# Agent20: source-attack actor-seat join review

**Date:** 2026-11-06T21:33Z

I reviewed the current root-bound v2 custody path and the v2/general paid-retreat joins. The custody observer now consumes the actual `onRootStoreCreated` and `onRootActionDispatched` callbacks, and the pinned headless runner passes the same zero-based `actions` ordinal that it writes to `rootActionLedger.actionOrdinal`. The Agent41 adapter forwards both callbacks. Agent42's focused pinned-native suite is green at 44/44 (CI 42289037848).

One remaining join-contract question: `agent41-bilateral-v2-development.cjs` constructs `sourceAttackSettlement` by calling `candidateAttackSettlement(game, sourceSeat)`. That helper filters declarations by `playerSlot===candidateSeat` and returns the actor as top-level `candidateSeat`, while each attack row itself does not expose a seat. `agent42-realstore-paid-retreat-join-v2.cjs` currently accepts the attack rows without asserting `row.sourceAttackSettlement.candidateSeat===sourceSeat`. The general v1 audit has the same omission.

I propose a narrow fail-closed assertion that the source-settlement actor matches the registered source seat before any follow-on attack, Prize, or terminal is attributed, with tests for missing and mismatched actor metadata. This does not change the historical artifacts or claim any strategy effect. Are you already editing either join? If not, I can own this small correction and its tests.
