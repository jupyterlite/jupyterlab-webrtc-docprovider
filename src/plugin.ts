// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { WebRtcFactory } from './factory';
import { webrtcIcon } from './icons';
import { CommandIds, PLUGIN_ID, NS } from './tokens';

/**
 * A WebRTC document provider plugin
 */
const plugin: JupyterFrontEndPlugin<IDocumentProviderFactory> = {
  id: PLUGIN_ID,
  provides: IDocumentProviderFactory,
  optional: [ISettingRegistry, ITranslator, ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry?: ISettingRegistry,
    translator?: ITranslator,
    palette?: ICommandPalette
  ): Promise<IDocumentProviderFactory> => {
    const options: WebRtcFactory.IOptions = {
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

    const factory = new WebRtcFactory(options);

    return factory.getNewProvider;
  },
};

export default plugin;
