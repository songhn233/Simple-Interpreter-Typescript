/*
program : compound_statement DOT

compound_statement : BEGIN statement_list END

statement_list : statement | statement SEMI statement_list

statement : compound_statement
          | assignment_statement
          | empty

assignment_statement : variable ASSIGN expr

empty :

expr : term ((PLUS | MINUS) term)*

term : factor ((MUL | DIV) factor)*

factor : PLUS factor
      | MINUS factor
      | INTEGER
      | LPAREN expr RPAREN
      | variable

variable : ID
*/

/* Type declare */
import { Type, TokenProps } from './type.ts'

/* Lexer */
export class Token {
  constructor(readonly tokenProps: TokenProps) {}

  [Symbol.toPrimitive]() {
    return `Token(${this.tokenProps.type}, ${this.tokenProps.value})`
  }
}

export class Lexer {
  private pos = 0
  private currentChar = ''
  ReservedKeywords = new Map([
    ['BEGIN', new Token({ type: Type.BEGIN, value: 'BEGIN' })],
    ['END', new Token({ type: Type.END, value: 'END' })],
  ])
  constructor(private text: string) {
    this.currentChar = text[0]
  }
  peek() {
    const pos = this.pos + 1
    if (pos > this.text.length - 1) {
      return ''
    }
    return this.text[pos]
  }
  advance() {
    if (this.pos >= this.text.length - 1) {
      this.currentChar = ''
      return
    }
    this.currentChar = this.text[++this.pos]
  }
  integer() {
    let ans = 0
    while (this.currentChar !== '') {
      if (/\d/.test(this.currentChar)) {
        ans = ans * 10 + Number(this.currentChar)
        this.advance()
      } else {
        break
      }
    }
    return ans
  }
  _id() {
    let res = ''
    while (/[(a-z)|(A-Z)|(0-9)]/.test(this.currentChar)) {
      res += this.currentChar
      this.advance()
    }
    if (!this.ReservedKeywords.get(res)) {
      this.ReservedKeywords.set(res, new Token({ type: Type.ID, value: res }))
    }
    return this.ReservedKeywords.get(res) as Token
  }
  getNextToken() {
    while (this.currentChar !== '') {
      if (/\s/.test(this.currentChar)) {
        this.advance()
        continue
      }
      if (/\d/.test(this.currentChar)) {
        return new Token({
          type: Type.INTEGER,
          value: this.integer(),
        })
      }
      if (/\+/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.PLUS,
          value: '+',
        })
      }
      if (/\-/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.MINUS,
          value: '-',
        })
      }
      if (/\*/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.MUL,
          value: '*',
        })
      }
      if (/\//.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.DIV,
          value: '/',
        })
      }
      if (/\(/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.LPARTEN,
          value: '(',
        })
      }
      if (/\)/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.RPARTEN,
          value: ')',
        })
      }
      if (/;/.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.SEMI,
          value: ';',
        })
      }
      if (/\:/.test(this.currentChar) && /\=/.test(this.peek())) {
        this.advance()
        this.advance()
        return new Token({
          type: Type.ASSIGN,
          value: ':=',
        })
      }
      if (/\./.test(this.currentChar)) {
        this.advance()
        return new Token({
          type: Type.DOT,
          value: '.',
        })
      }
      if (/[(a-z)|(A-Z)|(0-9)]/.test(this.currentChar)) {
        return this._id()
      }
      throw new Error('Lexer: Error Parsing Input')
    }
    return new Token({ type: Type.EOF })
  }
}

/* Parse */
class AST {
  constructor() {}
}

class BinOp extends AST {
  constructor(readonly left: AST, readonly right: AST, readonly op: Token) {
    super()
  }
}

class UnaryOp extends AST {
  constructor(readonly op: Token, readonly exper: AST) {
    super()
  }
}

class Num extends AST {
  readonly value: number
  constructor(token: Token) {
    super()
    this.value = token.tokenProps.value as number
  }
}

class Compound extends AST {
  readonly children: Array<AST> = []
  constructor() {
    super()
  }
  append(item: AST) {
    this.children.push(item)
  }
}

class Var extends AST {
  constructor(readonly token: Token) {
    super()
  }
}

class Assign extends AST {
  constructor(readonly left: Var, readonly op: Token, readonly right: AST) {
    super()
  }
}

class NoOp extends AST {
  constructor() {
    super()
  }
}

export class Parser {
  private currentToken = new Token({ type: Type.EOF })
  constructor(private lexer: Lexer) {
    this.currentToken = this.lexer.getNextToken()
  }
  eat(type: Type) {
    if (this.currentToken.tokenProps.type === type) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      throw new Error('Parser: Error Parsing Input')
    }
  }
  factor() {
    let node: AST
    const token = { ...this.currentToken } as Token
    switch (this.currentToken.tokenProps.type) {
      case Type.PLUS:
        this.eat(Type.PLUS)
        node = new UnaryOp(token, this.factor())
        return node
      case Type.MINUS:
        this.eat(Type.MINUS)
        node = new UnaryOp(token, this.factor())
        return node
      case Type.INTEGER:
        node = new Num(this.currentToken)
        this.eat(Type.INTEGER)
        return node
      case Type.LPARTEN:
        this.eat(Type.LPARTEN)
        node = this.expr()
        this.eat(Type.RPARTEN)
        return node
      default:
        return this.variable()
    }
  }
  term() {
    let result = this.factor()
    while (
      [Type.MUL, Type.DIV].some((v) => v === this.currentToken.tokenProps.type)
    ) {
      const op = this.currentToken
      this.currentToken.tokenProps.type === Type.MUL
        ? this.eat(Type.MUL)
        : this.eat(Type.DIV)
      result = new BinOp(result, this.factor(), op)
    }
    return result
  }
  program() {
    const node = this.compoundStatement()
    this.eat(Type.DOT)
    return node
  }
  compoundStatement() {
    this.eat(Type.BEGIN)
    const nodes: Array<AST> = this.statementList()
    this.eat(Type.END)
    const compound = new Compound()
    nodes.forEach((v) => compound.append(v))
    return compound
  }
  statementList() {
    const node = this.statement()
    const nodes: Array<AST> = [node]
    while (this.currentToken.tokenProps.type === Type.SEMI) {
      this.eat(Type.SEMI)
      nodes.push(this.statement())
    }
    if (this.currentToken.tokenProps.type === Type.ID) {
      throw new Error('Parser: Error Parsing Input')
    }
    return nodes
  }
  statement() {
    if (this.currentToken.tokenProps.type === Type.BEGIN) {
      const node = this.compoundStatement()
      return node
    } else if (this.currentToken.tokenProps.type === Type.ID) {
      const node = this.assignmentStatement()
      return node
    }
    const node = this.empty()
    return node
  }
  assignmentStatement() {
    const left = this.variable()
    const op = this.currentToken
    this.eat(Type.ASSIGN)
    const right = this.expr()
    return new Assign(left, op, right)
  }
  variable() {
    const node = new Var(this.currentToken)
    this.eat(Type.ID)
    return node
  }
  empty() {
    return new NoOp()
  }
  expr() {
    let result = this.term()
    while (
      [Type.PLUS, Type.MINUS].some(
        (v) => v === this.currentToken.tokenProps.type
      )
    ) {
      const op = this.currentToken
      this.currentToken.tokenProps.type === Type.PLUS
        ? this.eat(Type.PLUS)
        : this.eat(Type.MINUS)
      const right = this.term()
      result = new BinOp(result, right, op)
    }
    return result
  }
  parse() {
    const res = this.program()
    if (this.currentToken.tokenProps.type !== Type.EOF) {
      throw new Error('Parser: Error Parsing Input')
    }
    return res
  }
}

/* Interpreter */
export class NodeVisitor {
  static GlobalScope: Map<string, number> = new Map()
  visit(node: AST): number | void {
    if (node instanceof BinOp) {
      return new BinOpVisitor().visitBinOp(node)
    } else if (node instanceof Num) {
      return new NumVisitor().visitNum(node)
    } else if (node instanceof UnaryOp) {
      return new UnaryOpVisitor().visitUnaryOp(node)
    } else if (node instanceof Compound) {
      new CompoundVisitor().visitCompound(node)
    } else if (node instanceof Assign) {
      new AssignVisitor().visitAssign(node)
    } else if (node instanceof Var) {
      return new VarVisitor().visitVar(node)
    } else if (node instanceof NoOp) {
      new NoOpVisitor().visitNoOp()
    } else {
      throw new Error('Interpreter: Error Parsing Input')
    }
  }
}

export class BinOpVisitor extends NodeVisitor {
  visitBinOp(node: BinOp) {
    switch (
      node.op.tokenProps.type as Type.PLUS | Type.MINUS | Type.MUL | Type.DIV
    ) {
      case Type.PLUS:
        return (
          (this.visit(node.left) as number) + (this.visit(node.right) as number)
        )
      case Type.MINUS:
        return (
          (this.visit(node.left) as number) - (this.visit(node.right) as number)
        )
      case Type.MUL:
        return (
          (this.visit(node.left) as number) * (this.visit(node.right) as number)
        )
      case Type.DIV:
        return (
          Math.floor(this.visit(node.left) as number) /
          (this.visit(node.right) as number)
        )
    }
  }
}

export class UnaryOpVisitor extends NodeVisitor {
  visitUnaryOp(node: UnaryOp) {
    if (node.op.tokenProps.type === Type.PLUS) {
      return +this.visit(node.exper)
    } else {
      return -this.visit(node.exper)
    }
  }
}

export class NumVisitor extends NodeVisitor {
  visitNum(node: Num) {
    return node.value
  }
}

export class CompoundVisitor extends NodeVisitor {
  visitCompound(nodes: Compound) {
    nodes.children.forEach((v) => {
      this.visit(v)
    })
  }
}

export class NoOpVisitor extends NodeVisitor {
  visitNoOp() {}
}

export class AssignVisitor extends NodeVisitor {
  visitAssign(node: Assign) {
    if (
      !AssignVisitor.GlobalScope.has(node.left.token.tokenProps.value as string)
    ) {
      AssignVisitor.GlobalScope.set(
        node.left.token.tokenProps.value as string,
        this.visit(node.right) as number
      )
    }
  }
}

export class VarVisitor extends NodeVisitor {
  visitVar(node: Var) {
    const value = node.token.tokenProps.value as string
    if (VarVisitor.GlobalScope.has(value)) {
      return VarVisitor.GlobalScope.get(value)
    }
    throw new Error('GlobalScope: Variable Not Found')
  }
}

export class Interpreter {
  constructor(private parser: Parser) {}
  interpret() {
    const tree = this.parser.parse()
    const visitor = new NodeVisitor()
    visitor.visit(tree)
  }
}
