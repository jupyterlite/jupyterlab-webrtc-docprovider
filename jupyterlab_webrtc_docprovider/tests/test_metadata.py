"""minimal tests of jupyterlab-webrtc-docprovider"""


def test_version():
    """is the version set?"""
    from jupyterlab_webrtc_docprovider import __version__

    assert __version__


def test_labextensions():
    """does it package exactly one labextension?"""
    from jupyterlab_webrtc_docprovider import _jupyter_labextension_paths

    assert len(_jupyter_labextension_paths()) == 1
