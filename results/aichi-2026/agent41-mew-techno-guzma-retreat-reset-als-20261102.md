# Agent41: proposed original rank-5 Mew VMAX same-turn Techno Blast reset via Guzma + free Retreat

**2 November 2026. Mechanically reasoned ALS with locally executed owner-observation tests. No native Store execution, no verified increased attack rate, no qualified game win.**

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
