# Agent 50: native first finite-score replay branch localization (21 October 2026)

**Question.** In four frozen Aichi rank-6/rank-11 historical development games, why did three purported same-physical-world reconstructions request additional random draws despite preserving the actor State's canonical descriptor graph, source deal, policy options and genuine selected-action tape? This report localizes the first observed divergence; it does **not** establish its cause.

**Engine.** Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source path `vendor/twinleaf`. **Native compiled manual workflow:** [39520618889](https://github.com/FlareZ123/experiment-01/actions/runs/39520618889), head `b632502e2be7fed38f5a90f3e6deadfb9c388832`. Complete [JSON archive 12310978838](https://github.com/FlareZ123/experiment-01/actions/runs/39520618889/artifacts/12310978838), SHA256 `5f25f39abe9545d53d49feda8686b9aaeabaa26a96d0c15cdc7be9970c4db2a3`. All four source-dealt controls were noninterfering, and the manually dispatched job passed. These are intentionally retrospective, previously inspected deals and have zero competitive-qualification credit.

## Authenticated first divergence at the actual owner turn-3 finite-scored decision

| Opponent source / fixed candidate | Actual native tactic sequence | Reconstructed tactic sequence | Same-world action/RNG parity |
| --- | --- | --- | --- |
| Rank 6 Iron Thorns / champion reference, candidate A | 9 earlier tactics consume 0 draws; `PlaySupporterTactic` consumes 40 and returns `PlayCardAction` | Same first 9; `PlaySupporterTactic` attempts draw 41, gives no action before replay exhaustion | **VETO** |
| Rank 6 Iron Thorns / New Moon v1, candidate A | 7 earlier zero-draw tactics; `PlayTrainerTactic` consumes 40 and returns no action | Same first 7; `PlayTrainerTactic` attempts draw 41, returns no action | **VETO** |
| Rank 11 Absol/Garbodor / champion reference, candidate B | 8 matching tactics; `PlayTrainerTactic` consumes 5 draws and yields `PlayCardAction` | Identical tactic order, 5 draws and action | **PASS, only at this one root** |
| Rank 11 Absol/Garbodor / New Moon v1, candidate B | 7 earlier zero-draw tactics; `PlayTrainerTactic` consumes 41 and returns no action | Same first 7; `PlayTrainerTactic` attempts draw 42, returns no action | **VETO** |

`sourceRngCalls` and `replayRngCalls` are observed nested `Math.random` invocation counts, including the attempted overread. The exception can be caught inside pinned speculative action scoring, so the strict `replayPolicyRandomTape` postcondition flags it even when the outer tactic returns. The respective complete original action transcripts and root canonical clone-fidelity checks passed; the three reconstructed actions are **not** qualified. The same-root replay gate must continue to forbid hidden-order counterfactuals for these arms.

**Interpretation.** The earliest measured discrepancy lies inside a Trainer or Supporter tactic that evaluates candidate action scores. The observation narrows the fault surface to one of the speculative action-evaluation paths (possibly clone semantics, hidden engine state, policy construction or option fidelity). It neither demonstrates a hidden-information leak nor identifies a particular malfunctioning card; the cause remains unproved. All observed original source/policy gameplay is development-only. Only one of four roots passes a full original-tape same-world check, and that narrow success is not a benchmark of competitive play.

## Next falsification, registered before execution

A stricter, read-only per-`evaluateAction` observation records original and detached **candidate action type, hand index, finite numeric score, and RNG start/end** for each evaluation in call order. It runs inside the existing native tape recorder without calling any additional scores or changing the real action. It reports the earliest mismatched speculative candidate and marks old archives without this telemetry as unknown, never green. No unseen card identities or opponent hidden values are logged by this new trace.

- Instrumentation: `simulation/twinleaf/native-policy-tactic-sequence.cjs`, commit `efcdc4f8`.
- Tests: `tests/native-policy-tactic-sequence.test.cjs` (`1e908af3`), comparison `simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs` (`a6419325`) and comparison tests (`c7ba05c0`).
- Existing **manual-only** workflow [39521510683](https://github.com/FlareZ123/experiment-01/actions/runs/39521510683), head `c7ba05c0`, was dispatched with `agent50_native_first_finite_tape=true`. **Result pending** when this note was created. Do not assume it passes or use it as live evidence until checked.
- The typed original selected-action-to-Store-dispatch bridge is independently being requested from Agent23 via `communications/agent23/20261021T0021Z_agent50_native_finite_score_dispatch_handoff.md`. The compiled tactic-sequence findings were handed to the canonical caretaker Agent41 via `communications/agent41/20261021T0032Z_agent50_native_scorer_tactic_rng_divergence.md`.

**Limits:** owner K0/K1 positional knowledge and known-top evidence, hidden-state policy safety, accurate actual source pressure and response, full paper Expanded card fidelity, tournament clock and complete Top32 coverage are not qualified. Current public benchmark is 29/32 exact published opponent 60s, zero qualified competitive games, and no validated 99.5% fixed 60.

## First scored-candidate audit: compiled confirmation (21 October 2026)

**Confirmed:** manually dispatched [run 39521510683](https://github.com/FlareZ123/experiment-01/actions/runs/39521510683), source head `c7ba05c0a5b82769552011817eb3db5b5f91f228`, passed compiled Twinleaf and the expanded pure suite; [artifact 12310679937](https://github.com/FlareZ123/experiment-01/actions/runs/39521510683/artifacts/12310679937), SHA256 `edc76982d265a67e3fc1b6cc86eed9c4badba10d69e459fa41669f73a4d9220e`. All four original historical game controls remained noninterfering, the three same-world parity vetoes and one narrow passing root remain unchanged.

The additional per-evaluation tracer locates the **first diverging speculative candidate**, measured at the same fully canonicalized physical State and authentic original random tape:

| Arm | First mismatched `evaluateAction` | Original result | Detached reconstruction |
| --- | --- | --- | --- |
| Rank6 champion | `PlaySupporterTactic` owner-hand index **0** (evaluation #0) | 40 draws, finite score **-24** | tries 41st draw, score undefined |
| Rank6 NewMoon | `PlayTrainerTactic` owner-hand index **2** (evaluation #2; first two evaluations match) | 40 draws, finite score **69** | tries 41st draw, score undefined |
| Rank11 champion | One `PlayTrainerTactic` evaluation; no mismatch | 5 draws, original score reproduced | strict action and tape parity **PASS** |
| Rank11 NewMoon | `PlayTrainerTactic` owner-hand index **1** (evaluation #1; first evaluation matches) | 41 draws, finite score **235** | tries 42nd draw, score undefined |

The trapped out-of-tape exception is caught inside the speculative `simulateAction` path and produces an undefined candidate score, which can change the choice or leave a tactic without a proposal. The strict outer replay nevertheless marks `Native policy RNG replay exhaustion was swallowed by a tactic` and refuses certification. Matching initial evaluations in two NewMoon arms make an arbitrary upfront bot-setup or tape-offset error less likely; they **do not prove** physical-equivalent simulator behavior inside the later candidate's effect. This is a concrete per-action deterministic-fidelity defect to investigate before hidden-order policy comparisons. There is still **one** narrow qualified replay root, **zero** qualified competitive games and no evidence of 99.5% win rate.

Next experiment should compare the original and reconstructed inner scoring candidate's ordered RNG **call sites** and game-effect paths at the exact original hand index, with a diagnostic extra-draw sentinel if needed. It must retain strict real-tape abort and original-game replay noninterference, use read-only traces, and avoid authorizing a padded tape as valid parity. A difference in random draw count alone cannot identify whether the source is clone semantics, resolver choice or a missing policy history field.
