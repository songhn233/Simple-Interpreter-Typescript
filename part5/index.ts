/*
exper: term ((PLUS|MINUS) term)*
term: factor ((MUL|DIV) factor)*
factor: INTEGER
*/
export enum Type {
  INTEGER,
  PLUS,
  MINUS,
  MUL,
  DIV,
  EOF,
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

interface EOF {
  type: Type.EOF
  value?: undefined
}

export type TokenProps = INTEGER | PLUS | MINUS | MUL | DIV | EOF

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
      this.error()
    }
    return new Token({ type: Type.EOF })
  }
}

export class Interpreter {
  private currentToken = new Token({ type: Type.EOF })
  constructor(private lexer: Lexer) {}
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
    const ans = this.currentToken.tokenProps.value as number
    this.eat(Type.INTEGER)
    return ans
  }
  term() {
    let result = this.factor()

    while (
      [Type.MUL, Type.DIV].some((v) => v === this.currentToken.tokenProps.type)
    ) {
      if (this.currentToken.tokenProps.type === Type.MUL) {
        this.eat(Type.MUL)
        result *= this.factor()
      } else {
        this.eat(Type.DIV)
        result = Math.floor(result / this.factor())
      }
    }
    return String(result)
  }
  exper() {
    this.currentToken = this.lexer.getNextToken()
    let result = +this.term()
    while (
      [Type.PLUS, Type.MINUS].some(
        (v) => v === this.currentToken.tokenProps.type
      )
    ) {
      if (this.currentToken.tokenProps.type === Type.PLUS) {
        this.eat(Type.PLUS)
        result += +this.term()
      } else {
        this.eat(Type.MINUS)
        result -= +this.term()
      }
    }
    return String(result)
  }
}
