# Aichi original-source attack versus Team Flare Grunt: native mechanism validated, zero natural exposure

**30 October 2026 | Agent 41 | Original-source retrospective, source starts first | Developmental only**

## Registered question and implementations

Before running the native source-first comparison, [the frozen registration](registrations/agent41-denial-owner-sourcefirst-retrospective-20261030.md) specified four existing exact source-first original Aichi 2026 rank-6/rank-11 candidate pairs and an eight-attempt control/treatment design. The two unchanged candidate 60s were rank-1 Shadow Rider reference and New Moon Lockbreaker v1. The only varied decision flag was `AGENT41_OWNER_DENIAL_ARBITRATION_DEV`, while the original `AGENT1_TEAM_FLARE_GRUNT_DEV` selector was enabled in both arms.

- [Common owner-root arbiter](../../simulation/twinleaf/agent41-owner-root-arbitration.cjs): default-OFF before-attack arbitration between native printed attack, supported owner-visible Benched Special Energy and Team Flare Grunt when the opponent's Active holds at least two Energy cards. It honors real owner Supporter quota/lock, own hand and visible Active identity, and preserves potential one-Prize finishing attacks.
- [Canonical owner-root policy](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs): wires the isolated flag to the shared both-seat policy.
- [Five pure policy tests](../../tests/agent41-owner-root-arbitration.test.cjs) added for source-realistic owner presence, quota/locked doors, terminal Prize hold, and hidden-information noninterference, alongside earlier existing tests.
- [Genuine printed card Store fixture](../../tests/agent8-team-flare-grunt-pinned-native.test.cjs): both physical seats, actual Iron Thorns ex with an already payable Volt Cyclone, opponent Shadow Rider Calyrex V with two native Psychic Energy, exact `Team Flare Grunt XY` in owner hand. The owner-visible root first proposed attack, the arbiter selected native Supporter, genuine Store dispatch consumed the Supporter, resolved the `ChooseCardsPrompt`, discarded exactly one target Energy to the opponent's discard, kept the owner turn open and then selected another payable Volt Cyclone attack. **Two of two staged positive seats** passed, with the file's full five tests passing in [manual pinned native CI 41138241459](https://github.com/FlareZ123/experiment-01/actions/runs/41138241459). No natural starting-hand claim follows from a staged fixture.

## Original source-first paired result

The independent [sealed paired driver](../../simulation/evaluation/agent41-owner-denial-sourcefirst-pair.cjs) and [pure provenance/censorship tests](../../tests/agent41-owner-denial-sourcefirst-pair.test.cjs) were run in [manual canonical CI 41138896683](https://github.com/FlareZ123/experiment-01/actions/runs/41138896683), under `source_first_retrospective=true`. The paired step itself and its eight-attempt assertion passed. The complete `agent41-denial-sourcefirst-pair.json` is retained as a CI artifact even when a later independent workflow step fails.

| Original source | Unchanged candidate 60 | Same two-player opening deal | Control and treatment native outcome | Denial selections in treatment | Different genuine root |
| --- | --- | --- | --- | ---: | --- |
| rank 6 Iron Thorns | champion-reference | verified | native terminal: candidate slot 1, both | 0 | none |
| rank 6 Iron Thorns | New Moon Lockbreaker v1 | verified | 260-root censored game, both | 0 | none |
| rank 11 Absol Garbodor | champion-reference | verified | native terminal: candidate slot 1, both | 0 | none |
| rank 11 Absol Garbodor | New Moon Lockbreaker v1 | verified | native terminal: candidate slot 0, both | 0 | none |

Each row matched the two unchanged sixties and pinned engine, its exact source/complete physical deal fingerprint, and actual first player. The four control trials and four treatment trials yielded **8/8 retained attempts, 4/4 paired physical deals, 0 natural selected Team Flare Grunt interventions, 0 sampled accepted denial actions, 0 divergent native roots and 0 engine outcome changes**. The real root-chooser sample sizes by row were 16, 72, 25 and 67, identical across profiles. All four root audits were present. The comparison driver reports `competitiveQualifiedGames:0` and `winRateCertified:false`.

**Interpretation:** This original source-first panel supplies no evidence of beneficial opportunity frequency for this branch. It neither proves that such choices cannot occur elsewhere nor turns native engine winners into real matchup win rates. The policy remains opt-in and should not be promoted into the fixed benchmark on these data. An independently selected prospectively registered broader source sample, or a directly observed originally payable Team Flare Grunt versus attack state, would be needed for an effect estimate.

## Independent CI blocker

The top-level canonical workflow returned failure in this and earlier runs because `tests/agent8-wondrous-native-root-parity.test.cjs` expects Volt Cyclone to prompt from attached owner Energy and receives `false` for both seats. This exact failure was visible in [run 41129422950](https://github.com/FlareZ123/experiment-01/actions/runs/41129422950) at 21:17 UTC before the present policy changes, and recurred after the isolated positive and paired steps passed. The issue was [communicated to Agent 8](../../communications/agent8/20261030T223216Z_agent41_native_wondrous_canonical_gate_block.md). Do not mark the entire workflow green.

## Next priority

The positive staged sequence demonstrates how a **nonterminal Supporter can fit before an available attack**. The absence of opportunity in four source-first selected pairs, despite robust actor/native mechanics, indicates that new policy research should prioritize **frequent public competing resource decisions across all 29 authenticated opponents**, including two-seat Special Energy recipients, Supporter contention, and native opponent counterplay. One more narrowly staged Supporter line cannot by itself establish an improvement toward a single 99.5%-winning fixed sixty.
