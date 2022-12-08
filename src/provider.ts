// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IDocumentProvider, IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentChange, YDocument } from '@jupyter/ydoc';
import { PromiseDelegate } from '@lumino/coreutils';
import { Awareness } from 'y-protocols/awareness';
import { WebrtcProvider } from 'y-webrtc';

import { DEFAULT_SIGNALING_SERVERS } from './tokens';

/**
 * A WebRTC-powered share document provider
 */
export class WebRtcProvider extends WebrtcProvider implements IDocumentProvider {
  constructor(options: WebRtcProvider.IOptions) {
    super(
      `${options.room}${options.path}`,
      (options.model as YDocument<DocumentChange>).ydoc,
      WebRtcProvider.yProviderOptions(options)
    );
    const { usercolor, username } = options;
    this.awareness = (options.model as YDocument<DocumentChange>).awareness;

    const currState = this.awareness.getLocalState();

    // only set if this was not already set by another plugin
    if (currState && !currState.name) {
      this.awareness.setLocalStateField('user', { name: username, color: usercolor });
    }
    this._ready.resolve();
  }

  /**
   * Test whether the object has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * A promise that resolves when the document provider is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  requestInitialContent(): Promise<boolean> {
    if (this._initialRequest) {
      return this._initialRequest.promise;
    }
    let resolved = false;
    this._initialRequest = new PromiseDelegate<boolean>();
    this.on('synced', (event: any) => {
      if (this._initialRequest) {
        this._initialRequest.resolve(event.synced);
        resolved = true;
        this._ready.resolve();
      }
    });
    // similar logic as in the upstream plugin
    setTimeout(() => {
      if (!resolved && this._initialRequest) {
        this._ready.resolve();
        this._initialRequest.resolve(false);
      }
    }, 1000);
    return this._initialRequest.promise;
  }

  private _initialRequest: PromiseDelegate<boolean> | null = null;
  private _isDisposed: boolean = false;
  private _ready = new PromiseDelegate<void>();
}

/**
 * A public namespace for WebRTC options
 */
export namespace WebRtcProvider {
  export interface IOptions extends IDocumentProviderFactory.IOptions {
    room: string;
    username: string;
    usercolor: string;
    signalingUrls: string[];
  }

  export interface IYjsWebRtcOptions {
    signaling: Array<string>;
    password: string | null;
    awareness: Awareness;
    maxConns: number;
    filterBcConns: boolean;
    peerOpts: any;
  }
}

/**
 * A namespace for Yjs/WebRTC implementation details
 */
export namespace WebRtcProvider {
  /**
   * Re-map Lab provider options to yjs ones.
   */
  export function yProviderOptions(
    options: WebRtcProvider.IOptions
  ): WebRtcProvider.IYjsWebRtcOptions {
    return {
      signaling:
        options.signalingUrls && options.signalingUrls.length
          ? options.signalingUrls
          : DEFAULT_SIGNALING_SERVERS,
      password: null,
      awareness: new Awareness((options.model as YDocument<DocumentChange>).ydoc),
      maxConns: 20 + Math.floor(Math.random() * 15), // the random factor reduces the chance that n clients form a cluster
      filterBcConns: true,
      peerOpts: {}, // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
    };
  }
}
