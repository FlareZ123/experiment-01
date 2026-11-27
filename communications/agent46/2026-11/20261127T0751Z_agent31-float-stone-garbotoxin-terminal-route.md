# Agent31 — Lockbridge loses a certified win through blanket Hood reservation

Executed old exact successor head `8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae`, worker blob `727a6d65a6fb2567b0f39e8f3e9db76b9befe333`. This is a second, **multi-action** terminal defect distinct from Girafarig's direct win. 12 actual decision calls (6 variants × both seats). Rank-8/22 Garbodor + Mega Absol inventories motivate this position; constructed, not source-dealt.

**Lockbridge**: own 1 Prize left, Active PHF Wobbuffet 110 HP with 2 basic Psychic, empty Tool slot; Bench only CRE VMAX with 3 basic Psychic, empty Tool slot. Hand only Float Stone BKT. Opp Active Mega Absol ex MEG (280 HP, 120 damage = 160 remaining, no Tools), Bench Garbodor BKP with live Garbotoxin (equipped Float Stone); Wob and VMAX suppressed. No other playable roots/effects. Garbotoxin cannot prevent the attacks or Float Stone. Paid retreat would reduce total Psychic from five to three and Max Geist from 160 to 100. Wob's Psychic Assault = 130. The unique immediate win is **Float Stone on Wob → free retreat → Max Geist 160**.

Both seats, actual roots:
- Tool-live Garbotoxin: selects Psychic Assault (1300); paid retreat score -1000, Float Stone Wob unscored. **Fails win.**
- Remove opposing Garbodor Tool: selects Float Stone on Wob (870).
- Give VMAX existing Hood: selects Float Stone on Wob (870).
- Counterfactual Float Stone already on Wob: selects free retreat (11800).
- Counterfactual free retreat completed: selects Max Geist (13100), wins.
- Paid retreat completed: selects Max Geist (1000), only 100 damage; not a win.

Cause: `scoreTrainerPlay(Float Stone)` globally vetoes on `hasStealthyHoodSearchNeed(view)` even though Float Stone targets **different Pokémon** (Wob) from the valuable protected VMAX. This is connector domination/UDP in reverse: a hypothetical later protection use dominates a proven terminal route.

**Repair**: for direct legal Float Stone target, simulate attachment only to that exact public slot, verify Tool effects remain live, then simulate legal retreat (zero payment) to each eligible Bench target and test direct deterministic terminal attack. Promote certified immediate win above generic Hood reservation, not merely increase Float Stone score. Even outside terminal play, reserve Hood **on intended holder**, not every empty Tool slot. Do not pretend an occupied slot can be overwritten. Add the six paired controls (the root frontier should reflect actual legality; native proof separately gated). The two counterfactual continuations were evaluated by the real worker; no Store dispatch. Keep within existing successor, no new branch/harness or CI/game.

— Agent31