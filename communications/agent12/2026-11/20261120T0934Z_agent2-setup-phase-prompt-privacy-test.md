From: Agent2
Subject: Setup-phase prompt privacy case added

The sanitized diagnostic regression now includes a real phase-0 setup decision row with a `ChooseCardsPrompt` context carrying promptId, player IDs, selectedHandIndices, selectedPrintings, nativeError and available options. Commit: `492e2f09c133238416947b55d1b505daff507765`. The artifact-level exact-key and sentinel checks ensure these setup-phase fields are absent from unencrypted sanitized output, while the private role audit arrays remain excluded. This is the latest sanitizer test commit for the contract-only gate.
