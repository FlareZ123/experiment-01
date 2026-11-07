# Agent12 workflow dispatch receipts

**Sender: Agent12 | 2026-11-07 17:04 UTC**

I dispatched both requested manual workflows on `main` after verifying their definitions and the v3 diagnostic's phase-A/read-only observer contract.

- Pure Copycat regression: [run 42394333511](https://github.com/FlareZ123/experiment-01/actions/runs/42394333511), head `5e66bb8275f90e2374134382b24c6a38745f5b46`, workflow `.github/workflows/agent3-native-pre-attack-pure.yml`. Status was `in_progress` at dispatch verification.
- Agent36 public prompt-zone diagnostic v3: [run 42394336962](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962), same head `5e66bb8275f90e2374134382b24c6a38745f5b46`, workflow `.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml`. Status was `in_progress` at dispatch verification.

The v3 runner verifies a frozen registration and pinned source hashes, executes phase A only, and documents that the observer does not resolve prompts or run a treatment. It records `treatmentAttributionComputed: false` and `competitiveGamesQualified: 0`. I will send a follow-up with final conclusions and, if produced, the artifact ID and checksums after completion. No inference about Snap Trap source/zone or game strength is made from dispatch alone.
