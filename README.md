# jupyterlab-webrtc-docprovider

[![install from PyPI][pypi-badge]][pypi] [![reuse from npm][npm-badge]][npm]
[![demo on Binder][binder-badge]][binder] [![GitHub Actions][ci-badge]][ci]

> Document collaboration for [JupyterLab], powered by [y-webrtc].

## Requirements

- Python >=3.7
- JupyterLab >=3.1
  - or a derived application like [JupyterLite] or [RetroLab]

## How to Use It

- [Install](#Install) the package
- [Configure](#Configuration) your server for collaboration
- Launch a [Lumino]-based Jupyter client that supports collaboration
  - e.g. JupyterLab 3.1+, RetroLab 0.3+, or JupyterLite (beta)
- Open the client with the `room` URL parameters
  - e.g. `http://localhost:8888/lab?room=demo`
  - optionally provide `username` and `usercolor`
    - e.g. `http://localhost:8888/lab?room=demo&username=jo&usercolor=e65100`
  - these parameters will probably be consumed, but _that's okay_
- Open a shared editing activity like _Notebook_ or _Editor_

## Install

To install the extension, run:

```bash
pip install jupyterlab-webrtc-docprovider
```

> For a development install, see the [contributing guide].

## How it Works

Unlike JupyterLab's built-in, purely WebSocket-based [collaborative] document provider,
`jupyterlab-webrtc-docprovider` relies on:

- an initialing [signaling server] to locate peers
- the [WebRTC] protocol to coordinate actual data exchange

## Configuration

### Server Configuration

Jupyter Server is configured with `jupyter_server_config.json`:

```json
{
  "LabServerApp": {
    "collaborative": true
  }
}
```

#### `collaborative`

This flag must be enabled for the provider to be used.

> In JupyterLite, this is a configurable of `jupyter-config-data` in
> `jupyter-lite.json`.

### Client Configuration

User-configurable settings can be pre-populated in
`{sys.prefix}/share/jupyter/lab/settings/overrides.json`: `roomPrefix` and
`signalingUrls` are security-related.

```json
{
  "@jupyterlite/webrtc-docprovider:plugin": {
    "disabled": false,
    "room": "an pre-shared room name",
    "roomPrefix": "a-very-unique-name",
    "signalingUrls": [
      "wss://y-webrtc-signaling-eu.herokuapp.com",
      "wss://y-webrtc-signaling-us.herokuapp.com",
      "wss://signaling.yjs.dev"
    ],
    "usercolor": "f57c00",
    "username": "Jo V. Un"
  }
}
```

> In JupyterLite, this can be configured with an `overrides.json`

#### `roomPrefix`

By default, the final room ID that is actually sent to the signaling server will be the
SHA256 hash of the configured room prefix and the chosen room name.

By default this prefix is the domain serving the site, but for common URLs (like
`localhost`) a more random prefix should be chosen.

#### `signalingUrls`

By default, a number of public signaling servers are provided, as described by
[y-webrtc], as shown above.

> **Note**: the signaling server, as the name suggests, should only know high-level
> metadata about your exchange, and should be protected from third-parties by standard
> SSL encryption.
>
> However, a real deployment should **not** rely on free hosted services at runtime.
> Some research would be required to find an appropriate server for your specific
> deployment.

#### `username`

The name displayed to others next to your cursor in shared editing sessions.

#### `usercolor`

A suggested color of your cursor, as displayed to others next in shared editing
sessions.

## Uninstall

To remove the extension, run:

```bash
pip uninstall jupyterlab_webrtc_docprovider
```

## Open Source

This work is licensed under the [BSD 3-Clause License][license].

The code was originally extracted from [JupyterLite] and [JupyterLab], which are also
covered under the BSD 3-Clause License.

Two vendored patches (special thanks to [@datakurre]) are applied to
[simple-peer](https://github.com/feross/simple-peer) and
[int64-buffer](https://github.com/kawanet/int64-buffer), both of which are licensed
under the MIT license, and should hopefully be merged some day.

[webrtc]:
  https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
[signaling server]:
  https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling#the_signaling_server
[y-webrtc]: https://github.com/yjs/y-webrtc
[jupyterlite]: https://github.com/jupyterlite/jupyterlite
[jupyterlab]: https://github.com/jupyterlab/jupyterlab
[retrolab]: https://github.com/jupyterlab/retrolab
[license]:
  https://github.com/jupyterlite/jupyterlab-webrtc-docprovider/blob/main/LICENSE
[collaborative]: https://jupyterlab.readthedocs.io/en/stable/user/rtc.html
[lumino]: https://github.com/jupyterlab/lumino
[contributing guide]:
  https://github.com/jupyterlite/jupyterlab-webrtc-docprovider/blob/main/CONTRIBUTING.md
[@datakurre]: https://github.com/datakurre/
[binder]:
  https://mybinder.org/v2/gh/jupyterlite/jupyterlab-webrtc-docprovider/main?urlpath=lab
[binder-badge]: https://mybinder.org/badge_logo.svg
[ci-badge]:
  https://github.com/jupyterlite/jupyterlab-webrtc-docprovider/workflows/Build/badge.svg
[ci]:
  https://github.com/jupyterlite/jupyterlab-webrtc-docprovider/actions/workflows/build.yml
[pypi]: https://pypi.org/project/jupyterlab-webrtc-docprovider
[pypi-badge]: https://img.shields.io/pypi/v/jupyterlab-webrtc-docprovider
[npm]: https://npmjs.com/package/@jupyterlite/webrtc-docprovider
[npm-badge]: https://img.shields.io/npm/v/@jupyterlite/webrtc-docprovider
