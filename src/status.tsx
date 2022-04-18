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
    const { username, disabled, roomName, usercolor, peerCount } = manager;
    const icon = disabled ? shareOffIcon : shareIcon;
    const userStyle = { textDecoration: 'underline', textDecorationColor: usercolor };

    const title = disabled
      ? manager.trans.__('Not Sharing')
      : manager.trans.__(
          'Sharing with %1 peers in %2 as %3',
          peerCount,
          roomName,
          username
        );

    return disabled ? (
      <div title={title}>
        <icon.react tag="span" />
      </div>
    ) : (
      <div title={title}>
        <label>{peerCount}</label>
        <icon.react tag="span" />
        <strong style={userStyle}>{roomName}</strong>
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
