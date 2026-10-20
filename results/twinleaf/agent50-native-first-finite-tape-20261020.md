# Agent 50: authentic first finite-scored native decision tape, four historical arms

**Date:** 20 October 2026. **Evidence:** retrospective native pinned-Twinleaf policy fidelity, not a competitive matchup. **Pinned vendor:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Compiled manual workflow:** [run 39465546111](https://github.com/FlareZ123/experiment-01/actions/runs/39465546111), source head `162ddca1b78b2dffeb5b36f87e4b4c3d912d68d7`; [complete JSON artifact 12283819505](https://github.com/FlareZ123/experiment-01/actions/runs/39465546111/artifacts/12283819505), archive SHA-256 `2889106bd2e05f7d203e232f25a2e91c42ae2ff0a5e84b6999eb4935b3268dd6` (GitHub artifact digest). The compiled engine and **127/127 configured tests** passed. Four complete historical controls and the four instrumented runs matched their source deals, root-action ledger, public outcomes and noninterference projection; each remains **competitively unqualified**.

## Why the earlier 4/4 parity was too narrow

Previously [compiled native turn-3 replay](../../results/twinleaf/agent18-native-parity-root-tape-binding-20261020.md) authenticated all four original Store roots and selected actions with original RNG counts **0, 0, 1, 1**; these were early owner roots with little or no genuine tactic-score exposure. Even an exact replay at such a root does not certify the bot's scoring-heavy decision policy.

The new opt-in `AGENT50_NATIVE_TAPE_FIRST_FINITE_SCORE=true` pairs `firstFiniteScoredRoot` and `nativeTapeSameWorld`. At each eligible *actual* owner decision, it takes a source-preserving **pre-decode** State snapshot and constructor/options capture, records the full original `Math.random` tape around the actual decision, and selects the first decision returning at least one finite tactic evaluation. Postgame, it constructs the independent common candidate policy around a matching full State clone and demands exact RNG-tape consumption and selected-action equivalence. The original-game source playback remains independently attested. A `sourceStateChangedBeforeFirstScore` flag discriminates mutations before first evaluation.

This run did **not** request a hidden-world contrast. It tests same-physical-world decision fidelity only. The canonicalized source/clone descriptor and alias graph passed in every arm; all four raw prototype-sensitive graph hashes differed because the pinned clone normalizes shadowed dynamic native prototypes.

## Four retained actual observations

| Historical source arm | First finite-scored turn | Finite scores | Genuine policy RNG draws | Same-world replay verdict |
|---|---:|---:|---:|---|
| Rank 6, candidate A, champion reference | 3 | 1 | 40 | **Veto**: reconstructed policy overreads authentic tape; actual action `PlayCardAction` |
| Rank 6, candidate A, New Moon | 3 | 5 | 40 | **Veto**: reconstructed policy overreads authentic tape; actual action `PassTurnAction` |
| Rank 11, candidate B, champion reference | 3 | 1 | 5 | **Qualified same-world parity**: physical clone, full 5/5 RNG consumption and `PlayCardAction` agree |
| Rank 11, candidate B, New Moon | 3 | 6 | 41 | **Veto**: reconstructed policy overreads authentic tape; actual action `PassTurnAction` |

All four `sourceStateChangedBeforeFirstScore` flags were **false**. The three failures returned `Native policy RNG replay exhaustion was swallowed by a tactic`, and the fail-closed tape wrapper correctly withheld replay action and any hidden-order comparison. Therefore only **one of four** first-finite-scored decisions can currently be reconstructed faithfully from the captured physical State, constructor/options and original RNG tape. This is a failure of the replay fidelity gate; it does not prove that the real player made a wrong action or that hidden card identities were consulted.

## Reproducibility and next discriminating experiment

- [Native root observer](../../simulation/evaluation/agent50-bilateral-postgame-root-observer.cjs), [four-arm audit](../../simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs), [synthetic scored-root acceptance and negative control](../../tests/agent50-native-first-finite-tape.test.cjs), and the existing [manual-only compiled workflow](../../.github/workflows/twinleaf-hidden-information.yml).
- A first attempt, [run 39465036031](https://github.com/FlareZ123/experiment-01/actions/runs/39465036031), **passed 127 tests** but explicitly failed historical execution because its workflow input left `AGENT50_FIRST_FINITE_ROOT=false`. Corrected at `162ddca1` before this successful four-arm audit. This failed attempt supplied **no real scored-root evidence**.
- Distinguish **source policy closure state/history** from new-bot constructor state and from the postgame cloning semantics. Inspect the earliest divergence in tactic sequence/score and RNG count *without changing the genuine game*. In particular, the common Field Blower wrapper has remembered `phase`, `lastBlowerSuccessTurn`, and `lastObservedCandidateTurn`; replay creates an independent fresh closure. These fields are a hypothesis, **not an established cause** of the three tape overruns.
- Preserve the native control and source-first ledger. Fail rather than padding the recorded tape, replacing the genuine bot decision, restarting an arbitrary PRNG, interpreting a stale parity report, or counting a hypothetical game.
- Owner-known deck-top, exact K0/K1 history, validated two-player full-game information safety, source continuation, printed paper legality, and tournament clock remain unqualified. Even a successful action-replay does not solve those other gates.

**Status:** 29/32 exact official opposing 60-card lists, missing 23/25/28; **0** competitive-qualified games; no single fixed 60 shown to win 99.5%.
