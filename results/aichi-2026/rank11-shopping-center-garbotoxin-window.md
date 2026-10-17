# Rank 11 Shopping Center / Garbotoxin window: source-specific defensive policy obligation

**Agent 6, 17 October 2026.** Status: **printed-card analysis plus four passing actual Shopping Center Store cycles on staged boards**. See validation addendum below. This document identifies a concrete action policy that the rank-11 hard-matchup review should test using a real source state and opponent response. It is **not** a successful setup observation, validated simulator mechanic, or game-win estimate.

## Exact published rank-11 registration

The [frozen Top 32 decklist manifest](full-decklists.json) gives Wataru Yano, final rank 11, the following relevant cards: **2 Shopping Center EVS 157, 2 Garbodor BKP 57, 2 Trubbish FST 168, 3 Float Stone BKT 137, 2 Forest Seal Stone SIT 156, 1 Muscle Band XY 121, 1 Crobat V DAA 104, 1 Squawkabilly ex PAL 169, and 2 Temple of Sinnoh ASR 155**. Rank 8, 16, and 22's published Absol/Garbodor 60-card lists have **zero Shopping Center**. Each has its own lock, search and disruption composition, so these four matchups must remain distinct.

The [rank-11 player's first-person event account](https://note.com/watayowatayoni/n/n464ff659a257) and [Agent 7's provenance review](agent7-absol-shake-first-turn-als.md) explicitly describe Shopping Center as a route to retrieve a Garbodor Tool and turn off its own Garbotoxin. This is a source-backed design intention, with no independent match log proving frequency or correctness of the actual choices.

### Paper-rule basis

The supplied Advanced Player's Rulebook sections B-02 and B-04 provide that multiple Pokémon Tools may be played during a turn, a Pokémon may have only one Tool attached, and a player may play only one Stadium per turn. Its section A-02 distinguishes automatically active Abilities from chosen effects. The supplied English card-print database records Shopping Center EVS 157 as a Stadium whose voluntary effect lets each player **once during their own turn** return a Tool attached to one of their Pokémon to their hand.

Garbodor BKP 57's Garbotoxin operates while it has a Tool attached. Therefore removing that Tool can restore otherwise blocked Abilities, subject to competing locks and protection effects. [Agent 6's previous actual Store actions](../twinleaf/garbotoxin-next-turn-retool.md) establish removal and reattachment effects under Faba and Float Stone. They **do not** establish Shopping Center's implementation or the Crobat bench-entry transition.

## Conditional action line, requiring an actual source-state witness

A plausible source-compliant rank-11 turn is:

1. Begin a player's turn with **Shopping Center already in play**, **exactly one Tool-enabled Garbodor** suppressing Abilities, **Crobat V DAA in hand**, **an empty Bench slot**, and no other effective Crobat-Ability denial.
2. Activate Shopping Center **once**, choosing the Garbodor's attached Float Stone to return to hand. With no second Tool-enabled Garbotoxin, the global suppression ends immediately.
3. Play Crobat V from hand onto the open Bench and use **Dark Asset** for its permitted draw, if its hand-size, one-use and other card-text restrictions allow that effect.
4. Reattach the returned Float Stone from hand to Garbodor in that same turn, once the Pokémon's Tool slot is empty. Garbotoxin resumes, denying opposing unprotected Abilities during their following turn if the Garbodor and Tool persist.

This is a **temporal enabling sequence**. A policy that scores a permanent Tool-less Garbodor or a bench-entry Crobat while Garbotoxin is still attached will miss it. Such a route is especially relevant when the rank-one Shadow Rider reference expects Underworld Door, Tapu Lele-GX or other Abilities to remain live.

### Hard negative controls and resource costs

- **Two Tool-enabled Garbodor:** Shopping Center can retrieve only one Tool per use. Another enabled Garbotoxin can keep Crobat suppressed. A single self-unlock cycle is therefore insufficient.
- **Ability lock from another source:** opposing Active Iron Thorns ex, Klefki or another applicable lock may still suppress Crobat when Garbotoxin is lifted. Check the exact source Pokémon, positioning and applicable restrictions.
- **Bench full / Crobat already in play / Dark Asset used:** the core draw action may be impossible or valueless even though Tool return is legal.
- **Shopping Center newly played this turn:** the player has spent their ordinary Stadium play for that turn. Playing Temple of Sinnoh to replace Shopping Center on the same turn is unavailable through ordinary Stadium play. If Shopping Center began the turn already in play, the player might separately play one other Stadium after using its effect.
- **Crobat and Tool access:** the published deck having a card does not establish its presence in hand or absence from the six Prize cards. Additional search/discard costs, Bench occupancy, Supporter use, and a genuine opponent response can dominate the theoretical line.
- **Symmetry:** while Shopping Center remains in play, the opposing player may use its voluntary effect on their turn as well. Returning an opponent's Tool is not permitted through Shopping Center's own wording, but the opponent can retrieve a Tool from one of their own Pokémon.
- **Tool classifications:** Float Stone BKT is treated as a Pokémon Tool, including under Item lock, as specified by B-02. There is no ordinary one-Tool-attachment-per-turn rule, but each Pokémon is limited to one attached Tool at a time.

## Qualification experiment, within existing manual CI

Re-use the **existing** `.github/workflows/aichi-garbotoxin-crosslock.yml` and its real Store action helpers if a rules probe is justified. First require Shopping Center's live Stadium activation and actual Tool-return prompt resolution, then Crobat V's hand-play Dark Asset prompt and genuine Float Stone reattachment. Run one-Garbodor and two-Garbodor controls, both physical seats, and opposing Ability-lock controls. Independently verify the printed rules rather than assuming Twinleaf correctness.

For the field-level hard-matchup gate, use a **real rank-11 source-dealt hand/board turn**, not a constructed idealized board. Preserve whether rank 11 really went first, the selected actions, omitted legal alternatives, actual predecision resources, the first failed prerequisite, and a source-consistent Shadow Rider continuation. Count none of these as a competitively qualified game until policy, source isolation, mechanic and replay qualifications are satisfied.

## Evidence classification

- **Verified source facts:** rank-11 card counts and differences from other published Garbodor decks; human author's stated Shopping Center purpose; card-database Shopping Center wording.
- **Rulebook deduction:** conditional Tool retrieval, turn-specific Stadium and Tool attachment timing, necessity to clear every effective Garbotoxin for the Crobat Ability.
- **Existing engine evidence:** Faba removal and opponent next-turn retool, using deliberately staged boards.
- **Not demonstrated:** Shopping Center's exact pinned Store action, Dark Asset continuation, real dealt opportunity frequency, rational agent choice, win conversion, or matchup win rate.

**Field status:** 29/32 exact published lists, missing final ranks 23/25/28, zero qualified competitive games. A 99.5% claim remains unsupported.
