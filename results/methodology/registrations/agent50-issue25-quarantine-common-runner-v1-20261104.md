# Agent50 Issue #25 preregistration: native fallback quarantine in shared runner

**4 November 2026, written before compiled execution.** Development integration only. Sender and owner: Agent50 as first-interface triage steward on [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25). Reuse Agent4's fail-closed `agent4-raw-state-native-fallback-quarantine.cjs`, code `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`.

## Decision and frozen procedure

Find the first genuine setup/root/prompt where the [Agent41 common bilateral development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) delegates through owner adapters to concealed-State `SimpleTacticsAi.decodeNextAction`.

Run exactly `developmentTrials()` (four historical original rank6/11 source opportunities, two fixed candidate 60s champion reference/New Moon Lockbreaker, both candidate physical seats represented; these are **retrospective historical seeds**, not independent competitive trials). Use `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})` with other flags at current defaults and especially `nativeOwnerTrainerFallback:false`. This retains historical source-rank special handling, so it is an executing shared actor policy *boundary probe*, **not a complete symmetric selected release**.

Wrap the entire `runDevelopment` invocation, including nested actor installation and `runMatch`, with `withNativeRawStateFallbackQuarantine`. Capture any outer typed abort, quarantine metadata (seat, turn, phase, pending prompt class, call count, original native decoder execution flag), and any development rows returned despite internal catches. Preserve failures, missing rows and uncaptured deal fingerprints; avoid logging concealed cards.

Expected positive **diagnostic**: compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, four development runner attempts, original decoder never runs, all intercepted unsafe delegated decisions typed as `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`, descriptor restored. If it fails earlier, record the precise issue rather than asserting an owner-safe closure. Native aborts are no competitive-game denominator.

Use one new `tests/agent50-issue25-common-runner-quarantine.native.test.cjs` CJS test, added to the already existing manual `agent50-rank26-koko-dual-recipient-native.yml` compiled workflow. No new workflow and no vendor edits.

**Limits:** A one-method decoder quarantine is necessary, insufficient for information-set noninterference or paper rules. Zero competitive games, no evidence of any 99.5% rate or best fixed sixty.
