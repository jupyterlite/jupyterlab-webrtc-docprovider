// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { URLExt } from '@jupyterlab/coreutils';
import * as nbformat from '@jupyterlab/nbformat';
import { ServerConnection, Contents } from '@jupyterlab/services';
import { IDocumentProvider, IDocumentProviderFactory } from '@jupyterlab/docprovider';

import { DocumentChange, YDocument, YFile, YNotebook } from '@jupyter/ydoc';

import { Signal } from '@lumino/signaling';
import { JSONExt, PromiseDelegate } from '@lumino/coreutils';

import * as Y from 'yjs';
import { Room, WebrtcProvider } from 'y-webrtc';
import { Awareness } from 'y-protocols/awareness';


import { DEFAULT_SIGNALING_SERVERS } from './tokens';

/**
 * The url for the default drive service.
 */
const SERVICE_DRIVE_URL = 'api/contents';


/**
 * A WebRTC-powered share document provider
 */
export class WebRtcProvider implements IDocumentProvider {
  constructor(options: WebRtcProvider.IOptions) {
    this._isDisposed = false;
    this._path = options.path;
    this._format = options.format as Contents.FileFormat;
    this._contentType = options.contentType as Contents.ContentType;

    const model = this._sharedModel = options.model as YDocument<DocumentChange>;
    this._ydoc = model.ydoc;
    this._awareness = model.awareness;

    //const user = options.user;
    //user.ready.then(() => this._onUserChanged(user))
    //.catch((e: any) => console.error(e));
    //user.userChanged.connect(this._onUserChanged, this);
    

    // only set if this was not already set by another plugin
    const currState = this._awareness.getLocalState();
    if (currState && !currState.name) {
      const { usercolor, username } = options;
      this._awareness.setLocalStateField('user', { name: username, color: usercolor });
    }

    this._yWSProvider = new WebrtcProvider(
      `${options.room}${options.path}`,
      this._ydoc,
      WebRtcProvider.yProviderOptions(options)
    );
    this._yWSProvider.on('synced', this._onSynced);
    
    this._requestInitialContent();
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

  get room(): Room | null {
    return this._yWSProvider.room;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._yWSProvider.destroy();
    Signal.clearData(this);
  }

  on(type: string, f: (...args: any[]) => void): void {
    this._yWSProvider.on(type, f);
  }

  private _requestInitialContent(): void {
    console.debug("_requestInitialContent:");
    let opts: Contents.IFetchOptions = {
      type: this._contentType as Contents.ContentType,
      content: '1' as any,
    };

    if (this._contentType != 'notebook') {
      opts = { ...opts, format: this._format };
    }
    
    const settings = ServerConnection.makeSettings();
    let url = URLExt.join(settings.baseUrl, SERVICE_DRIVE_URL, encodeURIComponent(this._path));
    url += URLExt.objectToQueryString(opts as any);
    ServerConnection.makeRequest(url, {}, settings)
    .then(async resp => {
      if (resp.status !== 200 && resp.status !== 201) {
        throw new ServerConnection.ResponseError(resp);
      }
      // Improve the waiting for synced.
      if (this._synced) return;

      const data: Contents.IModel = await resp.json();

      if (data.format == 'text') {
        this._fromString(data.content);
      } else if (data.format == 'json') {
        this._fromJSON(data.content);
      }
      return;
    })
    .then(() => this._ready.resolve())
    .catch(reason => console.warn(reason));
  }

  private _onSynced = (event: any): void => {
    console.debug("_onSynced:", event.synced);
    if (!this._synced && event.synced) {
      this._synced = true;
      this._ready.resolve();
    }
  }

  //private _onUserChanged(user: User.IManager): void {
  //  this._awareness.setLocalStateField('user', user.identity);
  //}

  private _fromString(value: string): void {
    // Convert line endings if necessary, marking the file
    // as dirty.
    if (value.indexOf('\r\n') !== -1) {
      value = value.replace(/\r\n/g, '\n');
    } else if (value.indexOf('\r') !== -1) {
      value = value.replace(/\r/g, '\n');
    }
    (this._sharedModel as YFile).setSource(value);
  }

  private _fromJSON(value: nbformat.INotebookContent): void {
    const copy = JSONExt.deepCopy(value);
    const model = this._sharedModel as YNotebook;

    // Ensure there is at least one cell
    if ((copy.cells?.length ?? 0) === 0) {
      copy['cells'] = [{ cell_type: 'code', source: '', metadata: {} }];
    }
    model.fromJSON(copy);
  }

  private _isDisposed: boolean = false;
  private _synced: boolean = false;
  private _ready = new PromiseDelegate<void>();

  private _path: string;
  private _format: Contents.FileFormat;
  private _contentType: Contents.ContentType;
  
  
  private _ydoc: Y.Doc;
  private _awareness: Awareness;
  private _sharedModel: YDocument<DocumentChange>;
  private _yWSProvider: WebrtcProvider;
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
