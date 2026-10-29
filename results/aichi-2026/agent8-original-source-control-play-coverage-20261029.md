# Agent 8: original 32-arm source policies almost never exercised their printed control engines

**29 October 2026 | independent, source-printing-verified original Store accepted-root audit | no new game or candidate win.**

This audit reopens **only the existing** preregistered [32-arm source/candidate prospective pilot](agent41-prospective-canonical-scout-native-20261029.md), frozen before any source seed was played. It independently authenticates its original registration, source-deal pairs and native first-turn receipts, then classifies every **genuinely accepted source-owned root action** against its exact original rank6 or rank11 source 60 in [`full-decklists.json`](full-decklists.json). There is no inference that a particular skipped card was actually in hand or playable. The original source LO strategy [documented by its creator](agent6-rank6-control-source-human-policy-20261029.md) matters to interpreting missing effects.

## Complete root-action census, retaining all attempted games

| Observed source-owner accepted action | Rank 6 Iron Thorns LO | Rank 11 Absol/Garbodor |
| --- | ---: | ---: |
| Original registered game arms | **16** | **16** |
| Source actually first | 14 | 12 |
| Source actually second | 2 | 4 |
| Source first own turns with *only Pass* | **16** | 4 |
| All accepted PassTurnAction roots | **324** | **153** |
| All accepted PlayCardAction roots | **36** | **139** |
| All accepted AttackAction roots | **5** | **199** |
| Source Supporter card plays | **5** | **0** |
| Selected printed control / draw-search-acceleration group plays | **0** | **0** |

All counts above are **native accepted roots** over the 32 attempt histories, including 12 action-limited attempts; no sudden-death replay epoch occurred in this fixed archive. `AttackAction` means a declared native attack and **does not** mean it dealt useful damage or resulted in a legal competitive game. Iron Thorns ex's passive `Initialization` can impose genuine Ability suppression without playing a card, so 0 control Trainer plays does not imply zero pressure or a passive Ability failure.

### Rank 6: five scripted ALS repetitions dominate all 36 card plays

Among its 16 frozen games, the entire exact-source accepted `PlayCardAction` inventory was:

| Printed source card | Accepted plays |
| --- | ---: |
| Iron Thorns ex | 16 |
| Tag Call | 5 |
| Guzma & Hala | 5 |
| Thunder Mountain Prism Star (printed as `Thunder Mountain ♢`) | 5 |
| Double Colorless Energy | 5 |

**None** of the following printed rank6 control cards was played in any of the 16 games: four Plumeria, four Crushing Hammer, two Enhanced Hammer, two Team Flare Grunt, two Lusamine, one Team Rocket's Handiwork, three Guzma, one Captivating Poké Puff and one Echoing Horn. This is **zero accepted plays across the named nine-card tactic family**, with many copies actually present in the 60. Most source turns chose Pass; all **16 first own turns** had exactly a native `PassTurnAction` with no accepted preceding root play. Four Speed Lightning Energy also had **zero accepted attachments**. Five later accepted attack declarations came from the narrow Tag Call/Guzma & Hala/Thunder Mountain/Double Colorless script.

The source author's documented game plan emphasizes **denying Energy, trapping targets, looping Lusamine/Handiwork and winning by deck exhaustion**, often choosing first and declining to attack when taking Prizes helps the opponent. Thus an attack-only metric is misleading, yet this untouched original-source control package is a much clearer **policy-coverage gap**. It is compatible with an incomplete source bot and does not prove the owner *held* a legal control card at any specific root. K0/first Pass owner-card and affordability witnesses are needed before claiming missed actual actions.

### Rank 11: the source used Basic plays and Energy, but none of its main search/draw cards

Among 139 accepted source-owned plays in 16 arms:

| Printed source card | Accepted plays |
| --- | ---: |
| Darkness Energy | 73 |
| Oranguru V | 15 |
| Trubbish | 14 |
| Mega Absol ex | 14 |
| Crobat V | 9 |
| Tapu Lele-GX | 6 |
| Squawkabilly ex | 4 |
| Float Stone | 2 |
| Boost Shake | 2 |

No native accepted Supporter among three Carmine, three Marnie and two Guzma. No accepted Battle VIP Pass (four), Quick Ball (four), Professor's Letter (four), Dark Patch (three), VS Seeker (one) or Secret Box (one). The narrow held Boost Shake route completed twice in one distinct rank11 source-second physical deal; the critical first-player source lane was not genuinely exercised in the scout. Wider Back Order, held Tool and owner K1 lines already have independent mechanical evidence from other research but were **not demonstrated across this frozen unqualified opponent-policy cohort**.

The original source still made 199 accepted `AttackAction` declarations. That large raw count does not repair the near-absence of printed search/setup resource plays and cannot certify the tournament-intended Tool-Garbodor board was established.

## Reproduction and limits

- [Pure print/source action compiler](../../simulation/evaluation/agent8-original-source-control-play-coverage.cjs) validates every accepted source-hand card name against its original printed 60, distinguishes Pokémon, Trainers, Energy and known Supporters, counts actual Store root actions and first-own-turn Pass-only events. The `Thunder Mountain Prism Star` / `Thunder Mountain ♢` alias is explicit. A short, documented set of *selected strategy cards* is used for reporting; it is **not** a complete policy-quality scoring function.
- [Five read-only regression tests](../../tests/agent8-original-source-control-play-coverage.test.cjs) check source classification, actual first-turn Card+Pass separation, Store owner, unknown-print rejection, and roster-grounded tactic tags.
- [Original archived read-only entrypoint](../../scripts/agent8-audit-registered-source-pairs.cjs) now emits `sourcePlayCoverage` in addition to the paired source physical deal and accepted recipient reports. It cannot launch a new native game.
- [Existing manual original archive audit workflow](../../.github/workflows/aichi-rank11-artifact-audit.yml), mode `canonical-20261029-source-pairs`, added these tests and exact original rank6/rank11 all-accepted-root assertions. **[CI run 40939464835 PASSED](https://github.com/FlareZ123/experiment-01/actions/runs/40939464835): 21/21 Node tests and all original 32-arm exact count checks.** Output includes `rank6FirstPass:16,rank6ControlPlays:0,rank11SupporterPlays:0,competitiveQualified:0`.
- This is an **aggregate trace census**. It does not observe every source opening hand or prove a named card was available, affordable, or optimal. It does not validate the native game engine's paper KO priority, result accuracy or clock, and does not qualify any target win rate. Root actions after an action cap remain censored.

## Decision and next policy gate

An original-source-printed 60 and a native terminal are inadequate for evaluating a hypothetical 99.5% contender if the source policy cannot execute its own primary control tools and setup connectors. **The priority is source-owner, information-safe and policy-versioned action coverage**: collect actual K0 held/affordable resources before its first Pass, legally sequence rank6 printed control/Speed/LO options and rank11 supported setup/search plus early equipped-Garbodor, and then authenticate real candidate replies and source continuation across both natural starting orders. Do not infer competence from attack frequency. Preserve rank6 passive lock opportunities separately and retain the full unconditional denominator including engine errors, caps, different source-deal fingerprints and all seed cells.

The fixed 60 decision remains **undetermined**: original field source recovery 29/32, **zero competitively qualified game outcomes**, no demonstrated 99.5% win rate.
