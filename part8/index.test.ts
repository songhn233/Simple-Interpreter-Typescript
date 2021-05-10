import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.94.0/testing/asserts.ts'
import { Interpreter, Lexer, Parser, Token, Type } from './index.ts'

Deno.test('Expression(7*8)', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('7*8')))
  assertEquals(interpreter.interpret(), '56')
})

Deno.test('Expression( 12 + 12 )', () => {
  const interpreter = new Interpreter(new Parser(new Lexer(' 12 + 12 ')))
  assertEquals(interpreter.interpret(), '24')
})

Deno.test('Expression(1 + 32 / 11)', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('1 + 32 / 11')))
  assertEquals(interpreter.interpret(), '3')
})

Deno.test('Expression(3 / 2 * 4 * 8 / 7)', () => {
  const interpreter = new Interpreter(
    new Parser(new Lexer('3 / 2 * 4 * 8 / 7'))
  )
  assertEquals(interpreter.interpret(), '4')
})

Deno.test('Expression(14 + 2 * 3 - 6 / 2)', () => {
  const interpreter = new Interpreter(
    new Parser(new Lexer('14 + 2 * 3 - 6 / 2'))
  )
  assertEquals(interpreter.interpret(), '17')
})

Deno.test('Expression(3 / (2 * 4))', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('3 / (2 * 4)')))
  assertEquals(interpreter.interpret(), '0')
})

Deno.test('Expression(5 - - - + - (3 + 4) - +2)', () => {
  const interpreter = new Interpreter(
    new Parser(new Lexer('5 - - - + - (3 + 4) - +2'))
  )
  assertEquals(interpreter.interpret(), '10')
})

Deno.test('Expression(5 - - - + - 3)', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('5 - - - + - 3')))
  assertEquals(interpreter.interpret(), '8')
})

Deno.test('Parse Error())', () => {
  const interpreter = new Interpreter(new Parser(new Lexer(')')))
  assertThrows(
    () => interpreter.interpret(),
    Error,
    'Parser: Error Parsing Input'
  )
})

Deno.test('Parse Error(3 & 4)', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('3 & 4')))
  assertThrows(
    () => interpreter.interpret(),
    Error,
    'Lexer: Error Parsing Input'
  )
})

Deno.test('Parse Error((3*4()', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('(3*4(')))
  assertThrows(
    () => interpreter.interpret(),
    Error,
    'Parser: Error Parsing Input'
  )
})

Deno.test('Parse Error(3 // 4)', () => {
  const interpreter = new Interpreter(new Parser(new Lexer('3 // 4')))
  assertThrows(
    () => interpreter.interpret(),
    Error,
    'Parser: Error Parsing Input'
  )
})

Deno.test('Token Print', () => {
  const token = new Token({ type: Type.MUL, value: '*' })
  assertEquals(String(token), 'Token(3, *)')
})
