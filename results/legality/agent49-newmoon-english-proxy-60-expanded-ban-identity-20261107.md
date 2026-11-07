# Independent 34-print English proxy Expanded-ban screen for frozen New Moon 60

**Agent49 | 7 November 2026 | dated corpus and exact-effect screening.**
This is a reproducible **English-mechanics proxy audit**, never a
certificate that every original Japanese physical print was legal at
the 10 May 2026 Aichi tournament or that Twinleaf implements its text.

## Source and exact result

The frozen 60 is
[`new-moon-lockbreak-english-proxy-60.json`](../als/new-moon-lockbreak-english-proxy-60.json),
with 34 distinct explicit English proxy card IDs and 60 physical copies.
The source ban specification is
[`japan-expanded-aichi-2026.json`](japan-expanded-aichi-2026.json),
with **27 explicitly named banned identities** and print-sensitive
ability/attack selectors. An independent same-date present-day
Expanded check is consistent with the maintained
[27-card English list](https://tcgcontender.com/pokemon/reference?format=expanded&view=banlist)
(as of October 13, 2026), while the
[official 2026 rotation announcement](https://www.pokemon.com/us/news/2026-pokemon-tcg-standard-format-rotation-announcement)
retains Black & White onward in Expanded.

Using the actual bundled complete English corpus card records
(`resources/cards/en/<set>.json`) for all 34 exact IDs:

| Necessary source property | Result |
| --- | --- |
| Fixed 60 copies | **60** |
| Distinct exact English proxy card IDs | **34** |
| Source English set JSON files touched | **28** |
| Exact IDs, card names, and category/supertypes resolved | **34/34** |
| Bundled English `legalities.expanded` entries `Legal` | **34/34** |
| Original dated banned identities tested | **27** |
| Ban-identity matches (Trainer-name, Pokémon-name, Ability or attack) | **0** |
| Non-Basic card-name groups with more than four copies | **0** |
| ACE SPEC copies | **1** (Secret Box TWM) |
| Basic Psychic Energy copies | **3** |
| Radiant Pokémon copies | **0** |
| Prism Star copy-limit violations | **0** |

### Why exact print and effect matter

Two included Pokémon share names with **other banned printings**:

- This deck uses **3× Unown `xy7-30` (Ancient Origins)**, with
  *Farewell Letter* Ability and *Hidden Power* attack. Its original 2026
  ban selectors instead identify the **Lost Thunder Unown** versions
  with *HAND* and *DAMAGE* Abilities.
- The deck uses **2× Duskull `swsh4-69` (Vivid Voltage)**, with
  *Future Sight* attack and no Ability. The separate banned
  **Cosmic Eclipse Duskull** has *Spiritborne Evolution*.

A naïve name-level `banNames.has('Duskull')` or
`banNames.has('Unown')` would incorrectly reject this deck. Conversely,
assuming that every printing under a shared Pokémon name is legal
would admit the explicitly banned versions.

## Reproducibility and tests

New independent source validator:
[`agent49-newmoon-expanded-ban-print-audit.cjs`](../../simulation/evaluation/agent49-newmoon-expanded-ban-print-audit.cjs)
accepts the exact frozen candidate, dated 27-identity ban snapshot and
an exact English card-ID resolver. It checks name, card supertype,
`legalities.expanded`, full Pokémon Ability/attack names against
print-sensitive bans, non-Basic 4-copy limit, ACE SPEC count,
Radiant and Prism Star restrictions.

[Four regression cases](../../tests/agent49-newmoon-expanded-ban-print-audit.test.cjs)
cover the actual 60, the two same-name but legal different-effect
Pokémon, deliberately mutating the exact Duskull/Unown Ability to
banned identity, and simulated missing card/second ACE SPEC.
**4/4 passed** in an isolated V8 harness evaluating the actual fetched
source validator, actual manifest and ban snapshot, with compressed
card identities/effect names **individually fetched from the actual
28 repository English set JSON files in three batches**. Separately
Python with the uploaded card-list ZIP looked up all exact 34 IDs,
confirmed their Expanded flags, 60 count and Basic/ACE/copy limits,
and independently found no overlap with the 27 ban selectors.
This is **not** a Node22 CI run or native Twinleaf Store action replay.

## Strict boundaries

1. The English proxy has deliberate named-print substitutions (such
   as the native Basic Psychic `MEE 13` versus archived
   `swsh12pt5-156`). The **actual Japanese original event
   registration IDs** and applicable May 2026 Japanese rules still
   require a separate print-by-print certification.
2. Bundled legalities may lag official bans; the exact 27-identity
   Japanese snapshot plus crosschecked current 27-card English list
   reduces this risk without eliminating source-date uncertainty.
3. Native engine completeness, correct card-text implementation,
   owner decisions, lock interactions, matchup competence and the
   25/35-minute official Aichi clocks remain **unqualified**.
4. The final target is a single fixed 60 versus all 32 Aichi Top32
   opponents. Only 29 original name/count 60s are authenticated;
   23,25,28 are missing. No competitive games qualify and **no
   99.5% win rate is demonstrated**.

The result supports retaining this candidate for further source-fidelity
and actual adversarial game testing. It does not justify promoting it as
the winning deck.
