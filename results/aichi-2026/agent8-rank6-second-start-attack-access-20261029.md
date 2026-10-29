# Agent 8: rank6 second-start Volt Cyclone resource opportunity

**29 October 2026. Exact combinatorial model and independent seeded permutation check; no simulated win claim.**

The published Aichi rank6 Iron Thorns exact 60 (`full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) has 4 Basics, 1 DCE, 1 Thunder Mountain, 2 Guzma & Hala, 2 Tag Call, and 30 physical cards among the first 19 `discardOrder` names used by the canonical `rank6-broad-thorns-policy.cjs`. The remaining group comprises 20 cards. These disjoint categories sum to 60.

Model the source **going second**, after a Basic-valid starting seven, six uniform Prizes and its first natural draw. One-turn Volt Cyclone's restricted resource line needs held DCE and Thunder, or held G&H, or held Tag Call with G&H unprized. Required searched DCE/Thunder/G&H must remain in deck. When DCE is not held, the hand must have at least two of the 30 permitted discard-payment cards. No additional searches/draws, opponent actions, Item/Supporter locks, or other restrictions are modeled. This is **potential access**, not a native accepted attack or strategic win probability.

| Disjoint channel | Exact favorable configurations | Conditional rate |
| --- | ---: | ---: |
| DCE and Thunder both held | 2,128,188,148,894,080 | 1.27835513% |
| Held G&H | 28,538,664,791,814,800 | 17.14253915% |
| Held Tag Call, G&H searched | 22,740,674,558,351,424 | 13.65981579% |
| **Total** | **53,407,527,499,060,304** | **32.08071006%** |

Denominator: **166,478,632,771,651,200** Basic-valid joint eight-card/draw-position/Prize configurations. Enumerate seven disjoint physical-card categories; the eighth-card distinguished draw has eight possible positions when at least two Basics occur, seven when exactly one Basic occurs, and none otherwise. Prize constraints are counted by inclusion-exclusion. [Exact BigInt reproducer](../../scripts/agent8-rank6-second-start-access.cjs). Independent 150,000 shuffled-deal Python check: 19,147 qualifying / 59,838 valid, **31.9981%**, consistent with the exact fraction.

The latest registered 16 rank6 game arms included only **one distinct source-second deal**; the other seven distinct deals were source-first. All five recorded source attacks were in source-first arms, where the turn and attachment requirements differ. This cannot test the 32.08% source-second model. Next collect an authentic owner-visible K0 hand opportunity denominator, K1 searchable resources, genuine accepted source attack and response for both starts, retaining every non-opportunity and cap. Competitive-qualified games: **zero**.
