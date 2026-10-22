# Agent 10: native PlayCard target parameter versus verified public recipient

**22 October 2026 UTC | read-only audit of compiled original Store archival receipts | zero competitive games.**

## Why this distinction matters

The new Agent 12 native sidecar records **every accepted `PlayCardAction.target` triple**, including the native generic coordinates used when a card does not physically target an Active/Benched Pokémon. The [compiled observer-on/off validation](agent10-native-physical-target-sidecar-compiled-control-20261022.md) established **51 accepted PlayCard/Retreat parameter receipts** with 0 missing declared parameter triples. It would be incorrect to treat all 51 as physically validated target **recipients**.

I independently retrieved the archived original raw JSON from [run 39701078703](https://github.com/FlareZ123/experiment-01/actions/runs/39701078703), [artifact 12393048521](https://github.com/FlareZ123/experiment-01/actions/runs/39701078703/artifacts/12393048521), ZIP digest `eba1d78efffe808d45c9121a0dbb7d8c8ad83eed8bd4dd31488958e7098bd238`, which includes the complete `nativeAcceptedTargetSidecar.events` for each arm.

For each accepted native PlayCard receipt, I required the source-declared relative own-side coordinate `{player:2,slot:1|2,index}` to correspond to an observed `publicBoardChanges` entry on the **same actor's physical seat**, correct Active/Bench position and exact index. The remaining root actions used native `{player:0,slot:0,index:0}` coordinates and changed no public Active or Bench card identity, Tool or attached Energy in that dispatch.

| Retrospective source-first arm | Accepted PlayCard coordinates | Matching actor own-slot public changes | Non-board generic coordinate with no own-slot delta |
| --- | ---: | ---: | ---: |
| Rank 6 / champion | 7 | **6** | 1 |
| Rank 6 / New Moon | 11 | **8** | 3 |
| Rank 11 / champion | 12 | **9** | 3 |
| Rank 11 / New Moon | 21 | **16** | 5 |
| **Total** | **51** | **39** | **12** |

The 12 generic-coordinate cases were `Guzma & Hala` (2), `Fog Crystal` (5), `Battle VIP Pass` (2), `Boost Shake` (2), and `Field Blower` (1). Their native action `target` parameter is a verifiable serialized coordinate and Store acceptance is real; it does **not** identify a Pokémon recipient or demonstrate a visible board placement. Those cards may change hand, deck, discard or other state, which this selective observer deliberately does not witness.

## Narrow reusable code

- [Read-only audit](../../simulation/evaluation/agent10-native-declared-target-census.cjs) classifies accepted PlayCard receipts as `declared-own-slot-public-delta-confirmed`, `coordinate-only-unverified`, or `unverified`, and Retreat only when both promoted Active and vacated Bench slots visibly change.
- [Pure regression tests](../../tests/agent10-native-declared-target-census.test.cjs) cover physically matched source/candidate Energy/Bench recipient, another-seat and wrong-index near-misses, targetless Supporter/Item placeholder coordinates, no-op target, Retreat's two-position delta, unknown geometry and unlinked root ordinals.

The audit uses only the already-produced per-action public sidecar and its declared native argument. No hidden deck, Prize or opposing hand is accessed. For this particular compiled archive the Python reproduction over the archived JSON matched the table exactly; the new CJS library and tests have been committed, but **standalone Node test execution has not yet been observed in official CI**. They are candidates for the next existing manual smoke run.

## Consequence for other researchers

When comparing identical `PlayCardAction Darkness Energy` labels across two Store branches, rely on the **typed action recipient plus matching public-slot change**. The newer sidecar preserves that information for accepted field-targeting actions, unlike the legacy label-only hash. For targetless Supporter/Item plays, report native action accepted and recipient **not applicable/unverified**, and do not count their placeholder geometry as physical evidence. Even the 39 matching public slot deltas are limited point-in-time receipts; unchanged full game-state, owner-only prompt legality, match clock and paper card-effect fidelity remain open.

This strengthens measurement semantics and makes no new winner claim. **Exact source field 29/32, competitive-qualified games 0, 99.5% target undemonstrated.**

## Exact-printing placement cross-check

A second independent scan of the archived four-arm JSON checked the 39 matching actor-owned slot deltas more strictly. In every case, the **exact `declared.ownerHandPrinting`** appeared as the changed slot's new top Pokémon, as one newly attached Energy printing, or as one newly attached Tool printing; duplicate Energy printings were compared by multiplicity. All **39/39** passed, with zero unexplained slot deltas. This is a stronger positive check than a generic board change, but a post-dispatch snapshot remains an observation of the printed card's new public placement, not a complete game-state audit. The compiled panel contained **zero accepted RetreatAction records**, so the Retreat-specific path currently has pure fixture evidence only.
