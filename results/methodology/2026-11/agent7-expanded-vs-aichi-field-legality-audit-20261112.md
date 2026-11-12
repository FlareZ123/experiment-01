# Paper Expanded legality audit of the Aichi source field

**Agent 7, 12 November 2026.** This audit resolves the format conflict at the card-pool level rather than treating the repository's current Japanese Extra label as interchangeable with the governing `prompt.md` scope of paper Expanded (Black & White onward).

## Inputs

- `results/aichi-2026/full-decklists.json`: 29 available Aichi Top 32 lists, with ranks 23, 25, and 28 missing.
- Uploaded `card-list.zip`: 20,635 English card-printing records with Expanded legality fields where supplied.
- `results/aichi-2026/candidate-hood-shadow-rider.json`: current Hood Shield 60-card hypothesis.

## Findings

### Banned-printing scan

The card pool contains 41 exact English printings marked `Expanded: Banned`. A scan by exact source set/number found **zero** of those banned printings in the 29 available source lists or the Hood Shield candidate. This is a narrow banned-list result; it does not establish that every source printing is available/legal in English Expanded.

### Aichi ranks that are not directly represented in the supplied Expanded pool

The following source entries are present in the published lists but do not resolve to an English card printing in the supplied pool:

| Rank | Published card entry | Count | Card-pool / format finding |
| --- | --- | ---: | --- |
| 24 | Palace Book — SMP NAN25 | 2 | No matching English card-pool printing; Palace Book is a Japanese XY-P / SM-P promotional card without an official English release. |
| 24 | Player's Ceremony — SP 127 | 2 | No matching English card-pool printing; Japanese S-P Promo 127. The card database marks it not Expanded-legal. |
| 29 | Palace Belt — BWP 153 | 2 | No matching English card-pool printing; Japanese BW-P Promo 153 without an official English release. |
| 29 | Player's Ceremony — SP 127 | 1 | No matching English card-pool printing; Japanese S-P Promo 127, not Expanded-legal in the card database. |

Public card references:
- Palace Book: https://bulbapedia.bulbagarden.net/wiki/Palace_Book_(XY-P_Promo)
- Palace Belt: https://bulbapedia.bulbagarden.net/wiki/Palace_Belt
- Player's Ceremony: https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_(SM-P_Promo_248)
- Expanded legality entry for Player's Ceremony: https://poketcg.dragonshield.com/card/playersceremonysp127

The event lists use English-translated names and a `language: en` metadata value for these entries, but that does not turn the Japanese-only promotional printings into English Expanded cards. In particular, Player's Ceremony is explicitly not Expanded legal. Do not silently replace these cards with similarly named legal cards; that would change the registered opponent list.

### Current Hood Shield candidate

All non-energy card entries in `candidate-hood-shadow-rider.json` resolve to English Expanded-legal printings in the supplied card pool. The one normalization issue is its 11 Basic Psychic Energy entries recorded as `MEE 13`, which is a nonstandard placeholder rather than a printing in the supplied card database. Before calling the 60 fully paper-legal, normalize those entries to an actual legal Basic Psychic Energy printing (for example Chilling Reign CRE 232, which the card pool marks Expanded Legal). The `Battle Compressor PHF 92` shorthand resolves to the legal `Battle Compressor Team Flare Gear` printing.

## Consequence for the governing objective

The user-selected `prompt.md` defines the research scope as paper Expanded. The repository README and much of the current Aichi research instead describe Japanese Extra. At least ranks 24 and 29 contain Japanese-only / non-Expanded cards, so the exact 29-list Aichi field is **not** a uniformly legal Expanded opponent field. The three missing lists remain unverified as well.

Therefore:
1. Treat paper Expanded as the governing objective for this invocation.
2. Do not claim that the current Aichi Top 32 is an Expanded-legal field or that Japanese Extra native results establish Expanded strength.
3. Preserve ranks 24 and 29 as authentic Japanese Extra source lists; do not rewrite them to manufacture Expanded legality.
4. If the owner wants the Aichi event itself to remain the exact benchmark, the format must be explicitly changed to Japanese Extra. If Expanded remains governing, the benchmark needs an owner-approved rule for handling these non-Expanded opponents, or a different Expanded-legal opponent field.
5. Normalize the candidate's Basic Energy placeholder before publishing it as a legal fixed 60.

## Limits

- This is a card-pool/printing audit, not an independent tournament-rules ruling on foreign-language cards.
- The supplied card pool is the repository's local source of truth; external card references are corroboration.
- The 29 source lists are incomplete: ranks 23, 25, and 28 are still missing.
- No games were run, no deck was promoted, and no win-rate inference follows.

**Bottom line:** the current candidate can be normalized into an Expanded-legal 60, but the Aichi field as currently registered cannot be represented as an exact, uniformly Expanded-legal Top 32. The project must stop conflating Japanese Extra evidence with the prompt's Expanded objective.
