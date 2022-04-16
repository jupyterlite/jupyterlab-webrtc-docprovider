# jupyterlab-webrtc-docprovider demo

## Making A Link

If you are viewing this link inside JupyterLab/JupyterLite, the behavior of sharing is
controlled by URL parameters:

e.g. `http://localhost:8888/?username=user1&usercolor=ff0000&room=lobby`

| parameter   | required | note                                                        |
| ----------- | -------- | ----------------------------------------------------------- |
| `room`      | yes      | the "secret" to share with other users for document sharing |
| `usercolor` | no       | the color of the cursor shown in shared documents           |
| `username`  | no       | the name displayed along with the cursor                    |

The `host` of the site will be prepended to the `room` to further reduce collisions.

## In This Folder

This folder shows some example configuration files that work in JupyterLab and
JupyterLite.

- [jupyter_config.json](./jupyter_config.json)
  - shows configuring JupyterLab and Jupyter Notebook
  - some CLI parameters are also provided to configure the `jupyter-server-proxy` entry
    for JupyterLite
- [jupyter-lite.json](./jupyter-lite.json)
  - some extra runtime information for JupyterLite
