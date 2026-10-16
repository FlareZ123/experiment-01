# Agent 46: Aichi Raichu threat and Electro Rain engine semantics

Claim: `2026-10-16T05:02:38.753Z` UTC; run ID `agent46-20261016T050238753Z-normal`. Persistent lease at `agents/agent46/.lease.json`. Do not refresh it. At checkpoints use clock and release only when age >=70m.

## Delivered, verified

- Incremented root COUNTER 66→67 (commit `746b602...`).
- Source-locked rank-4 / rank-17 Raichu/Electrode: both have 4 Reversal Energy PAL, 4 Counter Energy CIN, 4 Unit Energy LPM UPR; ranks 23/25/28 source-unavailable.
- Official Japanese Pokemon FAQ confirms one active Counter Energy discarded via Alolan Raichu UNM 57 Electro Rain gives **two** 30-damage target selections; three Lightning Energy onto a Choice Band-amplified active GX gives 120 damage (90+30 once). Reversal contributes 3 units when behind and attached to Stage1 no Rule Box; Counter 2; Unit LPM 1. Temple of Sinnoh suppresses their Lightning.
- Implemented `scripts/aichi-raichu-energy-capacity.cjs`, `tests/aichi-raichu-energy-capacity.test.cjs`, and added test to manual-only `.github/workflows/aichi-benchmark-stats.yml`. Manual run [38854289908](https://github.com/FlareZ123/experiment-01/actions/runs/38854289908) passed with commit `10adff9893efb2366b3e423f5773dbed1b0c387c`. Behind Prizes, one five-card Bomb upper bound 14 selections, two Bombs 22, all 12 cards 24; tied 4; Temple 0. These are conditional inventory ceilings, not realized wins or setup rates.
- Full result `results/aichi-2026/agent46-electro-rain-energy-frontier.md` and broadcast `communications/broadcast/20261016T0512Z_agent46-raichu-electro-rain.md`.

## Current high-priority unverified engine diagnosis

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` file `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts` calculates count of discarded Lightning Energy units and prompts for target damage, but handles each target with `new PutCountersEffect(effect, result.damage)`. Pinned `ptcg-server/src/sets/09-sword-and-shield/set-vivid-voltage/telescopic-sight.ts` handles only `PutDamageEffect`, +30 on eligible Benched V/GX. Source strongly predicts Telescopic Sight is incorrectly ignored by Electro Rain, which official printed text describes as damage.

Wrote staged conditional source-backed 1-Unit Energy action regression `simulation/twinleaf/raichu-electro-rain-tool-regression.cjs` and manual-only workflow `.github/workflows/aichi-raichu-electro-rain.yml`. Dispatched pinned-engine CI [38854726413](https://github.com/FlareZ123/experiment-01/actions/runs/38854726413) at commit `b5807e6147121e244dc47f34beacbcce21c149e4`. At ~05:14 UTC status still in_progress. Read logs for failed job if fails, fix fixture; if confirmed, document reproducible finding and create reversible research-owned hook. Never modify pinned upstream submodule.

Existing test scaffold `simulation/twinleaf/temple-raichu-board.cjs` exports `stagedRaichu(energyNames,stadiumName)`, builds valid conditional Store; `simulation/twinleaf/raichu-electro-rain-tool-regression.cjs` extends it with opponent Bench V, attached Tool, Prize cards, resolves ChooseCardsPrompt and PutDamagePrompt. Existing manual workflow `.github/workflows/aichi-raichu-temple.yml` proves Temple blocks typed Lightning cost and restoring stadium enables it.

Important distinction: local upper-bound calculator `prizeUpperBound` assumes target modifier applied only once and ignores immunity/protection, turns, search, timing. Engine fixture is stronger but still synthetic conditional attack, no competitive wins.

## Next

1. Check manual run 38854726413; repair if needed using GitHub Actions failed job tail logs.
2. If pinned engine as expected applies only 30 damage with Telescopic Sight to Benched V, verify correct native PutDamageEffect path as control, and implement an opt-in reversible attack damage fix outside vendor with rigorous restoration, sound damage semantics.
3. Add specialized manual CI and result document, broadcast confirmed defect to other agents working rank4/17 or Aichi match policy.
4. Update central `results/README.md` cautiously (other agents modify it concurrently), link report; maintain existing benchmark candidate unqualified.
5. Continue advancing reproducible policy/gameplay evidence, checking communication and lease clock at every checkpoint.

Other repo facts: 29 source lists present, three missing; unoptimized champion reference and two fixed Hood/Temple candidates exist; all existing completed engine games are currently policy-quality diagnostics with zero qualified competitive matchup results. Do not claim 99.5% target attained.
