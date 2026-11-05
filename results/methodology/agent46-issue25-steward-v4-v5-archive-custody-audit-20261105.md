# Independent steward v4/v5 archive custody audit and source-root denominator

**Agent 46 | 5 November 2026 | DEVELOPMENT ONLY | 0 competitively qualified games**

## Actual contribution

Created [independent steward receipt auditor](../../simulation/evaluation/agent46-issue25-steward-archive-audit.cjs) and [ten adversarial regression tests](../../tests/agent46-issue25-steward-archive-audit.test.cjs). This **read-only** analysis consumes the exact bytes of the already selected Agent36/Agent1 native public JSON plus detached SHA-256 sidecar, selects historical v4 or v5 **before inspecting outcomes**, and produces a compact all-eight source Pass / source Attack / nonprompt action denominator.

The frozen registration is eight original-source rank6/rank11 trials, and the auditor requires exact registration/return/attempt identity, actual raw trial identity, correct fixed source seat (A→1, B→0), historical selected policy entry point and 48-root cap. It checks the complete 0-based native accepted root ordinals, seat/turn labels, untruncated public root count, computed root hash and separately reported engine root hash when available. It rejects malformed receipt promotion to a competitive-game claim. A missing runner-reported digest is a separately reported uncertainty.

The existing [selected v4 archive](agent36-issue25-steward-v4-native-20261105.md) and [same-start v5 treatment](agent36-issue25-steward-v5-prize-promotion-20261105.md) were published through the existing Agent1 writer. This new independent audit is deliberately separate from the producer. **It has now downloaded and verified the actual native ZIP archive in a successful GitHub Actions run** (details below).

## Verification achieved

Local Node **v22.16.0** and independent GitHub Actions runner: **10/10 pure tests PASS**, including duplicate/missing registered IDs, altered raw ID, sidecar tampering, incorrect selected v5 entry point, source seat inversion, noncontiguous accepted ordinal, inflation of claimed root count, truncated ledger, a history edit with a newly recomputed outer checksum but stale internal digests, and missing original runner digest.

These are **synthetic verification fixtures**; 8 synthetic source Pass roots do not describe eight observed native Passes. Real [v5 source census](agent8-issue25-native-v5-source-action-starvation-20261105.md) currently reports 33 source Pass roots, zero native source Attack roots and 7 source PlayCard roots across the eight actual original-source attempts. Those real v5 native counts were independently reproduced in the current CI receipt.

## Scientific interpretation and proposed use

A successful output is `PASS-bounded-file-and-root-custody`. It validates only that the input receipt is internally consistent and that its detached hash matches the byte sequence. It does **not** establish provenance of a checksum re-signed by an adversary, paper-valid payment, owner-visible alternative at Pass, opponent competence, source tactical payoff, 25-minute paper adjudication or any field win rate.

Import `inspect(Buffer, sidecarString, 'v4'|'v5')` into a downstream CI receipt consumer after downloading the actual selected archive. Require `integrity` and independently check output counts against the published native raw census. Preserve failed controls and capped trials. A source Pass remains an observation, and possible legal alternatives require an owner-visible contemporaneous board/hand inspection as requested in the [5 November Critic direction](../../communications/broadcast/2026-11/20261105T171205Z_critic_source_pass_opportunity_and_bilateral_payoff_gate.md).

No new runner, policy wrapper, vendor edit, workflow, benchmark result or candidate 60 was introduced. The next release decision still needs a **paper-payable source action, settled attack/control payoff, and meaningful opponent response**, plus the separate eligibility gates. There are 29/32 authenticated name/count source inventories; ranks23/25/28 remain missing; competitive games qualified: **0**.

## Actual existing-archive verification, 5 November 2026 20:47 UTC

Executed the already existing manually dispatched [bilateral archive audit workflow](../../.github/workflows/aichi-bilateral-pass-archive-audit.yml) using a new **opt-in** `steward-v4v5` choice and `source_run_id=42059191496`. This consumes the already archived *same-start* actual native v4/v5 JSON files. No new games were executed and no Twinleaf compilation or policy change was introduced.

- [Workflow run 42106652625](https://github.com/FlareZ123/experiment-01/actions/runs/42106652625), head `9a15721daa84398b0aba507acb1eb80c3ecf5dd1`, overall **SUCCESS**. Job `127523122156` passes pure tests, downloaded native archive, and exact JSON+checksum independent audit stages. GitHub Actions validated ZIP digest `sha256:b85d014b6abb84cb82394fc3db483751ba85ff5d2cd99f173330afcc544a73e3` for existing artifact `13432225055`.
- v4 verified internal JSON digest `d837fb4d7e8ed80207b535071eb2b8c606f9b9888c9aa3902557e2d8de517e89`, **8 registered / 8 returned**, **0 missing/truncated root ledgers**, **0 unknown native ledger digest**, no failures or warnings: `PASS-bounded-file-and-root-custody`. Independently counted **30 original-source Pass roots, 6 original-source nonprompt/nonpass roots, 0 original-source Attack roots**, and 229 prompt roots across both physical seats. Six capped arms, two engine errors (rank11 seed102 A both contenders).
- v5 verified internal JSON digest `22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17`, **8 registered / 8 returned**, **0 missing/truncated ledgers**, **0 unknown native ledger digest**, no failures or warnings: `PASS-bounded-file-and-root-custody`. Independently counted **33 original-source Pass roots, 7 original-source nonprompt/nonpass roots, 0 original-source Attack roots**, 244 prompt roots across both seats. Seven capped arms, one engine error (rank11 seed102 A New Moon).
- The v4/v5 native source action differential is partially **censoring-dependent**: one originally aborted rank11 champion arm reaches the cap under v5. The extra three source Passes and one source nonprompt/nonpass action arise from additional observed roots, not a certified per-decision strategic improvement. Comparisons of frozen physical openings remain the separately verified Agent36 source pairing evidence.
- The independent audit includes all error/cap statuses. A native root digest is evidence of historical Store event continuity, **not** a certification of paper-payable hand cost, owner decision opportunity at Pass, competent original-source attack line, actual opponent reply, clock compliance, or a completed competitive game.

**Research consequence:** archival identity and source-root census are no longer an outstanding integrity uncertainty for these exact historical v4/v5 JSONs. Their causal gameplay/paper-qualification vetoes remain intact. The next useful intervention must address the original source's decision frontier and actual paid attack or control payoff on genuine source-owned turns. No fixed 60 or win-rate conclusion follows from these observations.
