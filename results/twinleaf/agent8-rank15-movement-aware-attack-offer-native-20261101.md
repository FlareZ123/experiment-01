# Rank-15 Mega Lopunny: verified public-history-conditioned native attack offer

**Agent 8 | 1 November 2026 | bounded development release, pinned native two-seat control.**

## Specific decision error and isolated improvement

The original rank-15 Aichi source list contains two **Mega Lopunny ex PFL #84**. The pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` CardManager resolves that exact source-set number through the **`fullName` alias `Mega Lopunny ex M2`**. This real native alias was verified in an initial [compiled failing trial 41323089232](https://github.com/FlareZ123/experiment-01/actions/runs/41323089232); our first string guard incorrectly assumed `Mega Lopunny ex PFL` and failed closed before taking any action. The guard and test were corrected to the actual native fullName before the subsequent run.

The existing `simulation/twinleaf/agent41-public-payable-attack-offer.cjs` historically returns the **first** physically payable positive-damage printed attack. With both **Double Colorless Energy SUM** units available on the exact PFL #84 source card, that offer is always `Gale Thrust` at its printed base **60**, even in a stationary state where `Spiky Hopper` can immediately do **160**. A same-turn move from Bench to Active raises `Gale Thrust` to **230**, reversing the preferred nominal attack for that board.

This is a concrete discrete value / event-sufficiency problem: the two boards differ in their actual public move history, but `actorObservation` alone is exactly the same. The separate authenticated `publicEventReceipt` already exposes the needed Boolean without native IDs or concealed cards.

## Code and positive/negative native results

The owner-only, **default-off by absence of receipt** `agent41-public-payable-attack-offer.cjs` option now looks for the exact `Mega Lopunny ex M2` printing plus a same-actor, same-turn, same-printing trusted `publicEventReceipt.ownerActive.movedFromBenchToActiveThisTurn` boolean. It recognizes only two known attack names and their printed base damage, computes `Gale Thrust 60+170 if moved` versus `Spiky Hopper 160`, and returns the larger **nominal** attacking offer. Unknown/mismatched receipt states preserve historical first-payable behavior; other card printings and all frozen benchmark profiles without the receipt are unaffected by construction. These estimates deliberately exclude opponent Weakness, Resistance, defenses and strategic opportunity cost.

The new [two-seat pinned native regression](../../tests/agent8-rank15-public-movement-payable-attack-native.test.cjs) physically stages the exact source PFL #83/#84 Pokémon chain, one Double Colorless Energy on the actual owner Active, and a 320-HP Shadow Rider Calyrex VMAX defender. It constructs two otherwise identical owner-visible boards, with `movedToActiveThisTurn` intentionally present in one and absent in the other. It compares the plain historical chooser, the detached event-informed chooser, and executes the resulting **genuine Store AttackAction** through all WaitPrompts until the native turn advances.

The existing manual smoke [CI 41323308178](https://github.com/FlareZ123/experiment-01/actions/runs/41323308178) reports **2/2 passed native seat cases**:

| Actual owner state | Historical first-payable offer without receipt | New event-informed offer | Proposed nominal damage | Genuine Store settled damage |
| --- | --- | --- | ---: | ---: |
| Stationary, both seats | Gale Thrust | Spiky Hopper | 160 | 160 |
| Moved, both seats | Gale Thrust | Gale Thrust | 230 | 230 |

The two physical `actorObservation` values compare deeply equal. The exactly matching actor event receipts correctly distinguish the movement histories. Original printed Energy, attack costs and genuine Store action settlement are tested; source card fullName alias is explicitly resolved through the CardManager's `set==='PFL' && setNumber==='84'` membership.

**CI overall remains failed** because the preexisting `canceling-cologne-repeat-paper-gate.cjs` sudden-death case fails after the new two-seat test passes. No CI failure was hidden or suppressed.

## Scope and next gate

This is **staged native positive/negative evidence and a read-only same-root proposal improvement**, with no claim that the canonical bilateral selector actually prioritizes the new offer, that a natural rank-15 initial deal reaches the board, or that a qualified source opponent responds. The existing `sameRootPublicEventReceipt` option is enabled only in explicitly named developmental profiles. The frozen 32-arm v1/v2 policies, the candidate and opponent 60s, and the benchmark were unchanged.

A next actor-policy study should retain both physical seats and all baseline root decisions, turn on the bounded receipt only under a frozen new development profile, and compare identical original rank-15 physical deals, true native proposal acceptance, follow-on root and responding source opponent. Printed nominal damage still needs a defensively aware final damage model before it can be a universal ranking rule.

**29/32 original source 60s; 0 competitively qualified games; 99.5% target unverified.**

## Applied same-root chooser and genuine native attack, 1 November follow-up

The earlier report certified only the independent offer. The next [manual native CI 41324432079](https://github.com/FlareZ123/experiment-01/actions/runs/41324432079) expanded the same two-seat regression to exercise the **actual `collectAndChooseOwnerRoot` applied selector** from a genuine `chooseActorRootIntent` control and then dispatch its selected attack into the real Store:

- **Receipt absent**: historical actor root and applied same-root chooser both choose `Gale Thrust`.
- **Authentic stationary public receipt present**: default-off exact-printing arbitration displaces baseline `Gale Thrust` with `Spiky Hopper`, then genuine Store attack deals **160**.
- **Authentic moved public receipt present**: the applied selector preserves `Gale Thrust`, which deals **230** in genuine Store.
- Both physical seats passed the complete four native same-root root/attack cases. Exact native `Mega Lopunny ex M2` alias remains source-validated against original PFL #84.

This additionally verifies that the proposal can cross the existing same-root selection score gate. It remains **staged board evidence**, with original-source full-game opportunity, opponents' strategic responses, global paper-clock, and win-rate inference unproven. The workflow's overall conclusion is still failure on the separately known Cologne sudden-death assertion.

A new preregistered **16 controlled + 16 treatment original-rank15 native development-attempt** study is frozen in `results/aichi-2026/registrations/agent8-rank15-movement-root-paired-native-20261101.json`, with independent unscreened seeds, both fixed candidate 60s, both physical source seats, and treatment `sameRootPublicEventReceipt=true` only. Its results, if any, must be reported separately from the already-passed staged fixtures.
