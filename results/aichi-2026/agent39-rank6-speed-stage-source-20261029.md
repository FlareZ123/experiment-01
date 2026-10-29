# Agent39: first-turn rank6 source Speed Lightning staging (opt-in policy)

**29 October 2026. Implementation and pure-policy evidence, not native source-deal gameplay evidence.**

## Why this is needed

Agent8's pre-existing [compiled Store source attack fixture](../../simulation/twinleaf/agent8-rank6-speed-dce-store-fixture.cjs) proves that Iron Thorns ex TWM 77 can declare its printed 140-damage Lightning+Colorless+Colorless `Volt Cyclone` after attaching one Speed Lightning Energy RCL and one Double Colorless Energy SUM over two turns, **without Thunder Mountain Prism Star**. [CI 40926137363](https://github.com/FlareZ123/experiment-01/actions/runs/40926137363) passed before this intervention. See the separate [T3 attached-Speed policy bridge](agent39-rank6-live-lightning-source-policy-20261029.md). Agent8 pointed out that recognizing live Speed on the later turn is incomplete if the original source's first turn never intentionally attaches its held Speed Energy.

The original source physically contains four Speed Lightning and one DCE. When **rank6 source actually goes first**, global turn 1 can legally attach Speed to its Active Iron Thorns. If that Energy remains live, a second-turn DCE attachment (global turn 3) can pay the attack without relying on the uniquely counted Stadium. This is one source-actor staged plan; frequency, survival, prize risk and game desirability remain unknown.

## Separate default-off code treatment

In [`rank6-broad-thorns-policy.cjs`](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs):

- Added `firstTurnRank6SpeedStageOpportunity`, a pure owner-hand/Active and public-turn predicate: global turn 1, acting source's player turn, Active Iron Thorns ex, held Speed Lightning, manual Energy unused, and no player-wide hand Energy/Special Energy lock. It reads no concealed Prize cards, opponent hand or own deck.
- Added opt-in wrapper flag **`stageSpeedLightningFirstTurn:true`**, **default false**. It requires the already separate opt-in **`liveSpeedLightningAlternative:true`**, otherwise fails configuration. If the source is eligible on global turn 1, the wrapper selects a genuine `PlayCardAction` attaching held Speed to its own Active. It tracks action selection separately from subsequent real attached-Speed observation. The later-turn pre-existing source line can then use DCE to pay the printed attack without a Stadium.
- All historical source runs and the canonical comparison have this new option **off**. The default broad source policy, code paths, archived game results and nominated fixed 60s are unchanged.
- Added pure regression tests to [`rank6-broad-thorns-policy.test.cjs`](../../tests/rank6-broad-thorns-policy.test.cjs): real first/second global turns, actor seat, Phase, spent attachment quota, both Energy player locks, missing hand Energy, wrong Active Pokémon, and property accessors that throw if hidden own deck/Prize or opponent-hand state is inspected. The first-turn staging control cannot fire on global turn 2, preventing an unnecessary forfeiture of a potential immediate DCE/Thunder attack going second.

[Fast existing manually dispatched policy-smoke CI 40929670106](https://github.com/FlareZ123/experiment-01/actions/runs/40929670106) **succeeded** on this logic and the preceding shared rank6 source tests. The previous native Agent8 source mechanic proof establishes the cost calculation at a staged board, but **this newly introduced actor wrapper's native first-turn action has not been separately run with a full authentic source-deck deal**. A future clean first-turn Store control and preregistered paired original-source cohort need to show actual legal paid Speed attachment, resulting printed draw, subsequently held/prompted DCE, accepted Volt Cyclone, and a genuine opponent reply. Retain source-first and source-second cohorts and all no-Speed no-attack or failed cases. The optic flag belongs in a **new** source-policy revision; never reinterpret the Oct29 canonical 32-game scout under it.

Benchmark 29/32 exact original lists, zero qualified competitive games, no 99.5% claim.
