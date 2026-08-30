# Comprehensive Project Report: Automated LLM-Powered Trend/Product Research (mcp-nordstrom)

## Executive Summary
This project implements a fully automated, cost-efficient, and extensible workflow for trend and product research using Large Language Models (LLMs) in Node.js. It integrates multiple LLM APIs (Ollama, Google Gemini, and is ready for Jarvis), tracks token usage and cost, visualizes usage, and automates quota management. The architecture is modular, hands-free, and designed for extensibility, error correction, and minimal manual intervention.

---

## Purpose & Vision
- **Goal:** Automate trend/product research and data analysis using LLMs, with robust error handling, cost tracking, and quota management.
- **Vision:** Achieve a self-healing, provider-agnostic, and cost-aware research platform that can adapt to new LLMs and changing API landscapes, while keeping operational costs low.

---

## Architecture & Key Components

### Node.js Core Workflow
- **smart-categories.js:**
  - Main orchestrator for LLM API calls, token/cost tracking, .env management, and error handling.
  - Handles prompt construction, LLM provider selection, and response parsing.
  - Migrated from Ollama/llama3 to Google Gemini API, and ready for further LLM provider migration (e.g., Jarvis).
  - Tracks and logs token usage and cost for each LLM call.
  - Implements robust .env file handling for API keys and configuration.
  - Contains error handling logic to retry failed calls and log errors.
- **categories.js:**
  - Contains category logic or data for research (e.g., product categories, trend types).
  - Used by the main workflow to structure research queries and results.
- **firebase.js:**
  - Handles Firebase integration for data storage, retrieval, or authentication.
  - May be used for persisting research results or user/session data.
- **scrape.js:**
  - Web scraping for product/trend data from external sources.
  - Integrates with the main workflow to provide real-world data for LLM analysis.
- **serviceAccountKey.json.json:**
  - Google service account credentials for Firebase or GCP API access.
  - Required for secure, authenticated access to Google services.
- **.env:**
  - Secure storage for API keys and environment variables.
  - Used by all scripts to load sensitive configuration at runtime.

### Token Usage & Cost Tracking
- **gemini_token_usage.json:**
  - JSON log of Gemini API token usage and cost, updated by the workflow after each LLM call.
  - Used for cost analysis, quota management, and reporting.
- **gemini_costs_usage_graph.py:**
  - Python script to visualize token usage and cost over time.
  - Reads from `gemini_token_usage.json` and generates graphs for reporting and optimization.

### Automation & Browser Scripting
- **open_gcp_billing.js:**
  - Playwright script to automate navigation to Google Cloud billing/quota pages.
  - Used to check current quota, billing status, and automate navigation for quota increases.
- **open_gemini_quota_automated.js:**
  - Playwright script to automate Gemini API quota increase requests.
  - Handles login, project selection, quota UI detection, and form filling.
  - Uses robust selectors and logging to maximize automation.
  - Leaves browser open for manual intervention if Google blocks automation (e.g., due to security restrictions).

### AI Workflow Instructions
- **.github/instructions/always run keep.instructions.md:**
  - Project-wide coding and workflow standards.
  - Mandates automation, error correction, and file preservation.
  - Ensures all scripts and changes are kept within the project architecture.

---

## Key Features
- Automated LLM-powered research (Node.js, LLM API integration)
- Modular, provider-agnostic LLM integration (easy to add/swap LLMs)
- Robust .env and error handling
- Token usage and cost tracking (JSON + Python visualization)
- Automated browser navigation for quota upgrades (Playwright)
- Full automation and error correction as a priority
- Security: API keys managed in .env, sensitive data handling
- Logging and reporting for all major workflow steps

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
1. **LLM Integration:**
   - Calls LLM APIs (Gemini, previously Ollama, ready for Jarvis) for research tasks.
   - Selects provider based on cost, quota, and task type (future-proofed for dynamic selection).
   - Handles prompt construction, batching, and caching to minimize redundant calls.
2. **Token Tracking:**
   - Logs token usage and cost to `gemini_token_usage.json` after each LLM call.
   - Used for cost analysis, quota management, and reporting.
3. **Visualization:**
   - Python script (`gemini_costs_usage_graph.py`) generates cost/usage graphs from token usage logs.
   - Supports anomaly detection and cost-saving suggestions (future enhancement).
4. **Quota Automation:**
   - Playwright scripts (`open_gcp_billing.js`, `open_gemini_quota_automated.js`) automate quota/billing navigation and form filling.
   - Robust error handling and logging for all automation steps.
   - Leaves browser open for manual intervention if automation is blocked by Google security.
5. **Manual Steps:**
   - Some Google Cloud actions (login, quota request) require manual intervention due to security restrictions.
   - Scripts provide clear instructions and keep the browser open for user action.
6. **Automation Mandate:**
   - All possible steps are automated; errors are auto-corrected where feasible.
   - Project-wide instructions enforce automation and error correction as a priority.

---

## Pending/Next Steps
- Manual quota increase in Google Cloud Console (if blocked by automation)
- Option to migrate to Jarvis or other LLMs (pending API details)
- Continue automating and error-correcting all workflow steps
- Implement dynamic provider selection, batching, and advanced reporting

---

## Future-Proofing & Advanced Automation
- **Dynamic, cost-aware LLM selection:**
  - Automatically choose the cheapest provider for each task based on real-time cost and quota.
  - Fallback to alternative providers if quota is exceeded or errors occur.
- **Batching and caching:**
  - Avoid redundant LLM calls by batching similar prompts and caching results.
  - Reduces cost and increases throughput.
- **Watchdog and scheduler:**
  - Monitor for errors, retry or switch providers, schedule jobs for off-peak hours.
  - Ensures maximum uptime and cost efficiency.
- **Enhanced reporting:**
  - Predictive analytics, anomaly detection, and cost-saving suggestions.
  - Auto-generate weekly/monthly reports for stakeholders.
- **Security automation:**
  - Auto-rotate API keys, encrypt sensitive data, and alert on leaks or expirations.

---

## Notes for AI Developers
- All files and changes are preserved within the project.
- The project is designed for extensibility and robust automation.
- LLM integration is modular; new providers can be added by extending the provider module and updating configuration.
- Error handling and logging are built-in for all major workflow steps.
- Update scripts and .env as needed for new LLMs, automation, or security requirements.
- Follow `.github/instructions/always run keep.instructions.md` for coding and workflow standards.

---

*This report summarizes the current state, architecture, and future direction of the mcp-nordstrom project. For more details, see the codebase and PROJECT_OVERVIEW.md.*
