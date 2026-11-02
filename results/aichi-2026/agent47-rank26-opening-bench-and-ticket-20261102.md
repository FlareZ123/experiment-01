# Rank-26 Meloetta: opening-Bench exposure and Prize-reset feasibility gate

**Agent 47 | 2 November 2026 | exact setup combinatorics and printed-card analysis.** This study extends [the rank-26 conditional first-turn Crisis Punch sequence](agent47-rank26-meloetta-crisis-punch-original-line-20261102.md). It is **not a native game, a modeled win probability, or a certified deck ranking**.

## Relationship to the existing source research

This is a **decision-integration follow-up to previous work**, not an independent discovery of the Ticket effect or of the solo-Active defense. Agent34's [Ticket Prize audit](meloetta-redeemable-ticket-prize-gate.md), Agent27's [conditional DCE/Ticket Prize-cut calculation](rank26-dce-ticket-prize-rescue-cut.md), and Agent18's [compiled paper-order correction](../twinleaf/redeemable-ticket-paper-order-hook.md) already establish the printed Ticket rule, its opening probabilities, and the **pinned Twinleaf engine's reversed deck-end behavior unless its research-owned opt-in correction is enabled**. The earlier [New Moon/champion solo-opening comparison](../als/new-moon-meloetta-start-exposure.md) already gives those two unconditional-in-mulligan counts and stronger bonus-draw figures, while the [field-wide defense census](meloetta-donk-defense.md) audits all 29 exact original prints.

The incremental contribution here is a **single sourced four-contender comparison** that adds both Hood Shield and Temple to that setup exposure table, a source-locked reproducible audit, and the concrete integration veto that the existing optional [rank26 Exeggcute Pump decision hook](../../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs) checks opponent Prize count yet omits opponent **Bench presence**. The older [source first-turn search](../../simulation/twinleaf/meloetta-rank26-firstturn-source-window.cjs) already identifies lone opponents; this report argues that the same test must constrain decisions *before* the source gives away five Prizes. The existing [public last-Pokémon damage screen](../../simulation/twinleaf/agent7-public-no-bench-terminal-attack.cjs) is a possible foundation, subject to its stricter conditions. These are prospective design requirements, with no native policy rollout demonstrated.

## Decision-relevant result

The original rank-26 *Meloetta Donk* 60 has a first-turn line that engineers five **own** Exeggcute Knock Outs through Risky Ruins and Damage Pump. That leaves the **opponent** with exactly one Prize, enabling Meloetta ex's Tool-provided Crisis Punch for 280. Even if every cost and permission resolves, Crisis Punch targets one opposing Pokémon. If the opponent has a second Pokémon on the Bench, Knock Out of the Active **cannot simultaneously satisfy the no-Pokémon-in-play win condition**. The self-KO plan has then exposed its pilot to immediate one-Prize defeat on the opponent's reply. An opponent with two Basic Pokémon in a valid seven-card opener can voluntarily Bench at least one **before the game starts**, eliminating this specific immediate single-KO/no-Bench terminal.

Thus, meaningful rank-26 opponent-policy competence requires two opening-state buckets: **genuinely exposed solo Active** and **at least two opposing Pokémon initially in play**. A source bot should check the full intended terminal and available opponent Bench before burning five own Prizes. Its action model should never treat raw access to three Damage Pumps and the Technical Machine as a successful terminal line.

## Exact exposure for the four fixed candidate/reference 60s

The machine-readable immutable source inventories are [rank-1 original 60](full-decklists.json), [Hood v1](candidate-hood-shadow-rider.json), [Temple v1](candidate-temple-shadow-rider.json), and [New Moon v1](../als/new-moon-lockbreak-english-proxy-60.json). The only evolution names in these four inventories are **Shadow Rider Calyrex VMAX** and **Dusclops**. All other Pokémon are starting-eligible Basics. The table counts a uniform ordinary opening seven **conditional on at least one Basic**. It assumes that players with two or more Basics choose to Bench a second at setup; it excludes extra draws awarded from opposing mulligans, game actions, opponent information available before setup, and unusual starting effects.

| Fixed 60 | Basic copies B | P(exactly 1 Basic given valid 7) | P(at least 2 Basics given valid 7) |
| --- | ---: | ---: | ---: |
| Original champion Shadow Rider | 14 | **39.41763348%** | 60.58236652% |
| Hood Shield v1 | 14 | **39.41763348%** | 60.58236652% |
| Temple v1 | 15 | **35.84686438%** | 64.15313562% |
| New Moon Lockbreaker v1 | 17 | **29.27817856%** | 70.72182144% |

For B Basic copies and a seven-card hand, exact integer combinatorics give

\[
P(\text{exactly one Basic}\mid\text{valid})=
\frac{B\binom{60-B}{6}}{\binom{60}{7}-\binom{60-B}{7}}, \quad
P(\text{at least two Basics}\mid\text{valid})=1-P(\text{exactly one Basic}\mid\text{valid}).
\]

This is the **pre-turn information-state exposure** under a specific competent Bench policy. It is **not** the probability the rank-26 deck wins. The Meloetta side still needs to go through a complex authentic opening with available resources, both Energy types/payment, five self-KOs, attack authorization, and actual 280 to a vulnerable opposing Active. A defender holding multiple Basics may rationally decline to Bench before knowing the matchup, and the Pokémon are not revealed until setup ends; an engine must model that information boundary rather than give defenders hidden knowledge of the rank-26 archetype. Some Active Pokémon can also suppress an attacking Ability, and matchups may have other attacks or Prize routes beyond this one-turn terminal.

## Source-side Prize collision and the overlooked Ticket mechanism

The **original rank-26 source 60** contains exactly **one Double Colorless Energy** and **one Redeemable Ticket**. The proposed first-turn Crisis Punch line uses one Lightning acceleration from Tapu Koko Prism Star and the unique Double Colorless as the manual attachment to meet the three-Colorless attack cost. With six initial random Prizes, the DCE is initially Prized with probability **10% unconditionally** or **10.077777380% conditional on a valid seven-card rank-26 opener**. This is **not** a hard 10% failure certificate:

- [Redeemable Ticket, official Pokémon card text](https://asia.pokemon-card.com/sg/card-search/detail/18003/) moves **all current Prize cards to the bottom of the deck** and sets the same number of new Prizes from the *top* of the deck. With at least six pre-existing deck cards (true early in a normal game), it deterministically **unprises every old Prize**, including a formerly Prized DCE. This is a physical placement operation, not a uniformly random redraw of the combined deck and Prize pool. DCE access then becomes a search, shuffle, and draw-sequencing problem; DCE begins at the bottom until the deck is changed. A search of the deck can establish K1 Prize knowledge beforehand, but does not itself retrieve the DCE.
- When **both** unique DCE and unique Redeemable Ticket are initially Prized, the rank-26 original list has no other printed direct prize-exchange path for that Special Energy. Its Hisuian Heavy Ball only swaps a **Basic Pokémon** out of the Prizes. The double-Prized event is exactly \(\binom{58}{4}/\binom{60}{6}\) = **0.8474576271%** under an unconditioned random six-card Prize allocation. On this event the proposed *first-turn DCE-powered Crisis Punch* cannot be assembled by the named line, even though the two cards physically exist in the 60.
- The native Ticket implementation at the pinned Twinleaf revision has a **known reversed deck-order bug**. Its previously verified opt-in [paper-order correction](../twinleaf/redeemable-ticket-paper-order-hook.md) must be explicitly selected before any such native chain can be treated as paper-valid. Redeemable Ticket cannot be assumed playable if it is in hand with no viable opportunity or is itself Prized; a native paper-positive state must show that actual Item activation, top-to-bottom transition, new Prize count, owner-only deck knowledge and subsequent DCE retrieval. It must not approximate Ticket as simply shuffling all 52 remaining cards and redealing six.

The double-Prized probability is a **specific physical-resource failure state**, not an upper bound on rank-26 match wins, because alternate lines and later turns exist. A first-turn Ticket may also be strategically harmful if it replaces known-Prize contents with new unknown Prizes while consumable resources are scarce.

## Additional source-specific interaction vetoes

- Risky Ruins is triggered by **Basic non-Darkness Pokémon put on the Bench during the turn**, per the [official printing](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/me01/127). Pokémon placed during setup before Risky Ruins is played are not retroactively damaged.
- Reusing one physical Plasma Freeze Exeggcute after it re-enters the discard has a cited [May 2013 TPCi Rules Team FAQ](https://www.pokebeach.com/forums/threads/exeggcute-propagation-question.119787/), reproduced in the preceding source-line research. This must still be validated in the pinned native Store.
- The New Moon printed 60 has one **Klefki SVI 96**. When it starts Active, *Mischievous Lock* removes Basic Pokémon's other Abilities, including the Basic Meloetta ex's first-turn permission, unless the source can resolve its one Canceling Cologne or another legitimate lock answer. Thus an unprotected solo Active is **necessary for the simple no-Bench win model, but not sufficient for a legal first-player Crisis Punch**. Wobbuffet's Bide Barricade exempts Psychic Pokémon and cannot automatically be treated as equivalent to Klefki here.
- A raw one-Basic opener gives no right to observe opponent's deck before setup. Any recommendation to Bench an extra Basic is an actual policy intervention with future Bench/Prize liabilities; this memo only quantifies the immediate all-Pokémon-KO exposure.

## Reproduction and release gate

[Exact BigInt combination and real-inventory audit](../../scripts/agent47-rank26-opening-bench-coverage.cjs) and its [four-case Node regression](../../tests/agent47-rank26-opening-bench-coverage.test.cjs) are committed. The arithmetic was independently checked locally; a complete repository-installed Node test run has **not yet been observed**. The script additionally distinguishes unconditional 10% DCE Prize risk from the existing exact 10.077777380% valid-opener risk and computes the 0.860683385% conditional dual-Prize obstruction. The script reads actual four fixed 60s and original rank-26 DCE count; it does not compute a game outcome. It can be run under the existing Node 20+ environment with no engine compile and no new automatic workflow.

**Highest-value next native experiment:** With one prospectively registered two-seat common policy, stratify *every untouched original rank-26 physical setup* by opposing initial Bench size. Retain solo-Active opportunities, source-side DCE/Ticket Prize identities after a legitimate deck search, any Ticket root, all five own KO/Prize payments, locked or unlocked Meloetta ability, first-turn Crisis Punch settlement, and the opponent's next actual action. Against a defender with an initial Bench, source policy must distinguish an intentionally terminal no-Bench line from gratuitously awarding the opponent five Prizes. Preserve attempted/failed/capped rows. If no complete source line is observed, report **NOT_ENCOUNTERED** rather than a modeled win.

The overarching decision remains unchanged: **29/32 authenticated source sixties, no competitively qualified games, no selected best fixed 60 and no demonstrated 99.5% field win rate**.
