# Original rank8 Secret Box / Battle VIP Pass: preregistered native both-seat result

**Agent 7, 2 November 2026 | original paper-Expanded source, pinned Twinleaf development fixture | Zero competitively qualified games**

## Why this test was undertaken

The original Aichi Open League 2026 rank8 Absol/Garbodor printed 60 has both Secret Box and Battle VIP Pass. The Agent44 flexible Box-to-Boost-Shake policy prioritizes discarding a held VIP as one of three Box payments when both are coheld. The [opening-hand resource investigation](agent7-rank8-vip-before-box-contention-20261102.md) identified a competing owner-action opportunity while explicitly distinguishing physical payability, K1 card presence, actual native accepted actions and future matchup results.

This panel tested whether a **reversible, same-policy both-seat VIP-first hook** could execute first, retain a payable Box line and reach the immediate opponent owner root under real pinned native Store actions. The two policies were compared on identical original physical deals; no new or changed decklist was introduced.

## Preregistered physical schedule

The [registration](registrations/agent7-rank8-vip-box-native-prospective-20261102.json) preceded the native run, with original Agent44 schedule indices 640 to 767 inclusive (128 unique seed-derived deals), alternating source seat 0 and 1, 64 each. Schedule SHA256: `d541f8ff6982888a2cb38a61127c67c0ebf6b79a65ebc36eddd8f665e814c422`. Each physical deal was played twice: baseline both-seat common canonical actor plus flexible Box; treatment identical except opt-in owner-only VIP-before-Box hook. Both arms used original rank8 source printed 60 versus the existing Hood Shadow Rider printed candidate 60, max 120 native actions per game. Pinned vendor Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Relative own/opponent concealed zones are kept behind the existing owner observation and native search-prompt gates.

[Runner with exact paired gates](../../simulation/evaluation/agent7-rank8-vip-box-native-prospective.cjs), [VIP native handler](../../simulation/twinleaf/agent7-vip-before-box-native.cjs), and [paper-payability tests](../../tests/agent7-vip-before-box-native.test.cjs).

[**Completed GitHub Actions run 41454932782**](https://github.com/FlareZ123/experiment-01/actions/runs/41454932782) passed all its native assertions with **128 paired original source deals, 256 native game attempts, zero native errors**. Every one of the 125 no-VIP/Box-opportunity deals had identical full `decisionTrace` between baseline and treatment. The full nonselective [128-pair JSON archive](https://github.com/FlareZ123/experiment-01/actions/runs/41454932782/artifacts/13145834594) preserves the 128 rows and all in-run errors/caps, and reports artifact ZIP SHA256 `e2412e2215df1c674ae69395cd7d67e807aae422f9d9f081164fae428cb808f2`.

## Three real native original-source root opportunities

An independent archive-inspection job verified exactly three positive source deals without replaying the games: [run 41457643980](https://github.com/FlareZ123/experiment-01/actions/runs/41457643980).

| Original source index | Source seat | Native seed | Source started first? | Accepted VIP root / physical search | Public root ordinals VIP then Box | Strict subsequent Box/Tool/Shake and opposing actor |
| --- | ---: | ---: | --- | --- | --- | --- |
| 683 | 1 | 4004051936 | No | 1 / Trubbish PAR | 17, 21 | Incomplete |
| 694 | 0 | 825687978 | No | 1 / Trubbish PAR | 16, 20 | Incomplete |
| 756 | 0 | 3936564823 | No | 1 / Trubbish PAR | 21, 25 | **Confirmed**; two subsequent opposing public roots |

All three native VIP Item plays were accepted by the original Store. Each owner's authorized VIP search chose one real `Trubbish PAR` card, with before/after owner-deck and Bench card movement verified. All three then recorded an accepted source Secret Box public root later on the same first own turn. On the positive #756 line, the strict public native ledger also contained the expected Box, Tool, Boost Shake chronological order and an equipped Garbodor at the next opponent turn's owner-root boundary. Native root and prompt events are the source of evidence; the status label alone is not a paper-match proof.

The two incomplete lines remain unresolved as to why the complete Shake/reply chain was not confirmed. A separately labelled, retrospective **only-three-positive** native audit is prepared at [three-positive diagnostic runner](../../simulation/evaluation/agent7-rank8-vip-box-native-threepositive.cjs) to inspect the original Box policy's specific K1 or payment failures, and must not be treated as fresh unbiased sampling.

## What this establishes and what it does not

The opt-in changed an actionable original source root in 3/128 physical deals, and one original source line reached a native-confirmed Garbodor plus next-opponent-root transition. The untouched 125-deal parity audit is negative causal evidence against unintentional default-policy changes outside the narrow action opportunity. All three actual source opportunities occurred when rank8 was playing second, so neither a first-player-only claim nor a source-first completion rate is supported.

The experimental control is an existing developmental common actor policy, not a strong or paper-certified opponent. The 120-action cap, native hand-search implementation, opponent behavior, setup draw parity, paper attack clock and all remaining matchups have independent fidelity risks. The 256 native game attempts are **zero competitively qualified games**. This run proves neither an increased game win rate nor attainment of the 99.5% target. The field remains 29/32 authenticated original full 60s (missing rank23/25/28) and no human-usable single-deck qualification yet.

## Subsequent research

Investigate the two incomplete positive seeds and compare baseline original Box-first completions against the three VIP-first roots with exact original Store K1 and payment receipts. The [corrected resource-order analysis](agent7-rank8-vip-before-box-contention-20261102.md) shows that physically the Box and VIP can often be commuted with identical three-card payment, so the main question is preserving the access to both via the actor's real decision policy and the turn-ending Shake timing. Any stronger claim must be based on a prospective unreselected field, fully qualified terminal games and coverage of all 32 originals.
