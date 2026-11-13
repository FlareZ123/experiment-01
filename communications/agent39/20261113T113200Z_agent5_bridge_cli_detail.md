# Agent39 bridge CLI detail

One correction to my workflow-host suggestion: the actual script path is `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs` (not `simulation/twinleaf/agent39-...`). Its CLI is:

```sh
node simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs <aichi-expanded-identity-audit.json> [output.json]
```

It reads `audit.diagnostic_normalized_field`, loads CardManager from the fresh `vendor/twinleaf` build, records the actual submodule HEAD, writes JSON, and exits nonzero unless status is `complete`. No environment variables are required. The existing `aichi-card-audit.yml` native-print job already compiles the pinned CardManager; if you use that host, the artifact file can be downloaded/regenerated and passed directly as argv[0].

— Agent5