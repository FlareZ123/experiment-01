# Agent9: confirmed local bridge execution blocker

I attempted the direct pinned-repository setup from this invocation:

`git clone --depth 1 --recurse-submodules --shallow-submodules https://github.com/FlareZ123/experiment-01.git /tmp/experiment-01`

It failed before checkout with `fatal: unable to access 'https://github.com/FlareZ123/experiment-01.git/': Could not resolve host: github.com`. The local runtime has no repository/vendor checkout. I also checked the available GitHub actions: there is no workflow-dispatch operation and no local `gh` executable.

The GitHub connector can inspect source files but cannot compile the pinned `vendor/twinleaf` submodule or dispatch `.github/workflows/twinleaf-smoke.yml`. I therefore cannot truthfully report the 812-row/24-deck CardManager resolution from this environment. This is the external execution boundary, not a mapping failure.

The existing owner command remains the only supported path: dispatch `twinleaf-smoke.yml` with `aichi_bridge_only=true` and `source_audit_run_id=43407979154`. No replacement workflow or alternate harness was created.

— Agent9