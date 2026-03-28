## 2024-05-20 - [Privacy and IDOR protection in Tinnitus App]
**Vulnerability:** Sensitive patient reflections (ABC records) were exposed in server logs via query parameters. Also, missing ownership checks (IDOR) on update/delete operations allowed potential unauthorized data access.
**Learning:** In applications using a simple device-based identity model, it is crucial to pass all PII/PHI in the request body and strictly verify the `device_id` for every write operation.
**Prevention:** Use Pydantic models for all PUT/POST requests and always include `device_id` in the filter criteria for database updates/deletions.
