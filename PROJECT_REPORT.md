# Comprehensive Project Report: Automated LLM-Powered Trend/Product Research (mcp-nordstrom)

## Executive Summary
This project delivers a fully automated, cost-efficient, and future-proof workflow for trend and product research using Large Language Models (LLMs) in Node.js. It integrates multiple LLM APIs (Ollama, Google Gemini, and is ready for Jarvis), tracks token usage and cost, visualizes usage, and automates quota management. The architecture is modular, hands-free, and designed for extensibility, error correction, and minimal manual intervention.

---

## Purpose & Vision
- **Goal:** Automate trend/product research and data analysis using LLMs, with robust error handling, cost tracking, and quota management.
- **Vision:** Achieve a self-healing, provider-agnostic, and cost-aware research platform that can adapt to new LLMs and changing API landscapes, while keeping operational costs low.

---

## Architecture & Key Components

### Node.js Core Workflow
- **smart-categories.js:** Main orchestrator for LLM API calls, token/cost tracking, .env management, and error handling. Migrated from Ollama/llama3 to Google Gemini API, and ready for further LLM provider migration (e.g., Jarvis).
- **categories.js:** Category logic or data for research.
- **firebase.js:** Handles Firebase integration.
- **scrape.js:** Web scraping for product/trend data.
- **serviceAccountKey.json.json:** Google service account credentials for Firebase or GCP API access.
- **.env:** Secure storage for API keys and environment variables.

### Token Usage & Cost Tracking
- **gemini_token_usage.json:** JSON log of Gemini API token usage and cost, updated by the workflow.
- **gemini_costs_usage_graph.py:** Python script to visualize token usage and cost over time.

### Automation & Browser Scripting
- **open_gcp_billing.js:** Playwright script to automate navigation to Google Cloud billing/quota pages.
- **open_gemini_quota_automated.js:** Playwright script to automate Gemini API quota increase requests, with robust selectors and logging. Leaves browser open for manual intervention if Google blocks automation.

### AI Workflow Instructions
- **.github/instructions/always run keep.instructions.md:** Project-wide coding and workflow standards. Mandates automation, error correction, and file preservation.

---

## Key Features
- Automated LLM-powered research (Node.js, LLM API integration)
- Robust .env and error handling
- Token usage and cost tracking (JSON + Python visualization)
- Automated browser navigation for quota upgrades (Playwright)
- Full automation and error correction as a priority
- Modular architecture for easy LLM provider migration
- Security: API keys managed in .env, sensitive data handling

---

## Directory Structure
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
1. **LLM Integration:** Calls LLM APIs (Gemini, previously Ollama, ready for Jarvis) for research tasks.
2. **Token Tracking:** Logs token usage and cost to `gemini_token_usage.json`.
3. **Visualization:** Python script generates cost/usage graphs.
4. **Quota Automation:** Playwright scripts automate quota/billing navigation and form filling, with robust error handling.
5. **Manual Steps:** Some Google Cloud actions (login, quota request) require manual intervention due to security restrictions.
6. **Automation Mandate:** All possible steps are automated; errors are auto-corrected where feasible.

---

## Pending/Next Steps
- Manual quota increase in Google Cloud Console (if blocked by automation)
- Option to migrate to Jarvis or other LLMs (pending API details)
- Continue automating and error-correcting all workflow steps

---

## Future-Proofing & Advanced Automation
- **Dynamic, cost-aware LLM selection:** Automatically choose the cheapest provider for each task.
- **Batching and caching:** Avoid redundant LLM calls, cache results.
- **Watchdog and scheduler:** Monitor for errors, retry or switch providers, schedule jobs for off-peak hours.
- **Enhanced reporting:** Predictive analytics, anomaly detection, and cost-saving suggestions.
- **Security automation:** Auto-rotate API keys, encrypt sensitive data.

---

## Notes
- All files and changes are preserved within the project.
- The project is designed for extensibility and robust automation.
- Update scripts and .env as needed for new LLMs or automation.

---

*This report summarizes the current state, architecture, and future direction of the mcp-nordstrom project. For more details, see the codebase and PROJECT_OVERVIEW.md.*
