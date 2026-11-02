# Rank26 source Pump: native public-defender-Bench veto, both seats, original physical 60s

**Agent 47 | 2 November 2026 | staged real Twinleaf Store decision test, zero match games.**

## What was changed

The original [optional rank26 source Exeggcute Damage Pump policy](../../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs) already constrained intentional self-KOs by the number of opposing Prizes left. It **did not** check whether a single attack on the defender's Active Pokémon could remove **every opposing Pokémon in play**. A defender with a Benched Pokémon would survive a Crisis Punch Active Knock Out, retaining an immediate winning reply after the source voluntarily gave away five Prizes. See [the rank26 original-card sequence](agent47-rank26-meloetta-crisis-punch-original-line-20261102.md) and [the four-contender setup exposure](agent47-rank26-opening-bench-and-ticket-20261102.md).

A prospective, explicitly default-off third option was added: `withRank26ExeggcutePump(sourceSeat, execute, {requireOpponentSoloActive:true})`. It calls `opponentHasLiveBench(state,sourceSeat)`, using **only public opposing Bench occupancy**. When an opposing Bench Pokémon is present on the source's first-turn decision, the optional overlay declines its selected self-KO Pump and delegates to the original baseline actor; its audit records an `opposing-bench-present` veto. The original two-argument invocation still has the historical `rank26-single-source-pump-v1` audit and **identical default decision rules**. The new opt-in audit is `rank26-single-source-pump-solo-public-board-v2`.

**Scope boundary:** This gate vetoes deliberate Pump suggestions made by this particular optional overlay. A generic original bot's separate decisions, other own Prize-sacrifice tactics, different attack routes and possible later-game benefits are outside it. An absent opposing Bench is a necessary condition for the named one-Active-KO early donk, **not a sufficient condition** to win; first-player attack permission, Energy and Tool, Prize state, source K0/K1, opponent abilities, physical deck and real native action resolution are still required.

## Compiled native evidence and physical custody

[Existing manual Aichi Damage Pump workflow 41487527917](https://github.com/FlareZ123/experiment-01/actions/runs/41487527917) **SUCCESS** against the pinned Twinleaf and the **actual original rank-26 Meloetta 60 plus original rank-6 Iron Thorns 60**, using one prearranged source-native board. No deck substitution or copy-created Bench card was used.

[Native four-case runner](../../simulation/twinleaf/agent47-rank26-solo-opponent-pump-staged.cjs) is a specialization of the already validated original-sixties [prepared Pump fixture](../../simulation/twinleaf/rank26-pump-source-conserved-fixture.cjs). In the opposing-Bench arm, it moves a second real Iron Thorns ex **from the original defender's hand to the Bench**, preserving all 60 identifiable physical instances for each player. It installs a **synthetic baseline return marker** only as a transparent negative test of control delegation. The native source Pump proposal is an actual `PlayCardAction`; no action is dispatched and the synthetic marker is **not** a legal gameplay action or a counterfactual game. The output [artifact 13162288350](https://github.com/FlareZ123/experiment-01/actions/runs/41487527917/artifacts/13162288350) contains the complete `agent47-rank26-solo-pump-staged.json` (**2577 bytes, uncompressed SHA-256 `c500942e1f0beeff1b1471b520decb5547f223fcdc5f078dc1246cfb9c507d95`**).

| Source physical seat | Defender has Benched Iron Thorns? | Proposed source overlay action | Opt-in vetoes | Physical original 60s |
| --- | --- | --- | ---: | --- |
| 0 | No | Native `Damage Pump LOR` PlayCardAction, 2 counter moves | 0 | Both conserved |
| 0 | Yes | Synthetic baseline delegation marker; no overlay Pump | 1 | Both conserved |
| 1 | No | Native `Damage Pump LOR` PlayCardAction, 2 counter moves | 0 | Both conserved |
| 1 | Yes | Synthetic baseline delegation marker; no overlay Pump | 1 | Both conserved |

The [three pure public-board regressions](../../tests/agent47-rank26-solo-opponent-pump-gate.test.cjs) also passed: both physical seats, empty and occupied Bench, own Bench does not count, and guarded observer never touches inaccessible hidden hand/deck/Prizes. The existing original staged Pump settlement test also remained green in the same workflow. **Four prepared observations are not four randomized games**, and their artificial fallback is excluded from any gameplay outcome.

## Research consequence and next gate

This is a useful **preventative tactic predicate**, not a win-rate improvement. A next genuine source-first prospective matched-seed test should compare the old and opt-in source root selection against defenders that actually Bench another Basic during legal setup, preserving physical board, source K0/Prize access, paper-valid Pump payments and complete ensuing games. A real actor baseline fallback must be tested instead of the synthetic marker, and candidate defensive choices should not receive hidden knowledge of rank26 before legitimate reveal.

Default historical research fixtures and frozen profiles were not changed. All source opponent rank26 native games remain competitively unqualified; the benchmark still has **29/32 authenticated original 60s, zero qualified games, and no established 99.5% fixed deck**.
