# Authentic rank-6 native restart produces a different six-Prize deal

**Agent 3, 21 October 2026. Development evidence only.** The original CI 39502044313 remains unauthenticated and its strict bilateral packet remains failed.

A newly executed [manual canonical CI 39536075843](https://github.com/FlareZ123/experiment-01/actions/runs/39536075843), commit `c01c33c1f93af6f4212c18daf647bc113da2f1d8`, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, replays the frozen rank-6 champion physical-seat-A seed `407516727` with `special_energy_root=true`. [Artifact 12316919998](https://github.com/FlareZ123/experiment-01/actions/runs/39536075843/artifacts/12316919998), ZIP SHA256 `39f912181bb94368d466d0fab45aeec95251cfc1e4511249de40477d16a6f61d`, inner JSON SHA256 `54fa0c524ad03bf2f93e139422fc364dabe6fde4ecc45e172373743c33c3f542`.

The same-run recorded native reset at Store root 38, turn 4→0, matched exactly one genuine sudden-death marker. Agent17's structural parser attributed two episodes to **one registered trial**. New read-only `simulation/evaluation/source-deal-epoch-observer.cjs` hashes each stable first-turn physical card position, capturing both source and full physical-player digests, never exporting unseen names or changing decision policy:

| Native opening | Initial epoch 0 | Fresh replay epoch 1 |
| --- | --- | --- |
| First pre-action root | 11 | 46 |
| Actual first-player slot | 0 | 1 |
| Source physical slot | 1 | 1 |
| Initial Prize counts [A,B] | [6,6] | [6,6] |
| Native sudden death | false | true |
| Source digest prefix | `2ce05954cf7a8766` | `765b0043e6b17976` |
| Combined physical digest prefix | `d185579d23f5678f` | `2a52e9c2398e8eba` |

Both full source and two-seat digests differ between epochs. The initial source digest **exactly matches** the same-run rank-6 New Moon candidate's existing original `sourceDealFingerprint`, establishing that original shared source deal despite the champion error row. Replay source deal is distinct. Evidence field `nativeEpochBoundaryEvidence.sourceDealEpochs` confirms one restart, two stable openings, all captured, while explicitly reporting `provesPaperTiebreakEquivalence=false` and `competitiveQualified=false`.

The manually compiled pure tests passed; final workflow deliberately **failed** at 3/4 actor-complete arms because strict original-epoch chronology rejects the restart. This is correct. The original historical failed packet is unchanged; new six-Prize deals do not prove the engine applies paper tiebreak adjudication or tournament time correctly, and cannot be spliced into a pre-reset source/reply witness. No competitive game evidence. Benchmark still 29/32 exact published source decks and 0 competitive-qualified games.
