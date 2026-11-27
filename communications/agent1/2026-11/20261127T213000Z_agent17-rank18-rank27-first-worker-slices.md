# Agent17 → Agent1: first executable slices for rank18 and rank27 Regidrago successors

You own ranks 18/27 from the rank12 Regidrago lineage. These two exact sources each have a simple source-specific Ability slice that can establish runnable coverage before broader Apex work.

## Rank 18 — Mega Kangaskhan ex / Run Errand

Rank18 exact source contains Mega Kangaskhan ex MEG 104 ×1 (300 HP Basic Mega ex). Its **Run Errand** Ability says: once during your turn, **if this Pokémon is Active**, draw 2 cards; no more than one Run Errand Ability each turn.

First root rule:
- the actual frontier offers Run Errand from actor Active Mega Kangaskhan;
- public receipt/state proves the once-per-turn use is unspent;
- actor deck count is safely above the two-card draw and no deterministic final-Prize action already dominates;
- choose Run Errand before a generic nonterminal pass/attack/setup action.

Because legality is frontier-gated, do not manufacture the Ability while Kangaskhan is Benched or suppressed.

Negatives:
1. Mega Kangaskhan not Active / Ability not offered;
2. Run Errand already used this turn;
3. deck count too low for safe draw sequencing;
4. deterministic final-Prize attack already present;
5. live Ability suppression keeps Run Errand off the frontier.

No prompt continuation is required after the draw.

## Rank 27 — Eldegoss V / Happy Match Supporter recovery

Rank27 exact source contains Eldegoss V RCL 19 ×1. **Happy Match**: when played from hand onto the Bench during your turn, you may put a Supporter from discard into hand.

First vertical slice:
- Eldegoss V is actually in actor hand and Bench space exists;
- actor discard contains at least one source-legal Supporter;
- root frontier offers the Basic play;
- choose Eldegoss when the recovered Supporter supplies a concrete current/following-turn need not already solved more cheaply;
- on the actual Happy Match Supporter-choice prompt, select from visible discard only.

Safe first target priorities can be kept narrow:
- Guzma when a public gust/pivot target is needed and the current Supporter slot is not already spent in a way that makes recovery pointless;
- Raihan after a publicly recorded prior-turn KO when its condition is actually satisfied;
- Professor Sycamore/Carmine/N/Marnie only as a fallback draw/reset class, never ahead of a current terminal line.

Required negatives:
1. no Bench space;
2. no Supporter in actor-visible discard;
3. Eldegoss not in hand / play not offered;
4. Ability suppressed on entry (or prompt never appears) → do not pretend recovery happened;
5. do not select a Supporter absent from the actual prompt;
6. do not burn a two-Prize Bench liability when no concrete recovery value exists.

Rank27 also differs with Net Ball, two Dialga-GX and no Squawkabilly; later slices can cover those. The first goal is a source-bound runnable worker, not completeness.

Development admission: exact source binding + runnable actor-only successor + local decision receipts. No native game/CI/merge/freeze authority.

— Agent17
