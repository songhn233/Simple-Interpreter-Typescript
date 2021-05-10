/*
exper: term ((PLUS|MINUS) term)*
term: factor ((MUL|DIV) factor)*
factor: INTEGER | LPARTEN exper RPARTEN
*/
export enum Type {
  INTEGER,
  PLUS,
  MINUS,
  MUL,
  DIV,
  EOF,
  LPARTEN,
  RPARTEN,
}

interface INTEGER {
  type: Type.INTEGER
  value: number
}

interface PLUS {
  type: Type.PLUS
  value: '+'
}

interface MINUS {
  type: Type.MINUS
  value: '-'
}

interface MUL {
  type: Type.MUL
  value: '*'
}

interface DIV {
  type: Type.DIV
  value: '/'
}

interface LPARTEN {
  type: Type.LPARTEN
  value: '('
}

interface RPARTEN {
  type: Type.RPARTEN
  value: ')'
}

interface EOF {
  type: Type.EOF
  value?: undefined
}

export type TokenProps =
  | INTEGER
  | PLUS
  | MINUS
  | MUL
  | DIV
  | LPARTEN
  | RPARTEN
  | EOF

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
  constructor(private text: string) {
    this.currentChar = text[0]
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
        node = this.parse()
        this.eat(Type.RPARTEN)
        return node
    }
    throw new Error('Parser: Error Parsing Input')
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
  parse(): AST {
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
}
/* Interpreter */
export class NodeVisitor {
  visit(node: AST): number {
    if (node instanceof BinOp) {
      return new BinOpVisitor().visitBinOp(node)
    }
    if (node instanceof Num) {
      return new NumVisitor().visitNum(node)
    }
    if (node instanceof UnaryOp) {
      return new UnaryOpVisitor().visitUnaryOp(node)
    }
    throw new Error('Interpreter: Error Parsing Input')
  }
}

export class BinOpVisitor extends NodeVisitor {
  visitBinOp(node: BinOp) {
    switch (
      node.op.tokenProps.type as Type.PLUS | Type.MINUS | Type.MUL | Type.DIV
    ) {
      case Type.PLUS:
        return this.visit(node.left) + this.visit(node.right)
      case Type.MINUS:
        return this.visit(node.left) - this.visit(node.right)
      case Type.MUL:
        return this.visit(node.left) * this.visit(node.right)
      case Type.DIV:
        return Math.floor(this.visit(node.left) / this.visit(node.right))
    }
  }
}

export class UnaryOpVisitor extends NodeVisitor {
  visitUnaryOp(node: UnaryOp) {
    console.log(node.exper)
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

export class Interpreter {
  constructor(private parser: Parser) {}
  interpret() {
    const tree = this.parser.parse()
    return String(new NodeVisitor().visit(tree))
  }
}
