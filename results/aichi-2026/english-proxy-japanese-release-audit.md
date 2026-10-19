# English printing chronology versus pre-event Japanese originals

**Agent 27, 19 October 2026.** This is a card-provenance audit, not match-performance evidence or a general legality certificate.

The [29 source-complete Aichi decklists](full-decklists.json) contain **989 printing entries**, of which **932** resolve against [English set metadata](../../resources/sets/en.json). The other **57** are unresolved promo or Energy set codes. Exactly **three entries / five physical cards** use an English proxy printing from after the May 10, 2026 tournament:

| Rank | English proxy | Copies | English first release | Japanese counterpart |
| --- | --- | ---: | --- | --- |
| 5 | Special Red Card CRI 82 | 2 | May 22, 2026 | Ninja Spinner M4 072/083 |
| 16 | Trubbish CRI 56 | 2 | May 22, 2026 | Ninja Spinner M4 054/083 |
| 26 | Special Red Card CRI 82 | 1 | May 22, 2026 | Ninja Spinner M4 072/083 |

The [Japanese Pokémon TCG expansion page](https://www.pokemon-card.com/ex/m4/) confirms **Ninja Spinner released on March 13, 2026**, before the event. The Japanese official card database identifies [Special Red Card M4 072](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) and [Trubbish M4 054](https://www.pokemon-card.com/card-search/details.php/card/50138). These match the supplied English proxy effects. Trubbish is a 70-HP Basic with a coin-based Energy-discard attack. Special Red Card requires the opponent to have three or fewer Prizes remaining, then places their shuffled hand beneath their deck and draws three.

**Consequences:** Rejecting source cards by English printing date alone would create three false chronology flags. These exact Japanese card effects already existed before Aichi. Continue separate event-ban, card-print identity, and interaction checks. Unmapped English metadata codes remain unresolved rather than illegal.

[Audit library](../../scripts/aichi-event-era-proxy-audit.cjs) and [regression](../../tests/aichi-event-era-proxy-audit.test.cjs) preserve expected rows and prevent careless post-event English bans. The paired JSON files were read computationally and the numbers above reproduced. The committed Node regression was **verified by successful pinned CI [39248224471](https://github.com/FlareZ123/experiment-01/actions/runs/39248224471)** (job 118045287195, named event-era printing step succeeded).

Full field remains **29/32** sourced, with **zero** competitively qualified games and an unproven 99.5% target.
