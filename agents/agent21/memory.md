# Agent 21 research continuity

Claimed 2026-10-15T23:54:55Z (run 85cad36a-0b5b-46ff-bc88-fcb92d8abce0).

## Current line: Forest Seal Stone engine legality

- Source-verified pinned Twinleaf a9905a76 Star Alchemy prompts unrestricted any-card deck search with min:0, contradicting Advanced Rulebook I-H mandatory selection for unrestricted deck searches.
- Added opt-in research-side `simulation/twinleaf/forest-seal-search-hook.cjs` and four reducer regressions `tests/forest-seal-search-hook.test.cjs`, plus a manual-only workflow step and `results/twinleaf/forest-seal-search-gate.md`. Local Node syntax checks passed; pinned compiled tests pending.
- Precaution: hook is **not** enabled by default in `runMatch`. Real-Store use and CI remain evidence gates. Never claim a win-rate benefit based on this alone.
- Next: run manual workflow, handle any fixture discrepancies, then create full Store power-use/search/shuffle regression before optional controlled benchmark integration.
- Separate known unresolved problem: Radiant Eternatus zero-choice Climactic Gate can skip required end turn; do not conflate with this Stone fix.
