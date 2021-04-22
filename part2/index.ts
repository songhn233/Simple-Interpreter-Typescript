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
  get_next_token() {
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
      this.currentToken = this.get_next_token()
    }
  }
  exper() {
    this.currentToken = this.get_next_token()

    const left = this.currentToken
    this.eat(Type.INTEGER)

    const op = this.currentToken
    if (op.tokenProps.type === Type.PLUS) {
      this.eat(Type.PLUS)
    } else {
      this.eat(Type.MINUS)
    }

    const right = this.currentToken
    this.eat(Type.INTEGER)

    return op.tokenProps.type === Type.PLUS
      ? String(Number(left.tokenProps.value) + Number(right.tokenProps.value))
      : String(Number(left.tokenProps.value) - Number(right.tokenProps.value))
  }
}
