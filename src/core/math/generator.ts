import { Problem, Operation, SessionConfig, OperationRange } from '../../types';

// Generate a random number within range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if a number has carry in addition
function hasCarry(a: number, b: number): boolean {
  const ones = Math.abs(a % 10) + Math.abs(b % 10);
  return ones >= 10;
}

// Check if a number has borrow in subtraction
function hasBorrow(a: number, b: number): boolean {
  return a < b || (Math.abs(a % 10) < Math.abs(b % 10));
}

// Generate addition problem
function generateAddition(range: OperationRange, allowCarry: boolean): Problem | null {
  const maxTries = 50;
  
  for (let i = 0; i < maxTries; i++) {
    const a = randomInRange(range.min, range.max);
    const b = randomInRange(range.min, range.max);
    
    if (!allowCarry && hasCarry(a, b)) continue;
    
    return {
      id: `add_${Date.now()}_${i}`,
      expression: `${a} + ${b}`,
      answer: a + b,
      operations: ['+'],
    };
  }
  
  return null;
}

// Generate subtraction problem
function generateSubtraction(range: OperationRange, allowBorrow: boolean, allowNegative: boolean): Problem | null {
  const maxTries = 50;
  
  for (let i = 0; i < maxTries; i++) {
    const a = randomInRange(range.min, range.max);
    const b = randomInRange(range.min, range.max);
    
    if (!allowNegative && a < b) continue;
    if (!allowBorrow && a >= b && hasBorrow(a, b)) continue;
    
    return {
      id: `sub_${Date.now()}_${i}`,
      expression: `${a} - ${b}`,
      answer: a - b,
      operations: ['-'],
    };
  }
  
  return null;
}

// Generate multiplication problem
function generateMultiplication(range: OperationRange): Problem | null {
  const maxTries = 50;
  
  for (let i = 0; i < maxTries; i++) {
    const a = randomInRange(range.min, range.max);
    const b = randomInRange(range.min, range.max);
    
    return {
      id: `mul_${Date.now()}_${i}`,
      expression: `${a} × ${b}`,
      answer: a * b,
      operations: ['×'],
    };
  }
  
  return null;
}

// Generate division problem
function generateDivision(range: OperationRange): Problem | null {
  const maxTries = 50;
  
  for (let i = 0; i < maxTries; i++) {
    const b = randomInRange(Math.max(1, range.min), range.max);
    const answer = randomInRange(Math.max(1, range.min), range.max);
    const a = b * answer;
    
    if (a < range.min || a > range.max) continue;
    
    return {
      id: `div_${Date.now()}_${i}`,
      expression: `${a} ÷ ${b}`,
      answer: answer,
      operations: ['÷'],
    };
  }
  
  return null;
}

// Generate single operation problem
function generateSingleProblem(operation: Operation, config: SessionConfig): Problem | null {
  switch (operation) {
    case '+': return generateAddition(config.addition, config.allowCarryBorrow);
    case '-': return generateSubtraction(config.subtraction, config.allowCarryBorrow, config.allowNegative);
    case '×': return generateMultiplication(config.multiplication);
    case '÷': return generateDivision(config.division);
    default: return null;
  }
}

// Generate mixed operation problem
function generateMixedProblem(config: SessionConfig): Problem | null {
  const operations = config.enabledOperations.filter(op => op !== '÷');
  if (operations.length === 0) return null;
  
  const numOps = config.allow3DigitMixed ? randomInRange(2, 3) : 2;
  let expression = '';
  let answer = 0;
  const ops: Operation[] = [];
  const maxNum = config.allow3DigitMixed ? 999 : 99;
  
  for (let i = 0; i < numOps; i++) {
    const num = randomInRange(1, maxNum);
    const op = operations[randomInRange(0, operations.length - 1)];
    
    if (i === 0) {
      expression = `${num}`;
      answer = num;
    } else {
      const prevAnswer = answer;
      switch (op) {
        case '+': answer = prevAnswer + num; break;
        case '-':
          if (!config.allowNegative && prevAnswer < num) {
            expression = `${num} ${op} ${prevAnswer}`;
            answer = num - prevAnswer;
            ops.push(op);
            continue;
          }
          answer = prevAnswer - num;
          break;
        case '×': {
          const smallNum = randomInRange(1, 12);
          answer = prevAnswer * smallNum;
          expression += ` ${op} ${smallNum}`;
          ops.push(op);
          continue;
        }
      }
      expression += ` ${op} ${num}`;
      ops.push(op);
    }
  }
  
  return { id: `mixed_${Date.now()}`, expression, answer, operations: ops };
}

// Generate problems with parentheses
function generateParenthesesProblem(config: SessionConfig): Problem | null {
  const operations = config.enabledOperations.filter(op => op !== '÷');
  if (operations.length === 0) return null;
  
  const op1 = operations[randomInRange(0, operations.length - 1)];
  const op2 = operations[randomInRange(0, operations.length - 1)];
  const a = randomInRange(1, 20);
  const b = randomInRange(1, 20);
  const c = randomInRange(1, 20);
  
  let innerAnswer = 0;
  switch (op1) {
    case '+': innerAnswer = a + b; break;
    case '-': innerAnswer = a - b; break;
    case '×': innerAnswer = a * b; break;
  }
  
  let finalAnswer = 0;
  switch (op2) {
    case '+': finalAnswer = innerAnswer + c; break;
    case '-': finalAnswer = innerAnswer - c; break;
    case '×': finalAnswer = innerAnswer * c; break;
  }
  
  return {
    id: `paren_${Date.now()}`,
    expression: `(${a} ${op1} ${b}) ${op2} ${c}`,
    answer: finalAnswer,
    operations: [op1, op2],
  };
}

// Main problem generator
export function generateProblems(config: SessionConfig): Problem[] {
  const problems: Problem[] = [];
  const enabledOps = config.enabledOperations || ['+'];
  
  if (enabledOps.length === 0) return problems;
  
  const questionsPerOp = Math.floor(config.questionCount / enabledOps.length);
  const remainder = config.questionCount % enabledOps.length;
  
  for (let i = 0; i < enabledOps.length; i++) {
    const count = questionsPerOp + (i < remainder ? 1 : 0);
    
    for (let j = 0; j < count; j++) {
      let problem: Problem | null = null;
      
      if (config.allowParentheses && Math.random() > 0.7) {
        problem = generateParenthesesProblem(config);
      } else if (config.allow3DigitMixed && Math.random() > 0.6) {
        problem = generateMixedProblem(config);
      } else {
        problem = generateSingleProblem(enabledOps[i], config);
      }
      
      if (problem) problems.push(problem);
    }
  }
  
  return problems.sort(() => Math.random() - 0.5);
}

// Calculate score
export function calculateScore(correctCount: number): number {
  return correctCount * 10;
}