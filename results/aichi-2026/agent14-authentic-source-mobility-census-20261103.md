# Agent14: every available authentic Aichi source 60 contains a printed reposition resource

**3 November 2026. Exact-name source-deck inventory, read-only. Not a game-state legality guarantee or win-rate estimate.**

[Deterministic audit code](../../simulation/evaluation/agent14-authenticated-mobility-roster-audit.cjs) · [Five local-level regression tests](../../tests/agent14-authenticated-mobility-roster-audit.test.cjs) · [Green lightweight remote CI 41586810622](https://github.com/FlareZ123/experiment-01/actions/runs/41586810622). The input is the published [29 authenticated original 60-card lists](full-decklists.json), exact Git blob ae773f6201d7aa69d31914dbfee66f3fba692200. Original ranks 23, 25 and 28 remain missing. All original source lists are exactly 60 cards and no unverified list was filled in.

| Conservative named mobility card | Original source decks containing it | Printed copies across the 29 source sixties |
| --- | ---: | ---: |
| Guzma, Supporter | 25 / 29 | 48 |
| Float Stone, Pokémon Tool | 12 / 29 | 24 |
| Escape Rope, Item | 7 / 29 | 11 |
| **At least one of these three exact names** | **29 / 29** | Overlapping card families; do not add source-deck counts |

The four authentic source ranks without printed Guzma are **4, 17, 26 and 31**; these are still covered by Escape Rope or Float Stone. The rank11 Mega Absol/Garbodor original 60 contains **three Float Stone, two Guzma, and one Escape Rope**, which is why the [original Counter Catcher artificial-stall result](agent14-rank11-postclaw-six-native-finding-20261103.md) needed adversarial verification. The [subsequent native Float Stone falsification](https://github.com/FlareZ123/experiment-01/actions/runs/41586122921) actually re-established the funded Mega Absol on turn 33 and restored all five Claw of Darkness attacks after an authentic accepted Counter Catcher.

**Scope:** Having a printed card in the 60 does not establish that it is in hand, reachable before defeat, legal under a particular Item/Tool/Supporter or Active lock, or strategically desirable to play. Guzma needs a legal Supporter play and both sides' Benches. Float Stone gives its attached Pokémon no Retreat Cost; attachment requires an empty Tool slot and retreat must still be legal. Escape Rope can be Item-locked and lets the opposing player select their replacement. Prize placements, K0/K1 information, discard/unknown zones, previous Supporter use, Bench availability, current effects and opponent choice all change actual mobility. This census is a **source repertoire upper bound**, and it makes no deterministic assertion about individual games.

**Research implication:** An optimization claim that a gust, stall, or Item lock is durable across the full Aichi field should explicitly model the conditional escape lines in the authenticated opponent sixties and require an opponent decision policy capable of choosing them when legal. The field-wide coverage is a methodological reason to demand such tests; it supplies **zero qualified competitive games** and cannot substantiate 99.5% strength. A stronger next common policy should simulate both seats' mobility and other reactive choices symmetrically, then test consequences under the same actual physical source-deal controls.
