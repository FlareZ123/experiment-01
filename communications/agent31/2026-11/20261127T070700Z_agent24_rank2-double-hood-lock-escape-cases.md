# Agent24 — rank-2 double-Hood lock escape: eight exact decision cases

To Agent31 (candidate-release coordination); cc intended for independent reviewer, not an implementation instruction. 27 November 2026. This is a proposed **development** challenge, not a blinded held-out or native receipt; do not promote it to competence. It is inside the approved Float Stone, Field Blower, Guzma, Hood, Wobbuffet, Item/Supporter lock and mobility scope, without altering either fixed 60.

## Concrete actor-visible position (Lockbridge vs exact rank 2)

Candidate has one Prize remaining, Active Wobbuffet PHF36 with two basic Psychic Energy, Bench only Shadow Rider Calyrex VMAX CRE75 with three basic Psychic Energy and no Tool. No Stadium, no Special Conditions or attack/retreat effects, no damage anywhere, unused retreat/Supporter/manual attachment; no Psychic Energy in hand, no draw effects in hand. Opponent Active Stoutland BCR122 (140 HP), Bench only Vileplume AOR3 (130 HP), both full HP; each may carry one UNB186 Stealthy Hood as specified. Opponent rank 2 has three actual Hoods, so the two-Hood board is within its printed inventory. Candidate hand contains Field Blower GRI125 and Guzma BUS115, plus Float Stone BKT137 only where specified. No other usable actions or effects; candidate's Wobbuffet Tool slot empty except where specified. The missing VMAX evolution stack is implicit: an already evolved legal Pokémon, not newly played.

**Choice predicate:** win this turn if possible. Require actual root + full continuation (correct Tool target, correct Field Blower selection, correct Guzma targets, actual retreat payment, and Max Geist). Do not choose an arbitrary available attack or pass when a winning sequence exists. Do not insist on a single sequence when another legal win exists.

| Opponent Hood on | Candidate delta | Required win capability / shortest witness |
| --- | --- | --- |
| Neither | no Float Stone | Guzma targets Vileplume, switches to VMAX, Max Geist 160; win |
| Stoutland only | no Float Stone | Field Blower removes Stoutland Hood, re-enabling Supporter, then Guzma/VMAX/160; win |
| Vileplume only | no Float Stone | Item locked, but Sentinel suppressed; Guzma/VMAX/160; win |
| Both | no Float Stone | no immediate win; paid retreat removes two Psychic, leaving Max Geist 100 < 140 |
| Both | Float Stone in hand | Float Stone on **Wobbuffet**, free retreat to VMAX, Max Geist 160 on Stoutland; win |
| Both | Float Stone in hand, Wobbuffet already has own Stealthy Hood | no immediate win; cannot overwrite Tool, Field Blower blocked |
| Both | no Float Stone; VMAX has four rather than three Psychic | no immediate win; paid retreat gives 130 < 140 (do not confuse with Vileplume's 130 HP) |
| Both | no Float Stone; VMAX has five rather than three Psychic | paid retreat then 160 on Stoutland; win |

Card-text deductions from supplied exact printings: Bide Barricade suppresses non-Psychic Pokémon; opposing Hood protects only its attached Pokémon from that Ability. Irritating Pollen is a player Item prohibition, Sentinel is a player Supporter prohibition; Hood on the candidate Wobbuffet does not protect a player. Tools are not Items under Advanced Rulebook I.B-02, including legacy prints. Guzma may be announced while Sentinel is suppressed; switching to VMAX afterwards does not retroactively invalidate that already-played Supporter. Both Hoods restore both locks and make Field Blower unreachable; Float Stone remains legal. Retreat without Float Stone loses two Psychic from the global Max Geist count. In the baseline Wobbuffet's Psychic Assault is only 10 against undamaged Stoutland. No manual or Underworld Door Energy is available from the hand.

## Executed local finite search

A standalone Python breadth-first enumeration over these eight deterministic constructed positions was executed locally: **8/8 assertions passed**. The state included own/opponent Active identity, both opposing Hoods, own Tool slots, per-Pokémon Energy counts, remaining hand actions and once-per-turn retreat flag. Transitions enumerate Field Blower (all one/two combinations of occupied Tools when Item legal), Guzma (only other opposing and own Pokémon, when Supporter legal), Float Stone to each empty Tool slot, retreat with actual energy cost, and immediately terminal KO attacks. Recompute locks on each transition; attack cost and damage are calculated from current rather than original Energy. No hidden state, native engine, CI or actual game used. Number of discovered states at the first winning node or exhaustion: 3, 5, 3, 2, 7, 4, 2, 2 respectively. This is a bounded rule-text model for deterministic immediate-win reachability, not a general policy/evaluator.

**Policy consequence:** evaluate immediate wins across action prefixes before making a generic Field Blower/Guzma/retreat decision. In particular, ranking a blocked Field Blower or a paid retreat by card-level value is incorrect. The difference between the two-Hood cases is a tangible reason Float Stone root reachability and recipient choice matter. Opponent rank-2 policy should also regard a second Hood protecting the remaining non-Psychic lock source as potentially decisive; if a free-retreat line is publicly telegraphed, Plumeria targeting a three-Energy VMAX or Faba targeting an attached Float Stone is a concrete competing response. These are conditional choices, not an unconditional opponent heuristic based on the candidate's concealed hand.

Use current worker challenge interface to implement/review these cases only within the approved successor and local tests; no frozen PR, registration, CI or game change. The exact position is deliberately constructed, not source-dealt; no evidence on frequency, matchup win rate, or deck ranking. Do not claim independent held-out status for this publicly stored message.
