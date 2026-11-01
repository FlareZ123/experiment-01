# Agent 39: original rank-6 LO recursion and its conditional turn budget

**1 November 2026 | Evidence: exact source inventory, printed card texts, constructive sequence, finite fair-coin arithmetic. No native game, policy win, time-qualified result, or repaired source simulation.**

## Why this matters

The fixed-deck Aichi evaluation's original rank-6 Iron Thorns ex source has **2 Lusamine CIN96, 1 Team Rocket's Handiwork FCO112 and 3 VS Seeker PHF109** in the authenticated `full-decklists.json`. The [19 May original Iron Thorns LO builder's article](https://note.com/hamu_pcg/n/n2198c5aee581) explicitly describes deliberate Energy denial and trapping followed by Lusamine/Handiwork recursion to exhaust the opponent's deck. Its own registered code is **not** independently confirmed identical to rank6; the published rank6 inventory itself independently supports this exact recursion resource package. [Agent6's prior source audit](agent6-rank6-control-source-human-policy-20261029.md) describes the player-level strategic intent.

The supplied card database's actual English printed forms say:
- Lusamine CIN96: *Put 2 in any combination of Supporter and Stadium cards from your discard pile into your hand.*
- Team Rocket's Handiwork FCO112: *Flip 2 coins. For each heads, discard 2 cards from the top of your opponent's deck.*
- VS Seeker PHF109: recover one Supporter card from your discard pile into hand.

This is a distinct win channel from Volt Cyclone Prize-taking. The model below is an explicitly conditional **paper-resource construction**, not a claim that an owner-visible autonomous policy ever executed it on a natural shuffle.

## Constructive two-Lusamine cycle

Assume at the start of a late-game owner's turn: physically distinct **L1** is in owner hand; **L2** and **H (Handiwork)** are in own discard, owner may play exactly one Supporter and can survive future turns. No previous Supporter is used that turn. This setup has costs and is *not* guaranteed by simply registering the three cards.

| Owner turn | Supporter used | End-of-turn owner hand (among loop pieces) | End discard (among loop pieces) |
| --- | --- | --- | --- |
| 1 | L1 recovers H + L2 | H, L2 | L1 |
| 2 | H, two coins | L2 | L1, H |
| 3 | L2 recovers H + L1 | H, L1 | L2 |
| 4 | H, two coins | L1 | L2, H |
| 5 | L1 recovers H + L2 | H, L2 | L1 |
| 6 | H, two coins | L2 | L1, H |

Inductively, the state after turns 2 and 4 alternates between two physically distinct states, with the other Lusamine in hand, its partner and H in discard. The owner can play **one Handiwork every two owner turns** indefinitely in this idealized zone projection, without consuming another physical VS Seeker. It consumes **all one-per-turn Supporter permissions** during those turns. This is an important real contention: using Plumeria, Guzma, Team Flare Grunt, Lillie's Determination or a recovery Supporter during the loop interrupts its idealized cadence. Such extra turns should be counted, along with Item locks, opponent return, hand disruption and source deck-out.

The construction assumes at least two physical cards in discard at each Lusamine resolution. The actual ability to reach its initial state, survive opposing knockouts and locks, retain both Lusamine (including Prize risks) and keep an opposing Pokémon trapped is **unverified**.

## Exact fair-coin milling and horizon

Each H has two independent fair coins, milling **0, 2, or 4 cards** with probabilities **1/4, 1/2, 1/4** if enough cards remain. For exactly `k` resolved H uses before deck truncation, the *attempted* cards milled are `M = 2 Binomial(2k,1/2)`. Hence `E[M]=2k`, `Var(M)=2k`; six H uses require **12 consecutive owner Supporter turns** in the uninterrupted construction.

| H uses k | Owner turns | Expected attempted mill | Chance attempted mill ≥12 | Chance attempted mill ≥20 |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 6 | 6 | 1.562500% | 0% |
| 4 | 8 | 8 | 14.453125% | 0% |
| 5 | 10 | 10 | 37.695313% | 0.097656% |
| 6 | 12 | 12 | 61.279297% | 1.928711% |
| 8 | 16 | 16 | 89.494324% | 22.724915% |
| 10 | 20 | 20 | 97.930527% | 58.809853% |

**Illustration including opponent natural draws:** if the opponent's deck starts with **20** cards at the beginning of recovery turn L1, and exactly one natural draw occurs on each surviving opponent turn with no other deck movements, by owner's fifth Handiwork there have been nine intervening opponent natural draws. The chance that the opponent's remaining deck is **zero before its next attempted draw** is `P(M >= 11) = P(M >= 12) = 37.6953125%`. This is a *depletion indicator conditional on uninterrupted turns and no replacement*, not the probability that a game ended legitimately. If the opponent exhausts earlier, the idealized trace would stop; if its deck is empty after H, Pokémon TCG game resolution takes place on the next attempted compulsory draw, not immediately on discarding the last deck card.

The `25-minute` Swiss/Top32 paper-clock regimes mean this long cycle may be competitively impractical in a particular state. No wall-clock game logs have established the likelihood of actually reaching five, six or ten Handiworks, retaining the lock, or finishing inside time. Deck size alone cannot characterize elapsed wall time.

## A direct qualification gap and useful experiment

The source AI should be explicitly tested for these **owner-visible board/action phases**:
1. Precycle lock: physically settle Energy denial, Active trap, Bench minimization and retained resources without falsely rewarding only attacks.
2. **K0/K1 setup:** search a physical source-own deck and count H and both Lusamine in hand/deck/discard/Prizes; observe actual valid recovery and its opportunity cost relative to Plumeria/Guzma. Do not leak opponent hidden information to the policy.
3. **Cycle action:** settle alternating real Supporter `PlayCardAction` and recovery `ChooseCardsPrompt`, record actual two fair coins (0/2/4 cards removed), native physical deck-zone conservation and one-available-Supporter gate across **both physical seats**.
4. **Interruption response:** allow the other actual original deck to break the trap, use recovery or attach Energy, introduce item/Ability locks, and test source adaptation instead of applying permanent heuristic lock penalties.
5. **Terminal/clock:** detect real opponent failed mandatory draw and still-running/timed-out states under the official Swiss/Top32 clock; keep native 260-root caps and engine errors distinct.

A source opponent evaluator that chooses Volt Cyclone opportunistically but never explores these real Control-Supporter responses is **underqualified for the rank6 source matchup**. The quantitative idealized loop is a minimum capability specification and a future regression oracle, not an owner-safe native decision policy or a deck-swap recommendation.

## Reproducibility

[Pure source-conditional construction and exact BigInt coin polynomial](../../scripts/agent39-rank6-lusamine-handiwork-cycle.cjs), [seven Node 22 tests including independent 4,096-sequence enumeration](../../tests/agent39-rank6-lusamine-handiwork-cycle.test.cjs). The tests were exercised locally using equivalent source code on 1 November. No compiled pinned Store CI has been executed for this experiment. Source inventory: `full-decklists.json` rank 6; exact English printings cross-checked against the user's provided card archive. Manual gameplay rules: [Advanced Player's Rulebook](../../resources/) one Supporter per turn and draw-step terminal condition.

**Release classification:** no new authenticated original 60s, no qualified game, no validated fixed 60. The benchmark remains **29/32 exact original 60s, zero competitive-qualified games and no demonstrated 99.5% win rate**.
