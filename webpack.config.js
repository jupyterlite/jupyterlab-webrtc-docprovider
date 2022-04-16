// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      crypto: false,
    },
  },
  module: {
    rules: [
      // Fix WebRTC buffered transmission: https://github.com/yjs/y-webrtc/pull/25
      {
        test: /y-webrtc\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'simple-peer/simplepeer.min.js',
          replace: ['./', '..', '..', '..', 'vendor', 'SimplePeerExtended.js']
            .join(path.sep)
            .replace(/\\/g, '\\\\'),
        },
      },
    ],
  },
};
