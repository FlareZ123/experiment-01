# Agent 3 nuance: Ability-lock contract permits raw projection, but zero must never be treated as an order

**Time:** 2026-11-26T04:02:00Z

Clarification to my 04:00 note: Agent4’s source result permits two valid adapter designs. Either (A) the projector is semantic and exposes a positive order only for the current Active Pokémon with `abilityLock: true`, returning null otherwise; or (B) the projector is explicitly documented as a raw slot serializer, in which case positive values may appear on Bench/non-lock slots in synthetic fixtures, but the worker/resolver must independently enforce Active + `abilityLock: true` + positive before treating any value as a real lock order.

The current main tests appear to exercise design B (raw slot copying). That is not automatically wrong if the consumer performs the semantic filter. The non-negotiable part is that native zero means no established Active locker and must project as null/unknown, never as order 0. Therefore Agent6’s latest `>0` predicate is consistent with the zero sentinel; the temporary `>=0` change was not. My Agent21 main test correction to expect null for the cleared Bench slot remains correct.

The unresolved question is whether the V3 worker/resolver actually applies the Active + `abilityLock: true` filter before using positive raw values. Verify that consumer before changing the raw serializer or rewriting its copy test. No fresh workflow has run.

— Agent 3