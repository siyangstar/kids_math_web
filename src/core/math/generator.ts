import { Problem, Operation, SessionConfig, OperationRange } from '../../types';

// Constants for problem generation
export const MAX_TRIES_SINGLE = 500;
export const MAX_TRIES_MIXED = 3000;
export const MAX_INPUT_LENGTH = 6;
export const PARENTHESES_PROBABILITY = 0.4;
export const LEVEL_POINTS_DIVISOR = 500;
export const MAX_HISTORY_ITEMS = 100;

// AST Node types for mathematical expressions
type ASTNode = 
  | { type: 'val', value: number }
  | { type: 'op', op: Operation, left: ASTNode, right: ASTNode };

// Generate a random number within range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if addition requires carry on any digit
function hasCarry(a: number, b: number): boolean {
  let carry = 0;
  let num1 = Math.abs(a);
  let num2 = Math.abs(b);
  
  while (num1 > 0 || num2 > 0) {
    const sum = (num1 % 10) + (num2 % 10) + carry;
    if (sum >= 10) return true;
    carry = Math.floor(sum / 10);
    num1 = Math.floor(num1 / 10);
    num2 = Math.floor(num2 / 10);
  }
  return false;
}

// Check if subtraction requires borrow on any digit
function hasBorrow(a: number, b: number): boolean {
  let num1 = Math.abs(a);
  let num2 = Math.abs(b);
  if (num1 < num2) return false;
  
  while (num1 > 0 || num2 > 0) {
    if ((num1 % 10) < (num2 % 10)) return true;
    num1 = Math.floor(num1 / 10);
    num2 = Math.floor(num2 / 10);
  }
  return false;
}

// Get range config for specific operation
function getRange(op: Operation, config: SessionConfig): OperationRange {
  switch (op) {
    case '+': return config.addition;
    case '-': return config.subtraction;
    case '×': return config.multiplication;
    case '÷': return config.division;
  }
}

// Evaluate AST and validate against configuration rules
function evaluateAST(node: ASTNode, config: SessionConfig): { value: number, valid: boolean } {
  if (node.type === 'val') return { value: node.value, valid: true };

  const left = evaluateAST(node.left, config);
  const right = evaluateAST(node.right, config);

  if (!left.valid || !right.valid) return { value: 0, valid: false };

  const l = left.value;
  const r = right.value;

  switch (node.op) {
    case '+':
      if (!config.allowCarryBorrow && hasCarry(l, r)) return { value: 0, valid: false };
      return { value: l + r, valid: true };
    case '-':
      if (!config.allowNegative && l < r) return { value: 0, valid: false };
      if (!config.allowCarryBorrow && l >= r && hasBorrow(l, r)) return { value: 0, valid: false };
      return { value: l - r, valid: true };
    case '×':
      return { value: l * r, valid: true };
    case '÷':
      if (r === 0) return { value: 0, valid: false };
      if (l % r !== 0) return { value: 0, valid: false };
      return { value: l / r, valid: true };
    default:
      return { value: 0, valid: false };
  }
}

// Generate AST for a single operation
function genSingleOpAST(op: Operation, config: SessionConfig): ASTNode {
  const range = getRange(op, config);
  if (op === '÷') {
    // Generate divisor and quotient to ensure integer division
    const divisor = randomInRange(Math.max(1, range.min), range.max);
    const quotient = randomInRange(Math.max(1, range.min), range.max);
    return { type: 'op', op, left: { type: 'val', value: divisor * quotient }, right: { type: 'val', value: divisor } };
  }
  const a = randomInRange(range.min, range.max);
  const b = randomInRange(range.min, range.max);
  return { type: 'op', op, left: { type: 'val', value: a }, right: { type: 'val', value: b } };
}

// Generate a 2-operand problem with rejection sampling
function generateSingleProblem(op: Operation, config: SessionConfig, existingProblems: Set<string>): Problem | null {
  for (let i = 0; i < MAX_TRIES_SINGLE; i++) {
    const ast = genSingleOpAST(op, config);
    const res = evaluateAST(ast, config);
    
    if (res.valid && ast.type === 'op') {
      const l = (ast.left as { type: 'val', value: number }).value;
      const r = (ast.right as { type: 'val', value: number }).value;
      const expression = `${l} ${op} ${r}`;
      
      if (existingProblems.has(expression)) continue;

      return {
        id: `single_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
        expression,
        answer: res.value,
        operations: [op]
      };
    }
  }
  return null;
}

// Determine if parentheses are mathematically required
function doesRequireParentheses(op1: Operation, op2: Operation, isLeftHeavy: boolean): boolean {
  const precedence: Record<Operation, number> = { '+': 1, '-': 1, '×': 2, '÷': 2 };
  const p1 = precedence[op1];
  const p2 = precedence[op2];

  if (isLeftHeavy) {
    // (L op1 M) op2 R: parentheses required if op1 has lower precedence
    if (p1 < p2) return true;
    return false;
  } else {
    // L op1 (M op2 R): parentheses required if op2 has lower precedence or same precedence with non-associative op1
    if (p2 < p1) return true;
    if (p1 === p2 && (op1 === '-' || op1 === '÷')) return true;
    return false;
  }
}

// Format AST to string with parentheses as needed
function formatAST(ast: ASTNode, requiresParen: boolean, isLeftHeavy: boolean): string {
  if (ast.type === 'val') return ast.value.toString();
  
  if (isLeftHeavy) {
    const leftOp = ast.left as { type: 'op', op: Operation, left: {type:'val', value:number}, right: {type:'val', value:number} };
    const L = leftOp.left.value;
    const M = leftOp.right.value;
    const R = (ast.right as { type: 'val', value: number }).value;
    
    if (requiresParen) {
      return `(${L} ${leftOp.op} ${M}) ${ast.op} ${R}`;
    } else {
      return `${L} ${leftOp.op} ${M} ${ast.op} ${R}`;
    }
  } else {
    const rightOp = ast.right as { type: 'op', op: Operation, left: {type:'val', value:number}, right: {type:'val', value:number} };
    const L = (ast.left as { type: 'val', value: number }).value;
    const M = rightOp.left.value;
    const R = rightOp.right.value;
    
    if (requiresParen) {
      return `${L} ${ast.op} (${M} ${rightOp.op} ${R})`;
    } else {
      return `${L} ${ast.op} ${M} ${rightOp.op} ${R}`;
    }
  }
}

// Generate a 3-operand mixed problem using pure rejection sampling
function generateMixedProblem(config: SessionConfig, existingProblems: Set<string>): Problem | null {
  const ops = config.enabledOperations;
  if (ops.length === 0) return null;

  for (let attempt = 0; attempt < MAX_TRIES_MIXED; attempt++) {
    const op1 = ops[randomInRange(0, ops.length - 1)];
    const op2 = ops[randomInRange(0, ops.length - 1)];

    const isLeftHeavy = Math.random() > 0.5;
    const requiresParen = doesRequireParentheses(op1, op2, isLeftHeavy);
    
    if (!config.allowParentheses && requiresParen) continue;

    if (config.allowParentheses && !requiresParen && Math.random() > PARENTHESES_PROBABILITY) {
      continue;
    }

    let L = 0, M = 0, R = 0;
    
    // Generate numbers within user-configured ranges using pure rejection sampling
    if (isLeftHeavy) {
      if (op1 === '÷') {
         const m = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         const q = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         L = m * q;
         M = m;
      } else {
         L = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
         M = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
      }
      
      if (op2 === '÷') {
         const r = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         const q = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         // For (L op1 M) ÷ R, we need (L op1 M) to equal r * q, which is hard to brute force backwards here.
         // Instead we let evaluateAST reject it if it's not perfectly divisible.
         R = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
      } else {
         R = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
      }
    } else {
      if (op2 === '÷') {
         const r = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         const q = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         M = r * q;
         R = r;
      } else {
         M = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
         R = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
      }
      
      if (op1 === '÷') {
         // L ÷ (M op2 R). Handled by evaluateAST rejection.
         L = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
      } else {
         L = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
      }
    }

    const ast: ASTNode = isLeftHeavy 
      ? { type: 'op', op: op2, left: { type: 'op', op: op1, left: { type: 'val', value: L }, right: { type: 'val', value: M } }, right: { type: 'val', value: R } }
      : { type: 'op', op: op1, left: { type: 'val', value: L }, right: { type: 'op', op: op2, left: { type: 'val', value: M }, right: { type: 'val', value: R } } };

    // Validate against configuration constraints
    const res = evaluateAST(ast, config);
    if (res.valid) {
      const expression = formatAST(ast, requiresParen, isLeftHeavy);
      
      if (existingProblems.has(expression)) continue;
      
      return { 
        id: `mixed_${Date.now()}_${attempt}_${Math.random().toString(36).substring(2, 7)}`, 
        expression, 
        answer: res.value, 
        operations: [op1, op2] 
      };
    }
  }
  return null;
}

// Generate problems based on session configuration
export function generateProblems(config: SessionConfig): Problem[] {
  const problems: Problem[] = [];
  const enabledOps = config.enabledOperations || ['+'];
  
  if (enabledOps.length === 0) return problems;
  
  const questionsPerOp = Math.floor(config.questionCount / enabledOps.length);
  const remainder = config.questionCount % enabledOps.length;
  const existingExpressions = new Set<string>();
  
  for (let i = 0; i < enabledOps.length; i++) {
    const count = questionsPerOp + (i < remainder ? 1 : 0);
    
    for (let j = 0; j < count; j++) {
      let problem: Problem | null = null;
      
      if (config.allow3DigitMixed) {
        problem = generateMixedProblem(config, existingExpressions);
        if (!problem) problem = generateSingleProblem(enabledOps[i], config, existingExpressions);
      } else {
        problem = generateSingleProblem(enabledOps[i], config, existingExpressions);
      }
      
      if (problem) {
        problems.push(problem);
        existingExpressions.add(problem.expression);
      }
    }
  }
  
  return problems.sort(() => Math.random() - 0.5);
}

// Calculate score as percentage (0-100)
export function calculateScore(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}
