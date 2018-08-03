import { helpers } from '../../../../__data__';
import { DiagnosticCode } from '../../../../DiagnosticCode';

describe('Symbol', () => {
  test('cannot be extended', async () => {
    await helpers.compileString(
      `
      class MySymbol extends Symbol {
      }
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_EXTEND_BUILTIN },
    );
  });

  test('cannot be implemented', async () => {
    await helpers.compileString(
      `
      class MySymbol implements Symbol {
      }
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_IMPLEMENT_BUILTIN },
    );
  });

  test('cannot be referenced', async () => {
    await helpers.compileString(
      `
      const x = Symbol;
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_REFERENCE_BUILTIN },
    );
  });
});
