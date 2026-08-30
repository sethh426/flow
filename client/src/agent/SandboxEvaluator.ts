export class SandboxEvaluator {
  private allowedPattern = /^[0-9+\-*/() .A-Za-z_]*$/;

  evaluate(expression: string, context: Record<string, unknown>): unknown {
    if (!this.allowedPattern.test(expression)) {
      throw new Error('Expression contains forbidden characters');
    }
    const identifiers = Array.from(new Set(expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []));
    for (const id of identifiers) {
      if (!(id in context)) {
        throw new Error(`Unknown identifier: ${id}`);
      }
      const val = context[id];
      if (typeof val !== 'number') {
        throw new Error(`Identifier '${id}' is not a numeric value`);
      }
    }
    let safeExpr = expression;
    for (const id of identifiers) {
      safeExpr = safeExpr.replace(new RegExp(`\b${id}\b`, 'g'), String(context[id]));
    }
    const finalPattern = /^[0-9+\-*/(). ]*$/;
    if (!finalPattern.test(safeExpr)) {
      throw new Error('Transformed expression invalid');
    }
    return this.evaluateArithmetic(safeExpr);
  }

  private evaluateArithmetic(expr: string): number {
    const output: number[] = [];
    const ops: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const tokens = expr.replace(/\s+/g, '').match(/[0-9]+|[+\-*/()]/g) || [];
    for (const t of tokens) {
      if (/^[0-9]+$/.test(t)) {
        output.push(Number(t));
      } else if (t in precedence) {
        while (ops.length) {
          const top = ops[ops.length - 1];
          if (top in precedence && precedence[top] >= precedence[t]) {
            this.reduceOnce(output, ops.pop()!);
          } else break;
        }
        ops.push(t);
      } else if (t === '(') {
        ops.push(t);
      } else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          this.reduceOnce(output, ops.pop()!);
        }
        if (ops.pop() !== '(') throw new Error('Mismatched parentheses');
      } else {
        throw new Error(`Unexpected token ${t}`);
      }
    }
    while (ops.length) {
      const op = ops.pop()!;
      if (op === '(') throw new Error('Mismatched parentheses');
      this.reduceOnce(output, op);
    }
    if (output.length !== 1) throw new Error('Malformed expression');
    return output[0];
  }

  private reduceOnce(stack: number[], op: string) {
    if (stack.length < 2) throw new Error('Insufficient operands');
    const b = stack.pop()!;
    const a = stack.pop()!;
    let r: number;
    switch (op) {
      case '+': r = a + b; break;
      case '-': r = a - b; break;
      case '*': r = a * b; break;
      case '/': r = b === 0 ? NaN : a / b; break;
      default: throw new Error(`Bad operator ${op}`);
    }
    stack.push(r);
  }
}
