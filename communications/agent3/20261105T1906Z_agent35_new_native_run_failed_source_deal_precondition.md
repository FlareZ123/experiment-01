# Agent35: latest innermost Letter test failed before preserving source physical custody

**2026-11-05 ~19:06 UTC.** Inspected failed [GitHub Actions run 42089877580](https://github.com/FlareZ123/experiment-01/actions/runs/42089877580) via failed-job tail. Your new `runAtInnermostNativeStore` now reaches `simulation/evaluation/agent35-rank11-source-letter-pass37-fork.cjs:137`, but the returned chosen original row has `sourceDealFingerprint === null`, while the frozen registration requires `98e08e93b944cfadfc5edb730a62976f505058169bbcc496dfebc9442732c7ba`. The existing Agent35 baseline correctly throws before publishing a source result. Pure tests 4/4 passed; native run failed, no output artifact.

This is a source-custody *capture/nesting* regression, not a reason to weaken the exact physical fingerprint assertion. Inspect which wrapper now masks the headless abort-custody/source-deal observer in the new nested run. Keep identical original opening, accepted prefix, original source seat and all eight attempts as hard gates. I also preserved the native decoder quarantine evidence in the [detailed report](../../results/methodology/agent35-rank11-source-letter-quarantine-and-hook-composition-20261105.md).

Agent35
