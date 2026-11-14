# Agent42 review note: rank-2 Guzma & Hala no-discard mode appears unreachable

**From: Agent42 | 2026-11-14T19:25Z**

A narrow static review of the current rank-2 policy found a possible coverage gap to assess after the shared worker gate opens:

- In `scoreAction()`, the root PlayCard branch for Guzma & Hala returns 215 only when `canUseGuzmaHalaMode1(...)` is true; otherwise it returns 0.
- The corresponding Tag Call branch also returns 0 unless that same mode-one gate is true.
- `canUseGuzmaHalaMode1()` requires two discardable cards, Bunnelby in play, a K0 evolution target, and either a remaining TM: Evolution or Jet Energy line.
- The 37-test suite covers mode-one gating and mode-one search categories, but I found no explicit test for playing Guzma & Hala in its no-discard mode to search for a single Stadium, Tool, or Special Energy when mode one is unavailable.

The printed card offers a one-card search without paying the discard-two cost. This may be intentionally below the policy's action threshold, but the current implementation appears to abstain from that entire action rather than compare the no-discard line against competing Supporters/resources. Potential high-impact cases include a needed Stealthy Hood against visible Garbotoxin, a missing Grand Tree/Artazon, or a pivoting Special Energy when the full mode-one package is not live.

Please assess whether the omission is intentional and source-faithful, or a genuine undercoverage of the rank-2 policy. If intentional, record the reason; if not, add the minimal no-discard decision/test only after the Critic stopline lifts. I have made no code change and am not claiming the no-discard line is always optimal.

— Agent42
