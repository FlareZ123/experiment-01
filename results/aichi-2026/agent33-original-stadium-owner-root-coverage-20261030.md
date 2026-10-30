# Original Aichi Top32 Stadium-card owner-root coverage deficit

**Agent 33, 30 October 2026, paper source-census plus code inspection.**
This is a count of **unchanged published original source 60s**, not a
game simulation, legality certificate or deck-performance comparison.

## Reproducible original source inventory

`simulation/evaluation/agent33-original-stadium-coverage.cjs` reads the
existing `results/aichi-2026/full-decklists.json` and the 29 authenticated
source ranks (excluding 23, 25, 28). The Stadium-subtype mapping is
explicit, using the supplied Black & White onward card list and the
project's research-defined Japanese `Player's Ceremony SP127`. Prism glyph
spellings follow the source JSON.

- All **29/29** known original sixty-card decks contain at least one Stadium.
- They collectively contain **81 physical Stadium copies** across
  **16 distinct Stadium names**.
- **Historical snapshot at 23:17 UTC:** the inspected shared owner-root
  `simulation/twinleaf/agent34-actor-only-root-policy.cjs` offered only
  `play-thunder-mountain` and the then-new `play-tropical-beach`,
  both opt-in and conditional. That left **74/81 printed Stadium copies**
  without named placement lines and **25/29 sources** without either name.
- **Updated prospective development snapshot at 23:29 UTC:** added separate
  `play-players-ceremony`, `play-sky-field`, and
  `play-path-to-peak` owner-root options. All five flags remain
  **default OFF** and state-constrained. Their names appear in
  **37/81 printed Stadium copies** across **17/29 sources**. The other
  **44/81 copies** across 11 names have no explicit placement branch;
  **12/29 source decks** contain none of the five named printings.
  A printed copy counts even when its new condition almost never occurs;
  none of these coverage counts establishes native success or a win.

| Stadium in source 60 | Original copies | Ranks containing it |
| --- | ---: | --- |
| Sky Field | 17 | 1, 4, 5, 14, 18, 19, 30 |
| Temple of Sinnoh | 9 | 3, 8, 11, 16, 22 |
| Path to the Peak | 8 | 5, 9, 12, 15, 20, 21, 27 |
| Parallel City | 7 | 10, 12, 13, 20, 21, 27, 32 |
| Artazon | 5 | 2, 7, 15 |
| Player's Ceremony (SP127) | 5 | 3, 6, 24, 29 |
| Silent Lab | 5 | 9, 13, 15, 32 |
| Risky Ruins | 4 | 26 |
| Tropical Beach | 4 | 3, 6, 29 |
| Grand Tree | 3 | 2, 15, 31 |
| PokéStop | 3 | 9, 17, 31 |
| Thunder Mountain ♢ | 3 | 6, 24, 29 |
| Wondrous Labyrinth ♢ | 3 | 6, 24, 29 |
| Chaotic Swell | 2 | 7 |
| Shopping Center | 2 | 11 |
| Dimension Valley | 1 | 1 |

**Interpretation and strategic constraint:** A Stadium already present
on the public board can alter game mechanics, and a noncanonical native
policy may choose to play one. The result here is strictly about this
**specific shared actor-only placement decision vocabulary**. Counts do
not establish that every unsupported placement would be strategically
correct. Sky Field replacement can destroy a large Bench, while Temple,
Path and Silent Lab can switch off one's own valuable resources. Blind
Stadium filling would be harmful. We should test bounded, state-specific
Stadium choices and actual native Store acceptance before adding them to
the canonical common policy.

**Next high-frequency uncovered decision families:** Temple of Sinnoh (9)
and Parallel City (7) remain absent from this experimental owner placement
vocabulary. Sky Field (17), Path to the Peak (8), and Player's Ceremony (5)
have now received **separate, default-off, state-dependent proposal roots**
with synthetic tests and staged pinned-native tests awaiting CI execution.
Source copying, path legality, actual root action acceptance and real
opponent reply remain unverified for all three new experiments.

`tests/agent33-original-stadium-coverage.test.cjs` keeps original
source-count and missing-rank drift explicit. No native games observed
by this census and **zero competitively qualified wins**.

## Why prospective name coverage is not active gameplay coverage

No option is enabled by default, and the new cards have different realism
constraints. Sky Field requires five occupied own Bench slots and another
held Basic, which is impossible in the **initial seven-card hand** if Sky
Field is also in hand. It must wait for additional draw or search.
Path to the Peak requires a visible opposing Rule Box Ability and avoids
locking the acting player's own printed and Tool-granted Abilities.
Player's Ceremony is held for last-chance two-card draw only when
the Stadium slot is uncontested or Ceremony is already active.
Thus the **30-copy nominal increase** in named source coverage is a
new capability surface, never a demonstrated in-game line frequency.
The baseline 74 missing copies is kept explicitly for longitudinal
comparison, and the new 44 missing-copy count represents this exact
current development snapshot. Zero competitively qualified games.


## Printed two-Stadium contention among experimental branches

The raw source field has simultaneous access channels for several
**different** named Stadiums in the same fixed 60. A named root's
reachability therefore cannot be added uncritically as if all choices
are executable in the same turn:

| Original source rank | Competing printed Stadiums | Copies in that 60 |
| --- | --- | --- |
| 5 Mew Genesect | Sky Field vs Path to the Peak | 2 + 2 |
| 3 Snorlax Stall | Tropical Beach vs Player's Ceremony | 1 + 1 |
| 6 Iron Thorns | Tropical Beach vs Player's Ceremony | 1 + 1 |
| 29 Iron Thorns | Tropical Beach vs Player's Ceremony | 2 + 1 |
| 6, 24, 29 Iron Thorns | Player's Ceremony vs Thunder Mountain | 1+1, 2+1, 1+1 |

This is a **printed access overlap**, not simultaneous hand presence
or a proven best choice. The present development chooser makes
different hardcoded choices when more than one optional flag is
enabled, so it needs a prospective contention/arbitration policy
before cross-option combined win-rate experiments. In particular,
Path to the Peak can self-disable a source Mew Genesect player's
own Genesect V Fusion Strike System: preserving an early draw engine
may be preferable to a late tactical Path lock. All current original
two-seat registries should continue enabling only the specifically
precommitted owner policy difference.
