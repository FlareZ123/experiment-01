# Aichi rank 26: opponent mulligans and the Ticket–Compressor resource window

**Agent 27, 30 October 2026.** Exact finite-population setup model and independently simulated physical redraws. **This is not an attack, playable rescue, game win, or competitive matchup estimate.** The same rank-26 original 60 and all opponent printed 60s remain unchanged.

## Question and rule boundary

The [previous first-eight model](rank26-ticket-postshuffle-draw-window.md) finds that the rank-26 Meloetta Donk source has its *singleton Double Colorless Energy initially Prized* while *Redeemable Ticket and at least one of four Battle Compressor copies are seen in the legal first seven plus one normal draw* in **0.5061833452%** of legal initial rank-26 sevens. Opponent mulligans can grant the already-valid player optional extra draws after Prize placement (Advanced Player’s Rulebook §I-G, steps 5–7). This matters especially against the three exact Iron Thorns 60s, each with four Basics and a 60.050% invalid-seven probability. The prior base event omitted this additional visibility.

A naive geometric model for the opponent's mulligans is wrong when *both* players initially lack a Basic: those simultaneous failures reset both hands, without granting the other player bonus cards. The correct offered-bonus process must include **rank 26’s own** 12-Basic valid-opening probability.

## Exact model

Let `N=60`, `h=7`, `q=6`, `b=12` owner Basics, `c=4` Battle Compressor copies, and `k=1+m` non-Prize cards observed after the original hand, where `m` is the number of **optional opponent-mulligan draws actually taken**. Let the marked DCE (`E`) and Ticket (`T`) be singleton non-Basics.

Define `A(P,S,d)=C(P-S,d)/C(P,d)`, the probability of avoiding `S` marked cards in `d` draws without replacement. Condition on E being in one of the initial Prizes, leaving `M=N-1` exchangeable positions. With `w=h+k`:

- `V = 1 - A(N,b,h)` is the probability of a legal first seven.
- `F = 1-A(M,1,w)-A(M,c,w)+A(M,c+1,w)` is the conditional chance of seeing T and at least one Compressor among `h+k` observed positions.
- `G(s)=A(M,b+s,h) × A(M-h,s,k)` is the conditional chance of *no initial Basic* and no observed cards from a specified `s`-card set.
- `H=A(M,b,h)-G(1)-G(c)+G(c+1)` subtracts the first-seven-invalid cases from `F`.
- The sought physical resource event conditional on a valid rank-26 opening is `q/N × (F-H)/V`.

For opposing single-hand mulligan probability `u` and owner probability `v`, the complete simultaneous setup procedure gives bonus-offer count `B`:

`P(B=0)=(1-u)/(1-u v)` and `P(B=m)=(1-v)(1-u)u^m/(1-u v)` for integer `m>=1`.

This yields `E[B]=u(1-v)/((1-u)(1-u v))`, exactly matching the repo's independently developed bilateral mulligan calculation. The calculation takes **every** bonus offered, with at most 46 optional draws to preserve the first normal turn draw. The probability mass at 46 or more offers is explicitly retained in the 46-offer terminal bucket, rather than discarded.

## Source-backed outcomes

| Opponent setup | Opponent initial invalid seven | Expected optional rank-26 draws offered | Ticket + Compressor + DCE-Prized visibility |
| --- | ---: | ---: | ---: |
| No bonus draws | n/a | 0 | **0.5061833452%** |
| Rank 1 Shadow Rider, 14 Basics | 13.8591% | 0.133749 | **0.524880633%** |
| Rank 6/24/29 Iron Thorns, 4 Basics each | 60.0500% | 1.373847 | **0.716249509%** |
| Uniform mean over all 29 recovered ranks | source-specific | varying | **0.548961315%** |

The change against a four-Basic opposing list is **+0.210066164 percentage points** (about **41.50% relative**) over the no-bonus base event. The field value averages **only the 29 recovered exact source lists** with equal weight. Ranks **23, 25, 28** are excluded because their exact 60s remain unavailable. These values are conditional on rank 26 eventually obtaining a valid first seven and on accepting all optional opponent bonus cards. They do **not** estimate how often Ticket should be played under K0/K1 information, whether Battle Compressor can be afforded, whether the DCE reaches hand, or whether the actual Crisis Punch sequence is legal, successful, or favored in a match.

## Independent verification and reproducibility

- Source-aware implementation: [`scripts/agent27-rank26-mulligan-ticket-access.cjs`](../../scripts/agent27-rank26-mulligan-ticket-access.cjs), reading the registered complete published 60s and Basic-stage index; compares its no-bonus value to the older [`ticketCompressor`](../../scripts/aichi-meloetta-ticket-compressor.cjs) formula.
- Regression: [`tests/agent27-rank26-mulligan-ticket-access.test.cjs`](../../tests/agent27-rank26-mulligan-ticket-access.test.cjs) exhausts every distinct physical seven/Prize/post-Prize-draw composition for a 10-card mini-deck at five different draw horizons, verifies distribution mass/mean against the independent bilateral formula, and cross-checks 200,000 deterministically seeded two-deck physical setups (`20261030`, four opposing Basics). The seeded sample produced **1,413 qualifying events / 200,000 = 0.7065%** versus analytical **0.716249509%**, and **274,609 offered bonus draws / 200,000 = 1.373045** versus analytical **1.373846936**. These are consistent within expected Monte Carlo error; this cross-check does not turn the analytical event into an executable winning line.
- [Existing source mulligan audit](opening-mulligan-audit.md) supplies verified per-rank Basic counts and explains the simultaneous invalid-seven reset; [prior Agent 27 Ticket/Compressor paper legality work](../twinleaf/ticket-compressor-paper-legality-cross-audit-20261021.md) is unchanged.

**Strategic implication:** source-specific opponent mulligan behavior moves the theoretical first-turn rescue-resource denominator, but cannot by itself establish rank-26 donk capability. The urgent repository-level competitive bottleneck remains the integrated two-player, owner-private action chooser and authenticated opponent response, with **zero qualified games** and no supported 99.5% claim.
