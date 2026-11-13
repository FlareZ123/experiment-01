# Snorlax PGO Block: effect-scoped Stealthy Hood counterline

**Author:** Agent43  
**Date:** 2026-11-13 UTC  
**Status:** rules-derived tactical hypothesis; native Store probe requested; not a completed game result.

## Question

Can the current Hood candidate-policy model represent the rank-7 Snorlax PGO Block board from the Hood Shield v1 audit, and if not, what state distinction is missing?

## Evidence and derivation

Agent46's [58-row Hood Shield v1 audit](agent46-hood-full58-attack-conversion-audit-20261112.md) records the rank-7 slot-A final board as:

- candidate Active Shadow Rider Calyrex VMAX, 2 Psychic Energy, no Pokémon Tool;
- candidate Bench Lillie's Clefairy ex, 7 Psychic Energy;
- five Benched Pokémon on each side;
- opponent Active Snorlax PGO, 10 damage on a 150-HP Pokémon;
- no attack was recorded in the terminal board sequence.

The supplied English card snapshot supports the following printed facts:

- [Snorlax PGO 55](../../../resources/cards/en/pgo.json): Block says that while Snorlax is Active, the opponent's Active Pokémon cannot retreat. Snorlax PGO is a Basic Pokémon with no Rule Box.
- [Stealthy Hood SM10 186](../../../resources/cards/en/sm10.json): it prevents all effects of the opponent's Abilities done to the attached Pokémon and removes existing such effects.
- [Shadow Rider Calyrex VMAX SWSH6 75](../../../resources/cards/en/swsh6.json): its Retreat Cost is two Colorless Energy.
- [Lillie's Clefairy ex SV9 56](../../../resources/cards/en/sv9.json): Full Moon Rondo costs Psychic+Colorless and does 20 damage plus 20 for each Benched Pokémon on both sides.
- [Path to the Peak SWSH10 213](../../../resources/cards/en/swsh10.json): it removes Abilities only from Pokémon with a Rule Box. It does not disable Snorlax PGO's Block.
- [Tool Jammer SWSH5 136](../../../resources/cards/en/swsh5.json): while its holder is Active, opposing Active Pokémon Tools have no effect. Jamming Tower likewise suppresses Pokémon Tools.

**Derived counterline, conditional on access and the complete board:** attach Stealthy Hood to the *Active* Shadow Rider VMAX; its two Psychic Energy can pay the two-Colorless retreat cost; retreat and promote Lillie's Clefairy ex; Full Moon Rondo then calculates 20 + 20×(5+5) = 220. The damaged Snorlax has 140 HP remaining, so 220 is sufficient to Knock it Out.

This is a board-state counterline, not proof that the line was available in the archived game. The artifact does not expose the candidate's full hand, whether Hood was accessible/searchable at that exact turn, all other retreat restrictions, or all relevant effects. It therefore does not establish a missed forced win or a matchup win.

## Policy-model defect

The current Agent41 PR #38 branch (agent41/hood-garbotoxin-recovery-v3-20261112, reviewed at d0b768b1c248c8bb008cbfcc6f60d33e7b58ece4) models the recognized opponent lock as a boolean:

- hasLiveOpponentAbilityLock() recognizes Active Iron Thorns ex / Initialization and Tool-bearing Garbodor / Garbotoxin.
- hoodAttachTargets() prefers a Benched Shadow Rider VMAX over an untooled Active VMAX.
- hoodAwareArvenResolver and hoodAwareAttachToolTactic both consume that same target list.
- hasProtectableHoodLockThreat() rejects Path to the Peak globally.

Those assumptions are reasonable for the current global ability-suppression recovery target: Hood on a Benched VMAX can protect its Underworld Door from a global lock, and Path to the Peak independently suppresses the VMAX's Rule-Box Ability. They are **not** valid for Snorlax PGO Block:

1. Block affects only the opponent's Active Pokémon. Hood on a Benched VMAX does not remove the Block effect from the current Active Pokémon. The target must be the affected Active Pokémon, regardless of species.
2. Path to the Peak does not suppress Snorlax PGO, which has no Rule Box. It also does not suppress the Hood Tool. Although Path to the Peak disables Shadow Rider VMAX's Underworld Door, the proposed Block counterline uses Hood to enable a paid retreat and then attacks with Clefairy; it does not need Underworld Door.
3. A boolean extension that simply adds Snorlax Block to hasLiveOpponentAbilityLock() would therefore still select the wrong target and would still fail closed under Path to the Peak.

The !hasPathToThePeakInPlay condition inside canUseHoodedDoorUnderGarbotoxin() should remain scoped to the Underworld Door recovery route: Path to the Peak does disable the candidate VMAX's Ability. Do not remove that guard indiscriminately. The correction belongs in a source- and effect-scoped threat model used for Hood targeting.

## Recommended representation and tests

Represent each Hood-relevant threat with at least:

- source Pokémon, Ability, seat and zone;
- source suppression predicate (for example, Rule Box + Path to the Peak);
- effect scope / affected target predicate (global Ability suppression versus opponent-Active retreat prohibition);
- target-side Tool suppression (Jamming Tower and opponent Active Tool Jammer);
- the protected outcome being sought (restore an Ability versus enable retreat).

Then select only Pokémon actually affected by that threat. Preserve the existing Bench-first preference for global Garbotoxin / Iron Thorns protection; use the current Active Pokémon for Snorlax Block.

Required regressions:

1. Snorlax PGO Active Block prevents an untooled Active Shadow Rider VMAX from retreating.
2. Hood on that Active Pokémon allows the same native paid RetreatAction; Hood on a Benched VMAX does not.
3. Path to the Peak does not disable Snorlax Block and does not prevent the Hood-enabled retreat.
4. Jamming Tower and opponent Active Tool Jammer suppress Hood and keep the retreat blocked.
5. A global Garbotoxin / Iron Thorns case retains the existing Bench-VMAX target preference and correct Rule-Box suppression behavior.
6. Repeat the target-selection contract with both physical candidate seats.

## Coordination and limits

- Sent the target-scope/code-review handoff to Agent20 and Agent41 in their mailboxes.
- Requested that Agent3 extend the existing PR #41 native Store Hood probe with the Snorlax Block / Hood retreat positive and negative controls. This should reuse the existing manual path, not create another workflow.
- Agent20 owns the Max Geist / retreat policy integration; this note is an enabling counterline, not a parallel implementation.
- No native Snorlax Block probe has been run in this invocation. No full game has been played from this board. No deck-card change is recommended from this evidence alone.
- The V3 fixture remains owner-key/dispatch blocked; its generic baseline is not candidate-specific Hood policy evidence.
- This note does not resolve the Aichi Japanese Extra versus paper Expanded benchmark-scope conflict, missing opponent lists, or the 99.5% target.

## Bottom line

The missing abstraction is not another Hood priority or a one-card deck tweak. It is **effect-scoped lock modeling**: global Ability suppression and Active-only retreat denial require different Hood targets and different Stadium suppression logic. Validate the Snorlax interaction in the existing native Store probe, then integrate it into Agent20's candidate-only policy path if the probe confirms the expected effect.
