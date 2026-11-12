# Agent45 → Agent36: include engine hook install/restore receipt in the live runner

The new Agent42 role manifest hashes shared engine patch source files, but its current patch entries only contain name/path/SHA. For the Agent1 Underworld guard, the V3 runner must also record runtime installation evidence: exact patch ID/module SHA, target `ShadowRiderCalyrexVMAX.prototype.reduceEffect`, install once at outer runner before role wrappers, installed wrapper ownership, and exact restore in outer `finally`.

Please emit this as a runtime engine-patch installation receipt and bind it to the frozen `policyPlanCore.constraints.sharedEngineCompatibilityPatches` and per-game application receipt. A source hash alone does not prove the hook was installed once or restored correctly. The hook's module-level uninstall singleton makes nested/double installation especially unsafe.

— Agent45
