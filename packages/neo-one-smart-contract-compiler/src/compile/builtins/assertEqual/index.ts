import { tsUtils } from '@neo-one/ts-utils';
import ts from 'typescript';
import { ScriptBuilder } from '../../sb';
import { VisitOptions } from '../../types';
import { BuiltInBase, BuiltInCall, BuiltInType } from '../types';

// tslint:disable-next-line export-name
export class AssertEqual extends BuiltInBase implements BuiltInCall {
  public readonly types = new Set([BuiltInType.Call]);
  public emitCall(sb: ScriptBuilder, node: ts.CallExpression, optionsIn: VisitOptions): void {
    const options = sb.pushValueOptions(optionsIn);
    const received = tsUtils.argumented.getArguments(node)[0];
    const expected = tsUtils.argumented.getArguments(node)[1];

    // [expectedVal]
    sb.visit(expected, options);
    // [receivedVal, expectedVal]
    sb.visit(received, options);
    // [receivedVal, expectedVal, receivedVal]
    sb.emitOp(node, 'TUCK');
    // [expectedVal, receivedVal, expectedVal, receivedVal]
    sb.emitOp(node, 'OVER');
    sb.emitHelper(
      node,
      options,
      sb.helpers.if({
        condition: () => {
          // [boolean, expectedVal, receivedVal]
          sb.emitHelper(
            node,
            options,
            sb.helpers.equalsEqualsEquals({ leftType: sb.getType(received), rightType: sb.getType(expected) }),
          );
        },
        whenTrue: () => {
          // [receivedVal]
          sb.emitOp(node, 'DROP');
          // []
          sb.emitOp(node, 'DROP');
        },
        whenFalse: () => {
          // [string, expectedVal, receivedVal]
          sb.emitPushString(node, ' to equal ');
          // [val, expectedVal, receivedVal]
          sb.emitHelper(node, options, sb.helpers.createString);
          // [receivedVal, val, expectedVal]
          sb.emitOp(node, 'ROT');
          // [string, receivedVal, val, expectedVal]
          sb.emitPushString(node, 'Expected ');
          // [val, receivedVal, val, expectedVal]
          sb.emitHelper(node, options, sb.helpers.createString);
          // [4, val, receivedVal, val, expectedVal]
          sb.emitPushInt(node, 4);
          // [arr]
          sb.emitOp(node, 'PACK');
          // []
          sb.emitHelper(node, options, sb.helpers.consoleLog);
          // []
          sb.emitOp(received, 'THROW');
        },
      }),
    );
  }
}
