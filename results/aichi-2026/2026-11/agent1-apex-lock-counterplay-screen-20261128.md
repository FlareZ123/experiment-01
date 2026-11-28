# Apex Lockdown: source-locked counterplay and attack-selection triage (2026-11-28)

**Decision:** retain [Apex Lockdown v1](agent1-apex-lockdown-v1.json) as **unqualified**; do not promote based on the existing T2 setup-proxy percentage. The new source-inventory calculation creates specific *falsifying matchup/action forks* for its proposed `Megaton Blower -> Apex Dragon copying Chaos Wheel` plan, and for its alternative `Dominating Echo` attack. It does not simulate a game or a turn, choose a final 60, or demonstrate a win rate.

## Reproducible input and output

- Original 29 available Aichi Japanese Extra inventories: [full-decklists.json](../full-decklists.json), blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. No replacement lists or English reconstruction substitutions. Original ranks **23, 25 and 28 are missing**.
- New executable source-screen: [counterplay-screen.cjs](../../../scripts/2026-11/agent1-apex-lock-counterplay-screen.cjs); tests: [counterplay-screen.test.cjs](../../../tests/2026-11/agent1-apex-lock-counterplay-screen.test.cjs). Run from repo root: `node scripts/2026-11/agent1-apex-lock-counterplay-screen.cjs > /tmp/apex-counterplay.json`, then `node --test tests/2026-11/agent1-apex-lock-counterplay-screen.test.cjs`.
- Source file itself fails closed on non-60 opponents, duplicate source ranks, missing-rank overlap or duplication, and energy names that do not contain the word Energy. Its categories identify **printed inventory**, not drawn, accessible, funded or playable resources.
- Six tests and the real 29-source sweep passed in the connector's synchronous V8/CommonJS stand-in. **Actual Node, pinned native Store, CI, whole turns, games and matchup policies were not run.** No existing workflow or registration was changed.

## Field findings, with exactly 29 authenticated source lists

| Exact printed inventory group | Ranks | Count |
|---|---|---:|
| **Exclusively Special Energy**, no Basic Energy copies | 4, 5, 6, 7, 17, 24, 29 | 7 |
| Exclusively Special **and** printed Pokémon Ranger | 4, 5, 7 | 3 |
| Exclusively Special **and** printed Electrode-GX | 4, 17 | 2 |
| Exclusively Special with **neither of those named routes** | **6, 24, 29** | 3 |
| Printed Garbotoxin Garbodor (`LTR 68` or `BKP 57`) | **8, 11, 16, 22** | 4 |
| Printed AOR `Vileplume 3` with potential Item lock | **2, 15** | 2 |
| Any printed Pokémon Ranger (could clear an attack's player effect) | 4, 5, 7, 18, 32 | 5 |
| Any printed Electrode-GX (potential discard-to-board Energy channel) | 4, 9, 17 | 3 |
| Exclusively Basic Energy | 1, 8, 11, 16, 22 | 5 |
| Mixed Basic and Special Energy | all other 17 known ranks | 17 |

Across the 29 actual 60s, there are **120 Basic** and **118 Special** Energy copies. This is a copied-card composition statistic, not a sample of board states, turns, attacks or games. The ranks with no named Ranger/Electrode are *not* proved to have no legal counter: other cards, preexisting Pokémon, Ability effects, prize positions, Stadiums, timing and opponent decisions can all matter.

## Why these are material tactical forks

**Item-lock precondition (ranks 2 and 15).** `Megaton Blower` is an **Item**. If `Vileplume AOR 3`'s Irritating Pollen is active and unsuppressed, the opponent cannot play Items, so the proposed wipe is not available. The already-documented clean T2 proxy cannot be promoted to those matchups. A fixed 60 relying on this axis must show an *alternative legal* route under the real bench lock.

**Tool-restart asymmetry (ranks 8, 11, 16, 22).** The printed Garbotoxin Garbodor variants function with a Pokémon Tool attached. `Megaton Blower` removes opponent attached Tools, but a following **Dominating Echo** only bars Special Energy and Stadium cards from hand; it **does not bar Tools**. **Chaos Wheel** additionally bars Tools for the next opponent turn. Thus two attacks with superficially similar anti-Special text have different future access effects. This is only a conditional source-side risk, not proof that a Tool is in hand, accessible, or attached.

**Pure Special-Energy dependence (ranks 6, 24, 29).** All three Iron Thorns original lists have **zero Basic Energy copies** and neither named `Pokémon Ranger` nor `Electrode-GX`. Conditional on all opponent attached Energy being Special and removed by the wipe, a following next-turn ban on playing Special Energy from hand denies *ordinary manual Energy reattachment*. This does **not** rule out other card effects or a switch, or prove that Megaton can be played before an enemy lock; it identifies the exact state in which the plan has exceptional payoff. The full original inventories of these ranks should be used to falsify alternate attachment paths before concluding any skipped attack.

**Damage tempo is a competing axis.** Copied `Chaos Wheel` deals **100** and copied `Dominating Echo` deals **140** before modifiers. At printed 230 HP for Iron Thorns ex, two 140-damage attacks suffice while two 100-damage attacks do not; at 280 HP the same distinction holds (280 vs 200). That is a *pure damage threshold*, not a 2-turn KO prediction: both need legal turns, no healing/protection and the appropriate target. An optimizer must not choose the lower-damage Tool ban solely because it contains more keywords.

## Next actual decision gate

For the **same unchanged Apex 60** and realistic opponent policies, use matched physical deals to inspect three adversarial forks before claiming a better candidate:

1. Ranks **6/24/29**: exact `Megaton -> Echo` versus `Megaton -> Chaos` line, with actual paid attack, Tool replay, alternative Energy-attachment effects, and turn-2 counterplay; compare Prize conversion, not simply whether a lock flag was raised.
2. Ranks **8/11/16/22**: show whether Tool removal followed by **Echo** allows a source Tool + Garbotoxin reactivation that prevents the next Apex, and whether **Chaos** prevents it. Opponent must be allowed a sensible counterline; no scripted pass.
3. Ranks **2/15**: place live unsuppressed AOR Vileplume before the wipe attempt and require an alternate line; if the candidate cannot establish a non-Item plan, report failure rather than pretending the wipe occurred.

These tests require proper actor-only policies, native correctness and owner authorization where applicable. Existing v1 setup percentages remain **unqualified opportunity metrics**, and the best fixed 60 / 99.5% objective remains unproven.

## Source interpretation

Card text used: `Megaton Blower sv8-182` discards opponent Tools and Special Energy and the in-play Stadium; `Giratina-EX xy7-57` `Chaos Wheel` forbids Tool, Special Energy and Stadium play from hand during the next opponent turn; `Noivern ex sv2-153` `Dominating Echo` forbids only Special Energy and Stadium; `Vileplume xy7-3` `Irritating Pollen` forbids Item play; `Garbodor bw11-68` / `xy9-57` `Garbotoxin` requires an attached Tool. Verified against the supplied card-list archive on 28 November 2026. No full interaction adjudication is asserted.
