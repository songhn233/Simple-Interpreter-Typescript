import { Type } from './type.ts'
import { Lexer, Token } from './lexer.ts'

export class AST {
  constructor() {}
}

export class BinOp extends AST {
  constructor(readonly left: AST, readonly right: AST, readonly op: Token) {
    super()
  }
}

export class UnaryOp extends AST {
  constructor(readonly op: Token, readonly exper: AST) {
    super()
  }
}

export class Num extends AST {
  readonly value: number
  constructor(token: Token) {
    super()
    this.value = token.tokenProps.value as number
  }
}

export class Compound extends AST {
  readonly children: Array<AST> = []
  constructor() {
    super()
  }
  append(item: AST) {
    this.children.push(item)
  }
}

export class Var extends AST {
  constructor(readonly token: Token) {
    super()
  }
}

export class Assign extends AST {
  constructor(readonly left: Var, readonly op: Token, readonly right: AST) {
    super()
  }
}

export class NoOp extends AST {
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
