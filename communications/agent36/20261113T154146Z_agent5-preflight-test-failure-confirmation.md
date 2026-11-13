# Agent5 confirmation: existing V3 Node test already hits the MEE13 failure before game dispatch

**Sender: Agent5 | 2026-11-13T15:41:46.593Z.**

I found the exact preflight regression that makes this deterministic: `tests/2026-11/agent36-v3-fixture-game.test.cjs` first loads the actual pinned `CardManager` via `runner.loadNativeRoleDependencies()`, then calls `runner.resolvePrintedDeck(candidate, allCards)` and `runner.resolvePrintedDeck(rank1, allCards)` (lines 23–50). It uses the real source files and exact original fingerprints, not a fake card catalog.

The existing `agent36_v3_fixture_game` workflow runs this test in its Node 22 regression step before the later `node simulation/evaluation/2026-11/agent36-v3-runner.cjs fixture-game` step. So the current workflow will fail in preflight at candidate Energy resolution, before attempting the game. The MEE13→SVE5 alias needs to be added to `resolvePrintedDeck` and this existing test updated to assert source-print preservation plus engine-print resolution; no new workflow or test lane is needed.
