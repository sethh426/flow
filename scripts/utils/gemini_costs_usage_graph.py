import matplotlib.pyplot as plt
import json
import os

# Try to load actual usage data from the Node.js script
usage_path = os.path.join(os.path.dirname(__file__), "gemini_token_usage.json")
if os.path.exists(usage_path):
    with open(usage_path, "r") as f:
        usage_data = json.load(f)
else:
    # Fallback: example data
    usage_data = {"input_tokens": 25000, "output_tokens": 12000}

# Gemini 1.5 Pro pricing (<=128k tokens)
input_cost_per_million = 1.25
output_cost_per_million = 5.00

input_cost = usage_data["input_tokens"] / 1_000_000 * input_cost_per_million
output_cost = usage_data["output_tokens"] / 1_000_000 * output_cost_per_million

total_cost = input_cost + output_cost

# Plot
labels = ["Input", "Output"]
costs = [input_cost, output_cost]
colors = ["#4e79a7", "#f28e2b"]

fig, ax = plt.subplots(figsize=(7, 5))
bars = ax.bar(labels, costs, color=colors)

for bar, cost in zip(bars, costs):
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, yval + 0.0005, f"${cost:.4f}", ha='center', va='bottom', fontsize=12)

ax.set_ylabel("Cost in USD (per run)")
ax.set_title(f"Gemini 1.5 Pro API Cost for Your Project\nTotal: ${total_cost:.4f} (Input: {usage_data['input_tokens']} tokens, Output: {usage_data['output_tokens']} tokens)")
plt.tight_layout()
plt.show()

# Save the cost data for reference
with open("gemini_costs_last_run.json", "w") as f:
    json.dump({"input_tokens": usage_data["input_tokens"], "output_tokens": usage_data["output_tokens"], "input_cost": input_cost, "output_cost": output_cost, "total_cost": total_cost}, f, indent=2)
