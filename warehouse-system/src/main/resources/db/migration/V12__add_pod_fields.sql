ALTER TABLE shipments
    ADD COLUMN pod_file_name VARCHAR(255),
    ADD COLUMN pod_uploaded_at TIMESTAMP;
