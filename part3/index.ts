export enum Type {
  INTEGER,
  PLUS,
  MINUS,
  EOF,
}

interface Integer {
  type: Type.INTEGER
  value: number
}

interface Plus {
  type: Type.PLUS
  value: '+'
}

interface MINUS {
  type: Type.MINUS
  value: '-'
}

interface EOF {
  type: Type.EOF
  value?: undefined
}

export type TokenProps = Integer | Plus | MINUS | EOF

export class Token {
  constructor(readonly tokenProps: TokenProps) {}

  [Symbol.toPrimitive]() {
    return `Token(${this.tokenProps.type}, ${this.tokenProps.value})`
  }
}

export class Interpreter {
  private pos = 0
  private currentToken = new Token({ type: Type.EOF })
  private currentChar = ''
  constructor(private text: string) {
    this.currentChar = text[0]
  }
  error() {
    throw new Error('Error Parsing Input')
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
      this.error()
    }
    return new Token({ type: Type.EOF })
  }
  eat(type: Type) {
    if (this.currentToken.tokenProps.type === type) {
      this.currentToken = this.getNextToken()
    } else {
      this.error()
    }
  }
  term() {
    const ans = this.currentToken.tokenProps.value as number
    this.eat(Type.INTEGER)
    return ans
  }
  exper() {
    this.currentToken = this.getNextToken()

    let result = this.term()

    while (
      [Type.MINUS, Type.PLUS].some(
        (v) => v === this.currentToken.tokenProps.type
      )
    ) {
      if (this.currentToken.tokenProps.type === Type.PLUS) {
        this.eat(Type.PLUS)
        result += this.term()
      } else {
        this.eat(Type.MINUS)
        result -= this.term()
      }
    }
    return String(result)
  }
}
