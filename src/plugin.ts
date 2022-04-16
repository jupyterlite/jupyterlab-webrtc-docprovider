// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { PageConfig } from '@jupyterlab/coreutils';

import { UUID } from '@lumino/coreutils';

import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import {
  IDocumentProvider,
  IDocumentProviderFactory,
  ProviderMock,
} from '@jupyterlab/docprovider';

import { WebRtcProvider } from './provider';

/**
 * A WebRTC document provider plugin
 */
const plugin: JupyterFrontEndPlugin<IDocumentProviderFactory> = {
  id: '@jupyterlite/webrtc-docprovider:plugin',
  provides: IDocumentProviderFactory,
  activate: (app: JupyterFrontEnd): IDocumentProviderFactory => {
    const { host, search } = window.location;
    const params = new URLSearchParams(search);

    const roomName = (params.get('room') || '').trim() || UUID.uuid4();
    const username = (params.get('username') || '').trim() || null;
    const usercolor = (params.get('usercolor') || '').trim() || null;

    // enable if both the page config option (deployment wide) and the room name (user) are defined
    const collaborative = PageConfig.getOption('collaborative') === 'true';
    const signalingUrls = JSON.parse(
      PageConfig.getOption('fullWebRtcSignalingUrls') || 'null'
    );

    // default to a random id to not collaborate with others by default
    const room = `${host}-${roomName}`;

    const factory = (options: IDocumentProviderFactory.IOptions): IDocumentProvider => {
      if (!(collaborative && roomName)) {
        return new ProviderMock();
      }
      return new WebRtcProvider({
        room,
        usercolor,
        username,
        ...options,
        ...(signalingUrls && signalingUrls.length ? { signalingUrls } : {}),
      });
    };
    return factory;
  },
};

export default plugin;
