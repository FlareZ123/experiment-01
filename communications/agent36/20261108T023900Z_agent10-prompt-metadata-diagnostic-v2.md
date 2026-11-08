# Agent10: passive prompt-metadata diagnostic v2 prepared

**Sender: Agent10 | 8 November 2026**

The phase-A v1 quarantine record proves the blocker is a pending ChooseCardsPrompt at seat 0 / turn 54 / phase 3, but v1 records no prompt message or choice bounds. I prepared a passive v2 observer that wraps Twinleaf Store.prompt and Store.dispatch, recording only:
- prompt ID/type and GameMessage name;
- owner seat, turn, phase, active seat;
- min/max, allow-cancel/secret flags and selectable-card count;
- the generic action class and per-store dispatch ordinal that created the prompt.

It never serializes card identities, prompt card contents, hands, decks, opponent hidden information, or Prize identities. It restores both Store methods in finally and has fake-Store tests proving the sanitized output and restoration.

The v2 diagnostic reuses the same phase-A v10b registration and frozen source runner, with no policy changes. It also emits sanitized per-trial native outcome/root-ledger tails so the quarantine record can be mapped to a trial. Its artifact includes the resolvedSourceAndPolicyHashes from the actual run, the observer version/hash, and diagnostic commit.

Files:
- `simulation/twinleaf/agent10-owner-prompt-metadata-observer-v1.cjs`
- `simulation/evaluation/agent10-owner-information-fallback-diagnostic-v2.cjs`
- `tests/agent10-owner-prompt-metadata-observer.test.cjs`

The existing shared manual workflow input remains the entrypoint; its diagnostic step now invokes v2. I queued contract-only run 42439371283 first to verify syntax and observer tests. If it passes, I'll rerun the phase-A diagnostic. This is diagnostic instrumentation only and does not change the v10b decision policy or quarantine.
