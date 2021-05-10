export enum Type {
  INTEGER = 'INTEGER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MUL = 'MUL',
  DIV = 'DIV',
  EOF = 'EOF',
  LPARTEN = 'LPARTEN',
  RPARTEN = 'RPARTEN',
  BEGIN = 'BEGIN',
  END = 'END',
  DOT = 'DOT',
  SEMI = 'SEMI',
  ASSIGN = 'ASSIGN',
  ID = 'ID',
}

export interface INTEGER {
  type: Type.INTEGER
  value: number
}

export interface PLUS {
  type: Type.PLUS
  value: '+'
}

export interface MINUS {
  type: Type.MINUS
  value: '-'
}

export interface MUL {
  type: Type.MUL
  value: '*'
}

export interface DIV {
  type: Type.DIV
  value: '/'
}

export interface LPARTEN {
  type: Type.LPARTEN
  value: '('
}

export interface RPARTEN {
  type: Type.RPARTEN
  value: ')'
}

export interface EOF {
  type: Type.EOF
  value?: undefined
}

export interface BEGIN {
  type: Type.BEGIN
  value: 'BEGIN'
}

export interface END {
  type: Type.END
  value: 'END'
}

export interface DOT {
  type: Type.DOT
  value: '.'
}

export interface SEMI {
  type: Type.SEMI
  value: ';'
}

export interface ASSIGN {
  type: Type.ASSIGN
  value: ':='
}

export interface ID {
  type: Type.ID
  value: string
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
  | BEGIN
  | END
  | DOT
  | SEMI
  | ASSIGN
  | ID
