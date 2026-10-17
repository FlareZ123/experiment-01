# Aichi rank-26 Meloetta: Cologne, Order Pad and Forest Seal Stone joint access

**Agent 4, 17 October 2026.** Source-backed finite-population opening-resource model. This extends the [direct Cologne gate](meloetta-cologne-ability-lock-window.md) and [Order Pad baseline](../../scripts/aichi-meloetta-order-pad-bridge.cjs) using the already demonstrated staged [Forest Seal Stone → Cologne under Iron Thorns/Klefki](meloetta-cologne-ability-lock-window.md#additional-printed-access-line-forest-seal-stone-under-lock) interaction. No complete source-dealt match, opponent decision qualification, or competitive win rate is established.

## Source, question and definitions

Aichi rank 26's registered 60 includes exactly one **Canceling Cologne ASR 136**, three **Order Pad UPR 131**, one **Forest Seal Stone SIT 156**, and one Basic **Crobat V DAA 104**, among **12 Basic Pokémon**. The Iron Thorns source lists at ranks 6, 24 and 29 contain four Basic Pokémon each. The [registered exact-printing manifest](full-decklists.json) is guarded by the calculation. Source identities and printed Stone Ability mechanics were previously validated in compiled Store fixtures; those staged fixtures are not opening-hand trials.

An *access opportunity* here occurs by the beginning of the rank-26 player's first turn if:

1. Canceling Cologne is visible directly in the initial seven, chosen optional opposing-mulligan bonuses or the first ordinary draw; or
2. Cologne remains in the live deck and at least one visible Order Pad flips heads; or
3. Cologne remains in the live deck, Forest Seal Stone and Crobat V are both visible, and the Order Pad route did not already succeed.

The partition is deliberately ordered to count each physical deal once. The third route assumes the player can put Crobat V into play, attach the Stone, use Star Alchemy and select Cologne. It does **not** assume Crobat is already in play, that Meloetta is accessible or Active, that Bench space/switching and Item sequencing work out, or that the one-use VSTAR Power is strategically available. The percentages are *resource opportunities under idealized execution*, not legal completed sequences or win probabilities.

## Exact model

Six distinguished physical cards are enumerated: Cologne C, Stone S, Crobat V and three distinct Order Pads. Every labeled card is assigned to one of four zones: legal opening seven H, inaccessible six Prizes P, first-turn visible draws D, or live remaining deck R. For k opposing-mulligan bonuses, the capacities are **(7, 6, 1+k, 46−k)**. The model enumerates all 4^6 placements. For an assignment containing n_H distinguished cards in the opening seven, its unconditioned weight is the product of the phase falling factorials divided by (60)_6.

The seven-card opening is conditioned on at least one Basic. Crobat is the only Basic among the six distinguished cards. When it is in H, the assignment is legal. Otherwise, 11 other Basics and 43 other non-Basics occupy 54 remaining physical positions. The probability of a legal opening given the placement is:

    1 − C(43, 7−n_H) / C(54, 7−n_H).

Divide each placement's weighted legality by the initial-seven validity probability **1−C(48,7)/C(60,7)**. Visible cards are H or D; Prize cards are unavailable; Order Pad success with j visible Pads is **1−(1/2)^j**. If Cologne is in R and Stone and Crobat are visible, the *incremental* Stone component is weighted by the probability every held Pad fails, **(1/2)^j**.

For the independent opposing-mulligan distribution, let p_A be the four-Basic opponent's seven-card failure probability and p_B be the twelve-Basic Meloetta player's failure probability. Each exact k from 0 to 45 is weighted by the repository's simultaneous-mulligan probability P(K=k); the tail K≥46 is integrated at k=46 to leave one ordinary draw. Six Prize positions are explicitly excluded from searchable live-deck access. The exact implementation is [aichi-meloetta-stone-pad-bridge.cjs](../../scripts/aichi-meloetta-stone-pad-bridge.cjs), with a separate source-inventory and physical-shuffle [test](../../tests/aichi-meloetta-stone-pad-bridge.test.cjs).

## Numerical outcome

| Independent resource-access partition | No offered bonuses, plus turn draw | All usable bonuses offered by four-Basic Iron Thorns, plus turn draw |
| --- | ---: | ---: |
| Cologne directly visible | 12.659263% | 14.966817% |
| Extra successful Order Pad search, disjoint from direct | 14.106840% | 15.795662% |
| Extra Stone + Crobat visibility when prior Pad route fails | **1.275426%** | **1.617878%** |
| **Total modeled union** | **28.041528%** | **32.380357%** |

The known direct-or-Pad baseline in the latter column is **30.762479%**. Including Stone and Crobat raises modeled access to **32.380357%**, a gain of **1.617878 percentage points**. All figures are conditioned on a valid rank-26 opening; Iron Thorns' opponent-mulligan bonuses are elected when possible, and at most 46 are drawn before the mandatory card.

## Directly selectable Active: Meloetta in the opening seven

The broad resource-access model allows Meloetta ex to be absent from the initial seven. A stricter subevent requires the source singleton **Meloetta ex BLK 44** in the initial seven, so the player can select it as the initial Active without first searching or switching. We enumerate that attacker as a seventh distinguished card fixed in one of seven opening positions, preserving the six Prize cards and the same first-turn bonus-draw distribution.

Among valid rank-26 openings, **14.414801%** directly contain Meloetta. The joint event of *Meloetta initially present* and *at least one modeled Cologne access route* has probability **3.763670%** with no bonus draws, or **4.401787%** with all usable Iron Thorns mulligan bonuses. The latter splits into **2.045887% direct Cologne**, **2.184088% incremental Order Pad**, and **0.171812% incremental Forest Seal Stone**. Conditioned on Meloetta being in the initial seven, modeled Cologne access is **30.536580%** with bonuses.

This stricter joint event is a subset of potential first-turn attack lines because other openings may find and switch Meloetta into the Active Spot. It does not guarantee the remaining Risky Ruins, five self-KOs, Tapu Koko, Energy or TM: Crisis Punch prerequisites. These are access probabilities, never win rates.

## Validation and limits

The exact six-card enumerator conserves unit probability mass in tested draw windows and independently reproduces both existing direct Cologne and three-Order-Pad results to numerical tolerance. The companion test samples **120,000 seeded independently shuffled physical two-player deals**, resolving opening redraws, six Prizes, bonus offers, a mandatory first draw and separate Pad coin flips. Manual-only GitHub Actions workflow: [Aichi opening-hand audit](../../.github/workflows/aichi-opening-audit.yml). **Compiled-independent workflow [run 39026764843](https://github.com/FlareZ123/experiment-01/actions/runs/39026764843) succeeded at head `753895f6aae9d183d62362d3b883ccd06460d01d`**; its new exact-enumerator, 120k-deal simulation, and JSON report steps each passed. This demonstrates model implementation and repeatability, not a source-dealt match. The exact model is compatible with the earlier source-anchored stage tests demonstrating that Forest Seal Stone on Crobat can fetch Cologne under Active Initialization and Klefki lock.

**Strategic qualification:** This upper-layer access opportunity still omits the turn's more demanding needs: Meloetta ex, repeated Exeggcute self-KOs, Risky Ruins, Damage Pumps, Tapu Koko Prism Star, Energy, Technical Machine: Crisis Punch, any necessary switch, future Prize counts and adversarial counterplay. Order Pad heads are stochastic. A Stone search for Cologne also consumes the same VSTAR Power that might be needed to find a different missing piece. Treat the result as a connector-contention hypothesis for source-dealt tests, never as a win-rate input by itself.

The same arithmetic does not substitute for actual Top 32 deck coverage, which remains **29 exact published 60s of 32**, with ranks 23/25/28 unavailable. It does not promote Meloetta or any alternate deck as the fixed best list.
