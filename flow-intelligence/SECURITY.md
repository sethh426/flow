# Intelligence Security Rules

- Never place API keys, OAuth tokens, private keys or service-account JSON in this directory or prompts.
- Secrets belong in managed secret storage and are injected only into trusted server execution.
- Treat remote MCP servers as code with data access: review operator, transport, auth, tool surface and exfiltration risk before enabling.
- External publishing requires explicit authorization context and least-privilege scopes.
- Log request ids, provider/model names, cost/latency and sanitized error classes; do not log secrets or unnecessary user content.
- Use allowlists/schema validation at capability boundaries.
- Require idempotency keys for billable or externally visible operations.
- Budget/rate-limit every billable provider path.
- Record provenance for generated media and source assets.
- Keep historical recovered services off the production path until individually reviewed.
