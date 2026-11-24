package com.logistics.warehouse_system.service;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * Utility service for generating CSV exports from tabular data.
 */
@Service
public class CsvExportService {

    /**
     * Exports tabular data to CSV format.
     *
     * @param headers Column headers
     * @param rows    List of rows, each row is a list of cell values
     * @return CSV content as byte array (UTF-8 with BOM for Excel compatibility)
     */
    public byte[] exportToCsv(List<String> headers, List<List<String>> rows) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(baos)) {
            // Write BOM for Excel UTF-8 compatibility
            writer.write('\uFEFF');

            // Write header row
            writeRow(writer, headers);

            // Write data rows
            for (List<String> row : rows) {
                writeRow(writer, row);
            }
            writer.flush();
        }
        return baos.toByteArray();
    }

    /**
     * Exports tabular data to CSV format from a list of maps.
     *
     * @param headers Column headers (in order)
     * @param rows    List of row maps (key = column name)
     * @return CSV content as byte array (UTF-8 with BOM for Excel compatibility)
     */
    public byte[] exportToCsvFromMaps(List<String> headers, List<Map<String, Object>> rows) {
        List<List<String>> stringRows = rows.stream()
                .map(row -> headers.stream()
                        .map(h -> {
                            Object val = row.get(h);
                            return val == null ? "" : val.toString();
                        })
                        .toList())
                .toList();
        return exportToCsv(headers, stringRows);
    }

    private void writeRow(PrintWriter writer, List<String> cells) {
        for (int i = 0; i < cells.size(); i++) {
            if (i > 0) {
                writer.write(',');
            }
            writer.write(escapeCsvCell(cells.get(i)));
        }
        writer.write('\n');
    }

    private String escapeCsvCell(String value) {
        if (value == null) {
            return "";
        }
        String s = value.toString();
        // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
