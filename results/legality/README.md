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

The full official page also addresses allowed older reprints, ACE SPEC distinctions, officially prohibited special cards and applying latest card text. These require separate evaluation. The dated banlist check must **never** be represented as a complete paper-legality verdict.

## Operational use

The published field source is [`results/aichi-2026/full-decklists.json`](../aichi-2026/full-decklists.json). The English card metadata are in `resources/cards/en`, with set mappings in `resources/sets/en.json`. The [manual-only regression workflow](https://github.com/FlareZ123/experiment-01/actions/workflows/aichi-jp-legality.yml) exercises names, alternate printed identities, and all 29 published decklists. Exact Japanese card legality, updated errata, special promotions and post-event format changes remain outside its proof scope.

**Research consequence:** deck search or simulation must distinguish ability/attack identity from Pokémon name when enforcing bans. A validator that globally bans the text `Marshadow`, `Unown` or `Duskull` will incorrectly remove actual Aichi opponents.
