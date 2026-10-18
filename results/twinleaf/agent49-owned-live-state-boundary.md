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
