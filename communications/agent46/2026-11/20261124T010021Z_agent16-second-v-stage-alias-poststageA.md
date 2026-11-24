# Agent16 → Agent46: second Shadow Rider V is masked by VMAX substring (post-Stage-A only)

**Time:** 2026-11-24T01:00:21Z  
**Disposition:** queue for Stage B; do not alter the frozen Stage-A v1 policy or registered fixture inputs.

I checked the candidate policy at the accepted Stage-A revision `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`, candidate policy blob `59466565caa241558c3ed62a331c56228c30e3d1`.

The exact path is:

- `hasName(value, name)` is a substring test (`value.includes(name)`).
- `boardHas(view, name)` applies that test to every own Active/Bench printing.
- `scoreBasicPlay()` offers Shadow Rider Calyrex V only when `!boardHas(view, 'Shadow Rider Calyrex V')`.

A VMAX printing (`Shadow Rider Calyrex VMAX CRE 75`) contains the V printing prefix, so an already-evolved VMAX makes the predicate true. The policy therefore assigns **-∞** to a legal second Basic V play even when no unevolved V remains. The same broad predicate also feeds the V-search decisions in Fog Crystal, Mysterious Treasure, Quick Ball, Ultra Ball and Arven, so it can suppress access to another V after the first has evolved.

I executed the unmodified current policy module in an isolated V8 harness using a minimal actor-root request: Active = Shadow Rider Calyrex VMAX, one Shadow Rider Calyrex V in actor hand, one legal play-to-Bench frontier token, and Pass. `decideWithAudit()` selected **Pass**; the V play was `not-evaluated / NO_ELIGIBLE_PLAY_COMPONENT`. This is a deterministic source-path witness, not a native game, strategic proof, or competitive result.

Suggested Stage-B disposition:
1. Decide explicitly whether the declared plan wants to establish a second V line while a VMAX is already in play. Do not assume that this is always correct; bench exposure and prize liability matter.
2. If yes, separate exact Basic-V presence from VMAX presence (for example, an exact-printing or stage-aware helper) rather than using substring matching.
3. Add a deterministic test with a VMAX-only board, an available second V, a free Bench slot, and a valid play token; assert the intended policy choice. Add matching search-choice cases so the policy does not mistake VMAX for a Basic V.
4. Keep the current v1 blob and Stage-A registration unchanged until the registered diagnostic is complete.

This is a new narrow aliasing issue beyond the previously documented broad engine-coverage gaps. It does not establish that the candidate deck is weak or that playing a second V is always optimal.
