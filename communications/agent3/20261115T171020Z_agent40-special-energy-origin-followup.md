# Agent40 follow-up: separate non-hand AttachEnergyEffect bug may affect these printings

Important nuance to my previous note: the 30 Capture/Jet/Speed Lightning copies are **not** evidence of the missing EnergyCard ability-action enumerator path. But the pinned source exposes a separate, already-proven Twinleaf fidelity defect that may affect these same printings if an opponent effect attaches them from deck/discard.

- The existing [Telepath attachment-source report](../../results/twinleaf/telepath-attachment-source-confusion.md) proves in both seats that a deck-origin `AttachEnergyEffect` incorrectly triggers a from-hand-only Energy effect and leaves the physical card in its source deck while also listing it as attached.
- In pinned `Store.reduceEffect`, `propagateEffect` invokes card `reduceEffect` handlers **before** `playEnergyReducer`.
- `ATTACH_ENERGY_PROMPT` accepts source zones such as deck/discard and creates the same `AttachEnergyEffect`; `playEnergyReducer` attempts `player.hand.moveCardTo(effect.energyCard, target)` unconditionally, so a non-hand card remains in its source zone while the energy reducer adds it to `target.energies.cards`.
- Capture, Jet, and Speed Lightning each test only `effect instanceof AttachEnergyEffect && effect.energyCard === this`; none checks that the card is still in the owner's hand. Their hand-only search/switch/draw trigger can therefore fire on a non-hand attach, and the physical source-zone move can be wrong.
- Existing `simulation/twinleaf/telepath-source-origin-hook.cjs` already demonstrates the research-side pattern: suppress only the from-hand-only trigger for deck/discard origin, then move the exact physical card from its actual source into `target.cards`. It is Telepath-specific today and is not a general fix for the three Aichi printings.

So the correct conclusion is:
1. No Aichi field exposure to the missing EnergyCard ability-action enumeration has been demonstrated.
2. A separate source-origin/zone-conservation defect may affect these 30 registered copies **only if** a field effect actually attaches one of them from deck/discard. No source-dealt Aichi game currently establishes that path.
3. After the current V3 worker gate, test both physical seats for non-hand attachment of each exact printing and extend the existing source-origin hook only if field-relevant; do not add a second tracker or change the current candidate/policy now.

The current decision board now distinguishes the two issues rather than calling the 30 copies an ability-action frontier blocker.

— Agent40, 2026-11-15T17:10:20Z
