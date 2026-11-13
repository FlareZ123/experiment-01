# Agent 5 — root-determinization opponent-belief fusion counterexample

**Date:** 13 November 2026  
**Scope:** Source-level algorithm audit of `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`. This is a synthetic imperfect-information counterexample, not a Twinleaf match, card-mechanics result, deck matchup, or competitive-strength estimate.

## Finding

The current PUCT implementation samples one determinization from the root player's information set at the beginning of each iteration:

```js
state = config.sampleDeterminization(rootState, rootSeat, sampleRandom, searchContext);
```

It then traverses every later node in that same sampled world. Node keys include the acting seat and that seat's observation hash, but the hidden world is not re-determinized when control passes to the opponent.

This creates a **root-belief / opponent-belief mismatch** when the root knows a private card identity that the opponent cannot see. Across separate searches with different root-private cards, the opponent can have the same public observation but receive a different simulated best response. The opponent node's Q values are conditioned on the root's actual private card, as if the opponent knew it. Observation-keying within one root search does not solve this cross-root-information-set strategy-fusion problem.

## Reproducible counterexample

The new characterization test is:

- `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs`

The synthetic game has:
- seat 0 privately holds either `threat` or `bluff`;
- seat 0 makes the same public `commit` action;
- seat 1 sees the same public observation in both cases, including a 20% prior probability of `threat`;
- seat 1 chooses `block` or `pass`;
- blocking beats a real threat but loses to a bluff; passing beats a bluff but loses to a real threat.

From seat 1's stated belief, the expected values are:

| Response | Expected value |
| --- | ---: |
| Block | (0.2(+1)+0.8(-1)=-0.6) |
| Pass | (0.2(-1)+0.8(+1)=+0.6) |

Thus **Pass is the unique belief-optimal opponent response in both worlds**. Yet the current core's root-only determinization keeps seat 0's private card fixed across all 400 iterations. Source-level execution produced:

| Root-private card | Opponent observation | Block selections | Pass selections |
| --- | --- | ---: | ---: |
| Threat | Same hash | 393 | 6 |
| Bluff | Same hash | 6 | 393 |

The test asserts that the opponent observation hash is identical across the two searches while the root observation hashes differ. It then confirms that the opponent action distribution reverses with the root-private card. The counts exclude the first iteration, which expands the opponent node without selecting an opponent action.

**Execution qualification:** I ran the characterization against the fetched repository core in a Code Mode harness using deterministic hash and assert/test shims; the test passed. This is not a native Node CI run. The test is added to the existing Agent5 manual workflow for future Node execution.

## Interpretation and limits

This is a structural algorithm limitation, not evidence that the current bounded Flittle fixture is invalid. The Flittle pilot deliberately uses one Flittle plus 59 identical Psychic Energy cards; after the sole Flittle is publicly established Active, hidden card identities are degenerate. This particular counterexample therefore does not create a hidden-identity opponent-belief mismatch in that fixture.

It does matter for general Expanded games. A root player normally knows its own hand/deck information that the opponent does not. If every determinization preserves the root's exact private cards, opponent-node values can make the opponent appear to know those cards. The current algorithm should not be described as a generally sound multi-agent imperfect-information search until this is addressed.

The current code still has separate limitations already documented elsewhere: the upstream ActionEnumerator is not an Expanded-complete frontier, the Flittle provider uses a zero terminal/value signal and uniform priors, and the native Store/provider integration is not yet complete. This report does not supersede those findings.

## Required research direction

1. **Do not use current root-determinization opponent nodes as a competent opponent model for general Expanded contests.** Keep the bounded Flittle exercise labelled as an execution-boundary diagnostic.
2. Investigate actor-relative re-determinization at each decision node, conditioned on the acting seat's verified K0/K1/PARTIAL ledger and public evidence. A naive call to the existing sampler at every seat switch is not automatically correct: it must preserve legal transitions, the acting player's own hidden knowledge, and consistent action settlement when control returns to the root.
3. Add a metamorphic acceptance test: hold an opponent's complete observation and belief fixed while changing only the root player's private card identity; the opponent's selected policy distribution must remain invariant. Then swap physical seats and repeat.
4. Until an actor-relative search is validated, use a frozen independently competent opponent policy per field rank for deck evaluation rather than treating the current PUCT opponent nodes as an equilibrium best response.
5. Keep the root's own policy information-set aware: it may use its own private hand, but must not leak that information into the opponent's decision rule.

## Reproduction

Run under Node 22:

```sh
node --test tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs
```

The existing manual Agent5 workflow now includes this characterization test alongside the three core/belief/adapter contract suites. No new workflow or automatic push trigger was added.

## Follow-up — fixed actor-observation opponent policy mode

A practical evaluation path is now implemented in the MCTS core at `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`:

- Optional `config.opponentActionPolicy` plus a required stable `config.opponentPolicyId`.
- At non-root-seat nodes, the core supplies only the acting player's observation, sorted legal action keys, physical seat, seeded RNG and deadline context. It does not pass the native State or action objects to the opponent policy.
- The policy must return one key in the current legal frontier; otherwise search fails closed.
- Repeated opponent information sets must retain an identical action-key frontier.
- PUCT remains the candidate/root-seat planner; opponent actions follow the frozen policy. This is **policy-conditioned root search**, not adversarial PUCT or equilibrium search.
- The audit records `opponentModel`, `opponentPolicyId`, `opponentPolicyCalls` and `opponentInformationSetCount`. The legacy no-policy mode is explicitly marked `root-determinization-puct`.

The characterization test now includes the counterexample plus the fixed-policy mode. The fixed policy sees the same opponent observation in both root-private worlds and chooses Pass 400/400 times; the root's terminal values still differ because the actual root-private card is preserved for outcome evaluation. A third regression rejects a policy action outside its visible frontier.

**Current source-level validation:** 10/10 core + strategy-fusion tests passed in the Code Mode harness using deterministic hash and Node assert/test shims. The harness is not native Node/Twinleaf CI. The test file is included in the existing Agent5 manual workflow.

This mode is a practical way to evaluate against a frozen per-rank opponent policy without allowing the root's private hand to steer the opponent's action rule. It does not make a weak policy competent, certify that every action key is observation-safe across all root-private worlds, or close the Expanded action-frontier problem. Those remain explicit requirements. The default mode without a supplied policy still has the counterexample above.

The adapter integration was subsequently completed: `createTwinleafMcts()` forwards the optional fixed-policy callback and ID to the core. Its mock-Twinleaf adapter suite now passes 8/8 in the same source-level Code Mode harness. This verifies option wiring and the actor-observation callback contract in the mock adapter only; it does not substitute for a pinned native Twinleaf run.
