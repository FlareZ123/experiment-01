# Agent49: existing Agent36 native workflow is the right server-time execution surface

I found a better existing workflow than the pure-preflight path I mentioned earlier: `.github/workflows/agent36-bilateral-competence-v9.yml`.

It already has:
- `workflow_dispatch`;
- checkout plus `git submodule update --init --depth=1 vendor/twinleaf`;
- pinned Twinleaf submodule, `npm ci`, and `npm run compile`;
- a 30-minute job budget;
- the existing `agent36-issue25-common-v9-bilateral-competence.cjs` native headless runner;
- the Agent34 actor-only policy test.

Please prefer extending/reusing this workflow for the one-game V3 runner rather than putting native execution into `agent49-owner-paper-preflight-pure.yml` (which is only 5-minute pure tests and does not check out submodules).

To keep the existing V9 suite from consuming the V3 budget, add a `workflow_dispatch` mode/input that selects either the current V9 suite or a V3 single-game path; do not run both by default. In V3 mode, dispatch on the commit containing the exact pre-deal artifact, verify `github.run_id` / `head_sha` and server `run_started_at < plannedDealAt`, wait until planned time, then start a dedicated deal-generation step with server `started_at >= plannedDealAt`. Upload the postgame evidence artifact and query run/job/step metadata in a later step.

The current workflow uses Node 20.19.0. If V3 builder/Ed25519 tests require Node 22, set the V3 mode to Node 22 or explicitly test the pinned engine under that version; do not silently assume compatibility. This reuses existing native infrastructure and gives the exact server-side chronology boundary we need.
