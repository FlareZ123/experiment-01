# Original rank-6 dual Tag Call converts a future G&H discard payment on a genuine same-deal Store game

**Agent 6 | 1 November 2026 | retrospective mechanics contrast, not a competitive sample.** All three preselected physical opening deals were previously known to hold Tag Call and accept first-turn owner G&H search. The preregistration [`agent6-tagcall-dual-gh-cc-payment-20261101.json`](registrations/agent6-tagcall-dual-gh-cc-payment-20261101.json) was committed as `dec4b358` before the dual-payment runner was implemented and executed. Retrospective deal selection bars population conclusions.

## Fixed method and reproducible evidence

Original published Aichi rank **6 Iron Thorns** 60 versus original rank **1 Shadow Rider Calyrex** reference 60, both source physical seats, forced source actually first. Each identical source deal received **single** `Tag Call CEC -> Guzma & Hala CEC` versus **dual** `Tag Call CEC -> Guzma & Hala CEC + Cynthia & Caitlin CEC`, with identical source turn-three K1 opening policy and identical priority `Cynthia & Caitlin, Plumeria, ...` for eligible two-card Supporter payment. The optional dual choice was validated against the actual native owner-deck prompt. The extra card was never read from an unknown deck at K0.

The [reversible owner Store adapter](../../simulation/twinleaf/agent6-owner-tagcall-hala-native.cjs) now audits the **physical second searched card actually appearing in the owner's hand**, separately from proposal and native prompt acceptance. The [complete original Store runner](../../simulation/evaluation/agent6-tagcall-dual-payment-native.cjs) is opt-in in the existing manually triggered workflow; no automatic trigger or vendor patch.

- [Compiled manual CI 41357962029](https://github.com/FlareZ123/experiment-01/actions/runs/41357962029) **SUCCESS**, head `8fbd70a82e06571ffab03e375fcd30fb3e222b65`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Unabridged six-arm original Store archive](https://github.com/FlareZ123/experiment-01/actions/runs/41357962029/artifacts/13103629156), artifact ZIP **14,115 bytes**, SHA256 `2cb2c076ce19e43ba505bbee820d3ae0af466a34f214481ac4a35d8f94ff4a3c`, independently compared against GitHub's digest. JSON inside **269,393 bytes**, including complete accepted native root ledgers for both arms of all three deals.
- **6/6 native attempts without exception**, **3/3 original source deal pairs match**, **3/3 first opponent turn action root sequences identical** between treatment arms. Three accepted source Tag Call roots and three accepted owner G&H deck prompts per treatment; the dual treatment additionally physically gained Cynthia & Caitlin in **3/3** deals. The single treatment gained no second target.

## Exact physical observations

| Source seat / fixed seed | Single Tag owner gain | Dual Tag owner gain | Source turn-three result |
|---|---|---|---|
| A / `2341469307` | G&H | G&H + C&C | Source T1 DCE in both; native G&H root on T3, but planned Thunder/DCE search aborted in both because target requirement was unavailable; no Volt root |
| B / `516187842` | G&H | G&H + C&C | Both source T3 paid G&H, fetched Thunder Mountain + DCE, attached DCE and accepted Volt Cyclone attack root; only the two-card payment differed |
| B / `2411836147` | G&H | G&H + C&C | T1 DCE in both, T3 G&H fetched Thunder Mountain without a two-card discard, and both accepted Volt Cyclone attack root |

**Decisive source B seed `516187842`:** after an exactly identical original source opener and exactly identical opponent T2 `Psychic Energy -> Get Lost`, the actual source-owner G&H discard prompt physically removed `Trainers' Mail ROS` **and `Handheld Fan TWM`** under the single-Tag search, but removed `Trainers' Mail ROS` **and `Cynthia & Caitlin CEC`** under dual search. Native payment objects were confirmed absent from hand and present in discard after successful dispatch. The subsequent source T3 root sequence in both was G&H, Thunder Mountain, DCE, Volt Cyclone. The original Store marked both outcomes as finished; they remain unqualified engine observations. The other seed with a T4 opponent reply (`2411836147`) showed identical `Marshadow -> Pass` roots.

This shows that Tag Call's **second native search target can materially change a later Supporter payment** while leaving the immediate attack route unchanged. It can preserve a denial Tool from being spent in that particular payment. It also consumes a valuable recursion Supporter instead, and may compromise future control. Neither payment policy is proved strategically superior. The source A failure shows that extra discard material does not repair a separate K1-unavailable search target.

## Boundaries and handoff

The cohort is only three retrospectively selected original physical deals against one unqualified opponent policy. The archive's accepted `AttackAction` roots are **not independently settled damage/Prize witnesses in this runner**; source attack-root parity must not be promoted to game-performance equivalence. The opt-in owner wrapper is not merged into Agent41's shared qualified bilateral chooser. The sound next comparison requires same-state owner-reachable alternate payment, subsequent source denial opportunities, symmetric competent opponent replies, a paper-prompt validity portfolio and official-clock-aware game model.

**Benchmark unchanged:** 29/32 authenticated exact Aichi source 60s, zero competitively qualified games, no validated fixed winning 60 or demonstrated 99.5% rate.
