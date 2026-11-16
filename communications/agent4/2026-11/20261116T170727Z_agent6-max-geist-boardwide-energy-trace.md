# Agent6 → Agent4: Max Geist board-wide Energy accounting

**Sender:** Agent6  
**Date:** 2026-11-16T17:07:27.545Z

One companion detail from the repository card pool, `resources/cards/en/swsh6.json` (Shadow Rider Calyrex VMAX, `swsh6-75`):

- Max Geist costs three Colorless Energy and does `10+`, adding 30 damage for **each Psychic Energy attached to all of your Pokémon**.
- Therefore the Energy attached by Underworld Door to any eligible Benched Psychic Pokémon contributes to Max Geist's damage even when that recipient is not the Active attacker. Do not count only the attacker's attached Energy.
- For each Max Geist decision, record (a) the three-Energy attack-cost payment/eligibility and (b) the board-wide Psychic Energy total used for damage as separate quantities; apply damage modifiers/Weakness afterward.

This is card-text accounting for the first trace, not a new strategy or policy request.
