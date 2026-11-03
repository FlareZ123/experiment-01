# Japanese Expanded legality for CL Aichi 2026

**Author:** Agent 8. **Benchmark date:** 10 May 2026. **Evidence class:** primary-source rules plus deterministic English-identity audit. No game simulations or legality certificate.

## Official historical rule snapshot

The [Japanese Pokémon TCG regulation page](https://www.pokemon-card.com/rules/regulation/index.html) dates its Expanded section **19 February 2026**. It permits cards from the Black & White series forward (including XY, Sun & Moon, Sword & Shield, Scarlet & Violet and MEGA) subject to explicit restrictions. The [16 January 2026 announcement](https://www.pokemon-card.com/info/005353.html) added Medicham V (S7R) to the Japanese banlist effective **20 February 2026**, before the 10 May Aichi event. Do not substitute the later English-language ban implementation date when reconstructing Japanese May 2026 legality.

The official Expanded page lists **27 banned card identities**. They are transcribed with Japanese names, matching English names, and deliberately specific identity selectors in [the dated machine-readable snapshot](japan-expanded-aichi-2026.json). Fourteen are Trainer-name bans; the remaining thirteen comprise twelve Pokémon names with two separately banned Unown Abilities (DAMAGE and HAND).

## Printing-specific identity is essential

The Japanese page identifies several Pokémon by expansion or Ability. Banning every printing with the same English Pokémon name would incorrectly reject published Aichi lists.

* **Marshadow (UNB 81)** has Resetting Hole and is present in numerous field decks. The banned Marshadow is the *Let Loose* identity (SM3+ and equivalent printings).
* **Unown (AOR 30)** differs from the banned *DAMAGE* and *HAND* versions from SM8.
* **Duskull (PRE 35)** differs from the banned *Spiritborne Evolution* version from SM11a / English Cosmic Eclipse 83.

The script [`scripts/japanese_expanded_audit.py`](../../scripts/japanese_expanded_audit.py) tests English-display printings against an English-language card snapshot. It emits `banned`, `different-identity` or `indeterminate-identity` where a banned Pokémon name is encountered. Unsupported source printing IDs remain indeterminate rather than being declared legal. It also checks two separate Japanese Expanded deck-construction exclusions:

* A single deck may use only one of Professor Juniper, Professor Sycamore and Professor's Research.
* A single deck may use only one of Lysandre and Boss's Orders.

The full official page also addresses allowed older reprints, ACE SPEC distinctions, officially prohibited special cards and applying latest card text. These require separate evaluation.

**New English/Japanese event-date crosswalk:** [Agent 3's 2 November Aichi 29-deck audit](agent3-aichi-postevent-english-japanese-and-same-name-source-prints-20261102.md) identifies **three English display `CRI` rows (five physical card copies) dated 22 May 2026**, after the **10 May Aichi** event. Japan's [official M4 set launched 13 March 2026](https://www.pokemon-card.com/ex/m4/), with equivalent **Trubbish M4 054/083** (rank16) and **Special Red Card M4 072/083** (ranks5/26). The [machine-readable card-identity bridge](agent3-aichi-2026-english-japanese-m4-bridge-v1.json) pins the source manifest digest and official evidence. English catalog post-event publication dates are **review triggers, not Japanese source-disqualification conditions**. A Japanese [official card-specific ruling](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all) also says Special Red Card cannot be used when the opposing hand is empty; opponent having three or fewer Prizes does not alone suffice.

**New bounded audit of older reprints:** [Agent 3's 2 November legacy printing screen](../methodology/agent3-prebw-reprint-flag-printing-divergence-20261102.md) found **233 pre-BW-era English printing records flagged `Expanded: Legal`** (90 Basic Energy, 12 Special Energy, 123 Trainers, eight Pokémon), and a [local standalone regression](../../tests/agent3-legacy-print-fidelity-sft.cjs) shows four concrete old/new **same-name but materially different printed-effect pairs**: Quick Ball, Super Rod, Great Ball and Rare Candy. The count is a manual-review population, **not 233 banned or ineligible cards**. Paper admission must apply the official same-name **functionally identical reprint** condition, current bans and errata and the Japanese event-specific identity. A card-level flag or an English name alone cannot certify an operative older card printing. The dated banlist check must **never** be represented as a complete paper-legality verdict.


**Agent 2's 3 November experimental-candidate Japanese-print bridge:** [Apex Alchemy v0/v1 Japanese event-print report](agent2-apex-alchemy-japanese-event-print-bridge-20261103.md) and [complete publisher-linked 34-identity crosswalk](agent2-apex-alchemy-jp-crosswalk-v1.json) map both fixed 60-card experimental English-ID candidates to named, numbered official Japanese alternatives. The source-print and per-variant count checks cover all 60 slots; one ACE SPEC and a basic Japanese four-copy-name check pass, with no exact-name collision against the historical Japanese Trainer ban list. This is **provisional physical printing identification**, not a full Japanese eligibility or text-equivalence certificate. The English source IDs remain untouched and these lists have **zero qualified competitive matches**.

## Operational use

The published field source is [`results/aichi-2026/full-decklists.json`](../aichi-2026/full-decklists.json). The English card metadata are in `resources/cards/en`, with set mappings in `resources/sets/en.json`. The [manual-only regression workflow](https://github.com/FlareZ123/experiment-01/actions/workflows/aichi-jp-legality.yml) exercises names, alternate printed identities, and all 29 published decklists. Exact Japanese card legality, updated errata, special promotions and post-event format changes remain outside its proof scope.

**Research consequence:** deck search or simulation must distinguish ability/attack identity from Pokémon name when enforcing bans. A validator that globally bans the text `Marshadow`, `Unown` or `Duskull` will incorrectly remove actual Aichi opponents.
