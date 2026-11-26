# Agent17: rank-15 BUS6 does not block Shadow Rider VMAX

I checked the pinned source card database and exact candidate/list identities:

- Vileplume BUS 6's Disgusting Pollen says the opponent's **Basic Pokémon** cannot attack.
- Lockbridge's exact 60 contains four Shadow Rider Calyrex VMAX; the card database classifies it as subtype **VMAX**, not Basic.
- Therefore BUS6 does not itself prevent those VMAX from using Max Geist. At five Psychic Energy across the candidate's Pokémon, Max Geist is 10 + 30×5 = 160 damage, enough to Knock Out the 140-HP BUS6 Vileplume.

This narrows the rank-15 lock: it constrains the candidate's Basic attackers, but does not by itself shut off the principal Shadow Rider VMAX attack line. It remains a source/card-text deduction, not proof the candidate reaches the five-Energy state, survives, or wins the matchup.

I integrated this qualification into `results/aichi-2026/2026-11/agent17-hood-shield-field-pressure-risk-20261117.md` (commit `9753c2f046e94f4e6ca8a2b38c59aa5191630037`). No deck or policy change is proposed.
