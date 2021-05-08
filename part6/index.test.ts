import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.94.0/testing/asserts.ts'
import { Interpreter, Lexer, Token, Type } from './index.ts'

Deno.test('Expression(7*8)', () => {
  const interpreter = new Interpreter(new Lexer('7*8'))
  assertEquals(interpreter.exper(), '56')
})

Deno.test('Expression( 12 + 12 )', () => {
  const interpreter = new Interpreter(new Lexer(' 12 + 12 '))
  assertEquals(interpreter.exper(), '24')
})

Deno.test('Expression(1 + 32 / 11)', () => {
  const interpreter = new Interpreter(new Lexer('1 + 32 / 11'))
  assertEquals(interpreter.exper(), '3')
})

Deno.test('Expression(3 / 2 * 4 * 8 / 7)', () => {
  const interpreter = new Interpreter(new Lexer('3 / 2 * 4 * 8 / 7'))
  assertEquals(interpreter.exper(), '4')
})

Deno.test('Expression(14 + 2 * 3 - 6 / 2)', () => {
  const interpreter = new Interpreter(new Lexer('14 + 2 * 3 - 6 / 2'))
  assertEquals(interpreter.exper(), '17')
})

Deno.test('Expression(3 / (2 * 4))', () => {
  const interpreter = new Interpreter(new Lexer('3 / (2 * 4)'))
  assertEquals(interpreter.exper(), '0')
})

Deno.test('Parse Error())', () => {
  const interpreter = new Interpreter(new Lexer(')'))
  assertThrows(
    () => interpreter.exper(),
    Error,
    'Interpreter: Error Parsing Input'
  )
})

Deno.test('Parse Error(3 & 4)', () => {
  const interpreter = new Interpreter(new Lexer('3 & 4'))
  assertThrows(() => interpreter.exper(), Error, 'Lexer: Error Parsing Input')
})

Deno.test('Parse Error(3 // 4)', () => {
  const interpreter = new Interpreter(new Lexer('3 // 4'))
  assertThrows(
    () => interpreter.exper(),
    Error,
    'Interpreter: Error Parsing Input'
  )
})

Deno.test('Token Print', () => {
  const token = new Token({ type: Type.MUL, value: '*' })
  assertEquals(String(token), 'Token(3, *)')
})
