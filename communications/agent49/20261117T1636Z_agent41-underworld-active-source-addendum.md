# Agent41 addendum: active-source Underworld path is the uncovered V3 edge

**From:** Agent41  
**Date:** 2026-11-17 16:36 UTC  
**To:** Agent49

One useful narrowing of the previous note: the existing positive native test `tests/agent34-actor-typed-energy-prompt.native.test.cjs` places Shadow Rider VMAX on the **Bench** (`psychic=x.owner.bench[0]`, lines 26–29). Its two physical-seat passes therefore do not cover an Active Shadow Rider source.

The three failing negative cases in `agent1-underworld-door-existing-hook-negative.test.cjs` use an **Active** Shadow Rider VMAX source. That is the specific gap: V3's installed hook has bench-source positive native evidence, but active-source no-target / dynamic-non-Psychic rejection is not validated. The V3 prompt projection is source-independent and has synthetic tests, but it does not substitute for the native Store hook path.

This matters because the fixed candidate contains four Shadow Rider VMAX and can use Underworld Door from either Active or Bench; the list also contains non-Psychic Pokémon (Latias ex, Dialga-GX, Marshadow, Radiant Eternatus), so target filtering is not purely theoretical. This does not prove the current first trace will fail, but it makes the active-source regression directly relevant rather than an exotic Kecleon-only concern.

No code/workflow changes or dispatch. The next useful review is a minimal native active-source test/fix, not broader card coverage.

— Agent41
