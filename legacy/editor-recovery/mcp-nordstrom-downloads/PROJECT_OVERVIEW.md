# Project Overview: Automated LLM-Powered Trend/Product Research (mcp-nordstrom)

## Purpose
This project automates trend and product research using LLMs (Large Language Models) in Node.js. It integrates LLM APIs (initially Ollama/llama3, then Google Gemini, with plans for Jarvis), tracks token usage/cost, visualizes usage, and automates quota upgrades. The workflow is designed for full automation, error correction, and minimal manual intervention.

---

## Architecture & Key Files

### Node.js Core Workflow
- **smart-categories.js**: Main Node.js script. Handles LLM API calls, token usage tracking, .env management, and error handling. Migrated from Ollama/llama3 to Google Gemini API. Ready for further LLM provider migration (e.g., Jarvis).
- **categories.js**: Likely contains category logic or data for research (details not shown).
- **firebase.js**: Handles Firebase integration (details not shown).
- **scrape.js**: Handles web scraping for product/trend data (details not shown).
- **serviceAccountKey.json.json**: Google service account credentials (for Firebase or GCP API access).
- **.env**: Stores API keys and environment variables securely.

### Token Usage & Cost Tracking
- **gemini_token_usage.json**: JSON log of Gemini API token usage and cost, updated by the workflow.
- **gemini_costs_usage_graph.py**: Python script to visualize token usage and cost over time using data from `gemini_token_usage.json`.

### Automation & Browser Scripting
- **open_gcp_billing.js**: Playwright script to automate navigation to Google Cloud billing/quota pages.
- **open_gemini_quota_automated.js**: Playwright script to automate Gemini API quota increase requests. Handles login, project selection, quota UI detection, and form filling. Leaves browser open for manual intervention if Google blocks automation.

### AI Workflow Instructions
- **.github/instructions/always run keep.instructions.md**: Project-wide coding and workflow standards. Mandates automation, error correction, and file preservation.

---

## Key Features
- Automated LLM-powered research (Node.js, LLM API integration)
- Robust .env and error handling
- Token usage and cost tracking (JSON + Python visualization)
- Automated browser navigation for quota upgrades (Playwright)
- Full automation and error correction as a priority
- Modular architecture for easy LLM provider migration

---

## Project Directory Structure

```
categories.js
firebase.js
gemini_costs_usage_graph.py
gemini_token_usage.json
open_gcp_billing.js
open_gemini_quota_automated.js
package.json
scrape.js
serviceAccountKey.json.json
.env
.github/
  instructions/
    always run keep.instructions.md
```

---

## Workflow Summary
1. **LLM Integration**: Calls LLM APIs (Gemini, previously Ollama, ready for Jarvis) for research tasks.
2. **Token Tracking**: Logs token usage and cost to `gemini_token_usage.json`.
3. **Visualization**: Python script generates cost/usage graphs.
4. **Quota Automation**: Playwright scripts automate quota/billing navigation and form filling, with robust error handling.
5. **Manual Steps**: Some Google Cloud actions (login, quota request) require manual intervention due to security restrictions.
6. **Automation Mandate**: All possible steps are automated; errors are auto-corrected where feasible.

---

## Pending/Next Steps
- Manual quota increase in Google Cloud Console (if blocked by automation)
- Option to migrate to Jarvis or other LLMs (pending API details)
- Continue automating and error-correcting all workflow steps

---

## Notes
- All files and changes are preserved within the project.
- The project is designed for extensibility and robust automation.
- If you need to switch LLM providers or add new automation, update the relevant scripts and .env as needed.
