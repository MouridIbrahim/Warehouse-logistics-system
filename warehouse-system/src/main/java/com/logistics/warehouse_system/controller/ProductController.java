package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateProductRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.ProductDto;
import com.logistics.warehouse_system.dto.UpdateProductRequest;
import com.logistics.warehouse_system.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@Tag(name = "Products")
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<ProductDto> list(@RequestParam(required = false) String term,
                                         @RequestParam(required = false) String unitOfMeasure,
                                         @RequestParam(required = false) Boolean active,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                         @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return productService.list(term, unitOfMeasure, active, from, to, pageable);
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return productService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }
}
