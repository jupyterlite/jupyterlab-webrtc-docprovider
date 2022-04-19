// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IDocumentProvider, IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { TranslationBundle } from '@jupyterlab/translation';
import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

/**
 * The namespace for plugins, settings, and translations
 */
export const NS = '@jupyterlite/webrtc-docprovider';

/**
 * The plugin id for registration and settings
 */
export const PLUGIN_ID = `${NS}:plugin`;

/**
 * The plugin id for registration and settings
 */
export const FACTORY_PLUGIN_ID = `${NS}:factory`;

/**
 * The plugin id for the status bar in full lab
 */
export const STATUS_PLUGIN_ID = `${NS}:status`;

/**
 * The plugin id for the status bar in full lab
 */
export const RETRO_STATUS_PLUGIN_ID = `${NS}:retro-status`;

export const RETRO_NOTEBOOK_PAGE = 'notebooks';
export const RETRO_EDIT_PAGE = 'edit';

export const RETRO_STATUS_PAGES = [RETRO_NOTEBOOK_PAGE, RETRO_EDIT_PAGE];

/**
 * Default Signaling Server URLs
 */
export const DEFAULT_SIGNALING_SERVERS = [
  'wss://signaling.yjs.dev',
  'wss://y-webrtc-signaling-eu.herokuapp.com',
  'wss://y-webrtc-signaling-us.herokuapp.com',
];

/**
 * JupyterLab command IDs
 */
export namespace CommandIds {
  export const disable = 'webrtc-docprovider:disable';
}

/**
 * constants of keys to provide to `jupyter-page-config`
 */
export namespace PageOptions {
  export const urls = 'fullWebRtcSignalingUrls';
  export const prefix = 'webRtcRoomPrefix';
  export const collaborative = 'collaborative';
}

export const IWebRtcManager = new Token<IWebRtcManager>(`${NS}:IWebRtcManager`);

export interface IWebRtcManager {
  createProvider(options: IDocumentProviderFactory.IOptions): IDocumentProvider;
  trans: TranslationBundle;
  username: string;
  usercolor: string;
  roomName: string;
  disabled: boolean;
  peerCount: number;
  signalingUrls: string[];
  stateChanged: ISignal<IWebRtcManager, void>;
}
