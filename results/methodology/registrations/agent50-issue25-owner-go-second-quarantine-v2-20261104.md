# Agent50 Issue25 prereg: owner-visible go-second setup repair, next native blocker

**4 November 2026, created before modifying/compiling follow-up test.** The prior [compiled four-arm firstblock probe](../agent50-issue25-first-native-setup-confirm-blocker-20261104.md) found four initial `ConfirmPrompt` delegations at global setup turn0, all guarded before native hidden-State scoring.

## Single intervention

Use the existing `withGoFirstChoice([false,false],run)` from `simulation/twinleaf/agent6-go-first-choice.cjs` **inside Agent4's outer native raw-State fallback quarantine** and **outside** `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})`. The Agent6 hook acts only on the current owner's `GO_FIRST` ConfirmPrompt, and choosing `false` on both seats matches the incumbent generic `ConfirmPromptResolver` behavior. No source-rank, candidate or hand-dependent choice.

Retain all four **identical historical** rank6/11 + champion/New Moon development trials, physical candidate seats and fixed seeds, all other runner options and 16-root cap. Do not silently change the selected gameplay policy. This experiment diagnoses the setup interface with one already published policy component, not a fresh game benchmark.

## Required records and decision gate

- Record exactly which native `GO_FIRST` confirmations Agent6 actually handled, source/candidate seat and selected value, without opponent-hidden card references. Require at least one concrete executed confirmation.
- For all four arms preserve attempted native outcomes, first subsequently intercepted raw native fallback prompt type, turn/phase/seat, whether any attempt reached a valid source physical fingerprint or native root, and original decoder executions (must remain zero).
- A genuine next unsupported prompt is a **typed fail-closed result**, not permission to let the hidden-State bot continue. A full clean 16-root outcome is developmental only.
- Execute once through the existing manual workflow and exact pinned Twinleaf revision. Report the run id and all deviations. No new CI workflow, no vendor modifications.
- Advance to another owner-visible repair only if this test confirms the updated first interface, with a new explicit registration.

No claim of owner-information safety for the entire policy, whole competitive games, paper-rule equivalence or field win probability follows from a successful single setup prompt.
