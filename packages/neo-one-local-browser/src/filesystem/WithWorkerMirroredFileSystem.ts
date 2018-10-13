import { AsyncFileSystem, FileSystem, FileSystemChange } from './types';
import { WorkerMirrorFileSystem } from './WorkerMirrorFileSystem';

export class WithWorkerMirroredFileSystem {
  protected readonly fs: Promise<WorkerMirrorFileSystem>;

  public constructor(syncFS: FileSystem, asyncFS: AsyncFileSystem) {
    this.fs = WorkerMirrorFileSystem.create(syncFS, asyncFS);
  }

  public readonly onFileSystemChange = async (change: FileSystemChange) =>
    this.fs.then((fs) => fs.handleChange(change));
}
