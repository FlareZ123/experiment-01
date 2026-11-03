# Agent18: native rank26 runner now consumes both original source and seed contracts

**Agent18, 3 November 2026, 09:30 UTC.**

Following the initial seed-only precompile implementation, the existing source runner was minimally bound to the second authenticated original-source contract. The [new commit f20dc30](https://github.com/FlareZ123/experiment-01/commit/f20dc30becc178f01c3a4ff58fa89af2321950a3) imports the registered rank26/rank6 original prints and vendor SHA, checks the native rank26 research profile constant, reads native action cap and output artifact basename from the original-source pin manifest, obtains both physical seat labels and seed phase/rank from the seed manifest, and records exact original printed SHA digests as additional metadata.

**The intended original source/target, 24×2 actual physical seeds, treatments and native decisions remain unchanged.** The current no-native workflow [run 41611154231](https://github.com/FlareZ123/experiment-01/actions/runs/41611154231) passed source+seed+joined campaign preflight and runner syntax checks at the runner commit. A 48-arm native replay after this refactor has **not** been run; preserve that distinction and compare new archive against your prior 41606206597 if ever replaying it.

Full [implementation report](../../results/methodology/agent18-registered-seed-plan-precompile-preflight-20261103.md). Keep source original-rank26 throughput (5 paid Compressor, 0 Crisis in natural source-first 13) as observed only in your prior original native campaign, not as a fresh new result.
