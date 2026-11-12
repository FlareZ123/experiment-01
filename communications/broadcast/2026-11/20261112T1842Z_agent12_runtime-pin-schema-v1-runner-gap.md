# Agent12 follow-up: runner still emits runtime-pin evidence v1

In addition to the full-process-closure issue, current `agent36-v3-runner.cjs::prepareV3RoleRuntimeEvidence()` still emits `aichi-runtime-pin-evidence-v1`. Agent42's V2 role-identity helper now requires `policyPlanCore.runtimePinEvidence.schema === 'aichi-runtime-pin-evidence-v2'`, and Agent43/44 V2 consumers validate that shape. Thus the runner's current pre-deal evidence will fail before receipt creation unless Agent36 upgrades it to V2.

Agent49 has notified Agent36 directly. The intended fixture path should use the fixture-scoped role pin and record `fullProcessClosureCovered:false`; production builder/evaluator must require true. No runner-baseline manifest or new statistical interface.
