# Dark-type Absol pressure: Gardevoir VMAX fixed-duel counterline

Agent 1, 16 October 2026. **A falsifiable alternative-attacker hypothesis, not a deck recommendation or simulated game win rate.**

The four published Aichi Absol Garbodor opponents use Mega Absol ex, whose Claw of Darkness deals 200 Darkness damage and discards a selected card from the defender's hand. The rank-1 Shadow Rider Calyrex VMAX has 320 HP and Darkness Weakness x2, so unprotected Claw deals **400**, an immediate 3-Prize KO. Garbotoxin simultaneously threatens the Shadow Rider Ability engine.

The pool contains **Gardevoir VMAX (Champion's Path 17)**: Psychic type, 320 HP, Metal Weakness and **no Ability**. Max Cure costs Psychic/Psychic/Colorless, deals 180 and heals itself 50. **Full Face Guard (Evolving Skies 148)** reduces attacks' damage by 20 if the equipped Pokemon has no Ability. This suggests a different Mega Absol breakpoint under Ability lock, because neither Max Cure nor Guard requires a Pokemon Ability.

| Fully powered, stationary duel | Gardevoir attacks first | Absol attacks first |
|---|---|---|
| No Guard; no Muscle Band | Gardevoir wins the two-attack exchange | Absol wins |
| Guard; no Muscle Band | Gardevoir wins | **Gardevoir wins, with 10 HP before its second Max Cure** |
| Guard; opponent Muscle Band (+20) | Gardevoir wins | **Absol wins** |

**Trace with Guard, Absol first:** Claw 200-20 = 180; Max Cure 180 to Absol, heal 50 (Gardevoir damage 130); second Claw 180 (damage 310, Gardevoir has 10 HP); second Max Cure 180 KOs 280 HP Mega Absol. If Absol has Muscle Band, each guarded Claw instead deals 200 and the second attack KOs first.

[Reproducible bounded duel](../../scripts/absol-gardevoir-duel.cjs) and [assertions](../../tests/absol-gardevoir-duel.test.cjs). Source cards: [Mega Absol](https://limitlesstcg.com/cards/MEG/86), [Gardevoir VMAX](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh35/17/), [Full Face Guard](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh7/148).

The champion already plays Radiant Eternatus, whose Climactic Gate can put a VMAX from deck onto the Bench without the corresponding Basic. A **single Gardevoir VMAX** in a research candidate could therefore be fieldable through that specific line. It would be unusable as an ordinary evolution without a Gardevoir V, competes with Shadow Rider VMAX for a deck slot and with other VMAX for Gate selection, and requires 3 Energy and an attack-capable Active position. The opponent can use Field Blower, gust, Muscle Band, Temple of Sinnoh, hand discard, and preemptive attacks. Starting positions, ability locks, Item locks, actual attachments, Prize maps and sequencing remain unmodeled.

**Status:** arithmetic-only matchup substate. No entire decklist or competitive policy has been validated. Avoid promoting this line without testing real attack timing and alternate opponent responses.
