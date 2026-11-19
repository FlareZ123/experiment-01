# Rank-10 Regidrago: Phantom Dive allocation policy v2

**Status: development-only; blocked for competitive qualification.**

## Result

The rank-10 opponent policy now has a complete-allocation implementation for Dragapult ex TWM 130's Phantom Dive follow-up. The policy can rank full six-counter allocations and return one existing select-choice token. It does not expose a partial placement decision, add a worker decision kind, create a second validator, change the simulator, or alter the candidate deck.

The implementation is deliberately opt-in. Policy version is agent43-rank10-regidrago-opponent-v2. The default configuration disables Phantom Dive allocation. The only enabling value is phantomDiveAllocation=complete-choice-token-v1, and it must not be set in a registered bundle until the host projection and native tests are complete.

The allocation helper has 21 local synthetic tests passing on Node v22.16.0. Five policy-v2 integration tests are committed but were not run in this invocation. No Twinleaf game, fixture, match, or matchup evaluation was run. This is not evidence of a competitive win rate.

## Source and benchmark boundary

The source candidate is rank 10, Haruku Yoshioka's Regidrago list, selected from:

- results/aichi-2026/2026-11/agent39-ranks8-16-expanded-normalized-inputs-20261113.json
- Source dataset Git blob SHA1: f88bf0b8d3da450a50e0b283db73c6f1b5dc5bea
- The normalized source contains exactly 60 cards.

This is a source-list transcription, not an authenticated physical-paper deck fingerprint. Physical printings are not independently authenticated and the list is not admitted to the verified paper field. Do not describe it as a verified Aichi Top 32 paper deck or as a competitively qualified Expanded list.

## Native prompt contract and host boundary

The existing pinned-engine research in simulation/twinleaf/apex-phantom-dive.cjs establishes the effect shape: Phantom Dive produces a genuine PutDamagePrompt for 60 damage, and the raw result is an array of target/damage placements. That harness was not executed in this invocation; it is a source-level native effect harness, not a policy allocation result.

The existing host projection in simulation/evaluation/2026-11/agent36-prompt-projection.cjs does not currently project PutDamagePrompt. Agent49 owns the host/worker integration boundary. This contribution intentionally does not edit Agent36's projection or runner and does not integrate into the rank-1 first-trace bundle.

The current worker protocol already has the required representation:

1. Host generates one flat choice per complete allocation.
2. Each choice has one opaque token and a public label.
3. Host retains choiceByToken[token] = the exact native placement array.
4. Worker returns the existing select-choice decision with that token.
5. Host resolves the token to the native array and revalidates before dispatch.

No protocol extension or second validator is required.

The helper is simulation/evaluation/2026-11/agent43-phantom-dive-allocation.cjs. It enumerates weak compositions of six 10-damage counters across eligible opponent Bench slots. Five occupied Bench slots produce 210 complete allocations. Six targets, used as the conservative combinatorial upper bound, produce 462. Both fit under the existing 512-choice limit. The actual Pokémon Bench limit is five.

The helper expects the host to map native PlayerType and SlotType values to actor-relative geometry and pass only opponent Bench target descriptors. It rejects unknown or duplicate geometry, non-opponent targets, invalid indices, zero-only target sets, unsupported damage contracts, and choice counts above the limit. Zero-cap targets are excluded. Positive maxAllowedDamage values are not assumed to be generic hard caps: the existing paper hook explicitly documents that positive values may be UI/HP hints.

Crucially, the host must validate every generated allocation before exposing its token. The callback should combine the existing validateRawPromptResult path with paperPutDamageRejectReason from simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs. The Store dispatch hook also rechecks the paper guard when the selected raw result is dispatched. This is necessary because the pinned Store's ResolvePromptAction path does not itself call PutDamagePrompt.validate().

The helper accepts a validateResult callback for this purpose. If native validation or the paper guard rejects a candidate, that candidate is omitted. If every candidate is rejected, the helper returns a blocked result and exposes no partial menu.

## Allocation scoring

The worker sees only the actor-visible observation and the projected public choices. It parses the public PD1 allocation label and scores each complete allocation in this order:

1. Immediate Prize win.
2. Total Prize value from Bench Knock Outs.
3. Number of Knock Outs as the tie-breaker.
4. Remaining useful damage, weighted by the existing candidate-target priority heuristic and target Prize value.
5. Wasted overkill penalty.
6. Original choice order for deterministic ties.

The helper rejects malformed labels, wrong damage totals, non-10 damage packets, duplicate target indices, unknown Bench slots, and non-allocation choice kinds. It abstains if no valid candidate remains.

This is a prompt-level allocation scorer, not a complete game policy. It does not model the full attack activation cost, opponent responses, future Prize mapping, or game outcomes.

## Policy v2 behavior

The rank-10 policy module imports the allocation helper and exposes a strict configuration boundary:

- Default: phantomDiveAllocation=disabled.
- Opt-in: phantomDiveAllocation=complete-choice-token-v1.
- Unknown configuration keys or modes fail initialization.
- PutDamagePrompt is accepted only when its source is Phantom Dive or Dragapult ex TWM 130.
- Other PutDamagePrompt sources fail closed.
- ChooseAttackPrompt filters Phantom Dive out while allocation mode is disabled.
- Legacy unsupported prompt shapes remain fail-closed.

The default is intentionally disabled because the host projection is not yet implemented. Do not enable the opt-in value merely because the policy-side scorer exists.

## Challenge suite and evidence

The development suite is results/methodology/2026-11/agent43-rank10-phantom-dive-challenge-suite-v2.json. It contains six synthetic development cases and two explicitly blocked native/integration cases. Actor-view digests, expected decisions, cost ledgers, prompt coverage, source bindings, evidence classes, and dispositions are recorded there.

Integrity bindings:

- Policy module SHA256: 7b722a080c52061f84d7fc494f983d2506d5b09468c1e833682d63cdac1578ea
- Dependency manifest SHA256: f1db1bbfac7a067c9ca996a047256d1cdfc672d22738957cf6d8607295d67b80
- Common constraints SHA256: baa57e0c4ccf852d2fad9411a6985b1033eca1e5f8989fed6ad6e6318554409e
- Challenge suite SHA256: 0ca98bae7d496066e8721258637def112f52b6e8bf5dc23ff07a5d5aa218cbe5

The common constraints and dependency manifest are provisional artifacts. None of these hashes is bound to the signed V3 policy-plan core. The rank-10 policy producer ID is not registered in that plan. No independent reviewer or held-out review set is present. Therefore every case remains disposition=blocked for policy qualification, even where the synthetic unit test passed.

Evidence status:

- Allocation and paper-guard helper tests: 21/21 passed locally against local mirrors of the committed helper/test and the existing paper guard.
- Policy-v2 integration tests: five authored, not executed in this invocation.
- Native engine execution: not performed.
- Native policy prompt coverage: blocked because the current host projection does not support PutDamagePrompt.
- Held-out review cases: zero.
- Games and matchup samples: zero.
- Matchup or field win-rate estimate: none.
- 99.5% target: not demonstrated.

## Exact integration handoff

The Agent49-owned host projection should:

1. Detect a genuine PutDamagePrompt whose source provenance identifies Phantom Dive / Dragapult ex TWM 130.
2. Map each maxAllowedDamage target through the native PlayerType and SlotType enums and the prompt's perspective player. Confirm that every positive target is an opponent Bench slot; fail closed on unknown geometry.
3. Call enumeratePhantomDiveAllocationChoices with prompt.damage, prompt.options.damageMultiple, prompt.options.allowPlacePartialDamage, and the mapped target descriptors.
4. Supply a validateResult callback that requires both validateRawPromptResult(prompt, placements, state) to succeed and paperPutDamageRejectReason(prompt, placements, state) to return null.
5. Publish only the resulting flat choices and retain the returned choiceByToken map in the existing prompt projection.
6. Keep the existing select-choice dispatch path and revalidate the selected raw array at dispatch. The Store paper hook must remain installed.

Native coverage must then include both actor seats, five occupied Bench slots, fewer occupied slots, zero-cap targets, positive maxAllowedDamage cases, no-legal-target behavior, exact source provenance, all candidate validation, and dispatch revalidation. Run the committed policy-v2 tests in the repository runtime before enabling the config.

## Explicit non-actions and remaining gates

This work did not change the 60-card candidate, tournament source transcription, rank-1 first trace, PR #58, Agent36-owned projection/runner, Twinleaf upstream or pinned submodule, CI workflows, or shared release state. No games or fixtures were run.

The next meaningful action is host-side PutDamagePrompt projection by its existing owner after the canonical release hold permits it. Then run native prompt tests and the committed policy-v2 test file. Physical deck authentication, producer-plan binding, independent review, and a held-out case set remain separate admission requirements.
