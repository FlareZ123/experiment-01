# Agent 11: full-Bench Call for Family paper mismatch, exact 128-arm retrospective native compatibility

**4 Nov 2026. Development-only, zero qualified competitive paper games.**

Independent verification: [four original archive audit](../../../scripts/agent11-c11-fullbench-retro-archive-audit.cjs), [successful CI 41905080477](https://github.com/FlareZ123/experiment-01/actions/runs/41905080477). The check confirms 105 complete unchanged original traces and 23 identical pre-error prefixes followed by a native Pass.

## Mechanism and immutable sources

The [pre-registered Quick Ball v4 study](agent11-v4-quickball-128-matched-native-20261104.md) captured 23 actual pinned Twinleaf errors: original source rank11 Trubbish FST used Call for Family into five occupied Bench slots. Advanced Player Rulebook **C-11** says this attack ends before searching the deck. Native Store threw `NO_BENCH_SLOTS_AVAILABLE`. The true native original result and abort evidence remain immutable.

The [default-off research-side compatibility guard](../../../simulation/twinleaf/agent11-fullbench-call-family-native-pass-guard.cjs) detects the exact real-Store Active Trubbish, attack Call for Family and five occupied Bench condition, and replaces the bot's intended AttackAction with a native PassTurnAction. Pass ends the turn but does not count as attacking, so this is **a limited counterfactual approximation**, not certified faithful paper implementation. Neither vendor code nor original decklists change. [Five unit tests](../../../tests/agent11-fullbench-call-family-native-pass-guard.test.cjs) passed in each replay's CI.

The separate **retrospective** replays reused the same 16 original v4 seeds, two physical rank5 seats and control/tutor mode in each Quick Ball profile. The compatibility policy was chosen **after observing the initial failures**. Both source original 60s remained unchanged, pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, same retro repo checkout `5aaf09d0312869ac95a1304e2deb862e66c58fa8`.

- Quick Ball OFF + C-11: [CI 41903387542](https://github.com/FlareZ123/experiment-01/actions/runs/41903387542), artifact `13359077831`, ZIP SHA256 `807d4e727f5084b3b392ecc42a55ee9f6531da71a8755741abb5f3d88275a612`, JSON SHA256 `55cd13474d0618de436b5c8ca81c7e2319375e6ee1ed81e6f9b326f5e4455433`.
- Quick Ball ON + C-11: [CI 41903405698](https://github.com/FlareZ123/experiment-01/actions/runs/41903405698), artifact `13360141136`, ZIP SHA256 `5bcfa2a45a73da1c98773a8908352bda5f732ff027535906effdaeb36db967be`, JSON SHA256 `8da2270bd28377f782060f952e7d056a57070f3569f657a4c1c6f46e052ae6b6`.

## Native Store outcomes

| Measure, 64 arms/profile | Original OFF | Guard OFF | Original ON | Guard ON |
| --- | ---: | ---: | ---: | ---: |
| Native terminal outcomes | 13 | 13 | 6 | 6 |
| Native engine errors | **10** | **0** | **13** | **0** |
| 90-action caps | 41 | 51 | 45 | 58 |
| Native rank5 wins | 5 | 5 | 0 | 0 |
| Native rank11 wins | 8 | 8 | 6 | 6 |
| Accepted full-Bench Pass substitutions | 0 | **59** | 0 | **65** |
| Qualified paper games | 0 | 0 | 0 | 0 |

Full source-deal SHA and first-turn position equal **64/64** within each unguarded/guarded profile, recovering original abort-only proofs where normal result fields were missing. For all originally nonerrored attempts, **54/54 OFF** and **51/51 ON** retained **identical complete root-action ledgers, root SHA, decision SHA, native status and winner**. For all **23 originally errored** attempts, their independently captured successful action ledger was **an exact prefix** of the retrospective guard ledger, and the guarded native action at the formerly failing ordinal was **PassTurnAction**. Every previously errored attempt subsequently reached the 90-action cap. Guard audit recorded 59/65 accepted substitutions and **zero rejected**.

This validates narrow technical isolation of the compatibility shim, along with the persistent source policy's repeated low-value full-Bench attacks. It cannot validate attack-trigger semantics, original source strength, or Quick Ball value. Both Quick Ball profiles still have unrealistic opponent choices and unequal *game turns* per 90 counted engine actions. Neither a release-quality simulator nor the objective 99.5% fixed-deck result follows from these developmental observations. A real fix must emulate the full paper attack resolution, including any attack declarations or reactions.
