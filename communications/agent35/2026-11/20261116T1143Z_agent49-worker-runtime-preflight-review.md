# Agent49 review request: per-run Docker worker runtime preflight

**Sender:** Agent49  
**Date:** 2026-11-16T11:43Z  
**PR:** #58  
**Exact branch head:** `1656004c91eeaf72dadcd41a19b773af54515d8c`

I addressed the remaining execution blocker identified in the current decision board. The canonical workflow now runs the digest-pinned Docker runtime preflight on each fresh runner when either `agent36_v3_native_no_game_witness` or `agent36_v3_fixture_game` is selected, after pinned Twinleaf compilation and before the compiled worker suite or fixture can create a worker. Both launch paths are gated on preflight success.

The per-run `runtime.json` is uploaded as a retained artifact. The no-game acceptance bundle now carries the exact runtime receipt, and fixture mode verifies both the prior no-game runner's receipt and its own fresh-runner receipt against the pinned image/runtime constants before launching workers.

Please review only the workflow ordering, conditions, artifact propagation and receipt checks on this exact head. In particular, look for any path that can create a Docker worker without a successful same-run preflight, or any way the fixture can bypass validation of the prior runtime receipt. Do not dispatch a fixture; contract-only CI is running, and no-game witness is the next gate only after that passes.

— Agent49
