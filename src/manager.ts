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
import { ISignal, Signal } from '@lumino/signaling';
import { hash, codec } from 'sjcl';

import { WebRTCSharing as SCHEMA } from './_schema';
import { WebRtcProvider } from './provider';
import { DEFAULT_SIGNALING_SERVERS, PageOptions, IWebRtcManager } from './tokens';

/**
 * A configuragble WebRTC document provider factory
 */
export class WebRtcManager implements IWebRtcManager {
  constructor(options: WebRtcManager.IOptions) {
    this._settings = options.settings || null;
    if (this._settings) {
      this._settings.changed.connect(() => this._stateChanged.emit(void 0));
    }
    this._urlParams = this.initUrlParams();
    this._randomParams = this.initRandomParams();
    this._trans = options.trans;
  }

  /**
   * Create a new document provider.
   *
   * This is the main purpose of this class.
   */
  createProvider = (options: IDocumentProviderFactory.IOptions): IDocumentProvider => {
    if (this.disabled) {
      return new ProviderMock();
    }

    // obfuscate the final room name
    return new WebRtcProvider({
      ...options,
      room: this.fullRoomId,
      usercolor: this.usercolor,
      username: this.username,
      signalingUrls: this.signalingUrls,
    });
  };

  /**
   * Parse known URL parameters.
   */
  protected initUrlParams(): WebRtcManager.IURLParams {
    const params = new URLSearchParams(window.location.search);

    // URL parameters that will overload settings
    const room = (params.get('room') || '').trim() || null;
    const username = (params.get('username') || '').trim() || null;
    const usercolor = (params.get('usercolor') || '').trim() || null;
    return { room, username, usercolor };
  }

  protected initRandomParams(): WebRtcManager.IRandomParams {
    return {
      room: UUID.uuid4(),
      usercolor: getRandomColor(),
      username: getAnonymousUserName(),
    };
  }

  private get _composite(): Partial<SCHEMA> {
    return this._settings ? this._settings.composite : {};
  }

  /**
   * Whether the WebRTC is disabled.
   *
   * The order of preference is:
   * - the server's `collaborative` setting
   * - plugin settings
   */
  get disabled(): boolean {
    const collaborative = PageConfig.getOption(PageOptions.collaborative) === 'true';
    if (!collaborative) {
      return true;
    }
    return !!this._composite.disabled;
  }

  /**
   * The user's preferred name
   *
   * The order of preference is:
   * - URL param
   * - plugin settings
   * - a random name, provided by JupyterLab core
   */
  get username(): string {
    return (
      this._urlParams.username ||
      this._composite.username ||
      this._randomParams.username
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
  get usercolor(): string {
    return (
      this._urlParams.usercolor ||
      this._composite.usercolor ||
      this._randomParams.usercolor
    );
  }

  /**
   * The human-readable room name.
   *
   * The order of preference is:
   * - URL param
   * - plugin settings
   * - a random UUID, not meant to be shared
   */
  get roomName(): string {
    return this._urlParams.room || this._composite.room || this._randomParams.room;
  }

  /**
   * Derive the obfuscated room id
   *
   * The order of preference is:
   * - jupyter-config-data
   * - plugin settings
   * - the app's base URL
   */
  get fullRoomId(): string {
    const { roomName } = this;
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
  get signalingUrls(): string[] {
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

  /**
   * A signal that fires when the state of sharing and identity changes
   */
  get stateChanged(): ISignal<IWebRtcManager, void> {
    return this._stateChanged;
  }

  /**
   * The translation bundle.
   */
  get trans(): TranslationBundle {
    return this._trans;
  }

  private _stateChanged: Signal<IWebRtcManager, void> = new Signal(this);
  private _settings: ISettingRegistry.ISettings | null;
  private _urlParams: WebRtcManager.IURLParams;
  private _randomParams: WebRtcManager.IRandomParams;
  private _trans: TranslationBundle;
}

/**
 * A namespace for WebRTC types
 */
export namespace WebRtcManager {
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

  /**
   * Random fallback params
   */
  export interface IRandomParams extends IURLParams {
    room: string;
    username: string;
    usercolor: string;
  }
}
