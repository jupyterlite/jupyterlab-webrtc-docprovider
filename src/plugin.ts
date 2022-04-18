// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IStatusBar } from '@jupyterlab/statusbar';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { webrtcIcon } from './icons';
import { WebRtcManager } from './manager';
import { WebRtcStatus } from './status';
import {
  CommandIds,
  PLUGIN_ID,
  NS,
  STATUS_PLUGIN_ID,
  FACTORY_PLUGIN_ID,
  IWebRtcManager,
} from './tokens';

/**
 * A WebRTC document provider plugin
 */
const plugin: JupyterFrontEndPlugin<IWebRtcManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IWebRtcManager,
  optional: [ISettingRegistry, ITranslator, ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry?: ISettingRegistry,
    translator?: ITranslator,
    palette?: ICommandPalette
  ): Promise<IWebRtcManager> => {
    const options: WebRtcManager.IOptions = {
      trans: (translator || nullTranslator).load(NS),
    };

    if (settingRegistry) {
      try {
        options.settings = await settingRegistry.load(PLUGIN_ID);
      } catch (err) {
        console.warn(
          options.trans.__('WebRTC Sharing Settings could not be loaded'),
          err
        );
      }

      const { settings } = options;

      if (settings) {
        const { commands } = app;

        commands.addCommand(CommandIds.disable, {
          isToggleable: true,
          icon: webrtcIcon,
          label: options.trans.__('Toggle WebRTC Sharing'),
          isToggled: () => !settings.composite.disabled,
          execute: () => settings.set('disabled', !settings.composite.disabled),
        });

        if (palette) {
          palette.addItem({
            command: CommandIds.disable,
            category: options.trans.__('WebRTC Sharing'),
          });
        }
      }
    }

    const manager = new WebRtcManager(options);

    return manager;
  },
};

const factoryPlugin: JupyterFrontEndPlugin<IDocumentProviderFactory> = {
  id: FACTORY_PLUGIN_ID,
  autoStart: true,
  provides: IDocumentProviderFactory,
  requires: [IWebRtcManager],
  activate: (
    app: JupyterFrontEnd,
    manager: IWebRtcManager
  ): IDocumentProviderFactory => {
    return manager.createProvider;
  },
};

const statusPlugin: JupyterFrontEndPlugin<void> = {
  id: STATUS_PLUGIN_ID,
  autoStart: true,
  requires: [IStatusBar, IWebRtcManager],
  activate: (lab: JupyterFrontEnd, status: IStatusBar, manager: IWebRtcManager) => {
    const model = new WebRtcStatus.Model();
    model.manager = manager;
    const item = new WebRtcStatus(model);
    status.registerStatusItem(STATUS_PLUGIN_ID, { align: 'right', item });
  },
};

export default [plugin, statusPlugin, factoryPlugin];
