# Native completion: Arven's selected Nest Ball now establishes a Basic Pokémon

**Agent1, 9 November 2026.** This is a genuine owner-owned **paid Item-to-Bench gameplay correction** under the original selected-v8 developmental actor policy. It is not a paper-qualified tournament result and does not change the nominated fixed 60.

## Registered native comparison and result

The action contract was registered **before** native execution at `results/methodology/registrations/agent1-v8-arven-nest-from-physical-search-20261109.md`. It intentionally reused the already exposed four original rank-3 Snorlax versus rank-1 Shadow Rider physical seed/seat deals, so it is **functionality validation**, with no fresh-seed strength estimate. Both A and B use the same owner-held Arven, Mail and owner Ability-confirm layers. The only B change is the default-off `followArvenNestBall:true`: after a physically settled Arven own-deck search, its actual selected Nest Ball in the owner hand becomes eligible for a paid Store Item play when the incumbent would Pass, then resolves a native Nest Ball Basic-deck search to actually Bench the chosen physical Pokémon. All actions remain bound to the currently acting owner and native `canPlay` and prompt validation.

[Native GitHub Actions run 42564009730](https://github.com/FlareZ123/experiment-01/actions/runs/42564009730), head `8626d28b42abb4e51c6430cc3322e58a0ae851ad`, successfully compiled pinned upstream Twinleaf and ran the existing manual workflow. Output:

| Native field | Result |
| --- | ---: |
| Registered physical source pairs | 4 |
| Source + full two-player physical SHA-256 deals matching A/B | **4/4** |
| Native Arven own-deck Item/Tool searches in B | 9 |
| Arven-selected Nest Ball plays accepted by actual Store | **6** |
| Fully settled native Nest Ball prompts physically moving Basic to Bench | **6/6** |
| Strict substantive opponent response + subsequent source own-turn decision | **6** |
| Native Store Nest Ball rejection | 0 |
| Native A/B winner reversals or final-Prize differences | **0** |
| Qualified paper games | **0** |

## What moved and when

| Registered arm | First control/treatment divergence | Physically benched through selected Nest Ball | Native endpoints / final Prizes |
| --- | --- | --- | --- |
| `3:312:B`, source seat 0 | root 35, source global turn 3: **Pass → tagged PlayCardAction** | Bunnelby PRC on turn 3; Galarian Stunfisk SSH on turn 13 | cap → cap, [6,3] → [6,3] |
| `3:312:A`, source seat 1 | no root divergence | no selected Nest action | native terminal → same, [6,6] → [6,6] |
| `3:213:A`, source seat 1 | root 30, source global turn 3: **Pass → tagged PlayCardAction** | Articuno-GX CES on turn 3; Galarian Stunfisk SSH on turn 5 | cap → cap, [6,6] → [6,6] |
| `3:213:B`, source seat 0 | root 18, global turn 2: differing prompt-resolution ownership/result type; **not** a direct Pass→Nest first divergence | Articuno-GX CES on turn 2; Bunnelby PRC on turn 6 | cap → cap, [6,5] → [6,5] |

In the third changed arm, exact first divergence occurred at a prompt resolution and requires attention before assigning all gameplay effects causally to the first tagged Nest root. Every **counted physical Bench move**, however, was joined to an actual tagged Store-accepted Arven-selected Nest Ball action, with the owner/turn pair and subsequent meaningful opponent/source continuation checked. The game-state benefit is explicit additional Basic Pokémon in play; whether those particular Basics were strategically optimal remains untested.

**Three of four treatment arms remained 260-root censored**, with one native terminal that retained six Prizes on both sides. The original opponent policy remains insufficient for competitive strength inference, and this test does not measure the expected 99.5% Aichi Top32 win rate.

## Integration

- The existing `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs` already contained source-attested Arven→Nest mechanics, but the selected v8 entry point never passed `followArvenNestBall`; the action was unreachable from the actual shared runner.
- `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs` now passes that option only when owner-held Arven is enabled, exposes native `nestFromArven*` receipts, and links paid Item actions to immutable Store roots by the same action object through `onArvenNestActionCommitted`.
- `simulation/evaluation/agent1-v8-arven-nest-native-four-arm.cjs` performs 4/4 physical deal admission, six paid native action-to-physical Bench joins, and strict opponent + next own-turn continuation.
- `tests/2026-11/agent1-v8-arven-nest-native-four-arm.test.cjs` covers the frozen four-deal registration and continuation boundary.
- The **existing** `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml` runs the new opt-in comparison under the previously existing `original_held_arven` dispatch input. No new workflow definition was created.

**Decision:** This is a native-positive access-to-board policy primitive worth including in a versioned common two-player successor, with nontrivial Bench capacity, Item lock and choice-of-Basic tradeoffs accounted for. It has zero demonstrated contribution to a final match win in this fixed four-arm frame. Preserve source-owner action receipts rather than treating a search edge as a substitute for actual board establishment.
