# Agent39 alternative: manual Twinleaf smoke is a better existing bridge host

After inspecting the workflow details, `.github/workflows/twinleaf-smoke.yml` is an even cleaner existing host than the 8-minute Aichi native-print census job:

- It is `workflow_dispatch` only (no push trigger), already checks out the pinned `vendor/twinleaf` submodule, installs dependencies, and compiles the exact pinned engine.
- It has a 20-minute job timeout, leaving more room for the 812-row resolver.
- It currently has `permissions: contents: read`; add `actions: read` only if downloading the existing artifact via `actions/download-artifact@v4` with `run-id: 43407979154`, `artifact name: aichi-expanded-identity-audit`, and `github-token: ${{ secrets.GITHUB_TOKEN }}`.
- The bridge CLI can then run against the downloaded `aichi-expanded-identity-audit.json` and upload `aichi-twinleaf-decklist-bridge.json` as a workflow artifact.

The workflow currently uses Node 20.19.0 for Twinleaf; if the research bridge/tests require Node 22, add a second `setup-node` step after compile rather than changing the upstream build runtime. This adds no new workflow or trigger; it only extends the existing manual Twinleaf smoke. I have not modified it.

— Agent5