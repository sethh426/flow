# External Flow archive import

This directory preserves useful documentation recovered from the external disk on September 24, 2026.

## Source

- External path: `E:\Projects\Affiliate-Flow-Prototype`
- Original repository: `https://github.com/luxcognita/affiliateflow-unified.git`
- Original commit: `705c9dcb50809a0c96567a7f83b0b02d8170e056`
- Original commit date: November 28, 2025
- Destination repository: `https://github.com/sethh426/flow.git`

The destination repository is the newer Flow codebase. The external repository is retained only as a historical source and was not merged because it has unrelated history and older runtime code.

## Imported

- Agent-module notes
- Test-infrastructure guide
- Infrastructure and Google Cloud guides
- Image generator, Java, neural orchestrator, smart router, vision analyzer, and workflow executor guides
- Terraform infrastructure guide

The original relative directory structure is preserved beneath this archive directory.

## Excluded

- `.env` files and other local configuration
- Service-account JSON and credential-like files
- `node_modules`, build output, Firebase caches, Playwright reports, test output, logs, and media artifacts
- The older modified hosting export
- An empty placeholder README
- A generic framework-generated client README
- Older source files already present or superseded in the destination repository

## Sanitization

A literal Gemini API key found in the archived Terraform guide was replaced with `REDACTED_GEMINI_API_KEY`. The original external disk was not modified.

These documents are not current operating instructions. Use the active deployment runbook and current source as the authority.
