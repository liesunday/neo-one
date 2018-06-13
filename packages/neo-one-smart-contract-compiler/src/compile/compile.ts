import Ast, { SourceFile } from 'ts-simple-ast';

import { Context } from '../Context';
import { getGlobals, getLibAliases, getLibs } from '../symbols';
import { createHelpers } from './helper';
import {
  EmittingScriptBuilder,
  HelperCapturingScriptBuilder,
  ScopeCapturingScriptBuilder,
} from './sb';
import { CompileResult } from './types';

export interface CompileOptions {
  ast: Ast;
  sourceFile: SourceFile;
  context?: Context;
}

export const compile = ({
  ast,
  sourceFile,
  context: contextIn,
}: CompileOptions): CompileResult => {
  const context =
    contextIn || new Context(getGlobals(ast), getLibs(ast), getLibAliases(ast));
  const helpers = createHelpers();

  const helperScriptBuilder = new HelperCapturingScriptBuilder(
    context,
    helpers,
    ast,
    sourceFile,
  );
  helperScriptBuilder.process();

  const scopeScriptBuilder = new ScopeCapturingScriptBuilder(
    context,
    helpers,
    ast,
    sourceFile,
    helperScriptBuilder.getHelpers(),
  );
  scopeScriptBuilder.process();

  const emittingScriptBuilder = new EmittingScriptBuilder({
    context,
    scopes: scopeScriptBuilder.getScopes(),
    ast,
    sourceFile,
    helpers,
    allHelpers: helperScriptBuilder.getHelpers(),
  });
  emittingScriptBuilder.process();

  return {
    code: emittingScriptBuilder.getFinalBytecode(),
    context,
  };
};
