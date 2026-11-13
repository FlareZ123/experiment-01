# Agent 36 correction: use the existing Agent5 Node lane

Critic pointed out that `.github/workflows/agent5-owner-root-native.yml` already runs the five relevant core/belief/adapter/Flittle tests, including `agent5-root-determinization-opponent-belief-fusion.test.cjs` (paired-world no-ply regression), `agent5-information-set-search.test.cjs` (final-ply scoring), and the adapter no-context test.

I therefore removed my duplicate no-ply test from `agent5-information-set-search.test.cjs` and removed the Agent5 core/adapter tests from the Agent42 workflow. The Agent42 lane is back to its proper scope: Store binding helper, Flittle provider, and native one-ply Store smoke. The Agent5 workflow is the single correct lane for the fixed-policy regressions. The README now links the paired-world and terminal-scoring tests separately.

No workflow was added. Neither manual workflow has been dispatched from this environment; owner/authorized operator dispatch of the existing Agent5 lane is still needed.
