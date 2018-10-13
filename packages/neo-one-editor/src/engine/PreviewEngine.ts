import { LocalForageFileSystem, MemoryFileSystem, WorkerMirrorFileSystem } from '@neo-one/local-browser';
import { comlink } from '@neo-one/worker';
import { EngineBase, PathWithExports } from './EngineBase';
import { ModuleBase } from './ModuleBase';
import { packages } from './packages';
import { RegisterPreviewEngineResult } from './types';

export interface PreviewEngineCreateOptions {
  readonly id: string;
  readonly port: MessagePort;
}

// tslint:disable-next-line no-let
let mutablePreviewEngine: PreviewEngine | undefined;

export class PreviewEngine extends EngineBase {
  public static async create({ id, port }: PreviewEngineCreateOptions): Promise<PreviewEngine> {
    if (mutablePreviewEngine === undefined) {
      // tslint:disable-next-line no-any
      const EngineProxy = comlink.proxy(port) as any;
      console.log(id);
      const fs = await WorkerMirrorFileSystem.create(new MemoryFileSystem(), new LocalForageFileSystem(id));
      const initialized = fs.readdirSync('/').length > 0;
      console.log(initialized);
      const {
        builderManager,
        jsonRPCLocalProviderManager,
        transpiler,
      }: RegisterPreviewEngineResult = await EngineProxy.registerPreviewEngine({
        id,
        fs: comlink.proxyValue(fs),
        initialized,
      });
      console.log('registered');
      const [builder, jsonRPCLocalProvider] = await Promise.all([
        builderManager.getInstance(),
        jsonRPCLocalProviderManager.getInstance(),
      ]);
      console.log('got instances');

      const pathWithExports = packages.reduce<ReadonlyArray<PathWithExports>>(
        (acc, { path, exports }) =>
          acc.concat({
            path,
            exports: exports({ fs, jsonRPCLocalProvider, builder }),
          }),
        [],
      );

      console.log('creating engine');
      const engine = new PreviewEngine({ id, fs, pathWithExports, transpiler });
      mutablePreviewEngine = engine;
      mutablePreviewEngine.fs.subscribe((change) => {
        switch (change.type) {
          case 'writeFile':
            engine.renderJS();
            break;
          default:
          // do nothing
        }
      });
    }

    return mutablePreviewEngine;
  }

  public start(): void {
    this.renderHTML();
    this.renderJS();
  }

  public renderHTML(): void {
    const indexHTML = this.findIndexHTML();
    document.open('text/html');
    document.write(indexHTML);
    document.close();
  }

  public renderJS(): void {
    const entryModule = this.findEntryModule();
    console.log('renderJS');
    entryModule.evaluate({ force: true, useEval: true });
  }

  private findIndexHTML(): string {
    return this.fs.readFileSync('/public/index.html');
  }

  private findEntryModule(): ModuleBase {
    return this.modules['/src/index.tsx'];
  }
}
