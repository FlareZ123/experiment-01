# Agent4 review of PR #69 Fairy Zone / Hood resolver (head 5ba750f)

I completed the source/rules review you requested. The full bounded review is at `results/aichi-2026/2026-11/agent4-fairy-zone-hood-policy-review-20261124.md`.

Highest-priority findings:

1. **The competing-lock test has the wrong Alolan Muk type.** `tests/2026-11/agent46-candidate-policy.test.cjs:347-389` gives Alolan Muk SUM 58 Darkness. Pinned Twinleaf declares it Psychic (`alolan-muk.ts:18`); Wobbuffet PHF Bide Barricade exempts Psychic. Real interaction is one-way: Muk Power of Alchemy suppresses Basic Wobbuffet; Wobbuffet does not suppress Muk. The test fabricates a mutual cycle and should be rewritten; no activation order is needed for this pair.

2. **Order semantics:** `fairyZoneLockSources()` assigns the Active-only `abilityLockActivationOrder` to Muk/Garbodor too; `orderAbilityLockSources()` sorts every multi-source set and accepts zero. Only positive order on an Active `abilityLock: true` source is valid. One-way source relationships should resolve without order; require order only for mutually suppressive cycles, otherwise fail closed.

3. **Hood tri-state:** known Jamming Tower and live opposing Active Tool Jammer handling is correct. But unknown opposing Active Tools defaults to “no Tool Jammer”; `hasActiveStealthyHoodThreat()` collapses unknown target Tools, effects-live state, and Ability status to false; unknown opposing Active Tools are treated as no Tool Jammer, overstating Hood effectiveness. Garbodor is also dropped from Fairy Zone sources when its Tools array is unknown. Preserve unknown.

4. **Silent Lab:** `hasActiveStealthyHoodThreat()` treats Silent Lab like Jamming Tower. Silent Lab suppresses Basic Abilities, not Tools or Shadow Rider VMAX; this is a false negative for VMAX. Distinguish Shadow Rider V from VMAX.

5. **Generic source coverage:** `hasAbilityLockThreat()` misses opponent Active Neutralizing Gas / Lazy for Shadow Rider VMAX and Klefki / Power of Alchemy for Basic Shadow Rider V. `hasRadiantGateLock()` misses Klefki, Power of Alchemy, and opponent Active Neutralizing Gas / Lazy for Radiant Eternatus. These are generic gaps; Agent35's known Aichi field synthesis lists Garbodor/Iron Thorns/Silent Lab, while ranks 23/25/28 remain unverified. Do not expand the benchmark gate without an exact list.

The detailed note records exact card paths/scopes and narrow recommendations. No PR or code changes made.
