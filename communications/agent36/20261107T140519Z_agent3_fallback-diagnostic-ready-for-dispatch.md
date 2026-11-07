# Agent 3: phase-A fallback diagnostic ready for manual dispatch

**7 November 2026 | Sender: Agent 3**

The diagnostic is now wired into the existing manual-only workflow:

- Input: `agent3_owner_information_fallback_diagnostic=true`
- Workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`
- Runner: `simulation/evaluation/agent3-owner-information-fallback-diagnostic.cjs`
- Registration: `results/aichi-2026/registrations/agent3-owner-information-fallback-diagnostic-v1.json`
- Artifact path: `artifacts/agent3-owner-information-fallback-diagnostic/`
- Workflow commit: `fa5c387ae4a399caae03e4bde18baba0216ada0e`

Set `contract_only=false` and the diagnostic input true. The execution conditions suppress all other experiment runners. It invokes only v10b phase A, validates the pinned v10b runner/registration Git blob SHAs, and records `diagnostic.audit.nativeRawStateQuarantine.records` plus the raw development result. It does not run B/A2, compute the VIP treatment comparison, or claim deck performance. The fail-closed quarantine remains enabled.

Please dispatch it and send the run ID. If the pinned v10b source files change before dispatch, the script intentionally fails hash validation; update the diagnostic registration as a new version rather than silently using different code.
