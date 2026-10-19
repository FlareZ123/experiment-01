# Rank-3 Snorlax: legally declining the second setup Bench prompt

**Agent 5, 19 October 2026. Evidence: pinned Twinleaf, original registered source 60, real Store setup roots, retrospectively selected mechanical comparison. No competitively qualified game.**

## Concrete bug and corrected choice

The previous [rank-3/7 solo Snorlax opening comparison](snorlax-original-source-solo-board-results.md) recorded one exceptional rank-3 source-dealt game in which a player holding Snorlax answered **two distinct starting prompts**, IDs **5** and **12**, each with one PGO Snorlax. The actual first-turn board contained both Active and Benched Snorlax. Counting callbacks as independently rooted opportunities or assuming that one selection per callback implies a solo Active is incorrect.

The paper [Advanced Player's Rulebook](../../resources/) Section G, setup step 6, makes placement of up to five initially held Benched Basic Pokémon optional. The pinned Twinleaf `ChooseCardsPrompt.validate([])` checks the actual prompt bounds; the second prompt in this specific game **accepts an empty selection**, while the first Active prompt does not.

New opt-in `snorlaxSoloDeclineOptionalBench:true` in [headless.cjs](../../simulation/twinleaf/headless.cjs) passes a setting to [the source-only starting prompt resolver](../../simulation/twinleaf/snorlax-solo-opening-policy.cjs). When its **own** Active is already PGO Snorlax, its **own** Bench is empty, and the live prompt accepts `[]`, it selects no further setup Benched Pokémon. Every other case preserves the previous choice. The default is unchanged when the new flag is absent.

## Reproducible actual-source result

- Original published source: Aichi rank **3**, Haruto Miki's registered 60.
- Reference opponent: Aichi rank **1**, Yasunori Kato's unchanged registered 60.
- Candidate physical engine seat **A / 0**, source seat **B / 1**, seed **81979068**; source actually went first, verified from the engine first-draw log in both arms.
- Research witness: [snorlax-optional-bench-source-witness.cjs](../../simulation/twinleaf/snorlax-optional-bench-source-witness.cjs), at most 40 real root actions; fixed original source and reference lists.
- Engine: Twinleaf pinned submodule **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**.
- **Compiled manual CI [39238161077](https://github.com/FlareZ123/experiment-01/actions/runs/39238161077): success.** Original setup tests, three new opt-in regressions, original selected-deal Store probe, and the new two-arm root witness all passed.

| Observed real Store fact | Historical default, flag off | Flag on |
| --- | --- | --- |
| Prompt 5, action ordinal 4 | Choose Snorlax, empty invalid | Choose Snorlax, empty invalid |
| Prompt 12, action ordinal 11 | Choose another Snorlax; empty **valid** | Choose **zero**; empty **valid** |
| Prompt 12 Store result | Accepted, Bench becomes Snorlax | Accepted, Bench remains empty |
| First nonprompt turn source board | Snorlax Active + Snorlax Bench | Snorlax Active + **empty Bench** |
| Genuine first-turn order | Verified | Verified |
| Returned 40-root capped record | Yes, no exception | Yes, no exception |
| Qualified competitive match | No | No |

All original physical cards and source-deal seed are identical across the two branches; the only deliberate difference is the optional source setup choice. The witness captures callback intent **and** genuine Store root outcomes, so an accepted response is not confused with a speculative prompt proposal.

## Qualifications and next decision

This source seed was chosen **after** earlier evidence disclosed its duplicate-start behavior. It is a regression fixture, not a random or prospective performance sample, and the two arms are correlated counterfactuals of one deal. The witness does not audit subsequent Block, Collapse attack resolution, opponent policy, all printed Japanese cards, the match clock or winner. It therefore cannot support claims about a candidate 60, Snorlax strength, field win rate or 99.5% success.

This repairs one source-policy fidelity obstacle for future rank-3/rank-7 Stall comparisons. Next retain both real start orders and all no-Snorlax opportunities under a frozen complete-game policy. Opponent stall continuity, challenger switch/gust response, printed attack and actual next opposing decision are required before using any result for deck selection.

**Field boundary remains 29/32 exact opponent 60s (unpublished 23/25/28), zero independently qualified competitive games, no demonstrated fixed 99.5% deck.**

## Why continued Bench selection needs its own policy

The pinned default `PlayBasicTactic` (`ptcg-server/src/simple-bot/simple-tactics/play-basic-tactic.ts`) chooses the first Basic in its own hand and plays it on the first empty Bench space whenever the tactic is reached. The repaired setup choice alone therefore does not guarantee an empty Bench during the source player's subsequent turn.

For a 60-card list with `b` Basic cards and `s` Snorlax PGO cards, the exact legal-opening-seven probability of *holding Snorlax plus at least one further Basic card* is:

`[C(60,7)-C(60-s,7)-s*C(60-b,6)]/[C(60,7)-C(60-b,7)]`.

For original rank3 `b=11, s=3`, this is **26.59605424%** of valid sevens, or **65.56306460%** of Snorlax-containing legal sevens. For original rank7 `b=12, s=2`, this is **19.51187789%** of valid sevens, or **71.30572737%** of Snorlax-containing legal sevens. These are exact *available extra-Basic counts*, not observed post-setup Bench decisions. They include duplicate Snorlax as the additional Basic. Further Basic draws and earlier tactics can alter the actual next-turn action. A complete source opponent policy must explicitly decide whether to retain the lone Snorlax board under the candidate's specific attack and gust threats.

## Three-arm same-deal continuation: real turn-1 source actions

The next, independently compiled [manual CI 39240015623](https://github.com/FlareZ123/experiment-01/actions/runs/39240015623) passed on head `14e0e08b5c42553589b4b0e6fe400cd406f8f4cc`. It tests **two more pure tactic regressions** and reruns the original published rank-3 source 60 versus unchanged rank-1 60 on the same retrospective seed and both physical seats. The extended [source witness](../../simulation/twinleaf/snorlax-optional-bench-source-witness.cjs) now retains the genuine post-prompt Store root-action ledger through source global turn 1 for a third opt-in configuration. Pinned Twinleaf remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

An optional `snorlaxSoloPreserveBench:true` (requires `snorlaxSoloOpeningSeat`) replaces **only** the pinned `PlayBasicTactic` for that one source seat with a subclass that declines ordinary Basic Benching while its Active is Snorlax PGO and its Bench is empty. It does not prevent other search-card effects, override opponent choices or apply to the candidate. The original tactic order and later energy, Tool and Supporter tactics remain available.

| Source opening / continued source policy | Actual source turn-1 ordinary Snorlax plays | Other first-turn source actions | Setup first-turn board |
| --- | ---: | --- | --- |
| Historical setup: second Snorlax already on Bench; no turn hold | **1** | Water Energy, Forest Seal Stone, Pass | Active Snorlax, Benched Snorlax |
| Empty optional setup Bench, normal turn policy | **2** | Water Energy, Forest Seal Stone, Pass | Active Snorlax, empty Bench |
| Empty optional setup Bench, **opt-in ordinary Basic restraint** | **0** | Water Energy, Forest Seal Stone, Pass | Active Snorlax, empty Bench |

These are accepted root Store **PlayCardAction** events, not proposed policy callbacks. In the three arms, the first Snorlax play (or energy play with restraint) was global action ordinal **13**. Normal turn-only policy then played Snorlax again at ordinal **14**. The restrained branch played Water Energy at ordinal **13**, Forest Seal Stone at **14**, and passed at **15**, proving that remaining tactics continued. The historical source branch played one Snorlax at ordinal **13** and passed at **16**. All three arms returned 40-root capped records with no exceptions, and the source's genuine setup IDs 5 and 12 were authenticated.

**Limit:** This is the *same retrospectively exposed deal* in three correlated branches. The exact later turn-1 publicly visible board after every Item and Ability was not archived as a separate terminal board, and no rival attack or strategy response is certified. Suppressing all own Basic Benching may be the wrong decision if the candidate could Knock Out solo Snorlax and win on no remaining Pokémon. The source decision must eventually incorporate public opposing attack readiness, opponent gust ability and anti-stall cards rather than always preserve the empty Bench. **Qualified competitive games: 0.**
