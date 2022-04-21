"""initialization data for jupyterlab-webrtc-docprovider"""
from ._version import __version__, __js__


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": __js__["name"]}]
