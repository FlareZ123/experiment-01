# Early Benched-Mewtwo Battle Compressor: actual source-dealt turn-3 play without attack conversion

**Agent 35 | 21 October 2026 UTC | retrospective development-only native A/B.** The fixed 60-card lists were unchanged. The single intervention under test was `AGENT32_COMPR_BENCHED_DEV=true` versus false, using the existing canonical bilateral development policy on both physical seats. **No competitively qualified games or demonstrated matchup win percentages.**

## Native execution and control

[Manual compiled workflow 39617965707](https://github.com/FlareZ123/experiment-01/actions/runs/39617965707) completed **success**, from exact head `c9a16e19827b8befdbb9238bbc34e9178a338829`; preserved [raw paired four-arm artifact 12353222794](https://github.com/FlareZ123/experiment-01/actions/runs/39617965707/artifacts/12353222794) (138,715 bytes, as reported by GitHub Actions). The same job generated a disabled control `agent32-anyturn-compressor-control.json` and enabled treatment `agent7-canonical-actor-fourarm.json`, required all four trial IDs, identical source-deal fingerprints/actual starter seats and zero competitively qualified games, and printed per-arm `DONOR_PAIR` receipts in the native job log.

The production path is `simulation/evaluation/agent41-bilateral-v2-development.cjs` with `earlyBenchedCompressorPayload` on the treatment, `simulation/twinleaf/headless.cjs` handling `newMoonAttackPayloadCompressorBenchedSeat`, and `simulation/twinleaf/new-moon-compressor-payload-policy.cjs` selecting a held Battle Compressor when Mewtwo & Mew-GX is Benched and an owner-deck donor is sought. This compares the same authentic *historically selected* rank6 and rank11 deal registrations; it is **not held-out or prospective**. The generic native fallback, card-engine and source-policy competence, hidden-information boundaries, true adverse source lock, and paper-clock fidelity remain unqualified.

## Four attempted arms: directly reported Store root records

| Exact original source / candidate | Physical source-deal SHA256 prefix | OFF actions/status | ON actions/status | Actual owner Battle Compressor roots ON | Root-action SHA256 equality |
| --- | --- | --- | --- | --- | --- |
| Rank 6 / champion reference | `2ce05954cf7a` | 35, native terminal, source seat 0 | 35, identical | 0 | Identical |
| Rank 6 / New Moon fixed 60 | `2ce05954cf7a` | 200, native terminal, source seat 0 | 200, identical | 0 | Identical |
| Rank 11 / champion reference | `9bc69d70743d` | 260, action cap | 260, identical | 0 | Identical |
| **Rank 11 / New Moon fixed 60** | `9bc69d70743d` | **260, action cap** | **260, action cap** | **One PlayCardAction, global turn 3, root ordinal 21** | **Different** |

For the consequential fourth arm, the control root SHA256 was `d36f2d0cea103453dd7338363116ec9413eb43d1443e08b9e05ec202e36d1001`. Treatment was `8949fb294985f7ef54f63c8ec56f7857e67e8fd8f9caf3a5fdddf9535bf6447a`. Each row retained exactly the same `sourceDealFingerprint`, checked by the live job. The other root SHAs were unchanged: rank6 champion `6f471591b6b4de41a18ba9c0557644dc194a084ad2af14e48eecc6f70e66e334`, rank6 New Moon `414c088cdedbeb511dbeaec05bb26ad5c21a65b87f6a65b77d3abcf9e7c719c1`, and rank11 champion `b55152340296c3e0c64baee895e6698644cde83be1f949a67573a59bc892abf33`.

The treatment's rank11 New Moon candidate declared **seven Future Sight attacks** late in its capped game, at root ordinals 190, 201, 217, 227, 237, 247 and 257 (global turns 49–61). None of the reported candidate attack names in this arm was copied Poltergeist or Night Watch; the run remained censored with **no proven Prize conversion or candidate victory**. This is a narrow native sequence observation: the report has not independently inspected the internal owner deck-search selection payload or the post-Compressor discard contents. A successful held-Item `PlayCardAction` and changed root history alone **do not prove** that both desired GX donors were selected and established or that a playable Mewtwo attack became available.

The rank11 champion continued its original repeated Get Lost sequence, and rank6 comparisons remained exactly action-identical. The enabled option has observed exposure **in just one of the four original arms** and provides no evidence for broad field strength.

## Interpretation and actionable handoff

The early Benched-Mewtwo line has a concrete, naturally dealt timing opportunity and was accepted as a real turn-3 Item root. **It did not fix the policy's game-length / attack-conversion failure on this deal.** The next causal experiment, if resource justified, should inspect that exact root's owner-visible `candidateOwnDeckSelectionEvidence`, subsequent discard zone and Mewtwo attachment/Active mobility, then test a single versioned follow-through change under an identical common policy. Compare the entire later Store attack settlement and source continuation against the unchanged same-deal control. See [Agent 32's precursor census](agent32-rank11-late-compressor-conversion-bottleneck-20261021.md) and the [central decision index](../README.md).

Do not promote this as a validated New Moon win or as an independent sample of 32 opponent matchups. The benchmark remains **29 of 32 exact verified source 60s and zero competitively qualified games**.
