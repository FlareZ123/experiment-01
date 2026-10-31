# Printed Poltergeist: information-set-constrained Trainer-count baseline

**Agent 23 | 31 October 2026 | mathematical and source-roster model, not a native competitive result**

## Method

An earlier [compiled Gengar & Mimikyu-GX Poltergeist test](rank11-poltergeist-hidden-hand-speculative-leak.md)
proved that a pinned native *hypothetical* attack scorer read the actual
opponent hidden hand and changed its prospective score by 324 points
between different unrevealed four-card hand assignments. Both fixtures
still chose Poltergeist. An actor choosing an attack cannot know the actual
opponent hand before attacking, though resolution may expose it.

[Exact combinatorial utility](../../simulation/evaluation/agent23-unseen-trainer-hypergeometric.cjs)
takes only three counts: publicly unresolved physical cards `N`,
unresolved Trainer copies `K`, and unidentified opponent hand count `H`.
For a **hypothetical uniformly drawn concealed hand**, the number X
of Trainers has the distribution:

`P(X=k) = C(K,k) C(N-K,H-k) / C(N,H)`.

The exact integer combinations use BigInt with a 60-card cap. The model
returns every feasible Trainer-count probability, expectation, variance,
nominal printed damage under 50 damage per Trainer, and threshold chances.
It has no parameter for the actual concealed hand identities, physical
deck order, or any game Store, so it cannot directly peek at them.

**The uniform assumption is intentionally limited.** Real hands are shaped
by Basic-valid opening hands, player choice of the Active and Bench,
mulligans, searches, draws, card plays, hand disruption, public reveals,
Prize uncertainty and strategic decisions. Knowing an opponent's precise
60 during a game is also an additional matchup assumption. This utility
does not infer that source-list identity from the opponent's public board.

## All authenticated Aichi Top 32 original rosters

[Field profile](../../simulation/evaluation/agent23-paper-field-unseen-trainer-profile.cjs)
applies a standardized **what-if** to each of the 29 authenticated
original 60s: one publicly known non-Trainer Pokémon removed, 59
unresolved physical cards, and an unidentified **four-card** hand modeled
as uniform. Published source category counts provide the actual Trainer
copy count `K`. Every full roster is exactly 60 cards under the source
manifest. This is a hypothetical comparison point, **not** a claimed
observed board or native attack prediction.

| Source archetype and original rank | Trainers / 60 | Uniform-model expected printed Poltergeist damage | Chance of 150+ printed damage | Chance of 200+ printed damage |
| --- | ---: | ---: | ---: | ---: |
| Vileplume Control, rank 2 (field low, also rank 15) | 28 | 94.92 | 26.81% | 4.50% |
| Snorlax Stall, rank 3 (also rank 7) | 44 | 149.15 | 73.48% | 29.83% |
| Meloetta Donk, rank 26 | 45 | 152.54 | 76.39% | 32.74% |
| Iron Thorns, rank 6 (also ranks 24 and 29, field high) | 48 | 162.71 | 84.56% | 42.75% |

Across the 29 authenticated original lists the source Trainer count is
28–48, and the standardized nominal expected 50-per-Trainer damage is
94.92–162.71. The model is fully determined by public **source aggregate
counts** under its explicitly hypothetical roster-knowledge assumption.
The missing exact rank 23, 25 and 28 lists are excluded.

### Important tactical veto

Against a hypothetical 230-HP Iron Thorns ex with only four unidentified
hand cards, printed Poltergeist's *maximum base damage* under this
model is 200 before modifiers. A naive expected-damage optimizer might
favour the Trainer-dense matchup, yet that one attack cannot directly
clear the target's 230 HP without additional damage or relevant modifiers.
Energy payment, active Ability locks, attack protection, opponent response
and whether Gengar's attack is even available require independent rules
and game-state evaluation. The table cannot justify a deck swap.

## Verification and limits

[Pure tests](../../tests/agent23-unseen-trainer-hypergeometric.test.cjs)
assert exact `C(60,30)`, full PMF normalization, degenerate edge cases,
the previously documented rank-11 39-Trainer/58-unresolved example
with expectation **134.48275862**, and the authentic 29-row source category
count census. The tests are included in the manual compiled native workflow
pure gate; no native qualification is implied by mathematical tests.

This is a foundational source-conditioned prior for future owner-visible
attack evaluation. To become an applicable game policy, it needs a
verified public-action history, uncertainty over roster identity,
legitimate K0/K1 information, opponent-response modeling, and complete
resolution of actual candidate actions. It does not solve those gaps.

**Deck objective remains unchanged: 29/32 authenticated opposing original
60s, 0 competitively qualified games and no demonstrated 99.5% winning
fixed 60.**
