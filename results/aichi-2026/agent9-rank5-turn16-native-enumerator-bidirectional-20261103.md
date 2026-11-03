# Agent 9: same authentic rank-5 owner root proves both native Trainer offer failure directions

**3 November 2026.** This is a retrospective re-audit of the *already registered* exact original rank-5 Mew/Genesect vs rank-11 Absol/Garbodor A/B/A source archive. It introduces no new gameplay attempts, deck substitutions, policies, feature flags or CI workflows. The whole-policy qualification verdict stays negative.

## Reproducible source

- Original archive: manually dispatched [CI 41658633698](https://github.com/FlareZ123/experiment-01/actions/runs/41658633698), compiled head `5a676e43607650f21883e9ca53280e5044ba70cb`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [artifact 13240534314](https://github.com/FlareZ123/experiment-01/actions/runs/41658633698/artifacts/13240534314). ZIP SHA256 `232b245989660ac107ceda91a4074819ff9e96913f2c076dbb6fd68915f30db0`, decoded JSON SHA256 `c1da10aec0dd221f7387eb129453ca9ebc88f9834907f1be89cf56b16216bde0`.
- Exact reproducible archival reader: `scripts/agent9-rank5-mail-native-enumerator-audit.cjs`, exported `auditRank5MailRoot(archive)`, reads and asserts all relevant original-source record fields. Verified against the actual decoded JSON with Node v22.16.0, returning the expected two contradictory enumerator statuses plus real Store receipt. It has no simulator or hidden-card dependency.
- Related [full A/B/A report](agent9-owner-mail-original-5v11-native-aba-20261103.md). The authentic opponent/source registration is recorded in `results/aichi-2026/full-decklists.json`; primary printed card texts are in `resources/cards/en/me4.json` (Special Red Card M4 82), `resources/cards/en/xy6.json` (Trainers' Mail ROS 92), `resources/cards/en/swsh8.json` (Quick Ball FST 237), `resources/cards/en/me1.json` (Ultra Ball MEG 131) and `resources/cards/en/sv6.json` (Secret Box TWM 163). Trainer timing and deck-search rules: supplied Advanced Player's Rulebook, B-01 and H; search-card partial selections in H.

## Single physically observed root

Frozen source seed **465442104**, original rank-5 owner in physical seat **1**, opponent original rank11 in seat **0**, owner global turn **16**, original control root action ordinal **60**. Two independently re-executed control arms have exactly matching gameEvidence and the matched initial full physical deal is byte-identical across three A/B/A attempts.

The genuine owner `PassTurnAction` is captured in `decisionTrace`. Owner hand has **14 printed cards**, including two Quick Ball FST, two Ultra Ball MEG, one Secret Box TWM, one Escape Rope BST, one Path to the Peak CRE, one Trainers' Mail ROS and one Special Red Card M4. Own Active Dedenne-GX has zero Energy, own Bench has Genesect V, opponent Active Mega Absol ex has one Darkness Energy, opponent Bench holds Latias ex and Trubbish. Both Stadiums are empty and both players have all **6 Prize cards**. Original root trace shows no preceding opponent attack that could have imposed an attack-based Item lock. This turn's first physical source root is the observed Pass.

The read-only `commonActorAudit.ownerTrainerFrontier.examples` for exactly this owner seat and turn records:

| Physically held printing | Native enumerator | Printed constraint and state |
| --- | --- | --- |
| **Trainers' Mail ROS** | **Not offered** | Item is usable with 38 cards in owner deck; intervention later proved actual native acceptance and prompt settlement |
| **Special Red Card M4** | **Offered** | Requires opponent to have at most 3 Prize cards; opponent visibly has 6, so paper use is prohibited |
| Quick Ball FST, 2 copies | Both offered | One other discard per use, hand contains ample material; Basic search has a viable potential attacker target |
| Ultra Ball MEG, 2 copies | One offered, one omitted | Each has a two-card discard requirement; native copy offers do not establish full paper playability |
| Secret Box TWM | Offered | Three-card discard; requires comparing four search-axis rewards with alternative discard/connectors |
| Escape Rope BST | Offered | Each player has Benched Pokémon; switching remains a potentially playable tactical option |
| Path to the Peak CRE | Offered | Empty Stadium zone, first source root this turn; strategic self-suppression matters |

The **false negative** is directly grounded: the original enumerator withheld Trainers' Mail from this root, while the A/B/A intervention selected the physically held card and actual `Store.dispatch` accepted it. An actual owner top-four `ChooseCardsPrompt` resolved a revealed **Float Stone BKT** and that physical card entered the owner hand. The **false positive** is independently printed-rule grounded: native enumeration offered a Special Red Card despite its explicit opponent-Prize condition being false. We did *not* attempt to dispatch Special Red Card, so its actual Store acceptance/rejection is unknown.

This is a bidirectional **enumerator-as-paper-legality-oracle failure at one authenticated owner state**. Neither result establishes that playing Mail was better than other legal actions. In the control, turn18 Played Crobat V and Passed; the Mail treatment on turn18 Passed. Both remained at a 90-root action cap without a new source attack or Prize payoff.

## Secondary basic-attacker line to prioritize

Rank5 exact printed 60 contains **four Mew V** and **three Mew VMAX**. At this root there is no Mew V in the 14-card hand or the two Pokémon in play. The source physical zone counts sum to 60: **14 hand + 38 deck + 6 Prize + 2 Pokémon in play**, with no card remaining for discard/Lost/attachments. The root history contains no owner deck search through this point, so this is a **K0** situation; the four Mew V are in the combined 44 unknown deck/Prize slots.

Under a uniform conditional 44-card hidden allocation, the probability that **all four Mew V are in the six Prizes** is

`C(6,4) / C(44,4) = 0.00011049642359908951`, or **0.0110496424%**.

Equivalently, the probability that at least one Mew V remains in the 38-card deck is **99.98895036%**. This is a mathematical conditioned-deal estimate, not a simulated game frequency or an observed selected play. An owner-visible Quick Ball could pay one discard and search Mew V, then place it into a free Bench slot to prepare the already held Mew VMAX for a subsequent-turn evolution. Bench space exists; Energy funding, opposing pressure and subsequent attacks remain unproven. The line competes with the actual Mail-to-Float-Stone and the native control's future Crobat, making it a valuable *concrete* resource-to-attacker comparator.

## Integration consequence

Treat native enumeration as a hint about potential candidate moves, with **printed legality and actual Store settlement independent**. In the next genuinely selected, single immutable bilateral policy, preserve this root and its original full physical deal, all owner-visible candidate intents, explicit discard payment/target requirements, policy priorities and selected rationale. In particular, compare *Quick Ball to Mew V*, *Mail to Float Stone*, *Escape Rope*, and *Pass*, then follow the actual attack, opponent response and paper custody. This source-anchored regression checks both over-offering a printed-dead Trainer and omitting a native-accepted Trainer.

The 12 A/B/A historical attempts are development-only; zero competitively qualified games, no final fixed 60, no demonstrated 99.5% field win rate. Missing original ranks remain 23/25/28.
