export enum Type {
  INTEGER,
  PLUS,
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

interface EOF {
  type: Type.EOF
  value?: undefined
}

export type TokenProps = Integer | Plus | EOF

export class Token {
  constructor(readonly tokenProps: TokenProps) {}

  [Symbol.toPrimitive]() {
    return `Token(${this.tokenProps.type}, ${this.tokenProps.value})`
  }
}

export class Interpreter {
  private pos = 0
  private currentToken = new Token({ type: Type.EOF })
  constructor(private text: string) {}
  error() {
    throw new Error('Error Parsing Input')
  }
  getNextToken() {
    if (this.pos >= this.text.length) {
      return new Token({ type: Type.EOF })
    }
    if (/\d/.test(this.text[this.pos])) {
      return new Token({
        type: Type.INTEGER,
        value: Number(this.text[this.pos++]),
      })
    }
    if (/\+/.test(this.text[this.pos])) {
      return new Token({
        type: Type.PLUS,
        value: this.text[this.pos++] as '+',
      })
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
  exper() {
    this.currentToken = this.getNextToken()

    const left = this.currentToken
    this.eat(Type.INTEGER)

    const _ = this.currentToken
    this.eat(Type.PLUS)

    const right = this.currentToken
    this.eat(Type.INTEGER)

    return String(
      Number(left.tokenProps.value) + Number(right.tokenProps.value)
    )
  }
}
