# Agent 1: real pinned Store tiebreaker epoch reaches the conservative terminal classifier

**7 November 2026.** Positive integration of two independently existing research components, with a strict staging disclosure. The native tiebreaker adjudicator itself remains suspect and no competitive game outcome is qualified.

## Why this was necessary

Earlier I modified `simulation/twinleaf/terminal-transition.cjs` to capture `suddenDeath: state.isSuddenDeath===true` in every actual terminal public before/after snapshot. I modified the shared `simulation/evaluation/terminal-cause-evidence.cjs` so a genuine sudden-death terminal is `tiebreaker-batch-adjudication-unresolved`, never an ordinary final-Prize/no-Pokémon sufficient win. The original [synthetic condition tests](../../tests/agent1-terminal-tiebreaker-epoch.test.cjs) and [green 24-game unchanged v15 native regression](https://github.com/FlareZ123/experiment-01/actions/runs/42335777719) established ordinary-game compatibility, but those 24 real native decisions did not deliberately enter a tiebreaker epoch.

A stronger positive test must show that **the pinned actual Store reaches its real replay state** and that the **same public adapter** actually records `suddenDeath:true` on both sides of the *terminating native dispatch*.

## Independent genuine Store fixture and observed result

I reused **Agent24's existing pinned original 60/60 staged double-KO replay**, which was previously demonstrated to have a seat-biased native tiebreaker conclusion. Its implementation in `simulation/twinleaf/agent24-replay-simultaneous-ko-order.cjs` uses authenticated original Aichi rank20/rank11 sixties, real initial shuffle and Store, a deliberately experimenter-constructed initial tie to invoke native six-Prize replay, source-owned Basic card allocation to maintain Bench conditions, and synthetic lethal Active damage to both sides before invoking the actual `checkState` KO reducer.

The new `tests/agent1-terminal-tiebreaker-native-admission.test.cjs` creates **no replacement deck and no new synthetic engine state**. It temporarily interposes on the adapter's `runMatch` export **solely to retain its actual result** after the existing Agent24 fixture, then restores that export. It asserts the genuine `terminalTransition` produced by `headless.cjs` and invokes the same shared classifier used for ordinary developmental games.

The pinned native receipt proves:

| Field | Observed |
| --- | --- |
| Preserved original 60s | ranks **20 and 11**, selected in Agent24's reverse-seat fixture |
| Native Store replay | true, actual new six-Prize native replay |
| Synthetic intervention disclosure | true, previous tie and simultaneous lethal Active damage were **staged** |
| Native final reported winner | **seat 0** |
| Public terminal snapshot `before.suddenDeath` | **true** |
| Public terminal snapshot `after.suddenDeath` | **true** |
| Independently pending simultaneous Prize result | `PENDING_KO_PRIZES_NO_STRICT_LEAD` |
| Paper-game qualification | **false** |
| Shared `classifyTerminalCause` result | **`tiebreaker-batch-adjudication-unresolved`** |
| Observed sufficient paper-terminal causes | **zero** |
| Summary `tiebreakerUnresolved` / `observedTerminals` | **1 / 0** |

This establishes a real end-to-end native observer-to-classifier path for the new epoch exclusion. The test intentionally **does not repair** the underlying premature native tiebreaker winner. The replay begins from genuine registered physical sixty-card decks, but the synthetic prior tie and double-KO interventions **make this a fidelity fixture rather than a paper-played match**.

## Reproduction

- New `tests/agent1-terminal-tiebreaker-native-admission.test.cjs`, pure observer interposition and actual classification. Parent fixture remains owned by Agent24; neither their fixture nor upstream Twinleaf has been modified.
- Existing manually dispatched `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml` now has a separate opt-in `terminal_tiebreaker_native_admission` boolean and job. It checks out the pinned vendor gitlink, installs/compiles the exact `ptcg-server` and runs exactly one staged native integration test. Its default and developmental 24-game jobs remain independent and unchanged.
- **[GitHub Actions run 42338236053, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42338236053)**, repository checkout `1709f4407611a74c88827af639154df0e452921f`, original vendor commit **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, one compiled native test **1/1 PASS**. Recorded `AGENT1_REAL_TIEBREAKER_EPOCH_NATIVE` witness includes exact before/after true flags, no pending strict Prize lead, and exclusion status.

## Limits and subsequent work

We have now confirmed that the public state flag is a **real native Store property**, so the guard is not a trivially false or invented pseudo-API. This single staging fixture does not establish correct implementation of simultaneous KO resolution, card-specific exceptions, full game length or playing competence. The guard is intentionally conservative: an actual native tiebreaker might already have a valid paper winner; without a complete settled KO batch we withhold certification rather than claim one.

**No paper-legal competitive games qualified. The best fixed 60 remains unselected. The field is 29/32 published original name/count inventories, missing ranks23/25/28. No demonstrated 99.5% win rate.**
