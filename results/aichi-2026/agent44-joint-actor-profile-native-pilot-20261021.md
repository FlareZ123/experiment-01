# Jointly enabled canonical actor-policy pilot: one native epoch stopgate and three bounded arms

**Owner:** Agent 44 · **Executed:** 21 October 2026, 00:49–00:51 UTC · **Status:** development-only **NO-GO** · **Competitive games:** 0.

## Exact executable and reproducibility

- Workflow: [canonical manual composition, run 39523611732](https://github.com/FlareZ123/experiment-01/actions/runs/39523611732), [uploaded complete four-arm JSON, artifact 12311663228](https://github.com/FlareZ123/experiment-01/actions/runs/39523611732/artifacts/12311663228).
- GitHub checkout/policy code SHA: `f8baa3767db5c93ac80de8543d84d6fe59f4a5a1`; engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in `vendor/twinleaf`; Node 22 compiled with `npm ci`.
- Original ZIP SHA-256: `a93ef2a09a941fd35471532502f05fb9fa81ed7388d6caef108bc1118091b751`; contained JSON SHA-256: `15548f29e3daa9dd0d740d6ff6d5e19a766f3d23f89a3b313b9df7815df518ae`.
- Frozen historical registration: `results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json`; exact 60s come from `results/aichi-2026/full-decklists.json` and `scripts/aichi-new-moon-candidate.cjs`. Registration pins field-roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200` and New Moon 60 blob `0edaa9ee651ae9724bb0ea9b46b6431adb12760b`. The registration's original candidate/supporter assumptions are **historical**; this execution changed active wrapper versions and must carry its new Git SHA.
- Exact historical trials: rank 6, repeat 0, physical candidate seat A, seed `407516727`; rank 11, repeat 2, physical candidate seat B, seed `623585882`. Both frozen candidate 60s were attempted at each source deal, each with `maxRootActions=260`; nothing was sampled prospectively. The requested source-first retrospective panel was **never reached**, because the first panel failed closed.

## One joint, fixed opt-in vector

Workflow `.github/workflows/agent7-canonical-actor-bilateral.yml` was manually dispatched with `source_first_retrospective=true`, `energy_frontier=true`, `owner_single_search=true`, `special_energy_root=true`, `actor_hand_discard=true`, `actor_choose_pokemon=true`, `actor_quick_ball_root=true`, `native_generic_fallback=true`, `paper_cologne_quota=true`; `native_fallback_paircheck=false` and `rank6_source_k1=false`. Canonical actor composition, paper Supporter discipline, both-seat mandatory-option enforcement, and rank-specific native pressure observation were enabled in the fixed workflow independently of dispatched flags. No sparse-owner bundle or unrelated compressor opt-in was enabled.

Real three-arm audit reports the adapter versions:

| Slot / intercept family | Version |
| --- | --- |
| Root | `agent34-actor-only-root-slice-v3-optional-energy-frontier+agent8-actor-quick-ball-v1` |
| Fog search | `agent9-fog-crystal-owner-prompt-v2-live-state` |
| Owner single search | `agent41-owner-bounded-search-actor-v4-complete-bundles` |
| Discard prompt | `agent47-actor-hand-discard-v1-bounded` |
| Choose Pokémon | `agent8-actor-only-choose-pokemon-v1` |
| Select / Option / Attack | `agent8-actor-only-select-prompt-v1` / `agent13-actor-only-select-option-v2-live-state` / `agent13-actor-only-copied-attack-choice-v2-live-state` |
| Generic fallback attribution | `agent7-native-generic-fallback-attribution-v2-distinct-prompts` |

The reported priority, highest first: `ChoosePokemonPrompt`, `ChooseAttackPrompt`, `SelectOptionPrompt`, `SelectPrompt`, `FogCrystalRootAndOwnerDeckSearch`, `ActorOwnerSingleSearchPrompt`, `ActorHandDiscardPrompt`, `ActorOnlyRoot`. Each wrapper independently counts delegated calls, so **do not add overlapping delegation counters** to produce decision counts.

## Original attempted-arm census, including failure

| Original source deal and candidate | Live actor audit | Accepted actor roots | Generic decoder calls | WaitPrompt generic calls | Native result/obstruction |
| --- | ---: | ---: | ---: | ---: | --- |
| Rank 6, seed 407516727, champion-reference A | **missing** | unavailable | unavailable | unavailable | **Engine evidence error**, native clock reset at root ordinal 38; no row-level actor audit |
| Rank 6, same seed, New Moon A | present | 15 | 40 | 30 | 75 roots, rank-6 source scripted attack completed; candidate zero declared attacks, engine terminal favors source |
| Rank 11, seed 623585882, champion-reference B | present | 68 | 177 | 146 | Capped 260 roots, source Boost Shake/Garbodor planned line never initiated, 24 candidate and 19 source attack declarations |
| Rank 11, same seed, New Moon B | present | 63 | 167 | 141 | Capped 260 roots, source Boost Shake/Garbodor planned line never initiated, 22 candidate and 17 source attack declarations |
| **All attempted** | **3/4** | **146 across verified rows** | **384 across verified rows** | **317 across verified rows** | **one hard failure; two capped cases; 0 competitive-qualified** |

The three completed rows report **zero accepted-root rejections** and both-seat native Supporter quota success under the opt-in guard. They report 4/19/12 independently physically confirmed actor root effects and actor ChoosePokemon 3/0/0 settlements. The three rows also report owner single search **0 accepted** and actor hand discard **0 accepted**, despite these components being jointly enabled. This run establishes wrapper interoperability in three arms; it cannot establish full active policy coverage.

All three completed arms report `fullyActorOnly=false`, `candidatePolicyCompetenceEstablished=false`, `sourcePolicyCompetenceEstablished=false`, `paperClockQualified=false`, `competitiveGames=0`. Both rank-11 source hands failed to expose the nominated early Boost Shake/Garbodor line. Only the rank-11 candidates form a complete physical-source-deal pair in the archived packet. The rank-6 champion error prevents same-source-deal/candidate inference.

### First native verifier obstruction

The original rank-6 champion/seat-A arm's `sourceLineReplyPacket -> buildBilateralReplyPacket` failed on **root 38 of 121**:

```text
ordinal 36: seat 0 ResolvePromptAction ShuffleDeckPrompt, turn 4 -> 4, parent root 33
ordinal 37: seat 1 ResolvePromptAction ShuffleDeckPrompt, turn 4 -> 4, parent root 33
ordinal 38: seat 0 ResolvePromptAction WaitPrompt,        turn 4 -> 0, parent root 33
ordinal 39: seat 0 ResolvePromptAction CoinFlipPrompt,    turn 0 -> 0, parent root 33
ordinal 40: seat 0 ResolvePromptAction ConfirmPrompt,     turn 0 -> 0, parent root 33
```

The thrown verifier assertion is `Malformed chronological Store root at ordinal 38 of 121` at `simulation/evaluation/aichi-bilateral-reply-packet.cjs:73`. The engine's `runMatch` includes `suddenDeathClockResets` records with `actionOrdinal, actingSeat, action, pendingPrompt, fromTurn, toTurn, afterSuddenDeath, enteredSetup`, but the thrown report omitted those fields. **Do not assume this is a valid sudden-death transition yet.** It matches the shape of the earlier independently flagged root-38 clock reset, but the current run needs its *own same-run* reset metadata. If it authenticates as a replay, segregate it as a second epoch, never cross-link source/reply roots or count it as a second outer trial. An unauthenticated reset remains an evidence-integrity failure.

A new parser change must retain the unmarked-reset negative control. Agent 3 / Agent 25 own the source-side reset hypothesis; the canonical integrator should own the shared lineage parser and both-seat epoch semantics. Better first emit redacted `suddenDeathClockResets` provenance into the *error* row of the current canonical executable before relaxing any assertion. This is a deliberately exact falsification target.

## Go/no-go classification

| Prerequisite | Result |
| --- | --- |
| Stable full source/candidate 60s and engine pin | Recorded; historical only |
| Native accepted actions and quota in three intact rows | Narrow evidence **PASS**; missing fourth row |
| Entire active path actor-information-only | **FAIL**, 384 fallback calls; explicit `fullyActorOnly=false` |
| Genuine source pressure, legal candidate reply, source continuation | Rank-6 New Moon receives source attack and next roots; rank-11 source line absent; opponent policies unqualified |
| Clock epoch and complete root lineage | **FAIL** at rank-6 champion root 38 |
| Complete both-seat historical and source-first joint profile | **FAIL**, 4 historic attempted, source-first not reached |
| Frozen fresh samples, fair 32-deck coverage, paper game clock | **NOT RUN / NOT QUALIFIED** |
| Comparative deck strength / 99.5% threshold | **NO INFERENCE** |

### Concrete next gate

Record and authenticate original-run `suddenDeathClockResets` metadata at rank-6 ordinal 38. Preserve original rejection until a verified epoch-safe, one-outer-attempt packet passes same-run negative tests. Then rerun this **identical** joint flag vector at one frozen code revision; require all historical arms and the source-first retrospective panel to execute with every abort retained. Separately replace generic-decoder setup/card-play decision reliance before considering a prospective comparative test. Do not call a 260-root capped game a loss or win in a competitive sample.

**Evidence class:** actual pinned compiled/native development outcomes, not a paper-legal complete-game win-rate experiment.

## High-impact full-game decision failure in both rank-11 arms

The same **original native artifact** contains the complete candidate attack-settlement arrays. The champion-reference B arm declares **Get Lost 24 times**, on candidate turns 3 through 49, with **24/24** same-origin prompt-chain settlements. The New Moon B arm declares **Future Sight 22 times**, on candidate turns 9 through 51, with **21/22** confirmed prompt-chain settlements before the 260-root cap. Every attack declaration in each respective candidate arm has the same printed name. Both full ranked native arms terminate at the root cap with **six Prize cards remaining for each player**; this is a **26-turn-scale stalled-policy fixture**, with zero player Prizes gained, even though the executor counted 24 and 22 candidate attacks.

This is an important observed **common decision-policy stagnation**, not evidence that those attacks are inherently weak or that a specific candidate 60 is inferior. The native generic bot and incomplete actor roots repeatedly permit the same setup/utility attack while the board fails to transition into any Prize-taking plan. Aggregate attack counts and successful Store acceptances therefore conceal a major unqualified-policy failure. One pragmatic common-policy acceptance gate should insist on tracking repeated zero-Prize attack names, owner-visible legal alternatives, and capped/censored outcomes; do not manufacture arbitrary replacement attacks that are not native legal. Source-line absence and lack of actual pressure also remain independent confounders.

The native generic decoder's 384 calls in the three audited arms decompose into **317 WaitPrompt** administrative calls, while the rank-11 champion B fallback alone includes **25 seat-B ChooseCardsPrompt** calls and rank-11 New Moon B includes **21 seat-B OrderCardsPrompt** calls (across both rank-11 arms, ten or more repetitions of the latter are visible in the 96-record bounded first-call sample). These are authentic owner-prompt fallbacks requiring action provenance before full actor-only certification. Distinguish setup-phase first-hand ChooseCards, which are required game mechanics, from game-phase repeated owner choices when triaging; many generic prompt calls are neither strategic card plays nor independent game decisions.
