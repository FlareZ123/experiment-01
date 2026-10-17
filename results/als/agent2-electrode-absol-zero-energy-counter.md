# Agent 2: zero-Energy Grass response to Aichi Mega Absol ex

**18 October 2026.** Mechanism: conditional printed card text plus official Japanese Curry ruling. **Status: untested full-60 line; no qualified competitive outcomes.**

## Thesis and source identity

Four available Aichi Top32 source opponents, ranks **8, 11, 16, 22**, play Mega Absol ex (MEG 86) and Garbodor with Garbotoxin. The champion rank-1 Shadow Rider Calyrex VMAX is weak to Mega Absol ex's Darkness attack; [our companion printed threat report](../aichi-2026/agent2-absol-calyrex-attack-envelope.md) checks the resulting 400-damage / three-Prize exchange.

A structurally different counterattack fits in **three unique card slots** before accounting for required search and switching support:

1. **Hisuian Electrode V (LOR 172; `swsh11-172`)**, Basic Grass Pokémon V, 210 HP and two-Prize liability. Its `Tantrum Blast` has **zero Energy cost** and does **100 damage per Special Condition affecting itself**.
2. **Spicy Seasoned Curry (ASR 151; `swsh10-151`)**, Item: burn the player's Active Pokémon, heal 40 damage.
3. **Supereffective Glasses (ASR 152; `swsh10-152`)**, Pokémon Tool: when applying Weakness to damage dealt by the equipped Pokémon to the opponent's Active Pokémon, use **×3**.

Printed Mega Absol ex (MEG 86; `me1-86`) is Darkness, **280 HP**, **Grass Weakness ×2**, Mega ex **three-Prize** Rule Box. Electrode's one Burned Special Condition gives `1 × 100 = 100` base damage. With Glasses attached and that Grass Weakness in force, damage is `100 × 3 = 300`, which exceeds 280. A single successful zero-Energy Electrode knockout awards **three Prize cards**. If the opponent later KOs Electrode V, they receive **two**, absent other effects. No Psychic Energy needs to be attached to Electrode.

This is an **attack and Tool line**, without relying on Electrode's Abilities. Consequently Garbotoxin's Ability suppression alone does not disable Tantrum Blast or the Tool. The exact timing still depends on Pokémon position and Item/Tool availability, and other locks or prohibitions may interfere.

## Full-HP Curry playability: official rule confirmed

Pokémon Japan's official Q&A search for `からくちスパイシーカレー` specifically asks whether Spicy Seasoned Curry may burn the Active Pokémon when it has **zero damage counters**. The official answer is **yes**.

Source: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%81%8B%E3%82%89%E3%81%8F%E3%81%A1%E3%82%B9%E3%83%91%E3%82%A4%E3%82%B7%E3%83%BC%E3%82%AB%E3%83%AC%E3%83%BC&regulation_faq_main_item1=all

This resolves the key precondition ambiguity despite general no-change restrictions for healing-only Trainers: Curry's Burn changes game state even if its healing has nothing to remove. Burn damage checks at Pokémon Checkup after the attack turn, so the Burn status is available to Tantrum Blast within that turn. A card that prevents Burn, removes the condition, disables the attack, or blocks Item play defeats this particular sequence.

## Realistic dependencies and counterplay

- Electrode must become **Active before Curry is used**. Curry burns only the player's current Active Pokémon. Placing Electrode on the Bench without an adequate switch/retreat line does not execute the ALS.
- Electrode must be present and equipped with Glasses; it has only **one Tool slot**, conflicting with Float Stone, Forest Seal Stone, or other Tools on the same Pokémon.
- **Arven** can search the necessary Item and Tool in the same Supporter play when both remain in deck, but requires Item/Tool search to be possible and consumes the single Supporter for the turn. This creates a proposed compact line `find Electrode -> promote Electrode -> Arven -> Curry + Glasses -> attach Glasses -> play Curry -> Tantrum Blast`.
- **Hood Shield v1** already includes one Arven, but its four Mysterious Treasure and four Fog Crystal principally serve Psychic Pokémon, so a Grass Basic is an important **connector bottleneck**. Its one Quick Ball and Forest Seal Stone are possible broad-category connectors, each with different costs and competition. Deck construction needs explicit source access and a switch route.
- **Budew attack-origin Item lock** can prevent the Curry play. Pokémon Tools are a separate class under the modern rules, even when old Tool cards had the Item header. Stronger Tool lock, Jamming Tower, opposing Field Blower and gust effects threaten additional parts of the line.
- Glasses affects **Weakness on the opponent's Active**. A Bench-targeting alternative, disabled Weakness, altered type, damage prevention or changed attack profile can defeat the computation.
- The three cards consume slots against the **entire fixed 32-list field** and give uncertain value versus other Pokémon. Electrode V has Fire Weakness and exposes a two-Prize target. An opponent might KO it before it is Active or before it attacks.

The Japanese Expanded banned-identity snapshot `results/legality/japan-expanded-aichi-2026.json` does not list these three names, and they appear in the English database with Expanded legality. **Event-date Japanese printing, errata and overall deck legality still require full verification** before inclusion in a proposed fixed 60.

## Evidentiary requirements and preferred next test

1. Genuine pinned Twinleaf Store with Active Electrode at full HP: verify legal `PlayCardAction` Curry burns, `PlayCardAction` Glasses equips, and a zero-Energy `AttackAction('Tantrum Blast')` KOs Active MEG 86 for exactly three Prizes. Require matching validations in both physical seats, and test a blocked Item mode as negative control. Check whether research-owned hooks are necessary.
2. Build a **frozen candidate full 60**, recording exactly three cuts, search/switch opportunity costs, ability-lock coexistence and Prize collapse. Check complete Japan paper Expanded legality.
3. Actual source-60 game against each of ranks 8/11/16/22 with tracked starting order, opponent's live Garbotoxin, Dark Patch and attack choices, Item lock windows, and source-true responses. No aggregate until policies, clone safety, rule-fidelity and both-seat game traces are independently qualified.

This report is a **conditional three-card counter-ALS hypothesis**. Damage arithmetic and official Curry playability are established. Search consistency, realistic usage frequency, successful natural games, and win probability are **unmeasured**. Do not promote a deck or report a win-rate improvement on the strength of this line alone.
