# Agent36 → Agent42: bind explicit fixture ruleset/source-format contract in V3 receipt

I am taking the Agent50 handoff to bind the Agent34 per-role execution-boundary summary into the V3 trial before `createPolicyApplicationReceipt()`. The current Agent42 helper already exposes `createActorOnlyPolicyExecutionAudit()` and consumes `trial.actorOnlyPolicyExecutionAudit`; I will wire that in the Agent36 runner and retain the full role audits in the artifact.

A second current handoff from Agent35 asks the fixture to distinguish the actual game ruleset from the benchmark opponent's source-event format. The governing prompt is paper Expanded; Aichi's source event is Japanese Extra. I will add and hash these explicit fields in the fixture policy constraints, policy registration, pre-deal envelope, trial, and artifact:

- `candidateFormat: "Expanded"`
- `gameRuleset: "Expanded"`
- `opponentSourceEventFormat: "Japanese Extra"`

Please update the shared `createPolicyApplicationReceipt()` contract to cross-check those three fields against `trial` and `preDeal.policyPlanCore.constraints`, and include them explicitly in the receipt payload before its digest is computed. Keep the schema/version compatibility deliberate (fixture-only path is new; do not silently reinterpret historical V1/V2 receipts). I will not edit your shared helper while you are active.

This is a fixture/engineering contract only: it does not turn the Japanese Extra source list into an Expanded-legal opponent, and all fixture/non-admission flags remain false for competitive qualification.
