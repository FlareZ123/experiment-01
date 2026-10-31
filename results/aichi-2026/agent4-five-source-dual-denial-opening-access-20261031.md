# Agent 4: opening access to Plumeria plus Team Flare across all five original source 60s

**31 October 2026 | exact original Aichi 2026 Top32 printed lists | combinatorial access only**

## Scope and source identification

The 29 presently authenticated exact original 60s in [the source roster](full-decklists.json) contain five final-rank lists with **both** `Plumeria` and `Team Flare Grunt`. All their relevant Pokémon are Basics, so no evolution classification uncertainty enters the initial valid-starter calculation. Their exact original 60 counts are:

| Original final rank / archetype | Basic Pokémon | Plumeria | Team Flare Grunt |
| --- | ---: | ---: | ---: |
| 3 Snorlax Stall | 11 | 4 | 2 |
| 6 Iron Thorns | 4 | 4 | 2 |
| 7 Snorlax Stall | 12 | 1 | 1 |
| 24 Iron Thorns | 4 | 4 | 2 |
| 29 Iron Thorns | 4 | 4 | 2 |

Other roster members holding Plumeria without Team Flare do not enter the both-Supporter contest. Missing final-rank 23/25/28 lists remain unknown and could affect this count.

## Exact access model

Let `N=60`, `P` Plumeria cards, `F` Team Flare cards, `B` Basic Pokémon and `R=N-P-F-B` other cards. These are disjoint card categories. Draw an unordered seven-card starting hand uniformly from the original 60, and condition on it containing at least one Basic. No search, Supporter, mulligan **bonus** draw, prize inference, later discard, Item lock, or opponent's hand is modeled.

The probability that both Supporters and a Basic are present in the seven is inclusion-exclusion:

```text
C(60,7) - C(60-P,7) - C(60-F,7) - C(60-B,7)
 + C(60-P-F,7) + C(60-P-B,7) + C(60-F-B,7)
 - C(60-P-F-B,7)
```

Divide by the valid starter count `C(60,7)-C(60-B,7)`. For one additional ordinary card draw, enumerate exact initial counts `p,f,b,r` with `p+f+b+r=7`, `b>=1` and hypergeometric weight `C(P,p)C(F,f)C(B,b)C(R,r)`. Conditioned on this hand, the chance to have both Supporters after the eighth card is 1 when `p>0,f>0`, `(F-f)/53` when only Plumeria is present, `(P-p)/53` when only Team Flare is present, and 0 when neither is present. Divide the weighted sum by the valid starter count. Python `math.comb` and `fractions.Fraction` give exact rational computations.

| Original final rank | Both Supporters in valid starting seven | Both by one ordinary draw, starting hand Basic-valid |
| --- | ---: | ---: |
| 3 | **6.947043901%** | **9.161497282%** |
| 6 | **6.351249262%** | **8.508201983%** |
| 7 | **1.027379906%** | **1.402936632%** |
| 24 | **6.351249262%** | **8.508201983%** |
| 29 | **6.351249262%** | **8.508201983%** |

The rank6 initial number independently reproduces the previously recorded **6.3512492618%** probability. More Basic Pokémon in rank3 explain its modestly higher conditional coholding probability despite the same 4+2 Supporter counts. Rank7's singleton 1+1 makes it much lower.

## Relevance and limits

These probabilities quantify a **physical card access ceiling** before Item/Supporter search and opponent intervention. Even simultaneous possession is not a native playability certificate: one Supporter per normal turn, turn-one player-order restrictions, discard payment, opponent Active Energy, card effects and matchup-sensitive value still matter. They are unrelated to a 99.5% game win estimate.

The [original pinned Store opportunity census](agent4-original32-positive-witness-completeness-20261031.md) separately shows its first native-playable coholding conflict under the generic rank6 source bot was as late as global turns **15 through 61** (10 affected original game arms, seven distinct positive first-deal fingerprints); rank6 had no native-positive first opportunity before turn15 in that fixed sample. Therefore a choice between Plumeria and Flare alone addresses a **conditional later-turn control line**. Early-game threat competence still depends on accessible setup, Energy, lock, and other tactical actions.

A [fresh preregistered first eligible Flare-versus-Plumeria development trial](registrations/agent4-rank6-first-flare-prospective-20261031.json) now tests the temporal continuation of a source-owned choice under actual original Store prompts and next opponent responses. It will report no-exposure arms, native errors and action caps and cannot qualify competitive wins under the current weak bot.

**Evidence category:** exact combinatorics applied to authenticated original list counts, plus a separate observational timing comparison. No crossrank independent native win rate or fixed optimal deck conclusion.
