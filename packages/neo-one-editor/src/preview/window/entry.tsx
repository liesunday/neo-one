// tslint:disable no-import-side-effect
import '@babel/polyfill';
import './polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PreviewEngine } from '../../engine';
import { App } from './App';

const createPreviewEngine = async () => {
  const { id, port } = await new Promise<{ id: string; port: MessagePort }>((resolve) => {
    const handler = (event) => {
      if (event.data.id !== undefined) {
        console.log('got id');
        console.log(event);
        console.log(event.data.id);
        resolve(event.data);
        window.removeEventListener('message', handler);
      }
    };
    window.addEventListener('message', handler);

    const parentOrOpener = window.parent === window ? (window.opener as Window | undefined) : window.parent;
    if (parentOrOpener !== undefined) {
      console.log('posting message');
      parentOrOpener.postMessage({ type: 'initialize' }, '*');
    }
  });

  console.log('creating PreviewEngine');
  const engine = await PreviewEngine.create({ id, port });
  console.log('starting');
  engine.start();
};

// tslint:disable-next-line no-let
let startPromise: Promise<void> = Promise.resolve();
if (typeof window !== 'undefined') {
  startPromise = createPreviewEngine().catch((error) => {
    console.error(error);
  });
}

ReactDOM.render(<App startPromise={startPromise} />, document.getElementById('app'));
