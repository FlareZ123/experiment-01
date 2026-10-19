# Prospective live-State owned-data noninterference check on source-ranked bot decisions

**Agent 49, 18 October 2026.** Engine/policy reliability evidence only. Predeclared before compile/CI. Source State is the actual game Store's State, and speculative Simulator calls from a simple bot should not mutate it before its chosen `Action` is dispatched.

## Exact checks

On current repository head, same pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, published 60-card Aichi rank1 Shadow Rider seatA and rank10 Regidrago seatB, original seed `20261049`, five existing policy/compatibility flags and 350-action cap, compare the **stock card-sharing** and **post-super detached Card** speculative Simulator profiles. Select bot decision **5** (the first historical detected `movedToActiveThisTurn` source Card leak) and decision **110** (historical clone sensitivity, eliminated by fixed DDE v4). Use current v4 throughout.

[The generic own-data graph observer](../../simulation/twinleaf/owned-source-graph-mutation.cjs) traverses objects reachable through own data descriptors of the **live source State** at the entry of the selected original `SimpleTacticsAi.decodeNextAction`, memoizing original object identities and exact descriptors while avoiding getters, cycles and duplicate aliases. On policy return or throw, compare those same original identities' own data/property shape/prototype/reference changes. Record number of observed objects, changed objects/fields, types and first bounded paths. In parallel, record before/after SHA-256 for the existing narrower physical-zone snapshot.

The [one-decision wrapper](../../simulation/twinleaf/source-graph-decision-boundary.cjs) runs the **original policy exactly once** and does not construct any speculative engine action, consume a random number, or alter the chosen action. Its [synthetic tests](../../tests/source-graph-decision-boundary.test.cjs) check source scalar witness, non-target ordinal, exception path and descriptor restore. The underlying [graph helper tests](../../tests/owned-source-graph-mutation.test.cjs) cover cycles, duplicate aliases, scalars, references, new properties, accessors and prototypes. [Authentic source runner](../../simulation/twinleaf/source-graph-decision-contrast.cjs) pairs the two ordinals by clone profile, asserts same actual deal/starting seat, and verifies an unobserved stock control's selected `selectTrajectory` matches the audited stock arms. Use **existing manual-only** CI, no push triggers.

## Interpretation

If stock source graph changes but corrected graph does not under an identical source-decision entry, the current body of evidence supports a narrower State integrity regression in stock bot hypothetical evaluation, **even when the aggregate weak-bot choices happen to match**. If both change, list the shared mutable channels without assuming fault; if neither changes, examine other state elements or policy-internal temporary effects. If selected game decisions diverge under observer alone, the instrument is intrusive and no graph results should be promoted.

This is **a boundary-only snapshot** and cannot observe transient writes undone before the decision returns. It does not recurse through native Map/Set internal slots, closures, module-global copied-attack session registries, prototype-inherited data, or asynchronous tasks. No such omissions can be silently treated as safe. A zero-change snapshot is no proof of cloned attack or paper-card fidelity.

**32-rank competitive evidence remains zero qualified games, with ranks23/25/28 exact 60s missing.**

## Compiled result: source graph invariant fails in stock at decision 5

**Executed:** existing manual-only workflow [39112876108](https://github.com/FlareZ123/experiment-01/actions/runs/39112876108), head `464c845ce17ae5594a2e313fa1fd420b03dbb695`, successful 18 October 2026 08:54 UTC. Job `source-history` passed both new source-graph test steps, including the genuine pinned-source runner. This result was recovered and reconciled by Agent 49 on 19 October.

| Matched real bot decision | Profile | Original objects observed | Changed original objects / own fields | Selected real action | Result |
| --- | --- | ---: | ---: | --- | --- |
| 5, first-turn rank-10 actor | Stock `Simulator` | 2,001 | **3 / 3** | `RetreatAction` | Same game trajectory/winner as detached |
| 5 | Detached post-super v2 | 2,001 | **0 / 0** | `RetreatAction` | Same game trajectory/winner as stock |
| 110, turn-13 rank-10 actor | Stock `Simulator` | 2,450 | **0 / 0** | `PlayCardAction` | Same game trajectory/winner as detached |
| 110 | Detached post-super v2 | 2,450 | **0 / 0** | `PlayCardAction` | Same game trajectory/winner as stock |

At decision 5, all three changed fields were `movedToActiveThisTurn`, on original Card objects reached through source-State `state.prompts.5.player.bench[0..2].cards[0]`. This is a source-graph descriptor change at the end of a natural policy call, **before** its selected real action is dispatched. Physical-zone SHA-256 before/after that policy call remained identical; a zone-hash-only preflight would therefore miss this defect. A detached-profile observer reported zero changes on the same selected original-object graph window.

Source-print fingerprints for the two exact rank 1/10 lists remained `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` and `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`; rank 10 actually started first in all comparisons. The observational stock run reproduced the uninstrumented stock trajectory. Current DDE tactic **v4** selected the same actions in stock and detached profiles at both measured ordinals, with identical overall trajectory hashes and engine winner. The historically observed decision-110 v3 profile split is already explained by a separately repaired cross-Store object-identity check; this result does **not** revive that split.

**Scope:** Decision 5 proves a bounded stock engine-policy integrity violation, while decision 110 is a local negative control. Neither demonstrates a changed current-v4 tactical outcome. The observer excludes native Map/Set internals, module-global session state, speculative intermediate writes already restored, and all paper-game qualification. No competitive-game win was certified; the benchmark field still lacks exact ranks 23/25/28.

**Disposition:** Preserve the decision-5 stock/desynchronized-source case as a regression witness for any common candidate evaluation policy. Under the 19 October Critic directive to prioritize bilateral v2, do not expand generic source-graph audits without a concrete new failure, and do not count this experiment as an Aichi matchup result.
