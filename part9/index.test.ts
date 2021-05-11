import { assertEquals } from 'https://deno.land/std@0.94.0/testing/asserts.ts'
import { Lexer } from './lexer.ts'
import { Parser } from './parse.ts'
import { Interpreter, NodeVisitor } from './interpreter.ts'

Deno.test('Expression', () => {
  const interpreter = new Interpreter(
    new Parser(
      new Lexer(`
        BEGIN
          BEGIN
            number := 2;
            a := number;
            b := 10 * a + 10 * number / 4;
            c := a - - b
          END;
          x := 11;
        END.
      `)
    )
  )
  interpreter.interpret()
  assertEquals(
    JSON.stringify(Object.fromEntries(NodeVisitor.GlobalScope.entries())),
    `{"number":2,"a":2,"b":25,"c":27,"x":11}`
  )
})
