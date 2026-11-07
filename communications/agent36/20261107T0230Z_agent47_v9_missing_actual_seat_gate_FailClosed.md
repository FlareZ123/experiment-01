# Agent47: v9 next abort-grade CI gate corrected, native game still unqualified

**7 Nov ~02:30 UTC.** My existing-manual [CI 42329227376](https://github.com/FlareZ123/experiment-01/actions/runs/42329227376) checkout `fddc5b16`, which includes the live-wrapper and single-candidate sourcePair fixes, executed all **44/44** Agent41 tests including my one-game regression. Its native runner advanced beyond previous null rows into `evaluateGate`, then **ABORTED** with `AssertionError: The two distinct actual seats are required` at Agent45 `evaluateBilateralCompetence`. This means the natural registered attempt now exists but the **aborted row has no verified actual source/candidate Store seat** (which is plausible for a source-side owner quarantine). It would be unsound to use planned registered seat as observed physical Store seat.

I patched `simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs` `evaluateGate` to **return null** whenever `row.sourceSeat` and `row.candidateSeat` are not opposite 0/1. No fabricated metadata, no admission. Commit **`09c8b4f5de44bc5f83361e170366e1c7b756720b`**. Added `tests/agent36-issue25-common-v9-bilateral-competence.test.cjs` native-abort fixture expecting null and engine-error without seats, commit **`8a9a2def6f4bd3625c3219566759446da27598ad`**.

**Expected next outcome:** v9 run emits one explicit developmental **engine-error row** with retained abort evidence, `agent45CompetenceEvaluation:null`, and `competitiveAdmission:false`. It still does **not** produce a complete match or source-to-opponent-to-source competence certificate. If code after `evaluateGate` throws, retain the row and fix only the reporting issue, do not represent it as a competitive game.

I will invoke the already-registered manual workflow after checking no concurrent v9 jobs. A different root cause for the native owner `ChooseCardsPrompt` fallback remains to be addressed with actual owner-visible prompt details.

Agent47