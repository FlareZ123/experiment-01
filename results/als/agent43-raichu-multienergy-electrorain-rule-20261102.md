# Electro Rain counts Energy units: official Japanese ruling and exact Aichi Raichu 60s

**Agent 43 | 2 November 2026 | authentic 29-roster census + official rule + exact enumeration, no native damage settlement**

## A rule that needs a real native Store test

The supplied printed `Alolan Raichu UNM 57` Stage 1 uses **Electro Rain**: discard any amount of Lightning Energy attached to this Pokémon, then for **each Energy** discarded do 30 damage to any opponent Pokémon, allowing repeat selection. Its text says Energy, rather than Energy *cards*. The [official Japanese Pokémon TCG Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%A2%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%A9%E3%82%A4%E3%83%81%E3%83%A5%E3%82%A6&regulation_faq_main_item1=all) explicitly asks: when behind on Prize cards and discarding **one Counter Energy card** through Electro Rain, how many opposing Pokémon choices does the attack make? **Two**. Thus one qualifying Counter Energy physically discarded corresponds to two 30-damage allocations (**60 total damage**); selecting the same target twice is allowed by printed text. Any simulator that counts one **card** as one 30-damage increment in that circumstance contradicts the official ruling. This is a paper requirement, not yet a measured Twinleaf behavior.

## Authenticated original rank-4 and rank-17 source ingredients

The repository's `results/aichi-2026/full-decklists.json` has immutable blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`. Both exact original **rank-4 and rank-17 Raichu Electrode Combo 60s** contain **2 Alolan Raichu UNM 57**, **3 Electrode-GX CES 48**, **4 Reversal Energy PAL 192**, **4 Counter Energy CIN 100**, and **4 Unit Energy LPM UPR 138**, with twelve physical Special Energy cards total. The source card ZIP confirms:

| Physical Energy card | Active printed prerequisite | Lightning units while attached to Alolan Raichu |
| --- | --- | ---: |
| Reversal Energy | Behind in remaining Prize count; an **Evolution Pokémon with no Rule Box** | 3 |
| Counter Energy | Behind in remaining Prize count; a **non-GX/non-EX Pokémon** | 2 |
| Unit Energy LPM | Attached to eligible Pokémon | 1 |

When the above Reversal/Counter prerequisites fail, they provide only one **Colorless**. Those cards cannot alone pay Electro Rain's Lightning cost in that state. Stadiums such as Temple of Sinnoh can nullify the special effects and must be modeled dynamically.

**Electrode-GX's Extra Energy Bomb** attaches five **Energy cards** from discard to own Pokémon other than GX/EX (e.g. Benched non-Rule-Box Stage1 Alolan Raichu), then self-KOs its GX owner if it does so, usually conceding **two Prizes to the opponent per Electrode**. The Bomb's resource count is physical cards, unlike Electro Rain's damage count in Energy units. Two Bombs can concede four Prizes; this both potentially activates the deficit multipliers and brings the opponent near victory. Energy routing, evolution timing, KO/Prize thresholds, available discard, attacker placement and opposing locks must be resolved as a sequence.

## Exact optimization of Energy units for a given attached physical count

Let `r` = attached Reversal count, `c` = Counter count and `u` = Unit count, each integer from 0 through 4. For `N = r+c+u` physical cards, when all multipliers are active, `E = 3r+2c+u` Lightning Energy units and nominal `D = 30E` distributed damage. An exhaustive Python triple enumeration (all copies and sum constraints enforced) yields:

| Physical Energy cards on Raichu | Unique maximizing allocation | Energy units/30-damage choices | Conditional nominal maximum |
| ---: | --- | ---: | ---: |
| **5** | 4 Reversal + 1 Counter | **14** | **420** |
| **10** | 4 Reversal + 4 Counter + 2 Unit | **22** | **660** |
| **12** | 4 Reversal + 4 Counter + 4 Unit | **24** | **720** |

420 is a **five-card upper envelope** that one Bomb could attach if those exact discarded cards and a legal recipient are ready. 660 is a **ten-card upper envelope** from two correctly funded Bombs or another physical attachment route. 720 is the *entire twelve-card pool's* theoretical Energy-unit capacity, and is not evidence that all twelve can reach one attacker in time. These are **conditional maxima**, not demonstrated attacks, win probabilities, or even representative hand possibilities. Weakness/Resistance do not alter the printed Electro Rain increments, while damage-prevention effects and whether Special Energy remains functional can.

The conditional link to [Agent43's Klefki unlock hypothesis](agent43-klefki-counters-active-locks-for-electrode-20261102.md) is important: with own Active Klefki suppressing opposing Active Basic Wobbuffet/Iron Thorns Ability lock, one can hypothetically activate Benched Stage1 Electrode-GX, attach qualifying Energy to Benched Alolan Raichu, then promote Raichu for Electro Rain. When Klefki leaves Active, the opposing lock may return, so finish needed Bombs before switching. The rank25 original roster remains missing; neither of these two published 60s can be silently substituted for it.

## Decisive missing experimental witness

Use the **real pinned Twinleaf Store** and **both physical owner seats**, with an evolved Alolan Raichu already Active, a single attached Counter Energy, an opposing high-HP target, owner behind on Prizes and no interfering Tool/Stadium effects. Dispatch the true `AttackAction('Electro Rain')`, select one target twice in the genuine required target prompts, then assert **exactly 60 damage, one Counter Energy physical card discarded and correct Prize state**. Repeat with a qualifying Reversal Energy (90 damage/three choices) and a qualifying Unit Energy (30/one choice), and an invalid tied-Prize Counter condition. Preserve full root/prompt/payment/effect receipts. If the simulator instead produces only one target selection on the positive Counter case, register an actual paper-fidelity defect and implement a research-owned opt-in hook, with no vendor edits. A mechanical test still cannot establish deck strength; real original-game policy and 25-minute clock are separate requirements.

**Evidence:** real published 60 and supplied card text (direct); official Japanese FAQ (external authoritative); exhaustive integer arithmetic (exact conditional); native attack settlement (unverified); qualified competitive games (zero).
