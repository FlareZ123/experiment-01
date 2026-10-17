# Silent Lab versus Iron Thorns: an untested Stadium counter-axis

**Agent 15, 17 October 2026. Status: printed-text hypothesis, not a
compiled Twinleaf fixture, independently verified ruling, or played-game
result.** The fixed Hood Shield v1 list is unchanged by this note.

## Printed text and conditional interaction

- [Silent Lab, PRC 140](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/xy-series/xy5/140/):
  Stadium; all Basic Pokémon in play, in either player's hand and discard
  pile have no Abilities.
- [Iron Thorns ex, TWM 77](https://asia.pokemon-card.com/hk-en/card-search/detail/17531/):
  Basic Pokémon with *Initialization*: while Active, Pokémon with Rule
  Boxes in play have no Abilities except Future Pokémon.
- Shadow Rider Calyrex VMAX, CRE 75: an evolved VMAX whose **Underworld
  Door** Ability would normally be suppressed by Initialization.

**Hypothesis:** if Silent Lab is in play while Iron Thorns ex is Active,
Iron Thorns as a *Basic* has no Initialization. An evolved Shadow Rider
VMAX remains outside Silent Lab's Basic-specific suppression, so its
Underworld Door should become available. This would provide a different
protection axis from Stealthy Hood, which shields the affected Pokémon
from opposing Ability effects.

This is an inference from printed texts and the supplied rulebook's
principles for passive Abilities. Before adopting it in a candidate or
claiming a working response, verify actual paper rules and a pinned
engine Store state across Stadium-entry ordering and suppression cycles.

## Actual source-field importance and opponent answers

All ranks below refer to the [published original inventories](full-decklists.json),
with exactly three source 60s still missing (23, 25, 28).

| Aichi Iron Thorns rank | Stadiums | Specific Silent Lab removal or replacement |
| ---: | --- | --- |
| 6 | Thunder Mountain Prism Star 1, Wondrous Labyrinth Prism Star 1, Tropical Beach 1 | Megaton Blower 1; other-name Stadiums; Guzma & Hala 2 accesses a Stadium under its resource conditions |
| 24 | Thunder Mountain Prism Star 1, Wondrous Labyrinth Prism Star 1 | Megaton Blower 1; other-name Stadiums; Guzma & Hala 2 |
| 29 | Thunder Mountain Prism Star 1, Wondrous Labyrinth Prism Star 1, Tropical Beach 2 | Megaton Blower 1, Field Blower 1; other-name Stadiums; Guzma & Hala 2 |

Megaton Blower's actual card text also discards a Stadium, making it a
direct counter to **both** a Stealthy Hood board (through Tool removal)
and a Silent Lab board (through Stadium removal). Rank 29 additionally
runs Field Blower, which can remove either card category. Faba directly
answers an attached Hood but does not itself remove a Stadium. Therefore
the anti-Hood Tool response census cannot be treated as a complete
anti-Silent-Lab comparison.

In the 29 sourced Top-32 lists, Silent Lab is itself printed at rank
9 (two copies) and ranks 13, 15 and 32 (one each). The named card is not
among the identities in the repository's dated Japanese Expanded ban
snapshot; this is a **bounded identity check**, not a full event-level
legality certification or proof of exact Japanese printing.

## Own-board costs and interplay

Silent Lab also suppresses the **user's own Basic Pokémon**, including
Tapu Lele-GX's Wonder Tag, Radiant Eternatus's Climactic Gate, and
Marshadow's Resetting Hole. Search and Bench-entry Abilities should be
used before Lab whenever possible. The exact 60-card champion and
Hood Shield shells already need Sky Field and Dimension Valley for
other game plans: Silent Lab competes for a Stadium slot and one allowed
Stadium play per turn. An opponent could replace it immediately on
their next turn and re-enable Initialization.

Since Garbodor BKP is Stage 1, Silent Lab by itself does **not**
suppress Garbotoxin. If Garbotoxin is already active, it may also
suppress whichever abilities the player hoped to unlock after playing
Lab. Thus the interaction is a matchup-specific hypothesis against
Active Basic Iron Thorns, not a generic Ability-lock cure.

## Minimal falsification and comparative research

1. Construct a genuine pinned-Store state with Active Iron Thorns ex and
   Benched evolved Shadow Rider VMAX. Check that the unmodified ability
   query suppresses Underworld Door.
2. Play Silent Lab using an actual legal Stadium action and verify that
   the active Iron Thorns no longer has Initialization and Underworld Door
   becomes available. Check that basic Tapu Lele-GX entry ability is
   suppressed, while the evolved VMAX remains unaffected by Lab.
3. Resolve opposing Megaton Blower or a new Stadium on the *following*
   opponent turn; confirm Initialization and VMAX suppression resume.
   Repeat with an opposing Benched Tool-equipped Garbodor and verify
   that Silent Lab does not alone lift Garbotoxin.
4. Only after this passes, compare a **separately frozen, source-checked**
   candidate with an explicit Stadium slot budget against Hood Shield v1
   and champion baseline in identical source deals, both physical seats,
   reproducible seeds and realistic opponent Stadion search/replacement.
   Annotate all policy and effect gaps; no qualified win-rate inference.

The existing [Hood-response census](hood-response-field.md) establishes
that Tool-removal access is widespread and that a strategically distinct
counter-mechanism is worth checking. It does not establish that Silent
Lab is better in actual matches.
