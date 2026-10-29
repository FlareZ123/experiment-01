# Rank6/rank11 early ALS access: 29 October 2026 synthesis

Exact probabilities here describe **source-printed-card availability**, conditional on Basic-valid opening sevens. They do **not** measure native Store execution, competent play or wins.

| Source opening model | Restricted physical resource access |
| --- | ---: |
| Rank11 held direct Boost Shake, Tool, Trubbish/VIP, unprized Garbodor after one draw | **6.45550612%** |
| Rank11 held Forest Seal Stone with **Oranguru/Crobat V in starting seven** and available separate Trubbish Tool | **1.38463750%** |
| Rank11 broader held-Seal (V in hand or VIP-searchable) | **3.21076125%** |
| Rank6 starting **second**, first-turn DCE+Thunder via hand/G&H/Tag and allowed discards | **32.08071006%** |
| Rank6 starting **first**, two-attachment Speed Lightning+DCE with no held Thunder/G&H/Tag | **3.13832960%** |

The canonical rank11 source script currently attempts the direct held-Shake family; the separate held-Seal script requires a Tool-free V **already in play**, while its broader mathematical event includes additional V-access paths. Rank6's early script aims for DCE+Thunder; a printed LCC attack can also be paid with Speed+DCE after two own turns even without the Stadium. Its generic fallback might execute that alternative, untested.

The latest 16 rank11 arms share **eight distinct source physical deals**, including six source-first deals. Both direct completions reused one source-second deal. The latest 16 rank6 arms likewise share eight source deals, **seven source-first and one source-second**. Arm count cannot replace an independent source-opening opportunity denominator.

Details and reproducible BigInt programs: [rank11 direct](agent8-rank11-scout-opportunity-calibration-20261029.md), [rank11 pre-established V](agent8-rank11-held-seal-v-start-coverage-20261029.md), [rank6 second](agent8-rank6-second-start-attack-access-20261029.md), [rank6 first without Stadium](agent8-rank6-speed-dce-unstadiumed-bypass-20261029.md). Next measure actual **owner-visible K0 opportunity, legal owner K1 search, accepted Store source actions, and next opponent reply** per distinct preregistered deal and starting seat. Retain all caps, failures and no-opportunities.

Benchmark: 29/32 original printed sixties, zero competitively qualified games, no demonstrated 99.5% win rate.

## Timing correction: rank6 source-first eligibility

When rank6 starts **first**, its global turn 1 is a **staging** turn: the player cannot play Guzma & Hala or attack under the current paper first-turn rule. The first ordinary attack-eligible rank6 turn is **global turn 3**, after an opponent turn. Therefore the passive [first-own-decision observer](../../simulation/twinleaf/agent8-source-k0-opportunity-witness.cjs) provides only the **T1 owner-hand and attachment-opportunity baseline**, and cannot by itself establish whether a legal Volt Cyclone line was available or missed at T3. A full policy gate must additionally record the T1 normal Energy action, any opponent Energy disruption, and the T3 actor-visible board/hand and legal attack prerequisites **before** source choices. Rank6 source-second's first-own decision is global turn 2 and is immediately attack-eligible; rank11's early Boost Shake can be used on its first own turn through its printed special evolution permission. The first-turn Supporter restriction is documented by the [official Pokémon TCG rulebook](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh7_rulebook_en.pdf). This is an explicit measurement limitation of the initial observer, not evidence that its underlying recorded T1 snapshot is wrong.

## Compiled original-source K0 witness

[Manual CI 40926872575](https://github.com/FlareZ123/experiment-01/actions/runs/40926872575) **PASSED**, including [read-only K0 smoke](../../simulation/twinleaf/agent8-source-k0-witness-smoke.cjs) against the exact rank11 60 on a previously authenticated source-first seed. The installed observer captured first-turn owner-visible hand/board and route predicates from the live Store. This is **instrumentation feasibility**, without a same-deal uninstrumented decision-trace comparison, source route completion claim or competitive result. The same CI passed the prepared no-Stadium Speed+DCE attack proof. Zero qualified games.
