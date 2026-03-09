import { Problem, Operation, SessionConfig, OperationRange } from '../../types';

// 题目生成相关常量
export const MAX_TRIES_SINGLE = 500; // 单运算题目最大尝试次数
export const MAX_TRIES_MIXED = 3000; // 混合运算题目最大尝试次数
export const MAX_INPUT_LENGTH = 6; // 用户输入最大长度
export const PARENTHESES_PROBABILITY = 0.4; // 括号出现概率
export const LEVEL_POINTS_DIVISOR = 500; // 等级计算除数
export const MAX_HISTORY_ITEMS = 100; // 历史记录最大数量

// 数学表达式抽象语法树节点类型
type ASTNode = 
  | { type: 'val', value: number } // 数值节点
  | { type: 'op', op: Operation, left: ASTNode, right: ASTNode }; // 运算节点

// 生成指定范围内的随机整数
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 检查加法是否需要进位
function hasCarry(a: number, b: number): boolean {
  let carry = 0; // 进位值
  let num1 = Math.abs(a);
  let num2 = Math.abs(b);
  
  // 逐位检查是否需要进位
  while (num1 > 0 || num2 > 0) {
    const sum = (num1 % 10) + (num2 % 10) + carry;
    if (sum >= 10) return true; // 发现进位
    carry = Math.floor(sum / 10);
    num1 = Math.floor(num1 / 10);
    num2 = Math.floor(num2 / 10);
  }
  return false;
}

// 检查减法是否需要退位
function hasBorrow(a: number, b: number): boolean {
  let num1 = Math.abs(a);
  let num2 = Math.abs(b);
  if (num1 < num2) return false; // 负数结果由allowNegative控制
  
  // 逐位检查是否需要退位
  while (num1 > 0 || num2 > 0) {
    if ((num1 % 10) < (num2 % 10)) return true; // 发现退位
    num1 = Math.floor(num1 / 10);
    num2 = Math.floor(num2 / 10);
  }
  return false;
}

// 获取指定运算的数值范围配置
function getRange(op: Operation, config: SessionConfig): OperationRange {
  switch (op) {
    case '+': return config.addition;
    case '-': return config.subtraction;
    case '×': return config.multiplication;
    case '÷': return config.division;
  }
}

// 评估抽象语法树并验证是否符合配置规则
function evaluateAST(node: ASTNode, config: SessionConfig): { value: number, valid: boolean } {
  if (node.type === 'val') return { value: node.value, valid: true };

  // 递归评估左右子树
  const left = evaluateAST(node.left, config);
  const right = evaluateAST(node.right, config);

  // 如果子表达式无效，整个表达式无效
  if (!left.valid || !right.valid) return { value: 0, valid: false };

  const l = left.value;
  const r = right.value;

  // 根据运算类型进行计算和验证
  switch (node.op) {
    case '+':
      // 检查是否允许进位
      if (!config.allowCarryBorrow && hasCarry(l, r)) return { value: 0, valid: false };
      return { value: l + r, valid: true };
    case '-':
      // 检查是否允许负数结果
      if (!config.allowNegative && l < r) return { value: 0, valid: false };
      // 检查是否允许退位
      if (!config.allowCarryBorrow && l >= r && hasBorrow(l, r)) return { value: 0, valid: false };
      return { value: l - r, valid: true };
    case '×':
      return { value: l * r, valid: true };
    case '÷':
      // 除数不能为0
      if (r === 0) return { value: 0, valid: false };
      // 必须能整除
      if (l % r !== 0) return { value: 0, valid: false };
      return { value: l / r, valid: true };
    default:
      return { value: 0, valid: false };
  }
}

// 为单运算生成抽象语法树
function genSingleOpAST(op: Operation, config: SessionConfig): ASTNode {
  const range = getRange(op, config);
  if (op === '÷') {
    // 除法特殊处理：先生成除数和商，确保能整除
    const divisor = randomInRange(Math.max(1, range.min), range.max);
    const quotient = randomInRange(Math.max(1, range.min), range.max);
    return { type: 'op', op, left: { type: 'val', value: divisor * quotient }, right: { type: 'val', value: divisor } };
  }
  // 其他运算直接生成两个操作数
  const a = randomInRange(range.min, range.max);
  const b = randomInRange(range.min, range.max);
  return { type: 'op', op, left: { type: 'val', value: a }, right: { type: 'val', value: b } };
}

// 使用拒绝采样算法生成双操作数题目
function generateSingleProblem(op: Operation, config: SessionConfig, existingProblems: Set<string>): Problem | null {
  for (let i = 0; i < MAX_TRIES_SINGLE; i++) {
    const ast = genSingleOpAST(op, config);
    const res = evaluateAST(ast, config);
    
    if (res.valid && ast.type === 'op') {
      const l = (ast.left as { type: 'val', value: number }).value;
      const r = (ast.right as { type: 'val', value: number }).value;
      const expression = `${l} ${op} ${r}`;
      
      // 确保题目不重复
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

// 判断数学表达式是否需要括号
function doesRequireParentheses(op1: Operation, op2: Operation, isLeftHeavy: boolean): boolean {
  const precedence: Record<Operation, number> = { '+': 1, '-': 1, '×': 2, '÷': 2 };
  const p1 = precedence[op1];
  const p2 = precedence[op2];

  if (isLeftHeavy) {
    // (L op1 M) op2 R 结构：当op1优先级低于op2时需要括号
    if (p1 < p2) return true;
    return false;
  } else {
    // L op1 (M op2 R) 结构：当op2优先级低于op1或同优先级但op1非结合性时需要括号
    if (p2 < p1) return true;
    if (p1 === p2 && (op1 === '-' || op1 === '÷')) return true;
    return false;
  }
}

// 将抽象语法树格式化为字符串表达式
function formatAST(ast: ASTNode, requiresParen: boolean, isLeftHeavy: boolean): string {
  if (ast.type === 'val') return ast.value.toString();
  
  if (isLeftHeavy) {
    // 左重结构：(L op1 M) op2 R
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
    // 右重结构：L op1 (M op2 R)
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

// 使用纯拒绝采样算法生成三操作数混合运算题目
function generateMixedProblem(config: SessionConfig, existingProblems: Set<string>): Problem | null {
  const ops = config.enabledOperations;
  if (ops.length === 0) return null;

  for (let attempt = 0; attempt < MAX_TRIES_MIXED; attempt++) {
    const op1 = ops[randomInRange(0, ops.length - 1)];
    const op2 = ops[randomInRange(0, ops.length - 1)];

    const isLeftHeavy = Math.random() > 0.5; // 随机选择树结构
    const requiresParen = doesRequireParentheses(op1, op2, isLeftHeavy);
    
    // 检查括号配置
    if (!config.allowParentheses && requiresParen) continue;

    if (config.allowParentheses && !requiresParen && Math.random() > PARENTHESES_PROBABILITY) {
      continue;
    }

    let L = 0, M = 0, R = 0;
    
    // 在用户配置范围内生成数字，使用纯拒绝采样
    if (isLeftHeavy) {
      if (op1 === '÷') {
         // 除法特殊处理：先生成除数和商，确保能整除
         const m = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         const q = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         L = m * q;
         M = m;
      } else {
         // 左侧操作数
         L = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
         M = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
      }
      
      // 右侧操作数
      R = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
    } else {
      // 左侧操作数
      if (op1 === '÷') {
         // 左侧除法：L ÷ (M op2 R)，由evaluateAST拒绝采样处理
         L = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
      } else {
         L = randomInRange(getRange(op1, config).min, getRange(op1, config).max);
      }
      
      // 右侧操作数
      if (op2 === '÷') {
         // 右侧除法特殊处理
         M = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
         R = randomInRange(Math.max(1, getRange('÷', config).min), getRange('÷', config).max);
      } else {
         M = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
         R = randomInRange(getRange(op2, config).min, getRange(op2, config).max);
      }
    }

    // 构建抽象语法树
    const ast: ASTNode = isLeftHeavy 
      ? { type: 'op', op: op2, left: { type: 'op', op: op1, left: { type: 'val', value: L }, right: { type: 'val', value: M } }, right: { type: 'val', value: R } }
      : { type: 'op', op: op1, left: { type: 'val', value: L }, right: { type: 'op', op: op2, left: { type: 'val', value: M }, right: { type: 'val', value: R } } };

    // 验证是否符合配置约束
    const res = evaluateAST(ast, config);
    if (res.valid) {
      const expression = formatAST(ast, requiresParen, isLeftHeavy);
      
      // 确保题目不重复
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

// 根据会话配置生成题目集合
export function generateProblems(config: SessionConfig): Problem[] {
  const problems: Problem[] = [];
  const enabledOps = config.enabledOperations || ['+'];
  
  if (enabledOps.length === 0) return problems;
  
  // 计算每种运算的题目数量
  const questionsPerOp = Math.floor(config.questionCount / enabledOps.length);
  const remainder = config.questionCount % enabledOps.length;
  const existingExpressions = new Set<string>();
  
  for (let i = 0; i < enabledOps.length; i++) {
    // 前几种运算多分配一道题
    const count = questionsPerOp + (i < remainder ? 1 : 0);
    
    for (let j = 0; j < count; j++) {
      let problem: Problem | null = null;
      
      // 如果允许三位数混合运算，先尝试生成混合题
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
  
  // 随机打乱题目顺序
  return problems.sort(() => Math.random() - 0.5);
}

// 计算得分（百分比形式，0-100）
export function calculateScore(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}
