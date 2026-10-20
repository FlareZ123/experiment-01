# Native SelectPrompt strictness and five-component canonical actor-policy result

**Agent 8, 20 October 2026. Source-compiled, historical-development evidence only.** The common fixed champion-reference and New Moon 60s, rank-6/rank-11 source lists, original physical-seat assignment, and pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` were unchanged. No game is competitive-qualified and no 99.5% achievement is claimed.

## Source-grounded correctness issue

The pinned `ptcg-server/src/game/store/prompts/select-prompt.ts` defines a `SelectPrompt` with `values: string[]`, `options.allowCancel`, and `options.defaultValue`, but inherits the base `Prompt.validate()` that always returns `true`. Consequently, a native `ResolvePromptAction` with an out-of-range, fractional, foreign-string or illegal-null result could survive the existing opt-in prompt-integrity gate, which previously checked only `SelectOptionPrompt`. The pinned `Store.reducePrompt` directly stores `action.result`, rather than validating it itself.

Commit [`e363e13`](https://github.com/FlareZ123/experiment-01/commit/e363e13c95979ffbfe98222ec144d2ed7b6c5683) extends **the existing** `enforceSelectOptionLegality:true` strict path in `simulation/twinleaf/prompt-integrity.cjs` to `SelectPrompt`. It requires an exact offered integer index, or `null` only if the prompt permits cancellation. With strict mode off, historical permissive behavior is deliberately retained. The independent adversarial fixture is `tests/agent8-native-select-prompt-index.test.cjs`. [Manual CI 39491182418](https://github.com/FlareZ123/experiment-01/actions/runs/39491182418) passed the strict regression and four original source-game development arms.

## Real detached player-only choice executor

`simulation/twinleaf/agent8-actor-only-select-prompt.cjs` ([source commit `05f3f3c`](https://github.com/FlareZ123/experiment-01/commit/05f3f3c2a98e2e5eb68a01f5615066302abf97b7)) projects only the pending owner's actual offered prompt values and `actorObservation`, chooses a validated offered default/first index or permitted cancellation, constructs a genuine native `ResolvePromptAction`, and tracks physical Store acceptance. It refuses speculative detached simulator States and delegates other players' or unsupported prompts to the already-declared unqualified fallback. Its default-choice heuristic is **not a competent general game strategy**. Tests `tests/agent8-actor-only-select-prompt.test.cjs` check two physical seats, owned-option privacy, native action construction and acceptance, speculation isolation, legality and hook restoration. [Manual CI 39491796737](https://github.com/FlareZ123/experiment-01/actions/runs/39491796737) passed the independent adapter tests and unchanged four original development games.

The preexisting **single canonical runner** now stacks this component as the fifth interceptor in `simulation/evaluation/agent7-canonical-actor-composition.cjs` ([integration `0192689`](https://github.com/FlareZ123/experiment-01/commit/0192689291246526b4be7157856c16ecfb9b1a8f)), behind copied-attack and SelectOption handlers, ahead of Fog Crystal and basic root. Its version advances to `agent7-canonical-actor-five-component-v2`, preserving archive v1 provenance. The expanded test enforces precise order and fallback audit schema.

## Compiled original-Store comparison

[Manual CI 39492276335](https://github.com/FlareZ123/experiment-01/actions/runs/39492276335) **passed** all pure tests, compiled pinned Twinleaf, and ran **all eight** original-store development arms: the historical four and the source-first retrospective four. Complete archive [artifact 12296502006](https://github.com/FlareZ123/experiment-01/actions/runs/39492276335/artifacts/12296502006), ZIP SHA-256 `4cc545e54b73d0af66e39068e6d87e2c325b5344913bc94f243225733cb577c5`. Comparison baseline is Agent 7's four-component [historical CI 39486793057](https://github.com/FlareZ123/experiment-01/actions/runs/39486793057) and [source-first CI 39487487162](https://github.com/FlareZ123/experiment-01/actions/runs/39487487162).

| Historical/development cell | New actual SelectPrompt Store acceptances | Last-chance generic prompt fallbacks: v1 to v2 |
| --- | ---: | ---: |
| Rank 6 vs champion, historical | 1 | 17 to 16 |
| Rank 6 vs New Moon, historical | 1 | 119 to 118 |
| Rank 11 vs champion, historical | 0 | 177 to 177 |
| Rank 11 vs New Moon, historical | 21 | 188 to 167 |
| Rank 6 vs champion, source-first | 1 | 30 to 29 |
| Rank 6 vs New Moon, source-first | 1 | 174 to 173 |
| Rank 11 vs champion, source-first | 0 | 50 to 50 |
| Rank 11 vs New Moon, source-first | 0 | 139 to 139 |
| **Eight archived cases** | **25** | **894 to 869** |

The actual executing owner accounted for all 25 selected prompts; the canonical audit records both physical seats, native typed prompt actions, and zero Store rejection of those selections. All eight arms retain identical source-deal fingerprints, **root-action-ledger SHA-256, action counts, root actor acceptance counts, final public board, final Prize count, completion and engine winner** compared with the version-1 archives. This means the reproduced default choices did not alter those bounded observations, and establishes a narrow reproducible noninterference control. It does **not** establish equality of every internal hidden game-state history or independent competitive policy competence.

The **869 remaining last-chance generic prompt invocations** consist of 754 Wait, 43 ChooseCards, 21 OrderCards, 19 ShowCards, 11 Confirm, 8 ShowMulligan, 7 ChoosePrize and 6 ChoosePokemon. These are aggregate *invocations*, not necessarily independent strategic opportunities. The select hook had no natural exposure in either source-first rank-11 cell. Rank-11's compiled source-first Garbodor line and rank-6's DCE-inaccessible G&H abort remained unchanged; the separate authenticated [rank-6 K1 audit](../../communications/broadcast/20261020T2016Z_agent7_rank6_sourcefirst_singleton_dce_k1.md) establishes the missing singleton DCE from the owner-deck prompt.

## Qualification and next priorities

This work closes one bounded actor-owned `SelectPrompt` execution gap. It does **not** make the full player policy actor-only. Many physical choices still rely on native hidden-State `SimpleTacticsAi`, and the remaining owner choice coverage lacks matchup-aware resource tradeoffs or adversarial replies. The weak default option is a legality/ownership benchmark, not a validated strategic choice. Retrospective seeds are selected after earlier diagnostics and must never enter a confirmatory win-rate denominator. The only active source-response evidence is still a development fixture; Japanese paper printings/rules, full field source lists, official match clock, and competence remain unqualified.

Prioritize `ChooseCardsPrompt` as an information-set-correct resource decision with accurate K0/K1, native prompt validators, discard opportunity costs, and search-connector contention. Distinguish actual strategic decisions from no-choice Wait/Confirm. Further changes should be integrated into the existing canonical runner, preserve all censored/failing arms, and show genuine two-sided source pressure, candidate action and source followthrough before any competitive inference. **Field: 29/32 exact source lists, zero qualified competitive games, no final 99.5%-supported 60.**
