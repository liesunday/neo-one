import { utils } from '@neo-one/utils';
import * as nodePath from 'path';
import { MirrorFileSystem } from './MirrorFileSystem';
import { Disposable, FileSystemChange, SubscribableFileSystem } from './types';
import { ensureDir } from './utils';

export class WorkerMirrorFileSystem extends MirrorFileSystem {
  public static subscribe(fs: SubscribableFileSystem, worker: Worker): Disposable {
    return fs.subscribe((change) => worker.postMessage({ fsChange: true, change }));
  }

  public readonly handleMessage = (event: MessageEvent, fallback: (event: MessageEvent) => void) => {
    if (event.data.fsChange) {
      const change: FileSystemChange = event.data.change;
      this.handleChange(change);
    } else {
      fallback(event);
    }
  };

  public readonly handleChange = async (change: FileSystemChange) => {
    switch (change.type) {
      case 'writeFile':
        const { path, content, opts } = change;
        ensureDir(this.syncFS, nodePath.dirname(path));
        this.syncFS.writeFileSync(path, content, opts);
        this.emitChange({ type: 'writeFile', path, content, opts });
        break;
      case 'mkdir':
        ensureDir(this.syncFS, nodePath.dirname(change.path));
        this.syncFS.mkdirSync(change.path);
        this.emitChange({ type: 'mkdir', path: change.path });
        break;
      default:
        utils.assertNever(change);
        throw new Error('For TS');
    }
  };
}
