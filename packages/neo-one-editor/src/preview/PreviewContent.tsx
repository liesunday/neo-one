import { comlink } from '@neo-one/worker';
import * as React from 'react';
import { Engine } from '../engine';

interface Props {
  readonly engine: Engine;
}

export class PreviewContent extends React.Component<Props> {
  private readonly ref = React.createRef<HTMLIFrameElement>();

  public componentDidMount(): void {
    const instance = this.ref.current;
    if (instance != undefined && instance.contentWindow != undefined) {
      const contentWindow = instance.contentWindow;
      const { port1, port2 } = new MessageChannel();
      comlink.expose(Engine, port1);
      console.log('waiting for load');
      const handler = (event: MessageEvent) => {
        if (event.data != undefined && typeof event.data === 'object' && event.data.type === 'initialize') {
          console.log('sending id');
          contentWindow.postMessage({ id: this.props.engine.id, port: port2 }, '*', [port2]);
          window.removeEventListener('message', handler);
        }
      };
      window.addEventListener('message', handler);
    }
  }

  public render() {
    return <iframe ref={this.ref} src={this.props.engine.createPreviewURL()} />;
  }
}
