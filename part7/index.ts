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
  error() {
    throw new Error('Lexer: Error Parsing Input')
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
      this.error()
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
  error() {
    throw new Error('Interpreter: Error Parsing Input')
  }
  eat(type: Type) {
    if (this.currentToken.tokenProps.type === type) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error()
    }
  }
  factor() {
    if (this.currentToken.tokenProps.type === Type.INTEGER) {
      const node = new Num(this.currentToken)
      this.eat(Type.INTEGER)
      return node
    } else if (this.currentToken.tokenProps.type === Type.LPARTEN) {
      this.eat(Type.LPARTEN)
      const node = this.parse()
      this.eat(Type.RPARTEN)
      return node
    } else {
      this.error()
    }
    return new AST()
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
  error() {
    throw new Error('NodeVisitor: Error Parsing Input')
  }
  visit(node: AST) {
    if (node instanceof BinOp) {
      return new BinOpVisitor().visitBinOp(node)
    }
    if (node instanceof Num) {
      return new NumVisitor().visitNum(node)
    }
    this.error()
  }
}

export class BinOpVisitor extends NodeVisitor {
  visitBinOp(node: BinOp): number {
    switch (node.op.tokenProps.type) {
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
        return Math.floor(
          (this.visit(node.left) as number) / (this.visit(node.right) as number)
        )
      default:
        return 0
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
  error() {
    throw new Error('Interpreter: Error Parsing Input')
  }
  interpret() {
    const tree = this.parser.parse()
    return String(new NodeVisitor().visit(tree))
  }
}
