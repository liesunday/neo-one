import { Node } from 'ts-simple-ast';

import { ScriptBuilder } from '../../sb';
import { VisitOptions } from '../../types';
import { Helper } from '../Helper';

// Input: []
// Output: [exports]
export class GetCurrentModuleHelper extends Helper {
  public emit(sb: ScriptBuilder, node: Node, options: VisitOptions): void {
    if (options.pushValue) {
      // [globalObjectVal]
      sb.scope.getGlobal(sb, node, options);
      // [exports]
      sb.emitHelper(
        node,
        options,
        sb.helpers.getModule({ moduleIndex: sb.moduleIndex }),
      );
    }
  }
}
