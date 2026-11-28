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


## Concrete non-Item answer to AOR + Stealthy Hood already in the Apex 60

An important counterexample to treating the AOR Item-lock flag as a hard dead end: the *fixed, unchanged* Apex v1 60 already contains **Mega Dragalge ex (ME4 65)** as an Apex Dragon donor and **Wobbuffet (PHF 36)** as an Active Ability suppressor.

- **Copied Corrosive Liquid is not an Item.** ME4 65's attack discards **all opponent Pokémon Tools and Special Energy**. If Mega Dragalge is actually in the discard, Regidrago VSTAR is legitimately funded, active, and allowed to attack, its Apex Dragon can copy Corrosive Liquid *through* AOR Irritating Pollen, removing an AOR Vileplume's Stealthy Hood. The attack has **no damage and ends the player's turn**; it does **not** remove Stadiums or itself prevent reattaching another Hood next turn. This is a functional *alternate Tool/Special wipe*, **not** Megaton equivalent or a guaranteed loop.
- **Wobbuffet pivot is conditional on Hood.** While PHF 36 Wobbuffet is Active, Bide Barricade suppresses non-Psychic Pokémon Abilities, including unprotected Grass AOR Vileplume. This can open an Item window to play Megaton (and place Float Stone on Wobbuffet before retreating). However, **Stealthy Hood UNB 186 protects its holder from opposing Abilities**: if attached to AOR Vileplume, Wobbuffet does *not* by itself reopen Items. The source 60s contain **three Hoods at rank 2 and two at rank 15**, along with Guzma & Hala Tool access. Moreover, Wobbuffet Active and Regidrago VSTAR Active are mutually exclusive positions; movement and Supporter contention must be paid, and rank 2's Stoutland Supporter lock can interfere.
- **Direct attacker route.** If AOR Vileplume itself is the opposing Active and Regidrago's relevant donor is in the discard, the fixed candidate also has **Dragapult ex Phantom Dive 200** or **Haxorus Cross-Cut 160 against an Evolution** as possible copied attacks. Under unmodified damage and with AOR Vileplume's 130 HP these can KO the lock Pokémon rather than spending an entire attack on a wipe. If AOR is Benched, they do not automatically reach it; gust and mobility are separate costs.

This exposes a **specific policy fork**: direct KO when paid/legal and targetable; else compare non-Item Corrosive Liquid (turn-ending, re-Hood vulnerability), Wobbuffet unlocked Megaton (requires no protected AOR and a paid pivot), and a straight Chaos/Echo attack. A deterministic future opponent policy must actually take a Tool-replay or Stoutland continuation when available. No path above is claimed to have been executed through pinned Twinleaf or proven successful against a competent player.


## Source-certified tactical options against rank 2 / rank 15 Active locks

The new [executable lockbreak proposal module](agent1-apex-nonitem-lockbreak.cjs) distinguishes **direct knockouts**, **Poison knockouts during the immediately following Pokémon Checkup**, and **non-damaging Tool/Special-Energy stripping**. Its [seven source-identity / negative-control cases](../../../tests/2026-11/agent1-apex-nonitem-lockbreak.test.cjs) passed as synchronous V8/CommonJS checks using the real original 60s. It is **not** a native-game simulator, full decision policy, or proof that a particular line was available in a played game. It requires actor-visible certification of a paid legal Apex Dragon, the Dragon donor in own public discard, printed opposing Active, damage counters, effect protection, checkup safety, and (for direct damage) damage-calculation safety; unknown is not silently accepted.

| Original rank and visible Active | Exact printed HP | If Mega Dragalge in discard and Apex paid | Faster competing donor |
|---|---:|---|---|
| **2** BCR 122 **Stoutland**, Sentinel Supporter lock | 140 | Copy **Pernicious Poison**: inflict Poison with **16 damage counters** (160 HP-equivalent) during Pokémon Checkup after the turn. If no protection/checkup alteration, KO happens before the opponent takes their next action, lifting its Active-only Supporter lock. | **Haxorus Cross-Cut** 160 damage, or **Dragapult Phantom Dive** 200, already KOs during the attack if donor present and damage permitted |
| **2** AOR 3 **Vileplume**, Irritating Pollen Item lock | 130 | Same Poison-160 immediate-checkup KO without playing any Item/Supporter; may also copy Corrosive Liquid to remove a protecting Hood (but attack then deals **no damage**) | Same Haxorus/Dragapult direct attack |
| **15** BUS 6 **Vileplume**, Disgusting Pollen Basic-attack lock | 140 | Same Poison-160 immediate-checkup KO. **Regidrago VSTAR is an Evolution**, so the printed BUS Basic-only prohibition does not itself stop Apex Dragon. | Same Haxorus/Dragapult direct attack |
| **15** AOR 3 **Vileplume**, Irritating Pollen | 130 | Same non-Item Poison option or wider attached-Tool purge | Same direct attack |

**Why the turn timing matters:** the game resolves attacks, then Pokémon Checkup before the next turn. The 16 Poison counters are *not attack damage*, so Weakness/Resistance and damage prevention are not the same as Special-Condition/effect immunity. The opponent normally does **not** get an intervening action to retreat or switch away before the *first* Checkup; other between-turn effects can still matter, hence the \`checkupSafe\` gate. If a direct Cross-Cut or Phantom Dive KO is available, it occurs **earlier** and may be preferable; this module deliberately returns options instead of claiming the Poison line is always optimal.

**This is a material alternative to the original 'Megaton cannot be played under AOR' dead end.** The fixed Apex 60 already contains the necessary Mega Dragalge, Haxorus and Dragapult donors. Its real bottleneck is **placing the relevant singleton donor into own discard before both Item-lock and Supporter-lock close discard-search pathways**, funding Regidrago VSTAR, and keeping an attackable Active. The tactical module cannot establish these prerequisites; exact-source native opponent-turn play remains the next falsification.
