# Source rank-6 actor-only Special Energy: native paired policy sensitivity, with a strict chronology failure

**Agent 3, 20 October 2026.** Reproducible development result, **not competitive evidence**. Baseline and intervention match at identical repository commit, frozen 60-card decks, seed, source placement and original Store deal. The augmented source policy changes public action and attack trajectories enough to reverse one observed game's winner. Another authentic arm fails a strict root chronology invariant. Thus neither run qualifies as a complete competition panel.

## Question and source boundary

The published 60-card **rank 6 Kazuma Kashi Iron Thorns ex** (in [Aichi full-decklists.json](../aichi-2026/full-decklists.json)) contains **zero Basic Energy** and exactly eight Special Energy:

| Registered energy printing | Count | Modeled attached units |
| --- | ---: | --- |
| Speed Lightning Energy RCL 173 | 4 | one Lightning |
| Capture Energy RCL 171 | 2 | one Colorless |
| Spiky Energy JTG 159 | 1 | one Colorless |
| Double Colorless Energy SUM 136 | 1 | two Colorless |

The exact texts have independent card-pool support from bundled `cards/en/swsh2.json`, `cards/en/sv9.json`, and `cards/en/sm1.json`. Thunder Mountain Prism Star reduces one Lightning symbol of a Lightning Pokémon's attack cost if in play. Temple of Sinnoh replaces attached Special Energy effects with one Colorless unit in the bounded source model. Native Twinleaf remains the last word for individual `PlayCardAction` acceptance. No print-family generalization or extra Special Energy mechanic is inferred.

Before this change, the ordinary actor-only root `agent34-actor-only-root-policy.cjs` could attach Basic Energy but could not deliberately attach these ordinary source Special Energy cards. Agent 1's separately controlled direct DCE/Thunder ALS was not enabled in this paired experiment. The source-specific G&H attack pressure script remains enabled and is known to be limited.

## Implementation

- [Agent3 exact-source frontier](../../simulation/twinleaf/agent3-special-energy-frontier.cjs): pure numeric Energy-unit model, owner-hand frontier and public-Stadium check. Unsupported printings return null.
- [Shared Actor34 root](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs): **default-off** `AGENT3_SPECIAL_ENERGY_ROOT_DEV=true`, chooses owner-visible Special attachment, constructs the same real `PlayCardAction` to Active, and retains existing native acceptance audit.
- [Existing root physical witness](../../simulation/twinleaf/agent5-owner-root-slice.cjs): accepts the new `attach-special-energy` and preexisting `attach-dce` intent kinds, checking a real printed Energy moved into Active, without assuming a decrement in hand count after on-attach draw.
- [Pure regression tests](../../tests/agent3-special-energy-root.test.cjs): source-printed unit counts, duplicate colored costs, Temple override, attach lock, missing/unknown Special fallback, opponent concealed-card independence, native physical witness, and Thunder/attack precedence.
- [Existing canonical workflow](../../.github/workflows/agent7-canonical-actor-bilateral.yml): an opt-in `special_energy_root` input in the established canonical actor-only CI, no new preferred runner or automatic workload.

The first manual [compiled run 39500543277](https://github.com/FlareZ123/experiment-01/actions/runs/39500543277) revealed an unrecognized native post-dispatch witness intent. That **integration assertion** was repaired before the paired comparison. Pure tests pass in subsequent compiled runs.

## Frozen on/off comparison at the exact same source revision

| Field | OFF baseline | ON intervention |
| --- | --- | --- |
| Repository commit | `0c7ef1b8cc510f4dec9dfcea20275d0e3bfb97ae` | identical |
| Pinned Twinleaf | `a9905a76` | identical |
| Canonical manual CI | [39501283122](https://github.com/FlareZ123/experiment-01/actions/runs/39501283122) | [39501241896](https://github.com/FlareZ123/experiment-01/actions/runs/39501241896) |
| Reproducible JSON artifact ID | [12300925538](https://github.com/FlareZ123/experiment-01/actions/runs/39501283122/artifacts/12300925538) | [12299478172](https://github.com/FlareZ123/experiment-01/actions/runs/39501241896/artifacts/12299478172) |
| Strict overall four-arm outcome | PASS, 4/4 complete audits | FAIL, 3/4 complete audits |
| Exact rank-6 New Moon source fingerprint | `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1` | identical |
| Opponent rank, seed, candidate physical seat | rank 6, `407516727`, candidate seat 0 | identical |
| Rank-6 New Moon source attack declarations | 1 | 6 |
| Rank-6 New Moon candidate attack declarations | 4 | 0 |
| Rank-6 New Moon actions | 200 | 233 |
| Rank-6 New Moon native recorded winner | candidate seat 0 | source seat 1 |
| Rank-6 New Moon accepted root actions | 56 | 70 |
| Rank-6 New Moon rejected root actions | 0 | 0 |
| Rank-6 New Moon newly selected Special attachments | 0 | 5 |

The five `attach-special-energy` decisions in the intervention's rank-6 New Moon native root audit were all made at **source seat 1**, not at the candidate seat. Three fell within the audit's first-64 accepted-root witness cap and directly confirmed the source Active Pokémon received the intended printing:

- global turn 4: Speed Lightning Energy RCL;
- global turn 6: Capture Energy RCL;
- global turn 26: Speed Lightning Energy RCL.

Each of these three has `accepted:true` and `nativePhysicalEffect:'confirmed-public-effect'`. Two additional Special attachments occurred after the per-root physical witness cap; the audited aggregate lists **70 accepted / 0 rejected** total roots and five Special intents. This verifies a genuine native owner-root policy difference. It does **not** establish sensible downstream prompt choices, matchup win probability, model fidelity, or a tournament-clock-compliant game. In this frozen development case, Source turn-two scripted G&H line completed on both sides, so the winner difference arose later in their different coupled development decisions.

Both rank-11 reference cases retained their original non-Special typed intent counts. Their original-root audits remained complete. Thus the explicit new component caused no observed rank-11 choice change in this four-arm panel.

## Failure that prohibits promoting the entire ON panel

Rank-6 **champion-reference** at the same ON commit failed strict `buildBilateralReplyPacket` chronology validation, reducing complete audits to **3 of 4**. A later diagnostic head `8b8cbdabbde517371fcd12bd372edfd597ad7fbe`, with an expanded error-only message, independently identifies:

```text
Malformed chronological Store root at ordinal 38 of 121
public={"actionOrdinal":38,"playerSlot":0,
"action":"ResolvePromptAction","turnBefore":4,"turnAfter":0,
"priorTurnAfter":4}
```

This is a real post-dispatch clock reset in the recorded native Store ledger, **not** a clean chronological game. It must remain excluded from a win-rate calculation; the existing strict packet rightly rejects it. The artifact is [manual CI 39502044313](https://github.com/FlareZ123/experiment-01/actions/runs/39502044313), artifact [12302240553](https://github.com/FlareZ123/experiment-01/actions/runs/39502044313/artifacts/12302240553). A further source-only Thunder reduction and attack-before-extra-attachment patch did **not** eliminate this reset in that run. The specific native engine/pressure/prompt interaction causing turn 4 to turn 0 remains undiagnosed.

**Critically, the four-arm ON CI is not green.** No win fractions or candidate power rankings should be pooled from this dataset.

## Interpretation and limitations

This paired intervention gives empirical support for a *methodological* claim: a game evaluator whose opponent cannot proactively attach any cards from its exclusively Special Energy supply can reverse the apparent winner on an otherwise identical native source deal. It should therefore not be used to rank optimized candidate decks as if its opponent were competent.

The policy is still deliberately weak and incomplete:

- Original SimpleTacticsAi generic fallbacks persist. In the ON New Moon arm, the last-chance root audit records **141** generic pending-prompt fallbacks.
- Source rank-6 direct G&H scripting and rank-11 Boost Shake scripting bias source behavior.
- The Energy unit model covers four exact paper printings, not every Expanded Special Energy or cost-changing effect.
- Public effects, Tool constraints, attacks and game clock have not received paper-certified full-game validation.
- An attack declaration is an authentic event, but any attack may still have incorrect text resolution in pinned Twinleaf.
- One changed game result is insufficient to estimate any matchup probability, much less the required 99.5% full-field benchmark.

The benchmark remains **29/32 exact Aichi Top32 source lists**, **zero competitively qualified games**, and **no demonstrated 99.5% fixed-list performance**.

## Priority next work

1. Preserve the strict chronological-failure gate and reproduce the rank-6 champion turn-4 `ResolvePromptAction` reset, examining player phases, native prompt effects and source scripted pressure without reading hidden opponent state.
2. Once the clock reset is understood, retest matched same-head cohorts with exact physical-seat origin attribution, source-owner Special attachments and printed AttackAction declarations in both historical and true source-first arms.
3. Extend to correct owner-visible multi-turn Special choices and prompt resolution before using any full-match outcomes to compare candidate decks.
4. Evaluate one nominated unchanged 60 across all 32 exact opposing decks only when all required lists and a competent, auditable two-sided policy are available.

**Evidence classes:** source card inventory and rules (documented card text), unit frontier and fail-closed rules (code), selected/accepted native actions (computational observation), one game outcome reversal (unqualified simulator observation), clock reset (strict-audit failure). No competitively qualified strength result.
