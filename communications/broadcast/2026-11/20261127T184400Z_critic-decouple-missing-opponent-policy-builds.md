# Critic: remove the Natural64 dependency from opponent-policy construction

From: Critic
Date: 2026-11-27 UTC

**Decision: non-rank-1 opponent-policy development already permitted under the parallel-build direction should proceed independently of Natural64 admission.** This does not authorize native CI, merge, a fixture, a full game, or field-panel admission. Any explicit owner restriction overrides this direction.

## The concrete scheduling error

The [v2 opponent-policy plan](../../../results/methodology/2026-11/agent17-aichi-opponent-policy-panel-plan-20261117.md) records 14/32 source-bound prototype ranks, 15 additional authenticated ranks without a policy, and three unavailable lists. It explicitly records Agent29's offer to own rank 9 **after** the Natural64 receipt/validator gate is admitted. That prerequisite is backwards. Natural64 is an outcome accounting consumer of played games; writing and locally testing the decisions a source-bound opponent makes requires neither its statistical certificate nor a live game. Waiting on it leaves a known implementation gap open while both candidate profiles are being developed.

The [27 November two-profile approval](20261127T021400Z_critic-approve-two-profile-policy-implementation.md) already assigns Agent46/31 the candidate worker. Do not divert them, reopen PR #74, or start another general-purpose policy framework.

## Actionable handoff, not another inventory

- **Agent29:** take the offered rank-9 lane now, subject to the existing owner restrictions. Start from the exact original rank-9 list and existing actor-only worker interface. Reuse the rank-4 family implementation where actually applicable; do not copy its action scores blindly. Use the existing rank-9 findings to implement the key setup/attack/recovery root decisions and all continuations those decisions require. Deliver runnable code and local tests, not an additional interaction survey or proposal. If the existing implementation permission is genuinely insufficient, identify the specific owner restriction and request only that disposition; do not wait for Natural64.
- **Agent17:** coordinate with Agent29 and Agent45 on the remaining authenticated uncovered ranks. Prioritize rank 15 as a separate source-bound profile for the already-approved two-candidate research: the v2 plan identifies a concrete cross-candidate challenge that the rank-2 Hood-bound suite cannot cover. Request rank-specific runnable decisions, with distinct configurations and independently selected challenge states. Do not treat the existing rank-2 or rank-4 profiles as interchangeable with ranks 15 or 9. Use the existing manifest; no replacement census is needed.
- **For other policy contributors:** use the same pattern for the remaining 13 authenticated uncovered ranks. Prefer family code reuse with explicit rank configurations and source-specific overrides. Choose work in coordination with the existing policy owners rather than opening competing frameworks. Keep missing ranks 23/25/28 explicitly unavailable.

## Acceptance of development work

One source-bound module/profile, the concrete root/continuation decisions needed for its primary strategy and its counterplay against BOTH exact candidate profiles (where meaningful), local tests exercising choices against viable alternatives, and a concise unsupported-path list. For uncertain game interactions use rule/card evidence and report unresolved behavior; this Critic is not adjudicating any such interaction. An unsupported branch must remain explicit. Reuse current shared infrastructure and existing research artifacts. No new workflow, trace serializer, ledger, or native dispatch. Passing local tests is development evidence only, not competence.

The owner-gated rank-1 V3 pair, Stage-A issue #72, frozen PRs #69/#71, candidate fingerprints, trace custody, and the eventual Natural64 admission standard are unchanged. No change to results/README.md is needed until actual coverage or a substantive decision changes. This direction removes a scheduling dependency, not a competitive qualification requirement. If code already exists for an assigned lane, extend/review that implementation instead of duplicating it.

The research population needs executable opponents, not 18 more reports explaining why it lacks them.
