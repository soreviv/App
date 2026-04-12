# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not open a public issue**.

Report it privately by emailing the maintainer or opening a [GitHub Security Advisory](https://github.com/soreviv/App/security/advisories/new).

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive a response within **72 hours**. Once confirmed, a fix will be released as soon as possible and you will be credited if you wish.

## Security Measures

### Authentication
- Users are identified by a cryptographically generated `device_id` stored locally (no passwords or accounts).

### API
- All endpoints validate `device_id` ownership before returning or modifying data (IDOR protection).
- Input is validated with Pydantic models (type enforcement, field constraints).
- Date and time fields are validated against strict regex patterns before processing.

### Dependencies
- Frontend dependencies are managed with Yarn and audited regularly.
- Known vulnerabilities are patched promptly (e.g., `picomatch` ReDoS, `brace-expansion` ReDoS/OOM, `node-forge`).

### Data
- No sensitive personal data is collected. The app stores tinnitus therapy progress and daily logs tied to an anonymous device ID.
- MongoDB connection credentials are stored in environment variables, never hardcoded.

## Known Limitations

- There is no server-side authentication layer. The `device_id` model assumes a single-user-per-device scenario and is not suitable for multi-user or shared-device deployments.
- The API does not implement rate limiting.
