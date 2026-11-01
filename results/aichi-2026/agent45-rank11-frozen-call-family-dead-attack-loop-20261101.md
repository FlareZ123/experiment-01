# Agent45: full-Bench Call for Family dead-attack loop in original rank-11 source

**1 November 2026 | reproducible original-source policy competence counterexample. No competitively qualified games.**

## Specific mechanism, printed card and actual field match

The original Aichi rank-11 Absol/Garbodor sixty includes **Trubbish FST (Fusion Strike 168)** with two printed attacks. **Call for Family** costs Darkness and searches a Basic Pokémon directly to the Bench. **Super Poison Breath** costs Darkness and Colorless, deals 20 damage and Poisons the opponent's Active Pokémon. The provided advanced rulebook C-11 states that when an attack would put Basic Pokémon onto a full Bench, the attack ends before searching. The same rule does not make a different attack with a payable cost unusable.

In the original native rank-11 source games, Trubbish was repeatedly Active with a full five-Pokémon Bench and at least **two attached Basic Darkness Energy cards**, yet the frozen actor continued announcing Call for Family. The attack's recipient Bench was full, so the subsequent native Store effect could neither add a Pokémon nor damage the opponent. Super Poison Breath was **payable by printed Energy symbols on the exact same public board**. Its legality under all other card effects and its native damage/Poison consequence have **not** been independently reproduced; this is a public printed *opportunity*, not a certified winning alternative.

This directly illustrates why successful Store dispatch, physical conservation and a playable fixed opponent sixty do not qualify a decision policy as a competent adversary.

## Exact archived evidence

Sources are the previously frozen, postgame native original Store archives:

- [Frozen v1 32 arms](agent41-frozen-bilateral-v1-32-original-source-native-20261101.md): [run 41278620085](https://github.com/FlareZ123/experiment-01/actions/runs/41278620085), artifact **13072746019**, ZIP SHA256 f390c288ffddf8bfeeba7ab18cbb8aabbd1d913048fe55e82c1b09cb60a3b587.
- [Frozen v2 32 arms](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md): [run 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact **13072623187**, ZIP SHA256 cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b.

All 16 rank-11 original-source attempts from each frozen profile are included, retaining every action cap and engine terminal. The independent [pure audit](../../simulation/evaluation/agent45-rank11-dead-family-vs-poison.cjs) reads original sourceAttackSettlement public before/after boards and actual candidate ChooseCards/AttackAction native root chains. Its [four Node22 tests](../../tests/agent45-rank11-dead-family-vs-poison.test.cjs) pass locally. Vendor and frozen two-seat runners are unchanged.

| Actual rank-11 source attacks | Frozen v1 | Frozen v2 |
| --- | ---: | ---: |
| Source Call for Family declarations | 62 | 45 |
| Full-Bench Call for Family declarations | 50 | 36 |
| Full Bench, payable printed Super Poison Breath, no Bench change or opponent damage | **43** | **34** |
| Full-Bench cases without that confirmed payable/no-effect combination | 7 | 2 |
| Candidate Get Lost canceled because its specified discard zone was empty | **24** | **24** |

The **34 v2** payable-but-unused attack opportunities occur in just **two** same-source-rank/seed/seat games, 17 repeated opportunities per distinct candidate sixty:

| V2 original native attempt | Accepted ineffective source root turns | Other visible facts | Result |
| --- | --- | --- | --- |
| 11:2:A:champion-reference | 15, 17, ..., 47 (**17**) | Trubbish Active, two to four Darkness cards; three Benched Mega Absol ex with zero attached Energy | **260-action cap**, both players on six Prizes |
| 11:2:A:new-moon-lockbreaker-v1 | 13, 15, ..., 45 (**17**) | Trubbish Active, two to four Darkness cards; two Benched Mega Absol ex with zero attached Energy | Engine terminal, candidate physical seat 0 with zero Prizes; unqualified |

All 34 attacks have a same-epoch settled native Store AttackAction, a source Bench of exactly five unchanged named Pokémon after the attack, and an opponent Active with identical name/damage after the attack. The alternative is a *printed resource-cost opportunity*, so this analysis cannot simply count 34 successful hypothetical Poison attacks or substitute a predicted 34-turn outcome.

### A particularly unproductive reciprocal loop

In the **11:2:A:champion-reference** v2 game, candidate Girafarig LOT announced **Get Lost** on **24 turns (2 through 48)**. All 24 prompted to select two opponent discard cards, but the source opponent discard contained **zero cards** and the corresponding native prompt responses were permitted null selections. The card effect was inert on those turns. Simultaneously, source Trubbish completed 23 Call for Family attacks; the first five progressively filled its Bench, then **18** were inert on a full Bench, including the **17** turns with a printed payable Poison alternative. The game reached its action limit with **Prizes 6–6**.

This is one highly correlated native game with alternating zero-progress attack choices, rather than 24 independent draw failures. It demonstrates a structural deficiency in competing decision policy: a mandatory limited effect was allowed to resolve correctly while neither bot discriminated between strategically dead actions and a potentially damaging or repositioning line.

## What is proved and what remains to test

The **actual no-effect attacking** is a post-Store public-state observation; the source's attached two-plus Darkness and Super Poison Breath's printed cost are public mathematical access. The **unrealized alternative** still requires a controlled native Store fork (or an authentic original-deal intervention) to establish attack legality, Poison damage, follow-up choices, opponent reply and resource cost. A status or damage-prevention effect might change its value.

Relevant existing code already distinguishes [known-dead attacks](../../simulation/twinleaf/agent7-known-dead-attack-native.cjs) and includes a frozen option [paperFullBenchCallForFamily](../../simulation/evaluation/agent41-frozen-bilateral-development-v2.json). The latter helps engine fidelity when a Bench is full; it does not by itself make the actor choose a productive attack.

**Actionable integration target:** from the same owner-visible observation, compare chosen Call for Family against alternative playable printed attacks and retreat/reposition options, using physical Store positive/negative receipts. Penalize a known fully futile search when Bench is full and a reasonably payable, consequential line exists. Test both actors symmetrically, preserve the original no-op control and use fresh registered actual physical deals before any source-policy comparison. The 24 Get Lost into empty discard events similarly warrant a guarded owner-visible dead-effect preference, with the understanding that occasionally a player may rationally use a harmless attack to consume a turn.

All source, candidate and outcome evidence here remains **unqualified policy-development data**. No list revision, independent prospective game series or official 25-minute clock was produced; do not infer a probability of defeating rank 11.

**Target unchanged:** 32/32 identified opposing archetypes, 29/32 authenticated exact original 60s, zero qualified competitive games, no proven 99.5% fixed 60.
