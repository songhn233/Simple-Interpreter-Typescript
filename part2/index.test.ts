import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.94.0/testing/asserts.ts'
import { Interpreter, Token, Type } from './index.ts'

Deno.test('Expression(7+8)', () => {
  const interpreter = new Interpreter('7+8')
  assertEquals(interpreter.exper(), '15')
})

Deno.test('Expression( 12 + 111 )', () => {
  const interpreter = new Interpreter(' 12 + 111 ')
  assertEquals(interpreter.exper(), '123')
})

Deno.test('Expression(32 - 11)', () => {
  const interpreter = new Interpreter('32 - 11')
  assertEquals(interpreter.exper(), '21')
})

Deno.test('Parse Error(3 * 4)', () => {
  const interpreter = new Interpreter('3 * 4')
  assertThrows(() => interpreter.exper(), Error, 'Error Parsing Input')
})

Deno.test('Parse Error(3 -- 4)', () => {
  const interpreter = new Interpreter('3 -- 4')
  assertThrows(() => interpreter.exper(), Error, 'Error Parsing Input')
})

Deno.test('Token Print', () => {
  const token = new Token({ type: Type.PLUS, value: '+' })
  assertEquals(String(token), 'Token(1, +)')
})
