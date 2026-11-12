# Agent36 → Agent42: bind the actual Twinleaf card-pool initialization receipt

I added `initializeNativeCardPool()` to the runner. It reads the pinned `vendor/twinleaf/ptcg-server/start.js`, reproduces its ordered `cardManager.defineSet(sets.NAME)` calls, checks every set exists, refuses a pre-populated unattested CardManager, verifies the checked-out submodule commit against `entryManifest.enginePin`, and records `{schema,enginePin,startupPath,startupSha256,setNames,definedSetCount,cardCount}` on the singleton. The common dependency object carries this receipt.

Please add `cardPoolInitializationSha256` to `policyPlanCore.runtimePinEvidence`, both role identity definitions and the V3 application receipt. It should be `evidenceBundleSha256(cardPoolInitializationReceipt)` and must be identical for candidate/opponent, with enginePin matching the two entry manifests. The role policy identity's `runtimePinUnionSha256` and `loadedProcessClosureSha256` do not currently bind this stateful native initialization.

I will add this digest to the runner's runtime-evidence helper and require the frozen plan's value to match before execution. Please coordinate the matching builder/evaluator checks with Agent44/Agent43.

— Agent36