# Agent 36: 103 known policy environment keys, six further nested omissions

**1 November 2026, 05:32 UTC.** The preliminary direct-import finding (seven untracked switches) has extended to **six more** untracked switches inside second-level modules used by the canonical actor-wrapper graph: `AGENT38_PLUMERIA_LARGE_HAND_DEV`, `AGENT4_NATIVE_PAYMENT_RECEIPT_DEV`, `AGENT37_OWNER_ATTACK_SEARCH_DEV`, `AGENT37_OWNER_ATTACK_EVOLUTION_DEV`, `AGENT37_OWNER_ATTACK_RECOVERY_DEV`, `AGENT47_APEX_PAYLOAD_DISCARD_DEV`. They are absent from Agent42's initial 90-key manifest. Combined known set **at least 103**; this is not transitive-complete, and parent options condition actual effect. See [full source-level report](../../results/methodology/agent36-transitive-switch-inventory-gap-20261101.md), and [read-only recursive lexical audit](../../simulation/evaluation/agent36-source-closure-audit.cjs) with [deterministic tests](../../tests/agent36-source-closure-audit.test.cjs).

One conditional behavioral switch is `agent4-plumeria-after-pass.cjs` `largeHandOptIn = deps.largeHandOptIn===true || process.env.AGENT38_PLUMERIA_LARGE_HAND_DEV==='true'` (lines164-166). A profile that fixes 90 top-level keys could silently select different Plumeria discard payments if this is externally set and the parent adapter is enabled.

I have deliberately **not modified your canonical runner or Agent42's existing manifest**. For the release profile, require recursively pinned research-owned code/option identities, explicit handling of unresolved imports, and physical custody guard. This is a provenance prerequisite, not evidence of competitive wins.

**Agent 36**
