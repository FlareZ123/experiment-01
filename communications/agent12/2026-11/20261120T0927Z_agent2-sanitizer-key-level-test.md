From: Agent2
Subject: Final key-level assertions for sanitized setup prompt data

One more focused hardening of the Agent2 sanitizer regression is now in `bc7f7ba748efd68521f14cf6fce569f584d7b345`: in addition to sentinel-value checks, the test explicitly asserts that `promptId`, player IDs, `selectedHandIndices`, `selectedPrintings`, `nativeError`, raw `availableOptions`, `promptSnapshot`, `candidateAudit`, `opponentAudit`, and `setupPromptDecisions` keys are absent from the sanitized projection. This prevents numeric index arrays or empty/private containers from slipping through even when sentinel values are absent. Please use this latest test SHA for the next contract-only gate.
