# Nine original Regidrago fixed-60 field test: Temple did not activate under the shared native policy

**Agent39 | 9 November 2026 | Developmental only.**

## Decision

The fixed Temple Shadow Rider v1 60 did not show a robust advantage over the unchanged Aichi champion reference 60 across the nine authenticated original Regidrago lists using Double Dragon Energy. The more important observed limitation is actionable: the selected shared actor policy played **zero Temple of Sinnoh** cards in its 18 Temple-native games, despite executing 364 other `PlayCardAction` roots. The list substitution was exercised; its defining Stadium tactic was not.

A fresh, separately preregistered same-deck owner-public Stadium-policy experiment is being executed to resolve that deficiency. The original candidate list remains unchanged.

## Frozen study and reproducibility

- [Original frozen registration](../../aichi-2026/registrations/2026-11/agent39-temple-fixed60-nine-dde-prospective-v1.json): original Regidrago ranks 10, 12, 13, 14, 18, 20, 21, 27, 32, both physical seats, one independently generated 32-bit seed per rank/seat, 18 paired groups and 36 attempted genuine games. Candidate manifests are exactly the [rank1 champion 60](../../aichi-2026/benchmark-shadow-rider.md) and [Temple Shadow Rider v1 60](../../aichi-2026/candidate-temple-shadow-rider.md). Root cap: 260.
- [Executed registered runner](../../../simulation/evaluation/2026-11/agent39-temple-nine-dde-prospective-native.cjs) with the same pinned composed paper-semantics profile, same symmetric two-player actor policy, native physical opening matching, and independent per-seat policy/shuffle randomization.
- Native GitHub Actions [run 42576274998](https://github.com/FlareZ123/experiment-01/actions/runs/42576274998) **SUCCESS** at frozen branch head `3ecfa82169731591dfeeb2acacd05e3d7d429c5a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Archived full original native rows](https://github.com/FlareZ123/experiment-01/actions/runs/42576274998/artifacts/13655347427), artifact ZIP SHA256 `52948b4f99085afaa3f9fd6fa2eb0ed36d621099c49a1b71dbe6306c07f2bd65`. Archive includes `agent39-temple-nine-dde-native.json` and condensed per-pair matrix.

## Actual native results

| Recorded condition | Result |
| --- | ---: |
| Registered original-source real-game attempts | 36 |
| Native natural terminals | 27 |
| Root-260 unfinished caps | 9 |
| Engine errors | 0 |
| Source physical openings and actual starter matched | 16/18 pairs |
| Both terminal within correctly matched pairs | 10/18 |
| Champion-reference native candidate wins | 12/18 |
| Temple-native candidate wins | 10/18 |
| Champion minus Temple outcome interval over 16 matched groups, unresolved caps free to be win/loss | **−3 to +4 wins** |
| Competitively qualified paper games | **0** |

Source opening/starter mismatches were `18:0:A` and `21:0:B` and were never counted as causal matched comparisons. The interval is a deterministic partial-identification range, not a probability or statistical confidence interval. Its crossing of zero means the observed incomplete native games cannot select between these fixed 60s.

## The decisive practical deficiency: no observed Temple play

The separate [archived-root audit](../../../simulation/evaluation/2026-11/agent39-temple-nine-dde-artifact-reduce.cjs) ran on the exact frozen gameplay archive without changing any actions. Read-only [Actions run 42578273370](https://github.com/FlareZ123/experiment-01/actions/runs/42578273370) found:

- **364** native `PlayCardAction` actions across the 18 Temple candidate arms.
- **0** accepted `PlayCardAction` roots with `card: "Temple of Sinnoh"`, although `card` names are present in those real root records. The first samples were `Fog Crystal`, `Girafarig`, `Psychic Energy`.
- **62** opposing original Regidrago `Apex Dragon` attack roots in each fixed-60 arm.
- **18** retained pairwise first-root comparison records.

The original Temple treatment therefore did not exercise the intended Special Energy denial effect. This may be an action policy deficiency and does not demonstrate that Temple is intrinsically weak. The earlier isolated native eight-case Temple/DDE printed attack-payability fixture still supports the narrower mechanical interaction; it never established that a tournament game or this policy will reach and use Temple.

## Concrete follow-up under the unchanged Temple sixty

A new [fresh same-60 policy registration](../../aichi-2026/registrations/2026-11/agent39-temple-owner-stadium-policy-nine-dde-prospective-v1.json) compares the **same Temple v1 60** with the original actor policy versus an opt-in owner-only decision: play the genuinely held Temple when the public opponent board contains Regidrago V or VSTAR, the Stadium zone is empty, and the owner's once-per-turn Stadium action is available. The candidate, opponent decks, and other actor policies remain fixed. The source-neutral action applies equally to either physical player whenever applicable. It uses the existing native `PlayCardAction` and actual Store acceptance, with zero access to opponent hand, unknown Prize identities, or deck order.

- [Pure owner-visible selector](../../../simulation/twinleaf/2026-11/agent39-public-temple-regidrago-root.cjs)
- [Both-seat unit tests](../../../tests/2026-11/agent39-temple-regidrago-owner-root.test.cjs)
- [Native same-deck prospective runner](../../../simulation/evaluation/2026-11/agent39-temple-owner-policy-nine-dde-native.cjs)

**Limitations:** No official event clock, qualified independent paper adjudication, or strongly validated adversarial opponent policy. All native results remain development-only, including any future Stadium activation or native terminal winner differences. Ranks 23, 25, and 28 of the overall Top32 benchmark still lack authenticated original complete 60-card inventories. There is no fixed-deck selection and no established 99.5% field win rate.
