import { Type, TokenProps } from './type.ts'
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
