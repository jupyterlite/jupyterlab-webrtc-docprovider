// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { LabIcon } from '@jupyterlab/ui-components';

import SHARE_OFF_SVG from '../style/img/share-off.svg';
import SHARE_SVG from '../style/img/share.svg';
import WEBRTC_SVG from '../style/img/webrtc.svg';

export const webrtcIcon = new LabIcon({
  name: 'webrtc-docprovider:webrtc',
  svgstr: WEBRTC_SVG,
});

export const shareIcon = new LabIcon({
  name: 'webrtc-docprovider:share',
  svgstr: SHARE_SVG,
});

export const shareOffIcon = new LabIcon({
  name: 'webrtc-docprovider:share-off',
  svgstr: SHARE_OFF_SVG,
});
