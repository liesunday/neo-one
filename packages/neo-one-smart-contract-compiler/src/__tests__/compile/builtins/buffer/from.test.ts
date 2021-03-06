import { helpers } from '../../../../__data__';
import { DiagnosticCode } from '../../../../DiagnosticCode';

describe('Buffer.from', () => {
  test('should return a buffer from literal values', async () => {
    await helpers.executeString(`
      Buffer.from('5946158ab93f5f4fd6ba230f1c6c235117eec5f83e65275ac6f93ada9ca60477', 'hex');
      const x = Buffer.from('5946158ab93f5f4fd6ba230f1c6c235117eec5f83e65275ac6f93ada9ca60477', 'hex');

      assertEqual(x.equals(x), true);
    `);
  });

  test('should use utf8 as the default encoding', async () => {
    await helpers.executeString(`
      const x = Buffer.from('hello');
      const y = Buffer.from('hello', 'utf8');

      assertEqual(x.equals(y), true);
    `);
  });

  test('should allow dynamic utf8 strings', async () => {
    await helpers.executeString(`
      const x = 'hello';
      const y = Buffer.from(x);
      const z = Buffer.from(x, 'utf8');

      assertEqual(y.toString('utf8'), x);
      assertEqual(z.toString('utf8'), x);
      assertEqual(y.equals(z), true);
    `);
  });

  test('cannot be referenced', async () => {
    helpers.compileString(
      `
      const keys = Buffer.from;
    `,
      { type: 'error', code: DiagnosticCode.InvalidBuiltinReference },
    );
  });

  test('cannot be element referenced', async () => {
    helpers.compileString(
      `
      const keys = Buffer['from'];
    `,
      { type: 'error', code: DiagnosticCode.InvalidBuiltinReference },
    );
  });

  test('non-string is unsupported', async () => {
    helpers.compileString(
      `
      Buffer.from([]);
    `,
      { type: 'error', code: DiagnosticCode.UnsupportedSyntax },
    );
  });
});
