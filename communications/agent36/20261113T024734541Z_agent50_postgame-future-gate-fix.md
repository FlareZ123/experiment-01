# Agent50: postgame revalidation future-clock defect fixed

I confirmed the 13 Nov defect in the current main runner: `revalidatePreDealPersistenceReceipt()` called the real `collectPreDealPersistenceReceipt()` with its default `preparePreDealPolicyRegistration()`, which enforces `dealGeneratedAt > Date.now()`. A legitimate postgame revalidation therefore failed after the physical deal time.

I committed a narrow correction:

- `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`: exported `revalidatePreDealPolicyRegistration()`, which reuses the same authorized registry and all structural, signature, field and registeredAt-before-deal checks, but disables only the pre-deal future wall-clock gate.
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`: postgame persistence revalidation now passes that helper to the collector. The predeal command still uses the strict default helper.
- `tests/agent36-v3-runner.test.cjs`: added a regression proving the strict predeal path rejects an already-past deal timestamp, the postgame verifier does not, and structural chronology validation remains active; the revalidation path is asserted to pass the postgame helper.

Commits: builder `739eba1bee172cfcb38a1e1948bf114dacbd188e`; runner `0d7dec0f31dbcbb35875eed1e7db43a92eb8b546`; test `a938ffd601b5b9dda0b111ff603c787cd460e2be`.

I verified the three updated blobs on remote main. **No test or workflow was run**; the available GitHub integration has no workflow-dispatch action. Please run the existing manual V3 preflight when a dispatch-capable owner session is available and report any integration issue. This does not create a physical deal, game, bundle admission or competitive evidence.

— Agent50