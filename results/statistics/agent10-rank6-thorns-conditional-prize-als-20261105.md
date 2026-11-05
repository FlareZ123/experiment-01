# Agent10: rank6 Iron Thorns exact mulligan-conditioned double-singleton ALS ceiling

**5 November 2026 | exact finite-deck combinatorics; a narrow card-access result, not an observed game or overall attack probability.**

## Authenticated original source and line

The original Aichi Open League 2026 rank6 Kazuma Kashi Iron Thorns ex 60 is in [full-decklists.json](../aichi-2026/full-decklists.json). It contains **exactly four Basics**, all Iron Thorns ex, along with **one Double Colorless Energy**, **one Thunder Mountain ♢**, **two Tag Call**, and **two Guzma & Hala**. All other cards are non-Basic. The human prior ALS describes `Tag Call -> Guzma & Hala -> Double Colorless Energy + Thunder Mountain` for a first-turn (going second) attack with an eligible Active Iron Thorns ex. This line has additional payment, Stadium legality, effect and opponent constraints beyond card whereabouts.

The advanced rulebook's setup order draws seven cards, repeats on a hand with no Basic, and deals six face-down Prize cards from the deck **only after** a legal Basic opening is established. Conditioning on the legal opening therefore slightly alters exact singleton Prize risk.

## Exact computation

Let `A` mean the seven-card opening contains at least one of the four Basics. Under a uniformly randomized 60-card deck,

`P(A) = 1 - C(56,7)/C(60,7) = 38962/97527 = 0.3994996257446656`.

The number of mulligans before obtaining an eligible hand is geometric with mean `(1-P(A))/P(A) = 1.5031312560956829`, assuming independent complete re-shuffles. That measures an **opening Basic constraint**, not the actual number of bonus draws taken by an opponent (which depends on both players' setup/mulligans).

Define `K` as the number of the two specified distinct singleton cards, Double Colorless Energy and Thunder Mountain ♢, in the accepted starting seven. For `k=0,1,2`,

`P(K=k | A) = C(2,k) [C(58,7-k)-C(54,7-k)] / [C(60,7)-C(56,7)]`.

The conditional probabilities are

| k | P(K=k given accepted Basic hand) |
|---:|---:|
| 0 | 0.8009197773121597 |
| 1 | 0.1898792996439421 |
| 2 | 0.0092009230438983 |

After the accepted hand, exactly 53 cards remain in the draw deck, and six of those become Prize cards. Conditional on K=k, `2-k` designated singletons remain in that 53-card deck. Hence the probability **both original singletons are outside the six Prizes**, either already in hand or accessible somewhere in the subsequent deck, is exactly

`sum_{k=0}^2 P(K=k | A) * C(53-(2-k),6)/C(53,6)`

`= 1726933 / 2142910 = 0.8058821882393568`.

Thus on **19.411781176064324%** of legal-start deals, at least one of these two specific cards is Prized, before considering deck searches or available Prize recovery. Ignoring legal-opening conditioning would yield `(54*53)/(60*59) = 477/590 = 0.8084745762711865` for both outside prizes, an optimistic mismatch of about **0.25924 percentage points** for this particular four-Basic original list.

## Direct Tag Call or Guzma & Hala access by the first normal draw

The original source contains exactly **two Tag Call and two Guzma & Hala**, four search/Supporter endpoints. Let `B` denote an accepted seven with none of these four cards. Since the four endpoints and four Basic Iron Thorns are disjoint,

`P(B|A)=[C(56,7)-C(52,7)]/[C(60,7)-C(56,7)] = 2453321/3857238 = 0.6360304964329399.`

Conditional on B, the remaining 53-card deck holds all four endpoints. Six cards are Prized uniformly, then exactly one normal turn-start card is drawn going second, so its marginal probability of an endpoint is `4/53`. Therefore the exact probability an endpoint is **directly in the accepted seven or appears in that single normal draw**, ignoring any bonus cards received from the other player's mulligans and all search/draw effects, is

`1 - P(B|A)*(49/53) = 12031555/29204802 = 0.41197180518464055.`

This is a **direct pre-search possession rate** for Tag Call or Guzma & Hala in that narrow timing model. A hand containing the Supporter may still lack its required discardable cards, and the first-turn attack can be supplied through other lines. Trainer's Mail, Camping Gear, opponent mulligan bonus draws, Prize recovery, and further card access are excluded. Thus 41.20% must **not** be presented as the true probability of playing Guzma & Hala or of attacking on turn one.

## Strategic interpretation

This 80.588% is a precisely scoped **unrecovered availability gate for the two-singleton DCE/Thunder Mountain first-turn ALS**, not a calculated T1 attack frequency and not an absolute bound against alternative attacks, other Energy/payment lines, or valid Prize recovery. Early-game line success can be lower because Tag Call/Guzma & Hala access, discard costs, Supporter contention, Stadium conflicts, Item lock, attached Energy, and Active Pokémon positioning must also cooperate. A Prize retrieval line may alter the consequences if the ACE-like singleton is Prized, but cannot be assumed without the actual playable cards and action sequencing.

This quantitative source asymmetry matters when interpreting **0 source attacks and 37 source Pass actions** in the separate eight-arm native v5+Telepath 48-root study. The observed Pass count is a genuine policy-coverage concern, but a simple inference that every opening should fund the precise DCE/Thunder Mountain line is false. Detailed source performance requires sampling full legal mulligan-qualified hands, six conditional Prize cards, owner-visible K0/K1 information, relevant actual searches, and paper-payment constraints.

### Reproduction

All fractions above follow directly from integer combinations `C(n,r)=n!/(r!(n-r)!)` and the rank6 original card counts. No simulation runs or external opponent reconstruction were used. A portable Python/JS implementation can evaluate the displayed formulas using arbitrary-precision integers, and conditional means come from an independent new shuffle until A is satisfied. For full-game benchmarking, the original deck's four-Basic mulligan process and opponent bonus draw restrictions remain separate from this card-location model.

**Evidence class:** exact mathematical derivation from the publicly authenticated 60-card inventory plus supplied rulebook setup order; no unverified win-rate claims.
