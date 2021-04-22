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
  private current_token = new Token({ type: Type.EOF })
  constructor(private text: string) {}
  error() {
    throw new Error('Error Parsing Input')
  }
  get_next_token() {
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
    if (this.current_token.tokenProps.type === type) {
      this.current_token = this.get_next_token()
    } else {
      this.error()
    }
  }
  exper() {
    this.current_token = this.get_next_token()

    const left = this.current_token
    this.eat(Type.INTEGER)

    const _ = this.current_token
    this.eat(Type.PLUS)

    const right = this.current_token
    this.eat(Type.INTEGER)

    return String(
      Number(left.tokenProps.value) + Number(right.tokenProps.value)
    )
  }
}
