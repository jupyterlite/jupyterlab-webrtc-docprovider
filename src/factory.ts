// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { URLExt, PageConfig } from '@jupyterlab/coreutils';
import {
  getAnonymousUserName,
  getRandomColor,
  IDocumentProvider,
  IDocumentProviderFactory,
  ProviderMock,
} from '@jupyterlab/docprovider';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { TranslationBundle } from '@jupyterlab/translation';
import { UUID } from '@lumino/coreutils';
import { hash, codec } from 'sjcl';

import { WebRTCSharing as SCHEMA } from './_schema';
import { WebRtcProvider } from './provider';
import { DEFAULT_SIGNALING_SERVERS, PageOptions } from './tokens';

/**
 * A configuragble WebRTC document provider factory
 */
export class WebRtcFactory {
  constructor(options: WebRtcFactory.IOptions) {
    this._settings = options.settings || null;
    this._urlParams = this.initUrlParams();
    this._trans = options.trans;
  }

  /**
   * Parse known URL parameters.
   */
  initUrlParams(): WebRtcFactory.IURLParams {
    const params = new URLSearchParams(window.location.search);

    // URL parameters that will overload settings
    const room = (params.get('room') || '').trim() || null;
    const username = (params.get('username') || '').trim() || null;
    const usercolor = (params.get('usercolor') || '').trim() || null;
    return { room, username, usercolor };
  }

  private get _composite(): Partial<SCHEMA> {
    return this._settings ? this._settings.composite : {};
  }

  /**
   * Whether the WebRTC is disabled
   */
  get disabled(): boolean {
    const collaborative = PageConfig.getOption(PageOptions.collaborative) !== 'true';
    return collaborative || this._composite.disabled || false;
  }

  /**
   * The user's preferred name
   *
   * The order of preference is:
   * - URL param
   * - plugin settings
   * - a random name, provided by JupyterLab core
   */
  username(): string {
    return (
      this._urlParams.username || this._composite.username || getAnonymousUserName()
    );
  }

  /**
   * The user's preferred color.
   *
   * The order of preference is:
   * - URL param
   * - plugin settings
   * - a random, themable color, provided by JupyterLab core
   */
  usercolor(): string {
    return this._urlParams.usercolor || this._composite.usercolor || getRandomColor();
  }

  /**
   * The human-readable room name.
   *
   * The order of preference is:
   * - URL param
   * - plugin settings
   * - a random UUID, not meant to be shared
   */
  roomName(): string {
    let room = this._urlParams.room || this._composite.room;

    if (room) {
      return room;
    }

    room = UUID.uuid4();
    console.info(this._trans.__('Using randomly-generated room name'), room);
    return room;
  }

  /**
   * Derive the obfuscated room id
   *
   * The order of preference is:
   * - jupyter-config-data
   * - plugin settings
   * - the app's base URL
   */
  fullRoomId(): string {
    const roomName = this.roomName();
    const roomPrefix =
      PageConfig.getOption(PageOptions.prefix) ||
      this._composite.roomPrefix ||
      URLExt.join(window.location.origin, PageConfig.getBaseUrl());

    return codec.hex.fromBits(hash.sha256.hash(`${roomPrefix}-${roomName}`));
  }

  /**
   * Get the signaling URLs
   *
   * The order of preference is:
   * - jupyter-config-data
   * - plugin settings
   * - hard-coded defaults
   */
  signalingUrls(): string[] {
    let urls: string[] | null;

    try {
      urls = JSON.parse(PageConfig.getOption(PageOptions.urls));
      if (urls && urls.length) {
        return urls;
      }
    } catch {
      //
    }

    urls = this._composite.signalingUrls || null;
    if (urls && urls.length) {
      return urls;
    }
    console.warn(
      this._trans.__(
        'Using default public WebRTC signaling servers: not recommended for production.'
      )
    );
    return DEFAULT_SIGNALING_SERVERS;
  }

  getNewProvider = (options: IDocumentProviderFactory.IOptions): IDocumentProvider => {
    if (this.disabled) {
      return new ProviderMock();
    }

    // obfuscate the final room name
    return new WebRtcProvider({
      ...options,
      room: this.fullRoomId(),
      usercolor: this.usercolor(),
      username: this.username(),
      signalingUrls: this.signalingUrls(),
    });
  };

  private _settings: ISettingRegistry.ISettings | null;
  private _urlParams: WebRtcFactory.IURLParams;
  private _trans: TranslationBundle;
}

/**
 * A namespace for WebRTC types
 */
export namespace WebRtcFactory {
  /**
   * Initialiation options for the WebRTC Factory
   */
  export interface IOptions {
    settings?: ISettingRegistry.ISettings | null;
    trans: TranslationBundle;
  }

  /**
   * URL Params parsed from the WebRTC Factory
   */
  export interface IURLParams {
    room: string | null;
    username: string | null;
    usercolor: string | null;
  }
}
