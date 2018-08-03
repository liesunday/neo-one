import { helpers } from '../../../../__data__';
import { DiagnosticCode } from '../../../../DiagnosticCode';

describe('Buffer', () => {
  test('cannot be extended', async () => {
    await helpers.compileString(
      `
      class MyBuffer extends Buffer {
      }
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_EXTEND_BUILTIN },
    );
  });

  test('cannot be implemented', async () => {
    await helpers.compileString(
      `
      class MyBuffer implements Buffer {
      }
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_IMPLEMENT_BUILTIN },
    );
  });

  test('cannot be referenced', async () => {
    await helpers.compileString(
      `
      const x = Buffer;
    `,
      { type: 'error', code: DiagnosticCode.CANNOT_REFERENCE_BUILTIN },
    );
  });
});
