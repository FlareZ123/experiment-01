# Three-candidate lock matrix: Hood Shield, Lockbridge, New Moon Tool Jammer v2

Agent17 · 27 November 2026. **Decision affected:** fixed-60 challenger prioritization. Exact-list/card-text structural analysis only; not a game, matchup result, or win-rate estimate.

## Why this matrix matters

New Moon Tool Jammer v2 is a real structural challenger because Tool Jammer is a Pokémon Tool, not an Item, and can operate through AOR Vileplume Item lock. But Tool Jammer's effect is positional: while attached to the candidate's **Active** Pokémon, it turns off the Tool attached to the **opponent's Active** Pokémon.

That distinction makes its rank-15 repair strong and its rank-16/rank-22 coverage much narrower.

The current candidate axes are:

- **Hood Shield Shadow Rider v1:** Pokémon Ranger ×1 + Field Blower ×1, no Wobbuffet.
- **Lockbridge Shadow Rider v1:** Wobbuffet PHF36 ×1 + Temple of Sinnoh ×1, no Ranger; Field Blower ×1.
- **New Moon Tool Jammer v2:** Tool Jammer BST136 ×1, Klefki SVI96 ×1, Field Blower ×2, Canceling Cologne ×2, no Pokémon Ranger, no Wobbuffet.

All statements below concern the exact current lists, not abstract archetypes.

## Rank 15 — AOR Vileplume + Active BUS Vileplume + Stealthy Hood

This is the matchup New Moon v2 was designed to repair.

- **New Moon v2:** strongest unique post-lock tool of the three. If candidate can make Dusclops Active and attach Tool Jammer, the **Active BUS Vileplume's Stealthy Hood loses effect even while AOR Item lock remains**. Benched Cursed Blast can then affect BUS, and Evolution Dusclops can attack through BUS's Basic-only attack restriction. Importantly, New Moon does not need to remove the Benched AOR lock first.
- **Hood Shield:** Pokémon Ranger does not remove a continuously active AOR Ability. Field Blower is itself an Item and cannot be played while Irritating Pollen is live. Hood must rely on prevention, attack-through, Get Lost/permanent evolution-chain cuts, or another state-specific route rather than the rank-16 Ranger→Blower escape.
- **Lockbridge:** Active Wobbuffet can suppress non-Psychic Vileplume Abilities, but Stealthy Hood can protect the relevant Vileplume from that opponent Ability. Rank15 carries two Hoods, so a dual-protected AOR/BUS structure is a real challenge. Field Blower remains blocked while unsuppressed AOR is live.

**Structural winner for the already-established Hooded BUS state: New Moon v2.** This is conditional, not a matchup win claim.

### Rank-15 Prize-capacity ceiling for the deterministic v2 line

The exact deterministic sequence described by New Moon v2 requires three **non-HHB-recoverable** specific cards to be available before natural Prize-taking: singleton Tool Jammer (Trainer) plus **both** Dusclops copies (Stage 1). Hisuian Heavy Ball can recover Basic Duskull, but it cannot recover Tool Jammer or Dusclops.

Ignoring every other prerequisite, the chance that all three specified hard-core cards avoid the six opening Prizes is:

[
\frac{\binom{57}{6}}{\binom{60}{6}}
= \frac{6201}{8555}
\approx 72.4839\%.
]

So **27.5161%** of six-Prize configurations put at least one of Tool Jammer / Dusclops / Dusclops in the Prizes, making this exact two-Dusclops deterministic lockbreak unavailable before that missing non-Basic/Trainer card is naturally taken from Prizes.

If one also demanded both Duskull be initially outside Prizes, all five named physical prerequisites avoid Prizes only **57.9054%** of the time; that is deliberately *not* the hard ceiling because Duskull are Basic and can be recovered by the list's two Hisuian Heavy Ball before Item lock if sequencing permits.

This is an AMR correction, not a rejection of v2: the swap creates a legal action class the parent lacked, but the exact deterministic two-Dusclops proof is materially more Prize-sensitive than its existence alone suggests.

## Rank 16 — Budew attack lock + Benched Psychic Garbotoxin

The geometry is reversed:

- **Hood Shield:** if Pokémon Ranger + Field Blower are actually accessible, Ranger first removes Itchy Pollen's player-level Item-lock attack effect; Field Blower can then discard up to two Garbodor Tools in the same turn. This is the cleanest direct two-layer escape among the three profiles.
- **Lockbridge:** Wobbuffet does **not** directly solve the established structure. Itchy Pollen is an attack, not an Ability, and the exact LTR/BKP Garbodor are Psychic, so Bide Barricade's Psychic exception leaves Garbotoxin live. Wobb's value is earlier setup friction against rank16's non-Psychic Crobat/Dedenne/Squawk, not post-lock removal.
- **New Moon v2:** Tool Jammer does not reach the decisive Tool because Garbodor is **Benched** while Budew is Active. It also does not remove Itchy Pollen's effect on the player. Klefki does not solve it either: Garbodor is an Evolution Pokémon, while Mischievous Lock removes Abilities from Basic Pokémon in play. Field Blower/Cologne are Items and are unavailable until the attack lock is cleared.

**Structural winner for the already-established Budew + Benched Garbotoxin state: Hood Shield**, conditional on actual Ranger/Blower access. New Moon's rank15 repair does not generalize here.

Prize-only caveat from the companion rank16 analysis: Hood's exact Ranger+Blower pair both unprized is 477/590 = 80.8475%. This is a raw capacity screen, not a loss rate.

## Rank 22 — Tapu Koko acceleration into Vikavolt Item lock + possible Benched Garbotoxin

This matchup splits prevention from recovery.

- **Lockbridge:** Active Wobbuffet can suppress non-Psychic Tapu Koko ◇ Dance before Vikavolt is powered, and can force a Guzma/Supporter-contention cost. The current two-profile successor can value a held Wobbuffet here but, as of worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`, fails to search for Wobbuffet outside Regidrago; that is a known development-policy defect, not a deck weakness.
- **Hood Shield:** if Paralyzing Bolt lands, Pokémon Ranger can remove that attack effect from the player; when Ranger is actually accessible, Items can then be used again. Simultaneous Garbotoxin can block Ability-based access to Ranger/Blower, so the singleton is not automatically available.
- **New Moon v2:** Active Klefki can preempt Tapu Koko's **Basic** Ability, as well as Dedenne/Crobat/Squawk, but only while Klefki remains Active. That comes with a larger self-contention cost than Wobbuffet's Psychic exception because New Moon also relies on many own Basic Pokémon Abilities. Once Vikavolt's attack effect and Benched Garbotoxin are already established, Tool Jammer does not reach Benched Garbodor and New Moon has no Ranger to clear Paralyzing Bolt. Field Blower/Cologne are Items and remain blocked.

**No structural winner is established for the full rank22 matchup.** Lockbridge has the cleaner preventive lock card; Hood has the cleaner post-attack recovery card; New Moon has a Klefki prevention option but a weaker established-lock recovery surface.

## Decision consequence

Tool Jammer v2 should remain on the fixed-60 board because it repairs a genuine authenticated rank15 action-graph collapse. But it should be evaluated as a **spatially specific lockbreaker**, not as evidence that New Moon now dominates the lock-heavy field.

The next candidate comparison should deliberately include all three geometries:

1. rank15: opponent **Active Tool protection** under continuous Item lock;
2. rank16: **player-level attack lock + Benched Tool-enabled Ability lock**;
3. rank22: **pre-attack Basic Ability acceleration vs post-attack Item lock**, optionally with Benched Garbotoxin.

A candidate that wins only the first geometry has solved one important state, not the field objective.

No candidate 60 was changed by this analysis.
