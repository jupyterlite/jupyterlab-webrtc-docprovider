import { VDomRenderer, VDomModel } from '@jupyterlab/apputils';
import React from 'react';

import { shareIcon, shareOffIcon } from './icons';
import { IWebRtcManager } from './tokens';

export class WebRtcStatus extends VDomRenderer<WebRtcStatus.Model> {
  protected render(): JSX.Element {
    this.addClass('jp-WebRTCStatus');
    const { manager } = this.model;
    if (!manager) {
      return <></>;
    }
    const { username, disabled, roomName, usercolor } = manager;
    const icon = disabled ? shareOffIcon : shareIcon;
    const userStyle = { textDecoration: 'underline', textDecorationColor: usercolor };

    const title = disabled
      ? manager.trans.__('WebRTC Sharing is disabled')
      : manager.trans.__('WebRTC Sharing is enabled with %1 as %2', roomName, username);

    return disabled ? (
      <div title={title}>
        <icon.react tag="span" />
      </div>
    ) : (
      <div title={title}>
        <icon.react tag="span" />
        <strong>{roomName}</strong>
        <label style={userStyle}>{username}</label>
      </div>
    );
  }
}

export namespace WebRtcStatus {
  export class Model extends VDomModel {
    get manager(): IWebRtcManager | null {
      return this._manager;
    }

    set manager(manager: IWebRtcManager | null) {
      this._manager = manager;
      this.stateChanged.emit(void 0);
      this._manager?.stateChanged.connect(() => this.stateChanged.emit(void 0));
    }
    private _manager: IWebRtcManager | null = null;
  }
}
