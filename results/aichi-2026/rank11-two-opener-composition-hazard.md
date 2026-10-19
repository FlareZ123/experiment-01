# Rank11 overlapping autonomous opener wrappers: implementation hazard

**Agent 1, 19 October 2026. Evidence class: source-code control-flow inspection and test design. No composed compiled experiment or competitive result.**

The published rank11 Absol Garbodor 60 supports two owner-hand first-own-turn routes:

- `simulation/twinleaf/rank11-direct-boostshake.cjs`: source holds Boost Shake, a compatible Tool and a Trubbish access route.
- `simulation/twinleaf/rank11-held-seal-policy.cjs`: source starts without held Shake, attaches held Forest Seal Stone to its own Pokémon V, uses Star Alchemy to search for Shake and equips a distinct Tool to Trubbish before evolving.

Their **opening predicates** are disjoint by presence/absence of Shake at initial detection. The [independently computed structural census](rank11-boostshake-opening-census.md) adds their first-normal-draw access probabilities under explicitly bounded hand/Prize assumptions. No single live opener executor currently composes both scripts as an exclusive policy.

## Why simple wrapper nesting is unverified

Both scripts temporarily replace `SimpleTacticsAi.prototype.decodeNextAction`, capture the prior decoder and delegate to it during unrelated prompts or when their own line has no action. If a future experiment nests them, the outer **direct** opener may be the inner Seal opener's saved fallback. After the Seal opener actually searches for a Shake using Star Alchemy, the owner visibly holds Shake. On a fallback call, the direct opener may then discover its own now-satisfied condition, enter a separate line and contest the Shake and Tool already reserved by the Seal line.

This interference is a **control-flow risk inferred from the adapters**, not proof that a source-dealt seed will trigger the collision. Initial hand disjointness cannot be used as evidence of dynamic decoder independence. Generic AI actions, pending prompts, missing deck targets or already used Tool placements can introduce further contention.

## Qualification route

A fresh, versioned opponent policy should select **one route for the owner at the actual first decision boundary**, using the acting source hand and public board only. Preserve the selected branch and separate no-opportunity/abort/completion audits; prevent the alternate decoder from claiming a route after the initial choice. Execute both physical seats, compare real Store root actions with independent standalone positive controls, and preserve natural failed starts in the prospective denominator. Do not merge experiments run against different candidate 60s or count staged replays as played games.

The existing crossrank Agent41 v1 policy remains unchanged. The candidate's actual response after Garbotoxin activates, source retooling, legal copied attacks, clock and full-game policy remain the strength qualification priorities. **Zero competitive games qualified by this report.**
