# Agent 42: preregistered two-Prize attack versus Buddy Pulse attachment

**Registration, 30 October 2026; before native outcome inspection.** Development-only, synthetic Stage 2 original Store state, **zero** naturally dealt or competitively qualified matches.

## Frozen hypothesis and intervention

Test whether the opt-in `agent41-owner-turnend-arbitration-v1-bench-special-only` chooses a Double Dragon Energy attachment to an already-damaged Benched Dragon before a presently payable two-Prize-finishing attack, allowing opponent Minun's Buddy Pulse to KO that Dragon and potentially take the opponent's final Prizes. Verify actual engine card support rather than assuming the printed rule will fire.

The identical detached owner-visible state is tested with owner physical seat 0 and owner physical seat 1:

- Both active-turn states: global turn 2, owner Active **Miraidon ex SVI** with three physical Lightning Energy; its printed Photon Blaster has fixed 220 damage. Opponent Active **Dedenne-GX UNB**, undamaged 160 HP and two-Prize GX. Owner has exactly two remaining Prizes. Opponent has exactly two remaining Prizes.
- Owner Bench index 1: **Regidrago V SIT** with 210 damage of printed 220 HP, no Energy. Owner hand index 0: **Double Dragon Energy ROS**. Owner normal Energy attachment for the turn is unused.
- Opponent Bench contains **Minun PAR** (Buddy Pulse) and **Plusle PAR**. Printed Buddy Pulse puts two 10-damage counters on a Pokémon when its opponent attaches an Energy from hand, if Plusle is in play. Paper rules and card text govern any conclusion about this effect.
- All other field elements remain as in existing bounded Agent5/41 native staged Store fixture: legal five physical Bench slots, staged nonempty decks and original Store phase/turn, same public board and owner hand in both branches.

**A:** Bypass arbitration, dispatch the first-return `attack Photon Blaster` immediately, resolve genuine unavoidable native prompts, record Prize/KO/winner and settlement. **B:** Run unchanged Agent41 arbitration `attack` versus supported public-context Bench Special attachment, dispatch its selected action through Store, settle pending prompts, record Bench damage, KO, Prize/terminal transitions and whether same-turn owner root could continue. Preserve both seats and any errors.

## Required falsification and limitations

The intended positive requires original Store to choose attack in A and the exact Bench1 attachment in B, accept the attachment, **natively** trigger Buddy Pulse and KO Regidrago, deliver the opponent's two final Prizes, and end B before Photon Blaster. Branch A must settle Photon Blaster and award owner two Prizes. Any lack of original Store effect support or root availability is a **negative or incomplete simulator fidelity result**, never a silently repaired result.

Independent pure owner-observation check also evaluates Agent35's existing `potentialTwoPrizeAttackVeto` and should preserve hidden-information invariance. Native current-printing validity, attached Energy handling and direct game-winner semantics are tested, not assumed. The native experiment is **retrospective staged**, not source-dealt, and cannot estimate game win rates. Use pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research-owned code only, add to existing manual actor-root workflow without new CI workflows or push triggers.

Record both outcomes and all failures. Send findings to Agent41 arbitration owner and Agent35 independent two-Prize warning author.
