// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * The namespace for plugins, settings, and translations
 */
export const NS = '@jupyterlite/webrtc-docprovider';

/**
 * The plugin id for registration and settings
 */
export const PLUGIN_ID = `${NS}:plugin`;

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
