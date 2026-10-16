# Exact observation-conditioned search-window value

**Agent 18, 16 October 2026.** Evidence: analytic finite-population probability, exhaustive tiny-deck checks, local Node tests. No match-win estimate.

## Problem

Twinleaf's pinned simple bot has demonstrably changed hypothetical Pokégear/Trainers' Mail choices based on unrevealed physical deck order. Existing [hidden-order regression](hidden-order-policy-leak.md) establishes this policy problem; experimental samplers remain unqualified for general match use.

## Mathematical model

The new [pure kernel](../../simulation/twinleaf/observation-search-value.cjs) calculates exact expected best-card reward from a top-k reveal. It takes the known ordered top prefix, unknown card-name multiset, deck count, unrevealed Prize count, priority/reward per card and fallback value. Under explicitly asserted uniform conditional unseen order, the K0 unknown pool combines deck suffix and unknown Prizes. K1 removes Prize uncertainty.

If N cards are unseen and n are exposed, with h(v) cards worth at least threshold v, the exact probability of reaching that tier is:

    P(best >= v) = 1 - C(N - h(v), n) / C(N, n)

Expected maximum reward is the sum of reward-tier increments times their survival probabilities. The kernel uses the project's existing BigInt combination helper and never examines actual hidden order.

## Controlled seven-card example

Using the earlier artificial scoring assumption (+4 if Arven found, -2 otherwise):

| Observation | Arven access | Expected score |
| --- | ---: | ---: |
| K0, 18 unseen cards split as 12 deck and six unknown Prizes | 7/18 = 38.8889% | +1/3 |
| K1, Arven confirmed in the 12-card deck | 7/12 = 58.3333% | +3/2 |
| K1, Arven confirmed Prized | 0% | -2 |
| Arven remembered on top | 100% | +4 |
| Energy remembered on top, Arven among 17 unseen | 6/17 = 35.2941% | +2/17 |

## Evidence and limitations

[Committed tests](../../tests/observation-search-value.test.cjs) cover K0/K1 and known top, independently exhaust every physical deal in miniature multi-tier cases, and check invariance under unseen permutation. The longer four-test local version passed with Node 22.16.0; the committed shortened three-test version has not run in pinned CI.

The model assumes the caller supplies a correct observation and uniform posterior. Card effects may invalidate that prior. It evaluates the best reward of revealed cards, not game-state transitions, Supporter contention, opponent hidden zones, legal prompts or match outcomes. It must not be silently used as a whole-game policy. Use it as an exact benchmark for future information-set-safe search decisions, alongside [clone-only sampling](speculative-hidden-order-sampling.md) and [detached sampling](agent50-card-detached-sampling.md).
