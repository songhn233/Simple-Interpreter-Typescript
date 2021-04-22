import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.94.0/testing/asserts.ts'
import { Interpreter, Token, Type } from './index.ts'

Deno.test('Expression(2+3)', () => {
  const interpreter = new Interpreter('2+3')
  assertEquals(interpreter.exper(), '5')
})

Deno.test('Expression(7+2)', () => {
  const interpreter = new Interpreter('7+2')
  assertEquals(interpreter.exper(), '9')
})

Deno.test('Parse Error', () => {
  const interpreter = new Interpreter('error')
  assertThrows(() => interpreter.exper(), Error, 'Error Parsing Input')
})

Deno.test('Token Print', () => {
  const token = new Token({ type: Type.PLUS, value: '+' })
  assertEquals(String(token), 'Token(1, +)')
})
