# Native rank-11 Mega Absol activation was enabled by the *opponent* taking two Prizes

**Agent 10 | 3 November 2026 | Reanalysis of prior prospectively registered native 40-attempt archive | Zero new attempted matches, zero competitively qualified games**

## Discriminating mechanism

The previously reported original Aichi rank-11 source wins against champion reference and New Moon both arose after source spent manual Energy attachments on Benched Mega Absol ex instead of attacking with Active Squawkabilly ex. Their source first Claws were turn37 and turn33, respectively, after Mega had been fully funded by turn33. Why did the source not attack sooner or self-promote Mega?

**Observation: in each case the original source first Claw was possible only after the opposing candidate used an actual attack to Knock Out its own then-Active Squawkabilly ex**, promoting the funded Mega from its Bench. There was **no genuine source `RetreatAction` before either first Claw**, despite the original printed rank-11 60 including three Float Stone, two Guzma, and one Escape Rope, all subject to access, play, and cost constraints.

| Original source source rank11, seat0 | Real candidate attack and turn | Source Active pre-attack | Actual post-settlement source Active | Real candidate Prizes before→after | Next source first Claw |
| --- | --- | --- | --- | --- | --- |
| vs champion-reference seat1 | **Night Watch** on global **36** | Squawkabilly ex, **150 damage**, zero Energy | Mega Absol ex, **three Darkness Energy** | **6→4** | Global **37** |
| vs New Moon seat1 | **Hidden Power** on global **32** | Squawkabilly ex, **150 damage**, zero Energy | Mega Absol ex, **two Darkness Energy** | **6→4** | Global **33**, after third Darkness attachment |

On champion's turn34, an earlier Night Watch already dealt 150 damage to Squawk; the next Night Watch at turn36 KO'd that two-Prize Pokémon, and Mega was promoted. On New Moon's turn30, prior Hidden Power changed Squawk's damage **140→150**; Hidden Power on turn32 completed the KO and promotion. In both cases, the opponent gained exactly **two Prizes** for Squawkabilly ex; the original source took **no Prizes** from that exchange, and the opponent's public post-attack board then showed Mega Absol Active. The candidate-settlement reducer verified `settledPromptChain:true` and `nextSourceSameEpochProven:true` on those actual source promotion transitions.

The source then attacked with 200-damage Claw of Darkness, and later took all six source Prizes in each native continuation. Those positive attack roots and their target-level Prize receipts remain valid as **simulator observations**. The crucial missing strategic capability is an independently demonstrated legal means to **choose the moment of Mega promotion** while preserving the needed Energy and other resources. This archived source only reaches first Claw through an opponent-owned Knock Out. An opponent may have alternative choices, including delaying that KO or removing the funded Bench Mega through a different line; whether any such choices are available/optimal in the actual game is not determined here.

## Reproducibility and exact source audit

- Origin: [original 40 native attempts on five prespecified source ranks](agent10-prospective-five-rank-funding-mobility-40-native-20261103.md), [compiled CI 41553194703](https://github.com/FlareZ123/experiment-01/actions/runs/41553194703), [artifact 13192723280](https://github.com/FlareZ123/experiment-01/actions/runs/41553194703/artifacts/13192723280) with `agent10-prospective-5rank-resource-retreat.json`. Vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research commit `0aab0e36b75ee8f8f61c1b4513bcd1e1e6774f66`.
- [Read-only native opponent-KO promotion audit](../../scripts/agent10-rank11-opponent-ko-promotion-gate.cjs), [three pure regressions](../../tests/agent10-rank11-opponent-ko-promotion-gate.test.cjs). Reporter consumes the original archived JSON, filters only the two genuinely changed original rank11 source pairs, joins first source Claw to the **immediately preceding actual opponent AttackAction**, verifies the source Active identity Squawkabilly→Mega, candidate's two-Prize pickup, source's unchanged Prize count, and absence of pre-Claw source `RetreatAction`. It leaves native gameplay entirely unchanged.
- Independent archive JSON inspection confirmed **both (2/2) exact source KO-promotion joins** and zero preceding source normal Retreat. The underlying source seed **4096421492** and source seat0 are shared by the two different candidate matchups, so these are **one** original source seed's two candidate continuations, rather than two independent source-seed successes.
- The [four-factor causal replay](agent10-rank11-mega-funding-vs-retreat-four-factor-native-20261103.md), [CI 41555366164](https://github.com/FlareZ123/experiment-01/actions/runs/41555366164), separately proved that the positive source attack line depends on the staged **Energy funding** factor. Merely enabling the generic one-Energy paid-Retreat policy changed nothing; it was never selected because Squawk had zero attached Energy and did not satisfy that selector's cost predicate.

## Strategic consequence and next test

A native source win here requires a **three-part interaction**: stage three Basic Darkness attachments on Bench Mega; have a legal promotion window; target a high-Prize, Darkness-weak or damaged opposing Pokémon. The tested agent improved the first prerequisite while outsourcing promotion to the candidate's attacks. The reported two source native wins therefore establish **attack mechanism capability in a conditional opponent continuation**, with a substantial hidden dependency on candidate decision policy.

Do not infer that always attacking with Squawk would be better: in these same physical deals its first Motivate attached zero additional Basic Energy and the control never produced the Claw threat. The more promising missing piece is a **source-owned mobility transition and credible opposing counterplay**.

Paper legality of whole-game effects, source original-60 custody, actual 25-minute timing and expert policies remain unqualified; the original turn33–37 source attacks are exceptionally late. **No additional games were simulated for this KO audit, and competitive-qualified games remain zero.**
