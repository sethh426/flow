import matplotlib.pyplot as plt

def plot_gemini_costs():
    models = [
        "Gemini 1.5 Pro",
        "Gemini 1.5 Flash",
        "Gemini 1.5 Flash-8B"
    ]
    input_costs = [1.25, 0.075, 0.0375]  # $ per 1M tokens (<=128k tokens)
    output_costs = [5.00, 0.30, 0.15]     # $ per 1M tokens (<=128k tokens)

    x = range(len(models))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(x, input_costs, width, label='Input ($/1M tokens)')
    ax.bar([i + width for i in x], output_costs, width, label='Output ($/1M tokens)')

    ax.set_ylabel('Cost in USD per 1M tokens')
    ax.set_title('Gemini API Pricing by Model (<=128k tokens)')
    ax.set_xticks([i + width/2 for i in x])
    ax.set_xticklabels(models)
    ax.legend()
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    plot_gemini_costs()
