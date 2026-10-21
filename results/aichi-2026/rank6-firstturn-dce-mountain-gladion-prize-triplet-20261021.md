# Aichi rank 6: exact first-turn Iron Thorns DCE–Mountain–Gladion Prize obstruction

**21 October 2026, Agent 27. Evidence type:** checked exact published rank-6 physical 60, printed attack/cost/search text, exact finite-population combinations conditioned on Basic-valid opening seven, three independently exhaustive physical miniature-deal counts. **This is a first-turn resource impossibility finding, not a source-bot attack execution or game-win study.**

## Printed-source basis and strict time scope

The registered [Aichi 2026 rank-6 Kazuma Kashi Iron Thorns 60](full-decklists.json) contains exactly four Basic [Iron Thorns ex TWM 77](https://limitlesstcg.com/cards/en/TWM/77), one [Thunder Mountain Prism Star LOT 191](https://limitlesstcg.com/cards/lot/191), one [Double Colorless Energy SUM 136](https://limitlesstcg.com/cards/sum/136), and one [Gladion CIN 95](https://limitlesstcg.com/cards/cin/95). The other available Energy are four Speed Lightning, two Capture and one Spiky, each supplying only one Energy. There is no Basic Energy or source-deck multi-Energy acceleration.

Iron Thorns's **Volt Cyclone** costs Lightning + Colorless + Colorless and deals 140 damage. In the first attacking turn **going second**, the normal rules permit only one Energy from hand attached. Thunder Mountain reduces the Lightning requirement by one, leaving two Colorless; the sole DCE is the only card that supplies two Energy with one attachment. A legal first-turn attack therefore requires **both DCE and Thunder Mountain reachable** before that attack. Search cards (Guzma & Hala, Tag Call, Item search) can improve access to live deck/hand cards, but do not retrieve unseen Prizes.

The registered source's only direct initial-Prize recovery is **single Gladion**, a Supporter which looks at the six Prizes and takes **one** into hand; it may be played only once per turn. A prized Gladion itself cannot be used. This proof grants the player perfect draw/search access, unlimited legal sequencing, and the best possible use of Gladion: any missing DCE or Mountain may be recovered if exactly one is Prized and Gladion is accessible. It isolates *sufficient failures* where even such ideal play cannot pay the attack.

Define **D**, **M**, **G** as the three physically distinct non-Basic singleton copies: DCE, Thunder Mountain, Gladion. Event **E = at least two of D, M, G are among the original six Prize cards**. There are three pathways to E:

- D and M Prized, regardless of G: one Gladion could retrieve at most one of the two attack-critical cards.
- D and G Prized while M is not: the missing DCE cannot be recovered because the only Prize recovery Supporter is itself Prized.
- M and G Prized while D is not: the missing Stadium likewise cannot be recovered.

This exhausts the three pairwise cases and includes triple-Prized outcomes just once. **E proves no first-turn Volt Cyclone** in those deals under the precise source printing and normal rules. It is unaffected by opponent-mulligan bonus draws because draws cannot move the face-down Prize identities. Effects of the opponent having acted first can introduce *further* obstructions, and are outside the count.

## Exact count and conditional probability

Set `N=60`, `B=4` ordinary legal Basic starters, `h=7` initial hand cards and `p=6` Prizes. Condition on at least one Basic in the first seven. Each accepted hand paired with one of its six-Prize subsets has equal conditional probability. Denominator:

`Z = [C(60,7) − C(56,7)] × C(53,6) = 3,542,098,569,609,600.`

All three marked cards are non-Basic, so a specific pair Prized contributes

`Q₂ = [C(58,7) − C(54,7)] × C(51,4) = 30,881,024,647,200.`

All three Prized contributes

`Q₃ = [C(57,7) − C(53,7)] × C(50,3) = 2,160,758,017,600.`

Each triple-Prized deal lies in **three** pair events. Hence the physical union count is `3Q₂ − 2Q₃`, avoiding duplicate counting.

| Conditional physical-deal event | Exact favorable count | Share of Basic-valid hands |
| --- | ---: | ---: |
| Any specified singleton pair Prized | 30,881,024,647,200 | 0.871828494897% |
| All D, M, G Prized | 2,160,758,017,600 | 0.061002198983% |
| **At least two of D/M/G Prized** | **88,321,557,906,400** | **2.493481086726%** |

Thus **the first-turn Volt Cyclone is inaccessible in at least 2.493481086726% of valid source rank-6 opening deals**, even with perfect access to all non-Prized resources. The resulting **at-most attack availability ceiling is 97.506518913274%**. This says nothing directly about subsequent survival, attacks, later victories or losses.

## Why this does not contradict the established multi-turn frontier

[Agent 16's existing source-conserved analysis](agent16-rank6-multi-attachment-energy-prize-frontier-20261020.md) correctly demonstrated that a Prized DCE usually does **not** mean eventual Volt Cyclone is impossible: two one-unit Energy attachments plus Thunder Mountain, or several normal attachments without it, can finance attacks on *later* turns. That study's strictly Prize-only *multi-turn* permanent-energy obstruction is approximately **0.000118103%** conditional on a valid opening seven. Our 2.493% event concerns **only the very first attacking turn, which permits one normal hand attachment**, and explicitly allows subsequent turns to recover.

The rank-6 player's early [Tag Call / Guzma & Hala / DCE + Thunder opening opportunities](rank6-conservative-expanded-opening-frontier.md) remain separate. This event proves structural absence of a specific first-turn resource line under some Prize deals, while an *unblocked* deal can still fail for lack of appropriate cards in hand, discard costs, Stage/Item/Supporter opportunity contention, opponent Item/Ability disruption, poor decision policy or failed actual execution.

## Source verification and reproducibility

- [BigInt source-locked exact calculator](../../scripts/aichi-rank6-firstturn-energy-triplet.cjs) imports [Agent 16's registered rank-6 printing/count audit](../../scripts/aichi-rank6-energy-prize-frontier.cjs), checks the published 60, four Basics, all eight Special Energy and singleton Gladion, and calculates exact physical numerator/denominator.
- [Independent exhaustive three-mini-deck regression](../../tests/aichi-rank6-firstturn-energy-triplet.test.cjs) enumerates every Basic-valid hand and every unordered Prize subset of each remaining deck, labels physical D/M/G, and compares pair/triple/union **without reusing the closed form**. Three tests passed in an independent local V8 CommonJS test harness using the actual source manifest and correctly typed test/assert/fs adapters.
- Added to the existing **manual-only** [Aichi benchmark statistical workflow](../../.github/workflows/aichi-benchmark-stats.yml), which runs Node22. Before an independently observed workflow success, the compiled CI status must remain distinct from the local pure-test pass.
- This finding is independent of the [rank26 Meloetta first-turn Ticket-plus-Energy obstruction](rank26-third-energy-ticket-prize-collapse-20261021.md); the two studies cover different exact published source 60s and first-turn mechanics.

## Actionable implications

A conditional first-turn rank-6 simulator trace in event E that nevertheless performs Volt Cyclone using the unchanged source 60 must be investigated for illegal Prize recovery, Energy attachment, copied attack, initial board mutation, or loss of original physical source-deal fidelity. Do not condition competitive trials on E being false: retain every predeclared deal and both first-player orders as part of the full field comparison. A missing turn-one attack is not necessarily a player-policy failure in E, whereas source turn-three failure to attach available single-unit Energy is a separate **strategy** issue worthy of testing.

**Benchmark standing:** 29/32 exact published 60-card source opponents, zero competitively qualified games, no demonstrated 99.5% fixed-deck win rate.
