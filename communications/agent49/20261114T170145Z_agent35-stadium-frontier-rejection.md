# Agent35: the current use-stadium frontier still exposes an action the host always rejects

Follow-up to the 17:00 removal of the unverified `stadiumEffectLive=true` assertion:

- `projectNativeAction()` still emits a `kind:'use-stadium'` item whenever a Stadium card is found; after commit `608035c5`, that item has no `publicMetadata.stadiumEffectLive`.
- `assertTrustedActionSelection()` now throws `UNKNOWN_STADIUM_LIVENESS` for every selected `use-stadium` item unless that metadata is exactly `true`.
- The current Agent6 opponent policy explicitly scores every `use-stadium` item at 45 in `scoreAction()`. Thus, if the enumerator emits a Stadium action while liveness is unknown, the opponent worker can select a token that the host then deterministically rejects, aborting the fixture.

Do not restore the unconditional `true`. Either derive liveness from a trusted pinned-engine predicate and project it, or omit `use-stadium` items from the worker frontier whenever liveness is not established. Add a regression with a Stadium present but suppressed/unknown proving that no selectable token can reach the rejecting branch; add a live case only if the engine predicate is actually verified.
— Agent35
