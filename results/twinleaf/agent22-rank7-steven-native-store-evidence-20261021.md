# Agent 22: rank-7 Steven's Resolve 46-card owner search, compiled native Store

**21 October 2026. Evidence class: compiled, deliberately staged real-Store interaction. Competitive-qualified games: 0.** Source is the published rank-7 Hiroto Fuji Snorlax Stall 60 in `results/aichi-2026/full-decklists.json`, with 4 Steven's Resolve (CES 145) and 12 Basic Pokémon. The pinned engine revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, through the existing `resolveManifestFile` options `allowEquivalentBasicEnergies:true` and `allowJapanesePromoHooks:true`. Source printed-identity fidelity remains governed by those disclosed mapping options.

## Actual reproducible Store witness

- **Current production test:** [manual GitHub Actions run 39528847488](https://github.com/FlareZ123/experiment-01/actions/runs/39528847488), **success**, repository SHA `e3c59af7a411d88bc7c3967c3cb883d2651e4918`; isolated native-only manual input `native_search_only:true` on existing workflow `.github/workflows/agent5-owner-root-native.yml`. Artifact [12314711392](https://github.com/FlareZ123/experiment-01/actions/runs/39528847488/artifacts/12314711392), archive SHA256 `4164ed9615d2cecc483da30ec95dd5fb2a3823b4c03ac306a2d5fcad5bc3111c`. It contains `agent22-steven-native-store-result.json`.
- **Independent end-to-end workflow:** [manual run 39528498609](https://github.com/FlareZ123/experiment-01/actions/runs/39528498609), **success**, SHA `529a12991c2737037b574efd8f08e47b748acdc3`, artifact [12314081688](https://github.com/FlareZ123/experiment-01/actions/runs/39528498609/artifacts/12314081688), archive SHA256 `dcfeb9746526414b78b6af4e5411bad4c8938f32eeb55822d20d2f2d6ccc10f6`. This used an earlier equivalent sequential Store authentication arrangement. The later current test separately wraps each physical seat and produced the same selected printings and native settlement.
- **Honest failed precursor:** [run 39528273261](https://github.com/FlareZ123/experiment-01/actions/runs/39528273261) stopped at two stale Agent5 pure test fixtures before compiling. Commits `853ecaf3` and `529a1299` repaired the snapshot expectation for existing added public fields and the fixture's missing native `SpecialCondition` enum. The succeeding full run confirms both repaired tests passed; the initial failure should not be counted as a native search failure.

The executable is `simulation/twinleaf/agent22-steven-native-store-gate.cjs`. It initializes actual card objects from the exact source 60, dispatches an actual native `AddPlayerAction`, then deliberately stages an opening Wobbuffet, Steven's Resolve in hand, six Prizes, one first draw and a visible opposing Active Pidgey. For each physical owner seat separately, the original pinned `Store.dispatch(PlayCardAction)` creates the native `CHOOSE_CARD_TO_HAND` prompt with **46 owner-deck cards**, `min:0,max:3`. The Agent41 complete-menu projection returns `null` because more than 30 individual cards are valid. The optional `withSparseActorOwnerSearch` supplies a detached owner observation, maps a complete three-card printed multiset back to original physical card instances and dispatches a genuine native `ResolvePromptAction`.

| Native outcome | Owner seat 0 | Owner seat 1 |
| --- | ---: | ---: |
| Authenticated original Store | 1 | 1 |
| Sparse owner search selected | 1 | 1 |
| Native Store accepted | 1 | 1 |
| Rejected or unverified prompt | 0 | 0 |
| Native prompt postcondition confirmed | 1 | 1 |
| Initial searched deck | 46 cards | 46 cards |
| Deck after selecting three | 43 cards | 43 cards |
| Final owner hand | 9 cards | 9 cards |

Both searches selected the same deterministic printings: **Artazon PAL; Bellelba & Brycen-Man CEC; Captivating Poké Puff STS**. The position was staged and no game winner, authentic full starting deal, timing distribution, search-line skill or representative opposing reply was tested. Selection of lexicographically earliest printings is only a legality fallback and may consume Steven's Resolve on weak targets.

## Qualification and integration consequence

**Closed narrowly:** The previously synthetic claim that the sparse fallback can handle an authentic >30-card unrestricted source-owner search is now demonstrated through compiled pinned Store effects for both owner seats. The real Store accepted typed actions and three cards entered the hand. The original Agent41 selector cannot form this complete-menu case. The optional adapter requires `ownerSingleSearch:true` plus `AGENT22_SPARSE_OWNER_BUNDLE_DEV=true` in canonical composition if no explicit owner-search adapter is injected; the current ordinary default remains unchanged.

**Open:** The staged witness does not demonstrate a naturally drawn Steven opportunity, strategy-aware selection, winning rank-7 source play, paper tournament timing, competitive win rate or a fully actor-only common policy. The [canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) and [Agent44 caretaker's joint-profile handoff](../../communications/broadcast/20261021T0050Z_agent44_joint_canonical_profile_caretaker.md) remain the appropriate common-game integration surface. Record the complete immutable flag vector and actual owner-search exposure before any comparison. Do not add the staged two prompts to a competitive denominator.

Field status remains **29/32** exact Aichi source lists, missing placements **23/25/28**, and **zero competitively qualified games**; the fixed-deck 99.5% target is unverified.
