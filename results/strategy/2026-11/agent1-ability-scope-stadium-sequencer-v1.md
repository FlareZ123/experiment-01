# Ability-Scope / Stadium Sequencer v1

**Agent 1 · 27 November 2026**
**Scope:** New Moon Lockbreaker v1 actor-visible policy.

The policy must determine **which Abilities are currently suppressed before scoring a Stadium**. The same Path to the Peak can be an asymmetric lock, a self-lock, or irrelevant depending on the source and position of Ability suppression.

## Exact scope table

| Effect currently active | What it suppresses | Lunatone New Moon? | Consequence for candidate Path |
|---|---|---|---|
| Opposing Iron Thorns ex Initialization | Abilities of Rule-Box Pokémon except Future | **live** (Lunatone has no Rule Box) | With Solrock+Lunatone, Path can be asymmetric: candidate ignores Path; opponent Thorns loses Initialization; Perfection returns. |
| Path to the Peak | Rule-Box Pokémon Abilities | **live** | Solrock+Lunatone makes candidate Pokémon ignore Path. |
| Silent Lab | all Basic Pokémon Abilities in play/hand/discard | **off** | Pair does not protect candidate until Lab is removed/replaced. If Path replaces Lab, New Moon reactivates as Lab leaves and can then protect candidate from Path. |
| Active Klefki Mischievous Lock | all Basic Pokémon Abilities except Mischievous Lock | **off** | Path is not safely asymmetric for Perfection; first remove/switch the Klefki condition. This applies to the candidate's own Active Klefki too. |
| Active opposing Empoleon V Emperor's Eyes | opponent Basic non-Rule-Box Abilities | **off** | Empoleon itself does not suppress Mewtwo Perfection, but it suppresses the Lunatone shield; candidate Path would then suppress Mewtwo unless Empoleon is removed/disabled first. |
| Active opposing Flutter Mane | opponent Active Pokémon's Ability | **live if Lunatone is Benched** | Path shield can remain, but Path does not remove non-Rule-Box Flutter Mane; an Active Mewtwo still loses Perfection until Flutter is moved/disabled. |
| Garbotoxin-style global Ability suppression | broad Ability suppression while enabled | **off** | Path does not remove a non-Rule-Box Garbodor Ability; Tool removal/other lockbreak is required. |

## New Iron Thorns recovery: asymmetric Path is a real second branch

State:

- opposing Iron Thorns ex is Active and Initialization is suppressing Mewtwo & Mew-GX Perfection;
- candidate has Solrock + Lunatone in play;
- candidate can play Path to the Peak;
- no other effect currently suppresses Lunatone.

Sequence:

1. Lunatone New Moon remains active because Initialization only suppresses Rule-Box Pokémon Abilities.
2. Candidate plays Path.
3. New Moon prevents Stadium effects from being done to candidate Pokémon, so candidate Rule-Box Abilities are protected from Path.
4. Opposing Iron Thorns is not protected; Path removes Initialization.
5. Mewtwo Perfection is no longer suppressed by either effect and becomes usable.

This is a distinct Thorns line from native Gengar Horror House. It should be compared whenever the Solrock/Lunatone pair is already established or cheaply reachable.

## Self-contention: Active candidate Klefki disables the same shield

Candidate Klefki's Mischievous Lock is symmetrical across Basic Pokémon while Klefki is Active.

So an Active candidate Klefki suppresses:

- candidate Lunatone New Moon;
- candidate Mewtwo Perfection;
- candidate Unown Farewell Letter and other Basic Abilities.

If the plan is Klefki buffer -> later asymmetric Path/Perfection, the policy must explicitly include the switch/retreat that moves Klefki out of the Active Spot **before** crediting New Moon.

Do not simultaneously claim 'Klefki lock is active' and 'Lunatone shields Path' unless a card-specific exception actually exists.

## Stadium sequencing algorithm

For any contemplated Stadium play:

1. Enumerate every currently active Ability-suppression source and its exact scope: Basic vs Rule Box vs Active only vs global; owner-only vs both players; position requirement; Tool requirement.
2. Determine whether Lunatone New Moon is currently active **before** the Stadium replacement.
3. If the current Stadium is itself suppressing Lunatone (Silent Lab), recompute Ability state after that Stadium leaves play and before evaluating the new Stadium's effect.
4. Apply the new Stadium to only the Pokémon not protected by New Moon.
5. Recompute downstream attack legality (Perfection/Fairy Zone/etc.).
6. Compare direct/native attacker lines that do not require the restored Ability.

## Key sequencing examples

- Silent Lab -> Path with pair already in play: legal potential asymmetry because removing Lab reactivates New Moon.
- Opposing Klefki Active -> Path: no asymmetry; Klefki still suppresses Lunatone.
- Opposing Empoleon Active -> Path: no New Moon shield; Path can self-suppress Mewtwo.
- Opposing Iron Thorns Active -> Path with pair: strong asymmetry; Path suppresses Initialization.
- Flutter Mane Active -> Path with pair: New Moon can protect candidate from Path, but Flutter still independently suppresses the candidate Active's Ability.

## Required trace

Every Ability-dependent Stadium decision should expose:

- suppressor card/effect and exact scope;
- whether Lunatone New Moon is live before and after Stadium replacement;
- whether candidate Rule-Box Abilities are protected from the new Stadium;
- whether the opponent's lock Ability survives;
- attack legality after recomputation;
- competing native/direct attacker line.

This prevents the recurring mistake of treating 'Ability lock' as one binary flag.

No deck change or competitive result follows.