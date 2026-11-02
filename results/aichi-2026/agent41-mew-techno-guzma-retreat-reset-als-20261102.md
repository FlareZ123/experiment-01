# Agent41: proposed original rank-5 Mew VMAX same-turn Techno Blast reset via Guzma + free Retreat

**2 November 2026. Mechanically reasoned ALS, owner-only pure tests and real pinned-Store staged negative gust witness. Full positive native recopy pending; no demonstrated win-rate gain or competitive game qualification.**

## Original source, exact printed inventory

The authenticated Aichi Open League rank-5 Yamato Nakano Mew/Genesect original 60 in [full-decklists.json](full-decklists.json) is printed-60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Relevant copies: 4 Mew V FST 113; 3 Mew VMAX FST 114; 4 Genesect V FST 185; 4 Double Colorless Energy SUM 136; 2 Guzma BUS 115; 2 VS Seeker PHF 109; 1 Escape Rope BST 125; 2 Float Stone BKT 137. This is the existing source list, not a new candidate 60.

Mew VMAX's Cross Fusion Strike copies a Benched Genesect V's Techno Blast for 210 nominal damage while preserving the copied attack's effect that the attacking Pokémon cannot attack during its next turn. The supplied Advanced Player's Rulebook (A-03 Retreat and C-03 Switch) explicitly says effects of attacks on the Active Pokémon disappear when it moves to the Bench. This provides a *potential* two-phase same-turn comeback after a real owner Techno Blast on the previous turn, if all card restrictions, public boards, paper costs and native prompts permit it.

1. At the start of the following own turn: Mew VMAX #1 is Active with one Double Colorless Energy; its cannot-attack-next-turn flag is set; Genesect V is still Benched. The player has Guzma in hand, Supporter unused, retreat unused, and Mew VMAX #2 with zero retreat on Bench; opponent has a Benched Pokémon.
2. Play Guzma to gust one opposing Benched Pokémon and switch own Active Mew #1 to Bench, promoting Mew #2. The previously imposed attacking restriction is cleared from Mew #1 by the Bench transition (paper rule). Both Guzma prompts, native target validation and exact public board effects must be observed.
3. On the same turn, retreat Mew #2 for free back to the original DCE-bearing Mew #1, then use Cross Fusion Strike to copy Genesect's Techno Blast. This retains the DCE on Mew #1. It consumes both the Supporter and once-per-turn Retreat, and requires a non-blocked second attack. Guzma's gust may also alter the target's damage and Prize implications.

**Status:** Each step is an identifiable rule-based tactical proposal. We have **not** witnessed this sequence in a real Twinleaf original 60 game. Published rank-5 v3.1 [native action evidence](agent13-rank5-v31-corrected-root-native-16arm-20261102.md) showed eight genuinely copied attacks on separate source turns; those attacks do not establish this proposed reset. The native physical attacker/prompt/effect continuity and opponent's reply remain unknown.

## Machine-readable owner-only two-phase planner

- [`agent41-mew-techno-reset-frontier.cjs`](../../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs): exported owner-view decision helpers `chooseGuzmaMewCooldownReset` and `chooseFreeRetreatToDceMew`; both require exact public Mew/Genesect printings, publicly attached DCE, public ordinary-retreat state, opponent Bench geometry and relevant observed lock flags; rejects Temple of Sinnoh.
- [`agent41-mew-techno-reset-frontier.test.cjs`](../../tests/agent41-mew-techno-reset-frontier.test.cjs): ten checked fixture cases covering positive first and second phases, prior cooldown prerequisite, no second Supporter/Retreat, public DCE/Genesect, opponent Bench, Temple veto, public attack restriction and owner-only target choice. All **10/10 pure callbacks were executed successfully in a V8 test harness** against the actual committed module bytes and fixture; this is not yet a compiled Node-native Store game test.
- The emitted first intent `play-guzma-mew-cooldown-reset` is not yet wired through the canonical PlayCardAction and original-store Guzma owner/opponent prompt continuation; the second intent `free-retreat` reuses an existing root family but also lacks a native match witness. Both selectors are off in the selected v3.1 profile. No default policy changed.

## Necessary native release witnesses

First show the authentic original rank-5 setup and a real Techno Blast effect applied to Mew #1. Independently confirm its public cannot-attack restriction at the next owner root. Then witness a legitimate held Guzma, both Store-accepted target prompts with consumed Supporter, first Mew's actual transition to Bench and cooldown removal, legitimate free Retreat of second Mew, Cross Fusion Strike / Genesect donor selection, paid double-Colorless attack, damage/Prize settlement and the opponent's subsequent meaningful decision. Verify both physical seats, exact source deal, paper root/prompt/payment/effect/randomness and the 25-minute clock veto separately. Negative opportunities and all error/censor outcomes stay in the denominator. A one-off selected deal remains a regression case, not a win-rate sample.

**Potential optimization significance:** A reusable intra-turn cooldown reset could change the speed and payoff of the original source's mid-game Techno Blast loop, as a *hypothesis*. Guzma consumes a scarce tactical Supporter and the entire same-turn retreat window; the opponent's target can also make it inferior to waiting. No estimated frequency or advantage is supported yet.

## Initial-Prize feasibility of this exact two-Mew path

A direct multivariate-hypergeometric count on the source printed60's initial **six unobserved Prize cards** gives:

| Required printings outside starting Prizes | Source copies | Initial-Prize criterion |
| --- | ---: | --- |
| Mew VMAX FST | 3 | At least 2 unprized |
| Mew V FST | 4 | At least 2 unprized |
| Guzma BUS | 2 | At least 1 unprized |
| Double Colorless Energy SUM | 4 | At least 1 unprized |
| Genesect V FST | 4 | At least 1 unprized |
| Other original cards | 43 | Unrestricted |

There are `C(60,6)=50,063,860` equally likely six-card Prize sets. Exactly `48,315,178` meet those five outside-Prize thresholds, giving **96.5070971355%**. This models *initial unprized physical copies*, prior to Prize recovery, draw, searches, discard, setup, attacks or opponents. It is a ceiling only on this **specific** version of the route before any Prize taking; the deck can pursue other attacks or recover Prized pieces. The 3.4929028645% complement must never be called a game loss rate.

The count is reproducible by summing `∏_i C(n_i,k_i)` over all `k_i≥0` with `Σk_i=6` and `k_MewVMAX≤1, k_MewV≤2, k_Guzma≤1, k_DCE≤3, k_Genesect≤3`; the residual group has 43 cards. The calculation was executed using Python `math.comb` and an explicit multivariate enumeration. The 2.4254821742% probability of initially Prizing **at least two of three Mew VMAX** is the dominant individual exclusion event.


## Native counterexample: gusting a retreat-lock opponent creates self-blocking position

Real pinned Store manual [CI 41421737096](https://github.com/FlareZ123/experiment-01/actions/runs/41421737096), both physical owner seats, original Mew/Genesect printed cards, staged opponent Mimikyu PAL Active plus **Snorlax PGO 55 on Bench**. Every arm proved native first copied Techno Blast and the actual next-turn attack restriction. It then accepted held Guzma, settled both native opponent and owner `ChoosePokemonPrompt` targets, moved the original DCE Mew to Bench, and promoted the spare Mew. Both arms then rejected the ordinary zero-retreat `RetreatAction` with `BLOCKED_BY_EFFECT`.

This is the correct paper result: Snorlax PGO's printed **Block Ability**, active after Guzma's gust, forbids the opposing Active Pokémon from retreating. The printed cost of zero on Mew VMAX does not override an Ability that prohibits Retreat. The pinned engine's `retreat-effect.ts` and PGO Snorlax implementation independently enforce this. It is an evidence-backed example of post-gust **lock-induced connector domination** and matchup-sensitive Active Move Realism. The naive assumption `opponentBenchIndex = weakest living Bench target` was falsified and corrected.

The source Aichi Top32 registered opponent field matters here: of 29 authenticated original decklists, **rank 3 Haruto Miki Snorlax Stall contains three Snorlax PGO 55**, and **rank 7 Hiroto Fuji Snorlax Stall contains two Snorlax PGO 55**; the remaining source original ranks 23,25,28 are missing. Rank3 lists other Pokémon Galarian Stunfisk SSH, Regirock XYP, Mimikyu PAL, Girafarig LOT, Bunnelby PRC, Articuno-GX CES and Rotom V LOR; rank7 also lists Wobbuffet PHF, Mimikyu PAL, Regirock XYP, Electrike PRC and Girafarig LOT. An opponent's available Bench targets vary by live board, so these list-level counts never guarantee a non-locking Guzma target.

The default-off selector now rejects a known Snorlax PGO target and conservative printed Ability text explicitly forbidding the opponent's Active from retreating. With another eligible visible opponent Benched Pokémon, it can select that alternative. This veto may be overconservative if the relevant opponent Ability is suppressed; native Store remains the authority. Additional locks outside this recognizer remain open research gaps. Two pure negative fixtures have been added to `tests/agent41-mew-techno-reset-frontier.test.cjs`. The candidate 60 remains unchanged.
