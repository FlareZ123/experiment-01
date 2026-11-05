# Two release clocks for the Aichi May 2026 source field: five later-English Chaos Rising aliases

**Agent12, 5 November 2026. Source-printing provenance audit, independent of deck strength.**

## Result

A deterministic scan of the shared 29 published original 60-card name/count
lists against their **English set release dates** finds **three card rows,
five physical card copies, in three original source ranks**, attributed
to **Chaos Rising (CRI)**, the English-language expansion released
**22 May 2026**. The Aichi Expanded Open League tournament took place
**10 May 2026**, so a *literal physical English CRI printing* would be
12 days postevent. The repository's 60s are normalized English card
references; this timing cannot by itself establish an illegal tournament
deck or even a false card identity.

| Original finish | Original player | English-normalized reference | Count | Japanese same-card print available before event |
| --- | --- | --- | ---: | --- |
| 5 | Yamato Nakano | Special Red Card CRI 082 | 2 | Special Red Card, Ninja Spinner M4 072/083 |
| 16 | Takumi Matsumoto | Trubbish CRI 056 | 2 | Trubbish (ヤブクロン), Ninja Spinner M4 054/083 |
| 26 | Hibiki Yamada | Special Red Card CRI 082 | 1 | Special Red Card, Ninja Spinner M4 072/083 |

**Independent official chronology resolves the apparent illegality:**
Ninja Spinner M4 was released in Japan on **13 March 2026**, 58 days
before the tournament. Japan's official card search lists Special Red Card
as **M4 072/083** and Trubbish as **M4 054/083**. These are independently
documented earlier Japanese printing identities of the two English
localized cards. This is consistent with the three original Japanese
lists having legal names and gameplay on May 10. Without original
physical print photographs, it is *not* proof of which specific Japanese
printing each participant physically used.

## Reproducible repository source scan

- Tournament-as-of date: **2026-05-10**; confirmed by the official
  [Aichi event schedule](https://www.pokemon-card.com/info/005439.html)
  and [published Expanded Open list](https://limitlesstcg.com/tournaments/566/decklists).
- Source 60s: [results/aichi-2026/full-decklists.json](full-decklists.json),
  all 29 admitted rank/name/count lists. For every original rank and
  card row, group by printed English set code and sum the listed counts.
- English set dates: [resources/sets/en.json](../../resources/sets/en.json)
  records Chaos Rising as internal set **me4**, international code
  **CRI**, release **2026/05/22**. The official
  [Pokémon.com English expansion announcement](https://www.pokemon.com/us/news/the-pokemon-tcg-mega-evolution-chaos-rising-expansion-arrives-on-may-22-2026)
  independently confirms 22 May.
- Of all English set codes used by these 29 60s, CRI is the **only
  set-level release strictly after May 10**, with 3 rows / 5 copies.
  This is a set-date scan only. Within-set late variant-art releases
  are separately important.
- Japanese manufacturer verification:
  [official M4 Ninja Spinner release](https://www.pokemon-card.com/ex/m4/)
  **13 March 2026**;
  [official Special Red Card M4 072](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all);
  [official Trubbish M4 054](https://www.pokemon-card.com/card-search/details.php/card/50138).
  The official Japanese text shows a Basic Darkness 70 HP Trubbish
  with Acid Spray for 10 and a coin-dependent opponent Active
  Energy discard, matching the localized card's operational identity.

The source reference to CRI 082 in ranks 5 and 26 can therefore be an
**English catalog alias for an already-available Japanese M4 072 card**.
The source reference to CRI 056 in rank 16 can similarly alias M4 054.
For source provenance, record both identifiers and their regional dates
rather than deleting these cards, rewriting the original 60, or pretending
that the physical English CRI printing itself existed on 10 May.

## Why chronology requires card-level and region-aware checks

A later foreign-language printing can correspond to a card already
released in the event's jurisdiction. That is a different situation
from a future illustration or variant with no equivalent pre-event
printing: [Agent17's separate analysis](agent17-postevent-basic-energy-printings-20261104.md)
records **120** later 30th Celebration MEE Basic Energy art assignments
in 22 source 60s, with no evidence that those specific new artworks
were already available before the event. Those remain **printing-proxy
provenance warnings**, even though Basic Energy card names themselves
were available.

A model of the historical Japanese games should use the original
eligible card **name and contemporary card text** where possible and
independently document its English equivalent. Japanese and
international rules text, errata, available printing, and the Paper
Expanded format each need their own check. Neither an English set's
first availability nor a contemporary international-Expanded legality
flag settles those questions alone.

**Open rules nuance, not claimed as a difference in legal effect:**
the current English Special Red Card wording includes a conditional
draw clause for cards actually put on the deck bottom, while the
Japanese official M4 card search's compact Japanese wording does
not explicitly reproduce that condition. The no-hand interaction
requires authoritative Japanese ruling review; this audit does not
assert different effects or pretend that an English post-event image
is evidence of May tournament wording.

## Consolidated executable provenance audit: three release clocks

The companion [source-derived clock audit](../../scripts/agent12-aichi-release-clock-audit.cjs)
and [regression fixtures](../../tests/agent12-aichi-release-clock-audit.test.cjs)
cover all 29 original archived 60s. They prioritize printed PTCGO codes
over internal set IDs, recognize XY/SM/BW promo aliases, and distinguish
the mixed-release MEE Basic Energy art series.

| Exact printed identifier category | Source rows | Physical copies | Historical as-of interpretation |
| --- | ---: | ---: | --- |
| English CRI 056/082 from the 22 May expansion | 3 | 5 | Later English localization of cards available in Japanese M4 since 13 March |
| MEE 009-016 YOSHIROTTEN 30th Celebration artwork | 35 | 120 | Numbered art released 16 September, after tournament; underlying Basic Energy names are older |
| Japanese S-P 127 Player's Ceremony | 4 | 5 | Domestic promo existing since approximately September 2020; not an English set-code exception |

The [official Japanese S-P 127 record](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY)
verifies the Player's Ceremony S-P 127 / S-P catalog identity.
[PokeBoon's historical promo record](https://pokeboon.com/127sp-playersceremony-promo/)
dates its distribution to around September 2020.
The [MEE Basic Energies print-series catalog](https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG))
documents 001-008 introduced in Mega Evolution September 2025 and
009-016 in 30th Celebration September 2026.
The [manufacturer's 30th Celebration announcement](https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc)
confirms 16 September 2026.

**Reproducibility and CI limitation:** initial
[manual CI 42056107491](https://github.com/FlareZ123/experiment-01/actions/runs/42056107491)
failed because the script did not recognize the internal SMP promo alias.
The second [manual CI 42057074448](https://github.com/FlareZ123/experiment-01/actions/runs/42057074448)
found a separate defect: internal set IDs can collide with another
set's printed PTCGO code. Both were corrected with regression fixtures.
**Neither failed CI is a passing end-to-end script verification.**
A subsequent workflow dispatch was blocked by host safety checks.
An independent in-chat JavaScript census using the exact original
full-decklists.json and sets/en.json confirmed **29 complete 60s**,
three CRI rows/five copies, 35 MEE rows/120 copies and four Japanese
S-P rows/five copies. Post-correction compiled Node execution remains
unverified. These are provenance counts, never competitive win evidence.

The audit makes no claim that all 125 later-identified physical
printings existed on May 10 or that any player's private registered
artwork is known. Name/rule identity and Japanese print availability
must be distinguished from English-normalized collector identifiers.

## Impact and scope

- The **29/32 original card-name/count admission status is unchanged**.
  Ranks 23,25,28 still lack authenticated original sixty-card compositions.
- These five English CRI references **must not** automatically be marked
  as paper-illegal tournament card names: earlier official Japanese
  Ninja Spinner equivalents are verified.
- Physical printing identities and English translation equivalence
  remain explicit, qualified observations. No actual physical decks
  were inspected in this audit.
- The 120 previously identified MEE post-event artwork aliases are
  independent and must not be misinterpreted as if these five CRI
  aliases had the same regional chronology.
- No native game was run and no competitive win-rate evidence was
  produced. The shared 99.5% single-fixed-60 objective remains open.
