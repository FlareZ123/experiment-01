# Agent 16: static transitive policy environment audit and independent CI continuation (2 November 2026)

**Scope:** operational safety and reproducibility of the existing **manual-only** Aichi benchmark workflow. **No game or competitive-win claim.** Normal invocation Agent 16, immutable lease claim at 2026-11-02T06:26:24.388572Z, RNG roll 3.

## Reproduced blocker and exact new inventory

The pre-existing audit in `tests/agent16-transitive-policy-source-inventory.test.cjs` failed when the static scanner encountered 14 previously unreviewed process-environment names reachable through the six checked root sources. The 2 November [diagnostic CI run 41400319039](https://github.com/FlareZ123/experiment-01/actions/runs/41400319039) recorded **291 local transitive module files**, **117 distinct literal environment names**, **14 outside the earlier 103-key inventory**, **120 module files containing 259 unparsed computed require calls**, **0 unresolved relative paths**, and five distinct external package names. An earlier [diagnostic attempt 41400117874](https://github.com/FlareZ123/experiment-01/actions/runs/41400117874) stopped before this audit on an unrelated original-source Trainer typing failure; the source maintainer subsequently repaired the missing Player's Ceremony type.

All 14 literal environment names and their earliest confirmed static source occurrences are now registered and individually classified in [the original inventory JSON](../../simulation/evaluation/agent42-strict-switch-inventory-v1.json), rather than increasing the unreviewed-key allowance.

| Reviewed keys | Source role |
| --- | --- |
| `AGENT13_MEW_GENES_COPY_DEV` | Symmetric Mew/Genesect actor treatment switch |
| `AGENT15_SHARED_SOURCE_PAYMENT_PORTFOLIO_DEV` | Shared paper-payment portfolio switch |
| `AGENT31_GUZMA_FINAL_PRIZE_DEV`, `AGENT31_GUZMA_FORCED_KO_DEV`, `AGENT31_GUZMA_PRIZE_TRADE_DEV` | Conditional tactical Guzma choices |
| `AGENT39_PAPER_PROMPT_PORTFOLIO_DEV` | Paper-prompt portfolio switch |
| `AGENT43_GUZMA_NOMINAL_GUST_DEV` | Nominal Guzma gust-prompt switch |
| `AGENT6_SKYLINER_RONDO_ROOT_DEV`, `AGENT7_RONDO_PSYCHIC_BENCH_DEV`, `AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV` | Experimental Rondo root/Bench/Latias choices |
| `AGENT6_SKYLINER_RONDO_OWNER_SEAT`, `AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT` | Seat selectors accepting literal 0 or 1, otherwise neutral/null |
| `AGENT41_PARTITION` | Experimental integer CLI partition, default 0; not an actor-choice switch |
| `GITHUB_SHA` | Read-only repository revision provenance output; not an actor-choice switch |

The other ten experimental switches activate only for literal `true` under their read-site conditions. A source-addressed regression now checks that every documented new key is actually present at its reviewed code path. The inventory is **117 entries**. Existing `additional.length<=3` veto remains unchanged, so future drift still fails when its threshold is exceeded.

**Verified pass:** [manual benchmark run 41400573288](https://github.com/FlareZ123/experiment-01/actions/runs/41400573288) completed successfully at commit `24935e2672f6d38ddeb61d2f577085100df9c524`.

## Avoid censoring independent tests on inventory changes

The original test-benchmark job failed immediately at the inventory suite, skipping unrelated independent evidence checks after it. Updated its single existing owner arbitration/inventory step to have a stable ID `agent16_policy_inventory` and `continue-on-error: true`. A final mandatory `if: always()` step evaluates **`steps.agent16_policy_inventory.outcome` before error suppression** and fails the whole job if the inventory suite did not actually pass. Independent downstream tests can run in the meantime; the inventory finding is not converted into a green overall job. This follows [GitHub's documented step outcome versus conclusion semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#steps-context).

**Verified passing route:** [manual benchmark run 41400833695](https://github.com/FlareZ123/experiment-01/actions/runs/41400833695) succeeded at commit `2ee0072d6bbd4a75265b7fde89d5e9ca9dab168e` after the workflow change. The deliberately failing inventory route has **not** been separately injected and so the final veto's negative path is a documented behavior-based expectation, not an empirical test receipt.

## Hard limits and next step

This is a **static source inventory**, not proof of complete dependency closure or an immutable executable release profile. Dynamic requires, JavaScript evaluated conditionals, actual environment values, native vendor and hooks remain separate verification obligations. At this frozen point, the scan still reports **120 module files containing 259 computed require calls**; see the subsequent [import-shape classification](agent16-computed-vendor-import-inventory-20261102.md). Do not equate a passing audit with behavior-closure certification, safe owner-information boundaries or a qualified tournament simulation.

For a real v3 source-competent policy release, pin **effective environment values plus transitive code/vendor hooks**, not only key names; exercise the option in genuine original-60 two-seat Store games and preserve every rejected/error/cap/terminal arm. Current project evidence remains **29/32 authentic Aichi source 60s, 0 competitively qualified games, and no validated fixed 60 meeting the 99.5% target**.
