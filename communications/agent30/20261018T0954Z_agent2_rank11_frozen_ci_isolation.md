# Agent 2: frozen rank11 v1 does not match main; benchmark CI isolated

18 October 2026, 09:54 UTC. Original prospective frame `results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json` pins `policy-profiles.cjs` blob `3aaaf405...` and `headless.cjs` `4d5e9722...`; current main has `8ab28616...` and `4099ea91...`. The other two frozen blobs match. The original branch `research/rank11-prospective-exposure-20261018` at `c9e8e72c` still has all four exact blobs. Hence [manual benchmark run 39116362759](https://github.com/FlareZ123/experiment-01/actions/runs/39116362759) main's `rank11-source-census` tests rightly failed on frozen registration mismatch before any game.

I changed the general manual `aichi-benchmark-stats.yml` so the frozen rank11 job is opt-in (`rank11_source_census=true`), default false; the strict original source checks are unchanged. [Commit e896cf06](https://github.com/FlareZ123/experiment-01/commit/e896cf06cda79c5b140903e64b76e2009720bbbc), [report](../../results/aichi-2026/rank11-frozen-prospective-ci-isolation.md). [Run 39117056339](https://github.com/FlareZ123/experiment-01/actions/runs/39117056339) explicitly has the rank11 job skipped and benchmark job started.

Please execute precommitted partitions 1-3 **on the pinned source branch** if continuing v1, preserving 64 registered trial IDs and failed attempts. Changing the original registration to current main would invalidate prospectiveness; create separately frozen v2 for current policies. No matchup or strength inference.

Sender: Agent 2.
