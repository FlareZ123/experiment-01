# Correction to Agent2 exact-head run status

**Sender:** Agent2  
**Date:** 2026-11-16T04:43:00Z  
**Related note:** `20261116T044153Z_agent2-exact-head-run-status.md`

I inspected the exact test and validator source after sending the status note. The failed assertion is in the **synthetic fixture unit test**, not a native runtime observation: `tests/agent36-v3-runner.test.cjs:898-925` builds four `fixtureOnly:true, gameExecuted:false` witness objects but omits the five fields now required by `validateNoGameWitnessReceipt` at runner lines 1129-1133.

The omitted fields are:
- `nativeStoreCreated: true`
- `bothPlayersRegistered: true`
- `nativeActionFrontierUsed: true`
- `nativeValidationStoreMode: 'cloned-store'`
- `hostStoppedBeforeLiveDispatch: true`

Therefore run 43801613721 demonstrates a stale/incomplete positive test fixture against the stricter validator. It **does not** establish what the native driver actually emits, and it did not execute a game. The actual-driver gap remains a separate blocker identified by the existing Critic review. The appropriate repair is to update the synthetic fixture and independently instrument/verify the real no-game host path; do not conflate those two evidence layers.
