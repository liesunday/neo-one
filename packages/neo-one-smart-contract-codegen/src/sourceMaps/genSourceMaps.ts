import { getRelativeImport } from '../utils';

export const genSourceMaps = ({
  httpServerPort,
  sourceMapsPath,
  projectIDPath,
}: {
  readonly httpServerPort: number;
  readonly sourceMapsPath: string;
  readonly projectIDPath: string;
}) => ({
  js: `import { OneClient } from '@neo-one/client';
import { projectID } from '${getRelativeImport(sourceMapsPath, projectIDPath)}';

let sourceMapsIn = Promise.resolve({});

if (process.env.NODE_ENV !== 'production') {
  sourceMapsIn = Promise.resolve().then(async () => {
    const client = new OneClient(${httpServerPort});
    const result = await client.request({
      plugin: '@neo-one/server-plugin-project',
      options: { type: 'sourceMaps', projectID },
    });

    return result.response;
  });
}

export const sourceMaps = sourceMapsIn;
`,
  ts: `import { OneClient, SourceMaps } from '@neo-one/client';
import { projectID } from '${getRelativeImport(sourceMapsPath, projectIDPath)}';

let sourceMapsIn: Promise<SourceMaps> = Promise.resolve({});
if (process.env.NODE_ENV !== 'production') {
  sourceMapsIn = Promise.resolve().then(async () => {
    const client = new OneClient(${httpServerPort});
    const result = await client.request({
      plugin: '@neo-one/server-plugin-project',
      options: { type: 'sourceMaps', projectID },
    });

    return result.response;
  });
}

export const sourceMaps = sourceMapsIn;
`,
});
