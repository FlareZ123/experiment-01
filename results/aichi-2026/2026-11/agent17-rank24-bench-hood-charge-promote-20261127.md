# Rank 24 Iron Thorns counter-sequence: Hood on Bench, Door first, promote after

Agent17 · 27 November 2026. **Decision affected:** Hood Shield / Lockbridge play policy against exact rank24 Iron Thorns. Exact card-text/board-state sequence; not a game or matchup result.

## Exact interaction

Rank24 contains:

- Iron Thorns ex TWM 77 ×4 with **Initialization** while Active;
- Tool Jammer BST 136 ×1.

Both current Shadow Rider candidates contain:

- Shadow Rider Calyrex VMAX with **Underworld Door**;
- Stealthy Hood UNB ×2.

The relevant scopes are asymmetric:

- Initialization is an opponent Pokémon Ability effect that removes Abilities from Rule-Box Pokémon in play except Future Pokémon.
- Stealthy Hood can prevent effects of the opponent's Abilities done to its attached Pokémon.
- Tool Jammer attached to the opponent's **Active** Pokémon makes Tools attached to the candidate's **Active** Pokémon have no effect; it does not suppress Tools on the candidate Bench.

Therefore, when the opponent has **Active Iron Thorns ex + Tool Jammer**, a Stealthy Hood on a **Benched** Shadow Rider VMAX remains effective. Initialization is blocked for that Benched VMAX, so Underworld Door can remain live.

The same Hood becomes ineffective if that VMAX is promoted Active while opposing Tool Jammer remains effective. Initialization can then remove Underworld Door from the Active VMAX.

## Action order

When the actor-visible state permits it:

1. Keep the Hooded Shadow Rider VMAX on the **Bench** during the acceleration phase.
2. Use its live **Underworld Door** before promotion. Attach the Psychic Energy and take the draw now.
3. If a second Hooded Benched VMAX is available, consume that Door before moving either relevant holder into Active.
4. Only after the desired Door uses are complete, switch/promote the funded attacker into Active.
5. If Tool Jammer now suppresses that attacker's Hood, accept that Underworld Door is off while Active; the already-attached Energy and cards drawn remain.
6. Attack normally if the frontier is legal. Initialization suppressing an Ability does not erase attached Energy or the attack text.
7. On a later turn, if the same VMAX must use Underworld Door again, a legal switch/Guzma/retreat that moves it back to the Bench can make its Hood effective again. Re-evaluate the Ability after the position change rather than carrying the Active suppression forward.

This is a **sequence dependency**: `Door while Benched → then promote` is materially different from `promote → try Door`.

## Held-out policy cases

A candidate policy should distinguish at least:

1. **Positive:** opposing Active Iron Thorns + Tool Jammer; candidate has Hooded Benched VMAX, Psychic Energy in hand, legal Underworld Door target and later promotion route → use Door before promotion.
2. **Active negative:** same VMAX already Active under opposing Tool Jammer → do not claim Hood restores Underworld Door there.
3. **Bench positive despite Jammer:** opponent Tool Jammer remains attached, but VMAX is Benched → do not incorrectly globally suppress its Hood.
4. **Position reset:** Active VMAX with suppressed Hood moves to Bench → recompute; Hood can regain effect because the opposing Tool Jammer's scope no longer reaches it.
5. **Jamming Tower negative:** if a live Stadium globally removes Pokémon Tool effects, Benching alone does not restore Hood.
6. **No phantom acceleration:** if no Psychic Energy is in hand, no legal Benched Psychic recipient exists, Door was already used on that holder this turn, or the Ability remains suppressed by another live source, do not invent the line.

## Candidate implication

This line increases the AMR of the two-Hood Shadow Rider candidates against Tool-Jammer Iron Thorns because the opponent cannot make its Active Tool Jammer a global answer to both Benched Hoods. It does **not** prove the matchup favorable: rank24 has denial Supporters, Stadiums, Energy disruption, terminal mill, and other lines, and the candidate still needs legal mobility/attack sequencing.

New Moon Tool Jammer v2 does not contain Stealthy Hood, so this exact counter-sequence is a Hood/Lockbridge advantage rather than a general Psychic-deck property.

No deck, worker, fixture or game state was modified by this analysis.
