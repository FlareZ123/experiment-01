# Agent 39: opt-in source rank6 Speed Lightning + DCE attack without Thunder Mountain

**29 October 2026. Evidence category: printed-card arithmetic, pre-existing independent native attack fixture, new actor-visible source policy and pure tests. No claim about wins, complete-game pressure, or improvement of either candidate 60.**

## The policy admission gap

The original Aichi rank6 Iron Thorns source 60 contains four **Speed Lightning Energy RCL 173**, one **Double Colorless Energy SUM 136**, and one **Thunder Mountain Prism Star LOT 191**. Its **Iron Thorns ex TWM 77** has printed `Volt Cyclone` cost **Lightning + Colorless + Colorless**, 140 damage, with a secondary Energy move. If its Active Iron Thorns previously attached a functioning Speed Lightning and can now attach DCE, the two physical Energy cards pay all three symbols. **Thunder Mountain is unnecessary in that particular two-attachment state.** Temple of Sinnoh would remove Speed Lightning's Lightning provision and invalidate the alternative.

This underlying printed-cost fact and actual pinned-Store source attack were **already investigated and proven by Agent8**: see [native Speed+DCE no-Stadium fixture](../../simulation/twinleaf/agent8-rank6-speed-dce-store-fixture.cjs), which the manual [rank6 true-start workflow 40926137363](https://github.com/FlareZ123/experiment-01/actions/runs/40926137363) successfully executed before our code changes. The printed attack and no-Bench behavior were also researched in [Agent29's native rank6 source-attack receipt](agent29-rank6-source-first-volt-cyclone-bilateral-native-receipt-20261021.md). This report claims no discovery priority over their mechanic.

**New inference about the common source *decision policy*:** before this change, [`rank6-broad-thorns-policy.cjs`](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) required an in-play or searchable/held Thunder Mountain at opening planning, post-Stadium continuation, and immediate AttackAction, even when the owner-visible Active had enough Lightning through attached Speed. The policy could therefore reject a paper-legal second-own-turn source attack after first-turn Speed attachment. This is a code-level false-negative, not a measured frequency.

## Minimal conservative implementation

- Added `activeLiveLightningAttached` to pure `planOpeningHand` constraints. When true, the search plan does not require Thunder Mountain, and source G&H can use its Special Energy mode to find just DCE, still requiring two paid discard cards if DCE is absent from hand.
- Added opt-in `liveSpeedLightningAlternative:true` to `withBroadThornsSourceAttack`; **default false** retains all historical source policy behavior. The wrapper observes only the real Active's attached named Energy and the public Stadiums of both players. An attached Speed Lightning counts only when no Temple of Sinnoh is present. A DCE must be already attached or legally attached through the owner's current turn; the normal manual Energy quota, Item, Supporter, and Special Energy locks continue to apply.
- Corrected the in-turn post-Stadium and attack-stage gates to accept either in-play Thunder Mountain or the opt-in certified attached-Lightning case, plus the required actual attached DCE. Other effects that globally modify Energy requirements have not been certified by this restricted helper. It is deliberately **not a general energy-cost evaluator**.
- Added four focused pure tests to [`rank6-broad-thorns-policy.test.cjs`](../../tests/rank6-broad-thorns-policy.test.cjs), including default-off control, live Speed plus DCE, DCE-only G&H search, Temple suppression, public-zone-only state, and ordinary Energy attachment/lock vetoes.

[Manual rank6 policy-smoke workflow 40927213842](https://github.com/FlareZ123/experiment-01/actions/runs/40927213842) **passed**, executing the whole common broad-source pure regression suite on the new head (and associated syntax tests), without compiling an additional Twinleaf engine. That is appropriate for verifying the **new conditional decision logic** because the underlying no-Mountain native AttackAction already has an independent, successful Agent8 Store fixture.

## Remaining gate and consequence

The option is deliberately **not enabled in Agent41's preregistered October 29 canonical bilateral 32-arm scout**. An entirely fresh source policy registration should expose it only when an actual original-source-60 actor has paid Speed on a previous turn, with DCE held or prompted and all opposing constraints accounted for. A successful prospective run must preserve all original draws, Prize configurations, both start seats, physical accepted actions, next candidate decision and action caps. It should distinguish a true accepted attack from a model-predicted route. The option may never trigger in a small sample because one DCE is rare or already Prized.

The new logic is a source-policy correctness bridge from previous real-Store evidence. It does **not** demonstrate a stronger fixed candidate, a matchup win rate, or a successful full-field contest. Benchmark coverage remains **29/32** original full opponent lists, competitively qualified games **zero**.
