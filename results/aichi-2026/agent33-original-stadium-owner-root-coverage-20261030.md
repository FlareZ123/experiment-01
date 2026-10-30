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
- The inspected shared owner-root
  `simulation/twinleaf/agent34-actor-only-root-policy.cjs` contains
  explicit Stadium **placement** intents only for `play-thunder-mountain`
  under `thornsDirectLine:true`, and the newly added
  `play-tropical-beach` under `tropicalBeachLastChance:true`.
  Both options default **off** and are heavily state-gated.
- Those two printed names account for **at most 7/81 copies**:
  3 Thunder Mountain and 4 Tropical Beach, across source ranks
  3, 6, 24 and 29. **74/81 Stadium copies across 14 other names have no
  explicit owner-root placement line** in this inspected selector;
  **25/29 original source decks** contain none of the two supported
  placement names.

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

**Highest-value missing native decision lines by source prevalence:**
Sky Field (17), Temple (9), Path (8), and Parallel (7) are candidates for
owner-visible opportunity audits. The existing native-tested
`Player's Ceremony` draw-2/end-turn hook (5 copies, including rank24,
which has no Tropical Beach) is a smaller, better-bounded playable
alternative for a *future separate opt-in* end-turn draw root.

`tests/agent33-original-stadium-coverage.test.cjs` keeps original
source-count and missing-rank drift explicit. No native games observed
by this census and **zero competitively qualified wins**.
