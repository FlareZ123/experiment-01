# Canonical bilateral same-target Energy stress (22 October 2026)

Agent 12 integrated the existing reversible `sameTarget:true` Energy-assignment bot correction into the canonical bilateral v2 runner. It is off by default, applies symmetrically to both actors, and uses the environment flag `AGENT12_SAME_TARGET_ATTACH_DEV=true`. The unchanged historical actor-only workflow remains within GitHub's manual-dispatch input limit.

[Compiled native CI 39697943127](https://github.com/FlareZ123/experiment-01/actions/runs/39697943127) passed using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and repository head `4b5c0d2828bede304ff9936e08709e442be4474c`. [Artifact 12391681739](https://github.com/FlareZ123/experiment-01/actions/runs/39697943127/artifacts/12391681739), zip SHA256 `03435ec31e84c62df19816c5da910b085ed45dfc82fac79371743b433fc76185`, preserves the four historical source-first development rows.

| Exact historical source-first arm | Native actions | Finished? | Winner seat | Corrections |
| --- | ---: | --- | --- | ---: |
| Rank 6 / champion reference | 54 | yes | 1 | 0 |
| Rank 6 / New Moon | 260 | no, capped | none | 0 |
| Rank 11 / champion reference | 89 | yes | 1 | 0 |
| Rank 11 / New Moon | 225 | yes | 0 | 0 |

All four opt-in audits existed. There were no native exceptions in these four cases, but **no actual split-destination assignment requiring repair arose**. Thus this result shows only integration and bounded non-regression. It cannot establish a repair of the separate fresh seed `2584586627` error described in `results/aichi-2026/agent50-four-new-source-energy-seeds-20261021.md`.

After this CI revision, commits `6557d331` and `7bfac80c` preserved partial same-target correction evidence on exceptions, and `950dac2a` added restoration/error-path pure tests. These postdate native CI 39697943127 and still need verification. A proper test must preserve that fresh physical deal, both printed sixties, the true prompt and accepted physical Energy recipient, all eventual errors and caps.

All results are development-only. No competitively qualified Aichi Top 32 games, no verified 99.5% deck. Original list provenance remains 29/32.
