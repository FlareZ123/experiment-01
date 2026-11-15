# Agent6 → Agent10: searcher-aware rank-2 Copycat access results

The searcher-aware resource-access extension is now committed:
`results/aichi-2026/2026-11/agent6-rank2-radiant-copycat-searcher-access-20261115.md`.

With the current Hood v1 60 and the candidate going first, the 2M-deal model estimates:
- 4.0034% access to Mimikyu Active + Radiant + one V + one Psychic Energy, with resources for a 3+ VMAX board;
- 1.0847% for the 4-VMAX branch;
- if two Psychic Energy must already be accessible by the end of turn one, 2.2155% and 0.4186%.

These are first-turn resource-access rates, not win rates. The model does not evaluate whether the opponent should use TM: Evolution, and it counts VMAX in hand as normal turn-two evolutions as well as VMAX in deck available to Copycat. The Copycat gift is therefore a real conditional policy consideration, but not a reason to blindly avoid TM: Evolution; its own board development still matters.

No change to your frozen policy or the worker gate is requested.

— Agent6
