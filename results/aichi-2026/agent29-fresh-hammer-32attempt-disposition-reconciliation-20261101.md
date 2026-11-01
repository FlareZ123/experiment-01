# Agent 29: preregistered original-source Hammer cohort, archive reconciliation

**1 November 2026.** This is a post-run, read-only audit of the 30 October original-Store experiment. No candidate or opposing printed 60, seed, start order, physical deal, game execution or previous artifact was changed. **Evidence class:** original native Store action receipts with independently reclassified terminal/censored attempts. The 99.5% objective remains wholly unverified.

## Reproducible inputs

- [Preregistered 8-trial / 16-physical-attempt protocol](registrations/agent29-fresh-hammer-8arm-20261030.json), registered 2026-10-30 00:22 UTC before running any trial; four independent seed values, two fixed candidate 60s, original rank-6 Iron Thorns 60.
- [Original successful manual compiled CI](https://github.com/FlareZ123/experiment-01/actions/runs/40979911183): research HEAD `9036308a53eccddf1492126e9a84a4ef7548289b`, upstream Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Unmodified complete eight-trial JSON artifact](https://github.com/FlareZ123/experiment-01/actions/runs/40979911183/artifacts/12943618821), ZIP SHA256 `48227ba48f48deb42f5a90af74ccef6a830f986e2c75a6a98b78857fa235aa3a`, one member `agent29-fresh-hammer-8arm.json` (31,804 bytes). The native workflow completed successfully; the existing archive is retained verbatim.
- Registration froze ten research source blobs, original roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, 260 root-action limit and both actor-seat positions. All eight OFF/ON source initial fingerprints and true starting seats match; there are **four unique source first-deal fingerprints** shared across candidate decks. Six of eight trial pairs actually had the source first.

## Authenticated paired actions and completeness

Each trial consists of baseline Hammer-off and treatment Hammer-after-Pass on the *same* registered source physical deal. `H/T` are original native Store coin heads/tails in the treatment; `discard` counts physical opposing Energy entering discard. The final column is the **true game disposition for both original physical attempts**, derived independently from `finished` and the preregistered action cap.

| Rank6 original / candidate trial | Source first | OFF/ON roots | Accepted source Hammer | H/T | Physical Energy discarded | Both attempts |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| repeat0 seat A / champion | Yes | 68 / 70 | 1 | 0 / 1 | 0 | Engine terminal |
| repeat0 seat A / New Moon | Yes | 106 / 110 | 2 | 0 / 2 | 0 | Engine terminal |
| repeat0 seat B / champion | Yes | 260 / 260 | 3 | 2 / 1 | 2 | **Action cap** |
| repeat0 seat B / New Moon | Yes | 260 / 260 | 3 | 2 / 1 | 2 | **Action cap** |
| repeat1 seat A / champion | No | 26 / 26 | 0 | 0 / 0 | 0 | Engine terminal |
| repeat1 seat A / New Moon | No | 260 / 260 | 2 | 2 / 0 | 2 | **Action cap** |
| repeat1 seat B / champion | Yes | 260 / 260 | 1 | 0 / 1 | 0 | **Action cap** |
| repeat1 seat B / New Moon | Yes | 251 / 250 | 2 | 0 / 2 | 0 | Engine terminal |
| **Total** | **6/8** | **16 attempts** | **14** | **6 / 8** | **6** | **8 terminals, 8 caps** |

All 14 accepted source Item roots were `Crushing Hammer POR`. The six physically verified removals were `Psychic Energy MEE`. The two fixed candidate decks contributed zero newly accepted Hammer roots under this treatment. No source Hammer root was native-rejected. No completed engine winner changed in the four same-deal terminal pairs; four other pairs were capped in *both* branches. Native engine labels are unqualified; this is **not** evidence of card win-rate effect or candidate strength.

## A concrete original summary accounting defect

The preserved original artifact reports `nativeAbortOrCapCases:0`. Its producer formerly computed this from `row.status ?? 'settled'` and considered only `status !== 'settled'` an abort/cap. However the original Store runner emitted `finished:false, actionCount:260` for **eight** capped physical attempts *without* an explicit `status` or `capped` field. Their transport status therefore defaulted to `settled`, incorrectly hiding every capped game. This is a reproducible failure of the summary field, not of the underlying original Store history.

[Research-owned disposition function](../../simulation/evaluation/agent29-fresh-hammer-disposition.cjs) now explicitly classifies `engine-terminal`, `action-cap`, `unresolved`, and typed native failures from original physical attempt fields and the registered cap. The [registered experiment runner](../../simulation/evaluation/agent29-fresh-hammer-registered-cohort.cjs) exposes `gameDisposition` and a failure-inclusive aggregate while preserving the old transport `status` field for consumers. [Regression cases](../../tests/agent29-fresh-hammer-disposition.test.cjs) retain the eight archived physical trial pairs as a minimal root-count fixture, plus early abort/short-unresolved controls. Existing archival JSON is intentionally unchanged; its incorrect summary must be overridden using the physical rows.

**Corrected source-archive count: 16 attempts, eight engine terminals, eight 260-root censored attempts, zero typed native failures, zero shorter unresolved attempts.** The declaration `nativeAbortOrCapCases=0` in the original JSON is invalid. Under the corrected meaning the count is **eight**.

## Interpretation and integration boundary

This independently seeded original-source cohort proves that an owner-visible, native-`canPlay`-checked after-Pass chooser can activate real Crushing Hammers on both physical seats, with six genuine opposing Energy removals and no observed native rejections in this archive. Its intervention did not improve outcomes among the four terminal pairs, while half of the physical attempts remained action-censored. It never contested a non-Pass action or established the high-value [Crushing-before-Plumeria T3 counterfactual](agent25-rank6-crushing-first-stochastic-option-20261030.md); that remains untested at its exact source root. No newly executed paper-contract portfolio / Night Watch guard, 25-minute clock, source policy-quality certification or all-32 opponent comparison is present here.

**Release verdict:** positive source-owned Trainer execution witness; **zero competitively qualified games**. Keep the complete matched denominator, and do not use the original archive's zero-caps summary as evidence of completion. The cross-archetype fixed-60 and common paper-prompt release gates remain open.
