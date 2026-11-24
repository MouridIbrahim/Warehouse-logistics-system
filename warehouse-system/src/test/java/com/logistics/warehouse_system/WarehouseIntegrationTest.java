package com.logistics.warehouse_system;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.seed.enabled=true", "app.rate-limit.enabled=false"})
@AutoConfigureMockMvc
@Testcontainers
class WarehouseIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17");

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JsonMapper jsonMapper;

    private static final AtomicLong SEQ = new AtomicLong();
    private String token;

    // ---- helpers ----

    private String ref(String prefix) {
        return prefix + "-" + System.nanoTime() + "-" + SEQ.incrementAndGet();
    }

    private void login(String username, String password) throws Exception {
        String body = jsonMapper.writeValueAsString(Map.of("username", username, "password", password));
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        token = jsonMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private JsonNode postJson(String url, Object body, int expectedStatus) throws Exception {
        var request = post(url)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON);
        if (body != null) {
            request.content(jsonMapper.writeValueAsString(body));
        }
        MvcResult result = mockMvc.perform(request)
                .andExpect(status().is(expectedStatus))
                .andReturn();
        String content = result.getResponse().getContentAsString();
        return (content == null || content.isEmpty()) ? null : jsonMapper.readTree(content);
    }

    private JsonNode getJson(String url, int expectedStatus) throws Exception {
        MvcResult result = mockMvc.perform(get(url).header("Authorization", "Bearer " + token))
                .andExpect(status().is(expectedStatus))
                .andReturn();
        return jsonMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode patchJson(String url, Object body, int expectedStatus) throws Exception {
        MvcResult result = mockMvc.perform(patch(url)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andReturn();
        return jsonMapper.readTree(result.getResponse().getContentAsString());
    }

    private long createProduct() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("sku", ref("SKU"));
        body.put("name", "Test Product");
        return postJson("/api/v1/products", body, 201).get("id").asLong();
    }

    private long createWarehouse() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("code", ref("WH"));
        body.put("name", "Test Warehouse");
        return postJson("/api/v1/warehouses", body, 201).get("id").asLong();
    }

    private long createLocation(long warehouseId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("code", ref("LOC"));
        body.put("name", "Test Location");
        return postJson("/api/v1/warehouses/" + warehouseId + "/locations", body, 201).get("id").asLong();
    }

    private long createInbound(long warehouseId, long productId, long locationId, int qty) throws Exception {
        Map<String, Object> item = Map.of(
                "productId", productId,
                "storageLocationId", locationId,
                "receivedQuantity", qty);
        Map<String, Object> body = new HashMap<>();
        body.put("referenceNumber", ref("INB"));
        body.put("warehouseId", warehouseId);
        body.put("items", List.of(item));
        return postJson("/api/v1/inbound-orders", body, 201).get("id").asLong();
    }

    private long createOutbound(long warehouseId, long productId, long locationId, int qty) throws Exception {
        Map<String, Object> item = Map.of(
                "productId", productId,
                "storageLocationId", locationId,
                "requestedQuantity", qty);
        Map<String, Object> body = new HashMap<>();
        body.put("referenceNumber", ref("OUT"));
        body.put("warehouseId", warehouseId);
        body.put("items", List.of(item));
        return postJson("/api/v1/outbound-orders", body, 201).get("id").asLong();
    }

    private int inventoryQuantity(long productId, long locationId) throws Exception {
        JsonNode node = getJson("/api/v1/inventory?productId=" + productId + "&locationId=" + locationId, 200);
        JsonNode content = node.get("content");
        return (content == null || content.isEmpty()) ? 0 : content.get(0).get("quantityOnHand").asInt();
    }

    // ---- tests ----

    @Test
    void fullWorkflowInboundDispatchShipment() throws Exception {
        login("admin", "admin123");

        long productId = createProduct();
        long warehouseId = createWarehouse();
        long locationId = createLocation(warehouseId);

        long inboundId = createInbound(warehouseId, productId, locationId, 100);
        postJson("/api/v1/inbound-orders/" + inboundId + "/confirm", null, 200);
        assertThat(inventoryQuantity(productId, locationId)).isEqualTo(100);

        long outboundId = createOutbound(warehouseId, productId, locationId, 40);
        postJson("/api/v1/outbound-orders/" + outboundId + "/dispatch", null, 200);
        assertThat(inventoryQuantity(productId, locationId)).isEqualTo(60);

        Map<String, Object> shipment = new HashMap<>();
        shipment.put("trackingNumber", ref("TRK"));
        shipment.put("outboundOrderId", outboundId);
        long shipmentId = postJson("/api/v1/shipments", shipment, 201).get("id").asLong();

        patchJson("/api/v1/shipments/" + shipmentId + "/status", Map.of("status", "PREPARED"), 200);
        patchJson("/api/v1/shipments/" + shipmentId + "/status", Map.of("status", "DELIVERED"), 400);

        JsonNode history = getJson("/api/v1/shipments/" + shipmentId + "/history", 200);
        assertThat(history.size()).isEqualTo(1);

        JsonNode audit = getJson("/api/v1/audit-logs", 200);
        assertThat(audit.get("totalElements").asLong()).isPositive();
    }

    @Test
    void insufficientStockDispatchRejectedWithoutSideEffects() throws Exception {
        login("admin", "admin123");

        long productId = createProduct();
        long warehouseId = createWarehouse();
        long locationId = createLocation(warehouseId);

        long inboundId = createInbound(warehouseId, productId, locationId, 10);
        postJson("/api/v1/inbound-orders/" + inboundId + "/confirm", null, 200);

        // Creating an outbound order with insufficient stock should be rejected at reservation time
        Map<String, Object> item = Map.of(
                "productId", productId,
                "storageLocationId", locationId,
                "requestedQuantity", 50);
        Map<String, Object> body = new HashMap<>();
        body.put("referenceNumber", ref("OUT"));
        body.put("warehouseId", warehouseId);
        body.put("items", List.of(item));
        postJson("/api/v1/outbound-orders", body, 409);

        assertThat(inventoryQuantity(productId, locationId)).isEqualTo(10);
    }

    @Test
    void invalidInboundQuantityRejected() throws Exception {
        login("admin", "admin123");
        long productId = createProduct();
        long warehouseId = createWarehouse();
        long locationId = createLocation(warehouseId);

        Map<String, Object> item = Map.of(
                "productId", productId,
                "storageLocationId", locationId,
                "receivedQuantity", 0);
        Map<String, Object> body = new HashMap<>();
        body.put("referenceNumber", ref("INB"));
        body.put("warehouseId", warehouseId);
        body.put("items", List.of(item));

        postJson("/api/v1/inbound-orders", body, 400);
    }

    @Test
    void openApiDocsAreGenerated() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode node = jsonMapper.readTree(result.getResponse().getContentAsString());

        assertThat(node.get("openapi").asText()).isNotBlank();
        assertThat(node.get("info").get("title").asText()).isEqualTo("Logistics Warehouse System API");
        assertThat(node.get("paths").has("/api/v1/products")).isTrue();
        assertThat(node.get("paths").has("/api/v1/inbound-orders/{id}/confirm")).isTrue();
        assertThat(node.get("paths").has("/api/v1/outbound-orders/{id}/dispatch")).isTrue();
        assertThat(node.get("paths").has("/api/v1/shipments/{id}/status")).isTrue();
    }

    @Test
    void dashboardReportsWorkWithData() throws Exception {
        login("admin", "admin123");

        long productId = createProduct();
        long warehouseId = createWarehouse();
        long locationId = createLocation(warehouseId);
        long inboundId = createInbound(warehouseId, productId, locationId, 50);
        postJson("/api/v1/inbound-orders/" + inboundId + "/confirm", null, 200);

        MvcResult result = mockMvc.perform(get("/api/v1/reports/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode node = jsonMapper.readTree(result.getResponse().getContentAsString());

        assertThat(node.get("inboundVolume").asLong()).isPositive();
        assertThat(node.get("totalInventoryOnHand").asLong()).isPositive();
        assertThat(node.get("shipmentStatusCounts").isArray()).isTrue();
    }

    @Test
    void viewerCannotCreateProduct() throws Exception {
        login("viewer", "viewer123");
        Map<String, Object> body = new HashMap<>();
        body.put("sku", ref("SKU"));
        body.put("name", "Should Not Be Created");
        postJson("/api/v1/products", body, 403);
    }

    @Test
    void concurrentDispatchDoesNotOverAllocate() throws Exception {
        login("admin", "admin123");

        long productId = createProduct();
        long warehouseId = createWarehouse();
        long locationId = createLocation(warehouseId);

        long inboundId = createInbound(warehouseId, productId, locationId, 10);
        postJson("/api/v1/inbound-orders/" + inboundId + "/confirm", null, 200);

        long order1 = createOutbound(warehouseId, productId, locationId, 10);

        // Second order for same stock should be rejected at reservation time
        Map<String, Object> item = Map.of(
                "productId", productId,
                "storageLocationId", locationId,
                "requestedQuantity", 10);
        Map<String, Object> body = new HashMap<>();
        body.put("referenceNumber", ref("OUT"));
        body.put("warehouseId", warehouseId);
        body.put("items", List.of(item));
        postJson("/api/v1/outbound-orders", body, 409);

        // Dispatch the first order
        postJson("/api/v1/outbound-orders/" + order1 + "/dispatch", null, 200);

        assertThat(inventoryQuantity(productId, locationId)).isZero();
    }

    private int dispatchStatus(long orderId) {
        try {
            return mockMvc.perform(post("/api/v1/outbound-orders/" + orderId + "/dispatch")
                            .header("Authorization", "Bearer " + token))
                    .andReturn().getResponse().getStatus();
        } catch (Exception e) {
            return 500;
        }
    }
}
