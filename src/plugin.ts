// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette, Toolbar } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IStatusBar } from '@jupyterlab/statusbar';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { DisposableDelegate } from '@lumino/disposable';

import { webrtcIcon } from './icons';
import { WebRtcManager } from './manager';
import { WebRtcStatus } from './status';
import {
  CommandIds,
  FACTORY_PLUGIN_ID,
  IWebRtcManager,
  NS,
  PLUGIN_ID,
  RETRO_EDIT_PAGE,
  RETRO_STATUS_PLUGIN_ID,
  STATUS_PLUGIN_ID,
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
  requires: [IWebRtcManager],
  optional: [IStatusBar],
  activate: (app: JupyterFrontEnd, manager: IWebRtcManager, status?: IStatusBar) => {
    if (!status) {
      return;
    }
    const model = new WebRtcStatus.Model();
    model.manager = manager;
    const item = new WebRtcStatus(model);
    status.registerStatusItem(STATUS_PLUGIN_ID, { align: 'right', item });
  },
};

const retroStatusPlugin: JupyterFrontEndPlugin<void> = {
  id: RETRO_STATUS_PLUGIN_ID,
  autoStart: true,
  requires: [IWebRtcManager],
  activate: (app: JupyterFrontEnd, manager: IWebRtcManager) => {
    const retropage = PageConfig.getOption('retroPage');
    if (!retropage) {
      return;
    }

    const ext: DocumentRegistry.IWidgetExtension<any, any> = {
      createNew: (widget) => {
        const toolbar = (widget as any).toolbar as Toolbar;
        if (!toolbar) {
          return;
        }
        const model = new WebRtcStatus.Model();
        model.manager = manager;
        const item = new WebRtcStatus(model);
        if (retropage === RETRO_EDIT_PAGE) {
          const spacer = Toolbar.createSpacerItem();
          toolbar.addItem(`${RETRO_STATUS_PLUGIN_ID}-spacer`, spacer);
        }
        toolbar.addItem(RETRO_STATUS_PLUGIN_ID, item);
        return new DisposableDelegate(() => item.dispose());
      },
    };

    app.docRegistry.addWidgetExtension('Notebook', ext);
    app.docRegistry.addWidgetExtension('Editor', ext);
  },
};

export default [plugin, statusPlugin, factoryPlugin, retroStatusPlugin];
