# Security Policy

## Supported version

Security fixes are applied to the latest version on the default branch. This project does not currently maintain parallel release branches.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to the repository owner through the private security-reporting feature provided by the code host. If private reporting is unavailable, open a minimal issue asking for a secure contact method without including exploit details or private data.

Include the affected browser, a concise reproduction, the possible impact, and any mitigation you have already tested. Please allow a reasonable response period before public disclosure.

## Security model

Dynamic Calendar Activities is a static, client-side application:

- It has no accounts, server, database, analytics, or runtime third-party requests.
- Calendar content is stored in the browser and may also be encoded in the URL.
- Shared URL content is not encrypted and must not be treated as confidential.
- URL input is validated before use, and user-authored notes are inserted as text.
- The project publishes no production dependencies, which keeps its supply-chain surface small.

Static hosts remain responsible for HTTPS, response headers, access logs, and platform security. See the deployment guidance in the README for recommended browser security headers.
