# Original Top32: Supporter-family action vocabulary, 29 exact recoverable 60s

**Agent 25, 29 October 2026. Static original-card inventory only.** Input is [`full-decklists.json`](full-decklists.json), a card-by-card representation of the **29 available paper Expanded Aichi May 10, 2026 Top32 registrations**. Source ranks 23, 25 and 28 remain unrecovered; no inferred substitute 60s are counted.

The reusable `simulation/evaluation/agent25-29-source-supporter-vocabulary.cjs` groups 23 explicitly named, printed Supporter names into their consequential action families and retains **all 29 source rows**. It guards the exact sixty-card totals and missing-rank IDs. A named Supporter **present in a list does not establish a valid owner-held hand, a legal target, an unspent turn quota, a favorable line, or a completed Store effect**. The shared preregistered canonical actor policy has no general family-wide Supporter chooser; its card-specific branches are optional.

| Named printed Supporter | Original source decks containing it | Printed copies in those 29 lists | Main required action family |
| --- | ---: | ---: | --- |
| Guzma | **25/29** | 48 | Opponent Bench gust plus own Active switching |
| Lillie's Determination | **16/29** | 19 | Shuffle own hand, draw six or eight |
| Marnie | **13/29** | 16 | Disrupt both players' hands |
| Carmine | **12/29** | 15 | Turn-one hand reset and draw |
| Raihan | **12/29** | 14 | Post-KO Energy attachment and deck search |
| Iono | **10/29** | 11 | Prize-dependent both-player hand reset |
| Crispin | **9/29** | 10 | Basic Energy selection, mixed access |
| Plumeria | **8/29** | 20 | Opponent Energy denial consuming own hand |
| N | **7/29** | 8 | Prize-dependent both-player hand reset |
| Guzma & Hala | **5/29** | 13 | Stadium + Special Energy + Tool multi-axis search |
| Roxie | **1/29** (rank 31) | 4 | Discard non-GX/non-EX Pokémon to draw |

The **rank-31 Dusknoir/Chimecho original 60** illustrates why a shortlist limited to ubiquitous Guzma/Lillie/Marnie can be misleading. It carries **four Roxie**, no other selected frequent Supporter, plus many search/recursion Items. Roxie's discard requirement is explicitly tied to Pokémon that are neither Pokémon-GX nor Pokémon-EX. Correct operation requires typed hand selection, discard costs, full card-text timing and native confirmation. With Roxie included, **29/29** published source sixties contain at least one Supporter from the 23-name targeted vocabulary. This is an **inventory coverage property**, not 29 actual legal missed plays.

An additional connecting bottleneck: **VS Seeker is in 23/29 source lists (59 printed copies)**, while **Battle Compressor is in 17/29 (33 copies)**. These are **Item** cards, not Supporters. Their ability to reach or set up Supporter lines depends on the earlier action, Item permission, discard pile, costs and alternative resource uses. A graph that merely connects VS Seeker to Guzma would overstate the genuine flexibility if it omits the one-Supporter-per-turn and one-use constraints.

## Integration priority and scientific caveats

The current evidence points toward a **shared two-seat legal action selector with opponent/source reply receipts**. Gust/Switch, both-player hand reset, Energy denial, and multi-axis search should be modelled separately for costs and targets, with a common owner-visibility, turn-quota, native acceptance and prompt-effect witness. Before broadening card policy, use the existing Agent7 held-Supporter opportunity census, Agent24 printed Lillie postcondition observer and the [two genuine candidate-seat Lillie plays](agent25-32-native-lillie-settled-replies-20261029.md) as a positive control for this structure. Negative cases such as a Bench-free Guzma, unavailable Team Flare Grunt target, or an important protected discard should also be tested.

This audit **does not** automatically validate which 23 Supporters can be played at a particular root, how many copies are legal or helpful, nor any match outcomes. The 29-source coverage remains incomplete until ranks 23/25/28 are independently recovered. **Zero competitively qualified simulated games and no demonstrated 99.5% win rate.**

**Reproduce:** `node simulation/evaluation/agent25-29-source-supporter-vocabulary.cjs`; pure assertions in `tests/agent25-29-source-supporter-vocabulary.test.cjs`. The generated JSON includes per-rank exact Supporter counts and main functional family descriptors. The line-level card printings are retained in the source JSON. No supplementary inferred opponent decklists were generated.
