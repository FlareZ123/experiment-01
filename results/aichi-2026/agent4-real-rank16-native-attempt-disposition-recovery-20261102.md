# Native attempt disposition recovered from the archived rank-16 source campaign

**Agent 4 | 2 November 2026 | post hoc reporting repair on the ORIGINAL existing archive; zero new gameplay.**

## Why the old summary misclassified successful native rows

The [19:20 Critic diagnosis](../../communications/broadcast/20261102T1920Z_critic_native_reporter_contract_repeat_defect.md) correctly identified that the initial rank-16 original-source summary had counted **`missing-native-status:16`**. This was a schema mismatch. The canonical [agent41 development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) returns successful/capped native rows with `finished`, `endReason`, `actionCount`, `turns` and `winner`; **a normal successful native row has no `status` key**. Abort rows have an explicit `status`, such as `engine-error` or `engine-physical-invalid`, and separate archived error evidence. An absent normal-row `status` must not be misread as a missing game.

The publicly archived [16-arm rank-16 source run 41507843137](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137) **completed its native gameplay generation**, despite failing later at a syntactically malformed summary-printing command. Its [raw artifact 13171637457](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137/artifacts/13171637457) has ZIP SHA-256 `a3ab73a08691e0b348767a90363104529b84320b619d749656f8e6c349c6b563`. The unzipped `agent16-rank16-all-16-native-attempts.json` is **15,387,779 bytes**, SHA-256 `9e56a0ae667243b6f003f3f645ed5a34f3c6267077f159b5556044747a36dbdb`. It contains all 16 prescribed unchanged original rank-16 printed-60 source attempts and their complete original development rows, not merely a partial log.

## Correct native-only disposition, no games rerun

A read-only examination of the full original artifact yielded:

| Native original-source result field | Genuine archived count |
| --- | ---: |
| Preregistered/observed native attempts | 16 / 16 |
| Native engine terminal: `finished:true` and `endReason:'engine-game-end'` | **9** |
| Native action limit: `finished:false`, `endReason:'action-limit'`, `actionCount:260` | **7** |
| Normal rows with an explicit `status` property | **0** |
| Explicit native aborts in this particular archive | **0** |
| Source actually started first / second | **8 / 8** |
| Competitively qualified full paper games | **0** |

By unchanged candidate identities, champion-reference has **5 engine terminals / 3 action caps**, while new-moon-lockbreaker-v1 has **4 engine terminals / 4 action caps**. The native engine winners in completed rows are physical seat indicators and are **not** evidence of winning the paper Expanded benchmark. All 16 rows explicitly mark `qualifiesForCompetitiveInference:false`. The original postprocessor's `missing-native-status:16` was an **inaccurate presentation label**. The raw original Store archive remains the factual record.

## Reusable cross-agent contract

I added [one pure canonical attempt classifier](../../simulation/evaluation/native-attempt-disposition.cjs), `aichi-canonical-native-attempt-disposition-v1`, and a batch reconciler that consumes all preregistered trial IDs. It distinguishes:

- `engine-terminal`: only `finished:true` plus `engine-game-end`, never automatically a validated win.
- `action-cap`: `finished:false` plus actual `action-limit`, never a loss.
- `native-abort`: genuine nonterminal native engine error, physical invalidity, or Supporter quota veto, preserving the original raw error label.
- `precheck-rejection`: explicit rejected registration/preflight without live gameplay.
- `unknown`: conflicting or insufficient native fields, including explicit but unsupported status strings.
- `missing-attempt`: registered trial absent from the actual observed-row set.

The reconciler rejects duplicate preregistrations and duplicate observed trial IDs, and separately lists unregistered rows rather than pooling them with the prospective cohort. It is **schema-faithful**, leaves upstream `status` as `rawStatus`, and emits `competitiveQualifiedByReader:false` in every case. Whole-paper qualification is an independent, stronger process.

For regression, [a 16-row faithful schema projection](fixtures/agent4-rank16-native-disposition-projection-20261102.json) retains all actual trial IDs, missing normal `status` fields, real `finished/endReason`, real action counts, turns, native winner seat and unqualified flags, with original artifact SHA as provenance. Its scope is deliberately **only** the disposition-bearing projection; it is not a replacement for the full raw 15 MB archive. [Eight tests](../../tests/native-attempt-disposition-real-rank16.test.cjs) exercise all 16 real native cases, synthetic explicit abort/precheck/contradiction safeguards, missing scheduled arms, duplicates and unexpected rows. They passed the existing lightweight [global evidence gate CI 41510536426](https://github.com/FlareZ123/experiment-01/actions/runs/41510536426), checkout `4d681cf44be9cec2d4129f9c707f71d45f87d81e`, with **no new games or vendor changes**.

## Required integration and limitations

Use `summarizeNativeAttempts(rows, scheduledArms().map(x=>x.id))` in future **versioned** original-source reports; keep the existing historical frozen raw archive immutable. Before promoting `engine-terminal` to a competitive paper outcome, separately audit original-source strategy, legal card transitions, opposing policy, turn/prize/clock correctness and game end. A public opponent root following a source Pass is a chronology witness, never automatically a consequential response.

This helper has **not yet been integrated into every existing reporter**. Report owners should adopt it with versioned attribution only after examining their own source row schema; older non-agent41 schemas may differ and should not be silently reclassified. The corrected rank-16 9/7 disposition is a reporting recovery, **no direct improvement to deck strength**.

**Global stop line remains 29/32 authenticated original sixties, 0 competitively qualified games, no selected fixed 60 demonstrably at 99.5%.**
