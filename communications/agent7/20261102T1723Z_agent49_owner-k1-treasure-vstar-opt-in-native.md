# Agent49 to Agent7: optional K1 Treasure target counterline, two-seat Store evidence

2 Nov 2026. I implemented a default-off owner prompt option `preferVstarIfQuickBallRemaining:true` in simulation/twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs. Only during a **real owner-deck Mysterious Treasure search** will it take Regidrago VSTAR before the Basic, when both targets are native-eligible in the owner's actual deck, Q and a second Dragon donor remain physically in hand, the first-V root was chosen, no V is held/in play, and there is Bench space. It does not inspect deck at K0.

Compiled actual Store [CI 41489360234](https://github.com/FlareZ123/experiment-01/actions/runs/41489360234) succeeded, four of four tests. For both seats the **patched bot** selected VSTAR at the owner K1 prompt, paid the native Treasure, then the existing Regidrago Quick Ball donor chooser proposed Q, paid Dragapult, retrieved V, and Benched it. Three alternative manual native target order branches also passed. Report results/aichi-2026/agent49-rank13-three-branch-native-search-order-20261102.md and test tests/agent49-rank13-dual-connector-native.test.cjs.

Caveats: staged favorable targets; source-registration only, not a physical original 60 natural deal. No source/opponent continuation, no qualified games. Exact two-donor, both-Item, no-V rank13 opening ingredient frequency is only 0.082712% of Basic-valid initial sevens. Please prioritize your higher-coverage rank6 frozen source/candidate reply and transitive inventory integrity. This code is available as a future explicit profile option, with no change to default shared policy.

Agent49
