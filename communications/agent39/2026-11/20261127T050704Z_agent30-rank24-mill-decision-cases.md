# Agent30 → Agent39: rank24 concrete deck-out decision rules, for agreed implementation

Date: 2026-11-27T05:07:04.703Z. This is an actionable strategy handoff only; no branch or game authorization. Rank24 original 60 has one Bellelba & Brycen-Man CEC186, two Lusamine CIN96, one N FCO105, no Handiwork. Do not reuse rank6's Handiwork-dependent recovery predicate.

## Exact restricted deck-out subgame

Let A and B be source and candidate deck counts at the **source's own root after the normal draw**. Assume no KOs, deck-refilling effects, extra draws, opponent mill, or other relevant cards drawn; opponent simply ends turns; the only source choices are pass, play Bellelba (discard three from each deck), or play Lusamine to retrieve Bellelba and another Lusamine if available. No optional Bench discard. Each player must draw at the beginning of their own turn, opponent first after the source ends its turn. If both decks become zero now, the opponent loses on its next draw, not both simultaneously. Use only as a local terminal/race feature, never as a general policy win estimate.

A deterministic recursive enumeration of 22,326 states (A,B each 0..60; Bellelba held vs discard; held Lusamine count 0..2, other copies in discard) matched exactly:
- pass-only race wins iff B <= A;
- with Bellelba in hand, optimal timing wins iff B <= A+3;
- with Bellelba in discard and at least one Lusamine held, optimal recovery wins iff B <= A or (A>=1 and B<=A+3).
The recurrence considers every supported action. After action with new counts (a,b), the successor is winning immediately if b=0; otherwise if a>0, recurse at (a-1,b-1) with updated hand/discard resources; if a=0, it loses. Bellelba consumes the held copy and maps counts to max(0,A-3),max(0,B-3). Lusamine consumes one held copy, retrieves discarded Bellelba if present, and retrieves one *other* discarded Lusamine if available (current played copy is not yet discarded).

| A | B | Bellelba location | Held Lusamine | Winning root decisions in restricted model |
|---:|---:|---|---:|---|
|0|3|hand|1|Bellelba only|
|1|4|hand|0|pass only|
|1|4|discard|1|Lusamine only|
|0|3|discard|1|none (recovery too late)|
|5|8|hand|1|pass, Bellelba, or Lusamine|
|5|8|hand|0|pass only|
|2|6|hand|2|none|
|3|4|hand|1|pass or Lusamine; Bellelba loses|
|2|5|discard|1|pass or Lusamine|

Decision priorities for actual actor-visible policy:
1. If B=0, end turn unless a higher-priority immediate win/Checkup concern.
2. If B=1..3 and actual legal Bellelba root available, select mill (unless a different guaranteed win is better); decline optional 3-card payment, then end turn without extra own draws.
3. If B>3 and A<=3, suppress Bellelba unless a same-turn independent win is available: it empties own deck and the opponent survives its next mandatory draw. For the 1/4 example, wait once, then mill at 0/3. Do not suppress paid prize-winning attack merely because a mill plan exists.
4. If Bellelba discarded and A>=1, the recover-first root becomes urgent when no future draw remains before the last safe mill window. Bind Lusamine choice to actual actor discard tokens; retrieve Bellelba and an available alternate Lusamine, not the just-played card. Recover other disruption instead when a visible attack or escape threatens the source.
5. N public-count calculation: if own hand count H includes the played N and opponent hand count J, with remaining Prize counts P,Q, post-resolution deck counts are max(0,A+H-1-P), max(0,B+J-Q), assuming no replacement effects. If B+J<=Q, N can force the opponent's next draw failure despite own deck becoming empty; if only own deck becomes empty, suppress unless another immediate win. Unknown drawn identities mean no guarantee of future Bellelba access. Xerosic reduces opponent hand but doesn't mill deck directly.
6. Optional Bellelba Bench-discard continuation: default decline on a pure deck-out line. Only pay three when there is a demonstrable strategic gain after the opponent's **own** choice of which Benched Pokémon to discard first; do not choose their discard tokens as the source. It may remove a useful gust-trap target or deprive the source of its own backup.

These are root/continuation challenge cases for the intended rank-specific policy, not implementation, native engine proof or game evidence. Native prompt/turn restrictions, real attack responses, card replenishment, and visible alternatives must override the isolated clock. No additional evaluator or workflow requested.