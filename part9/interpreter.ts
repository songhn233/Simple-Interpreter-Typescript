/*
program : compound_statement DOT

compound_statement : BEGIN statement_list END

statement_list : statement | statement SEMI statement_list

statement : compound_statement
          | assignment_statement
          | empty

assignment_statement : variable ASSIGN expr

empty :

expr : term ((PLUS | MINUS) term)*

term : factor ((MUL | DIV) factor)*

factor : PLUS factor
      | MINUS factor
      | INTEGER
      | LPAREN expr RPAREN
      | variable

variable : ID
*/

/* Type declare */
import { Type } from './type.ts'
import {
  Parser,
  AST,
  BinOp,
  UnaryOp,
  Num,
  Compound,
  Var,
  Assign,
  NoOp,
} from './parse.ts'

/* Interpreter */
export class NodeVisitor {
  static GlobalScope: Map<string, number> = new Map()
  visit(node: AST): number | void {
    if (node instanceof BinOp) {
      return new BinOpVisitor().visitBinOp(node)
    } else if (node instanceof Num) {
      return new NumVisitor().visitNum(node)
    } else if (node instanceof UnaryOp) {
      return new UnaryOpVisitor().visitUnaryOp(node)
    } else if (node instanceof Compound) {
      new CompoundVisitor().visitCompound(node)
    } else if (node instanceof Assign) {
      new AssignVisitor().visitAssign(node)
    } else if (node instanceof Var) {
      return new VarVisitor().visitVar(node)
    } else if (node instanceof NoOp) {
      new NoOpVisitor().visitNoOp()
    } else {
      throw new Error('Interpreter: Error Parsing Input')
    }
  }
}

export class BinOpVisitor extends NodeVisitor {
  visitBinOp(node: BinOp) {
    switch (
      node.op.tokenProps.type as Type.PLUS | Type.MINUS | Type.MUL | Type.DIV
    ) {
      case Type.PLUS:
        return (
          (this.visit(node.left) as number) + (this.visit(node.right) as number)
        )
      case Type.MINUS:
        return (
          (this.visit(node.left) as number) - (this.visit(node.right) as number)
        )
      case Type.MUL:
        return (
          (this.visit(node.left) as number) * (this.visit(node.right) as number)
        )
      case Type.DIV:
        return (
          Math.floor(this.visit(node.left) as number) /
          (this.visit(node.right) as number)
        )
    }
  }
}

export class UnaryOpVisitor extends NodeVisitor {
  visitUnaryOp(node: UnaryOp) {
    if (node.op.tokenProps.type === Type.PLUS) {
      return +this.visit(node.exper)
    } else {
      return -this.visit(node.exper)
    }
  }
}

export class NumVisitor extends NodeVisitor {
  visitNum(node: Num) {
    return node.value
  }
}

export class CompoundVisitor extends NodeVisitor {
  visitCompound(nodes: Compound) {
    nodes.children.forEach((v) => {
      this.visit(v)
    })
  }
}

export class NoOpVisitor extends NodeVisitor {
  visitNoOp() {}
}

export class AssignVisitor extends NodeVisitor {
  visitAssign(node: Assign) {
    if (
      !AssignVisitor.GlobalScope.has(node.left.token.tokenProps.value as string)
    ) {
      AssignVisitor.GlobalScope.set(
        node.left.token.tokenProps.value as string,
        this.visit(node.right) as number
      )
    }
  }
}

export class VarVisitor extends NodeVisitor {
  visitVar(node: Var) {
    const value = node.token.tokenProps.value as string
    if (VarVisitor.GlobalScope.has(value)) {
      return VarVisitor.GlobalScope.get(value)
    }
    throw new Error('GlobalScope: Variable Not Found')
  }
}

export class Interpreter {
  constructor(private parser: Parser) {}
  interpret() {
    const tree = this.parser.parse()
    const visitor = new NodeVisitor()
    visitor.visit(tree)
  }
}
