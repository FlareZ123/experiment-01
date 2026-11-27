# New Moon vs Silent Lab: the Solrock/Lunatone shield does not bootstrap itself through Basic Ability lock

**Agent 13 · 27 November 2026**  
**Decision affected:** Stadium-lock policy for the retained New Moon 60.  
**Scope:** printed card-text/rules reasoning. No game, CI, or win-rate claim.

## Finding

Do not generalize the successful Path-to-the-Peak asymmetry to **Silent Lab**.

- Lunatone OBF 92's **New Moon** is an Ability on a **Basic Pokémon**.
- Silent Lab says each Basic Pokémon in play, hand and discard pile **has no Abilities**.

Therefore Silent Lab removes Lunatone's New Moon itself. The protection cannot bootstrap through a Stadium that erases the protecting Basic Ability.

The correct policy distinction is:

- **Path to the Peak:** Lunatone has no Rule Box, so New Moon remains active; with Solrock in play, New Moon can protect the candidate's Pokémon from Path while the opponent's Rule-Box Pokémon remain suppressed.
- **Silent Lab:** Lunatone is Basic, so Silent Lab removes New Moon; the candidate's Basic Abilities, including Mewtwo & Mew-GX Perfection, remain suppressed until Silent Lab is removed/replaced or another legal effect changes the state.

This is a hard rules distinction, not a matchup heuristic.

## Authenticated field exposure

Silent Lab appears in the exact Aichi source lists at:

- rank 9 Absol Electrode — 2 copies;
- rank 13 Regidrago — 1;
- rank 15 Lopunny Vileplume — 1;
- rank 32 Regidrago — 1.

These are not hypothetical Stadium states.

## Strategic consequence

A New Moon policy facing Silent Lab should prioritize an actual Stadium answer:

- play one of the candidate's own Stadiums when legal;
- Field Blower the Stadium when Items are legal and the Blower is worth spending;
- use another legal card interaction that removes/replaces Silent Lab.

Do **not** spend TPE / Bench slots assembling Solrock + Lunatone solely to answer Silent Lab. That pair does not solve this lock by itself and can create extra Bench liability against Regidrago or Snorlax.

The same pair can still have value for other Stadiums after Silent Lab is removed.

## Compound-lock cases

### Rank 15

Rank 15 can combine:
- AOR Vileplume Item lock;
- BUS Vileplume Basic-attack lock;
- Silent Lab Basic-Ability lock.

If Silent Lab is active while AOR Vileplume removes Items, neither “New Moon pair” nor immediate Field Blower is a live escape. The policy must value any **pre-lock Stadium replacement/removal window** more highly.

Horror House before the full lock can therefore have value not only for Hood/Energy denial, but for denying the hand-played Silent Lab itself during the locked turn.

### Regidrago ranks 13/32

Silent Lab can suppress Perfection and New Moon while the opponent builds Apex Dragon. TPE's attachment-time search is an Energy-card effect rather than a Basic Ability, so board development can still occur; the attack line must separately solve the Stadium before relying on Perfection.

## Acceptance states

1. **Silent Lab + Solrock/Lunatone:** worker must still treat New Moon as disabled and Mewtwo Perfection as suppressed.
2. **Path + Solrock/Lunatone:** worker should treat candidate Pokémon as protected from Path while source Rule-Box Abilities remain suppressed.
3. **Silent Lab + legal Stadium replacement:** worker should value replacing Lab before spending resources on an Ability-dependent attack.
4. **Silent Lab + AOR Item lock:** Field Blower is inaccessible; worker must not hallucinate the Item answer.
5. **Pre-lock Horror House:** opponent has not yet played Silent Lab; Horror House is legal. Worker may credit denial of the hand-played Stadium for the locked turn, without assuming it is actually in the hidden hand.

## Disposition

This finding narrows, rather than overturns, New Moon retention. The fixed 60 already contains four Stadiums plus two Field Blower, so a printed answer exists; policy must use those windows correctly.

No card change, qualified matchup, or 99.5% claim follows.
