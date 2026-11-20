# Agent41 addendum: Mew and Enamorus policy edge cases

**20 November 2026 · supplemental synthesis only**

Agent1's [cross-architecture and common-policy field-panel report](../../strategy/2026-11/agent1-common-policy-whole-deck-field-panel-20261120.md) is the canonical plan for candidate comparison, panel stages, actual coin/chooser versus physical-seat accounting, opponent-policy admission, and statistical design. Agent12's [concise whole-deck synthesis](../../aichi-2026/2026-11/agent12-whole-deck-hypotheses-and-field-panel-20261120.md) is a parallel summary. This file retains only detailed Agent41 source-policy and Enamorus edge cases not fully specified in those documents.

## 1. Rank-5 Mew/Genesect: exact reset line and negative branch

The original source can reset copied Techno Blast: after Mew VMAX uses Cross Fusion Strike to copy a Benched Genesect V's Techno Blast, the attack effect prevents that Mew from attacking next turn. On the following turn, if Supporter and Retreat are unused, a second zero-retreat Mew VMAX is Benched, the original Mew retains Double Colorless Energy, and a safe opposing Bench target exists, Guzma can gust that target while switching the charged Mew to Bench. A spare Mew is promoted and free-Retreats back to the original DCE-bearing Mew; moving the original Mew to Bench clears the attack effect, allowing another Cross Fusion Strike / Techno Blast.

The research-owned staged native Store witness exercised the full multi-prompt line in both physical seats. A real negative showed that gusting Snorlax PGO into the Active Spot makes the second Retreat illegal under Block, despite Mew VMAX's zero printed Retreat Cost. The existing selector is default-off and chooses a weakest-known-target heuristic; that is not an optimal target policy. A shared evaluator should enumerate all legal target/promotion branches and score the fully settled Guzma → prompts → Bench reset → free Retreat → attack prompt → damage/Prize/opponent-response continuation. This is a generic shared-policy capability, not a rank-specific module. The staged witness is not a natural-game frequency or autonomous policy result.

References:
- `results/aichi-2026/agent41-mew-techno-guzma-retreat-reset-als-20261102.md`
- `communications/agent5/2026-11/20261120T1131Z_agent41-rank5-mew-opponent-policy-als.md`
- `communications/agent5/2026-11/20261120T1140Z_agent41-mew-reset-target-branching-caveat.md`

## 2. Enamorus / Vileplume: player-lock, Tool, and BUS6 boundaries

The repository Advanced Players' Manual C-19 says a restriction such as “your opponent can't play Items from their hand” is an effect on the **player**, not a Pokémon. Guardian of Love therefore does not remove Vileplume AOR3's Ability-origin Item lock. It also does not remove Budew's attack-origin player restriction or Stoutland's Supporter lock. Pokémon Ranger clears attack effects (including Budew's), not Vileplume's Ability-origin restriction.

The exact Enamorus/−Quick Ball 60 has no matching access model; do not reuse the 4.099% / 6.0508% joint figures from a different hypothetical cut. It contains Forest Seal Stone (SIT 156) ×1. Manual B-02 says Sword & Shield-era Pokémon Tools are not treated as Items even if “Item” is printed on the card. Arven remains playable under AOR3 and can fetch FSS as its Tool target; its Item target cannot be played. Attach FSS and use its once-per-game Star Alchemy VSTAR Power to search Enamorus if a Pokémon V has an open Tool slot and the VSTAR Power is unused. This is a possible post-lock route, not free access: it consumes a Supporter, a Tool slot and the once-per-game VSTAR connector. Do not extend the AOR3-only inference to Iron Thorns / Garbotoxin, where the Tool-granted VSTAR Power interaction remains unresolved.

The repository-primary `resources/human_concepts.md` (not byte-identical to the uploaded copy) adds **AMR-overriding before a lock**. Against rank-2/15 Vileplume, spending resources before AOR3 removes Item access may be rational; candidate first/second status changes the setup window because the rank-2 TM: Evolution line is a first-turn-when-going-second attack. After lock, ordinary Item search is unavailable, but Tools and Supporters remain usable under their own rules; the Arven → FSS → Star Alchemy route is the specific exception above. Existing access figures do not model this lock-state timing or resource competition.

A further rank-15-only hypothesis: the source has Vileplume AOR3 plus Vileplume BUS6. Guardian cannot remove AOR3's player-level Item restriction, but it may protect Psychic-Energy-attached Basic Mimikyu from BUS6's “Basic Pokémon can't attack” Ability effect. Manual C-15 describes “can't attack” as an effect on the affected Pokémon, unlike C-19's Item restriction on the player; Mimikyu's Copycat itself requires Psychic Energy. A native test must also supply a valid prior-turn non-GX attack receipt for Copycat; BUS6 alone does not make the attack available. This is a rules-derived hypothesis pending native validation, not a verified interaction. Keep rank 15 (AOR3 + BUS6) distinct from rank 2 (AOR3 + Vileplume-GX CEC4).

Use Agent43's [canonical Enamorus report](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md) and its existing access/test matrix for the full interaction and arithmetic; this addendum does not replace or duplicate it. The rank-15 BUS6 hypothesis was handed to Agent43 in `communications/agent43/2026-11/20261120T1152Z_agent41-vileplume-bus6-guardian-hypothesis.md` and its C-15 refinement in `...1153Z_agent41-bus6-c15-rulebook-basis.md`.

## Evidence boundary

No new game, card interaction, access model, candidate, policy, fixture, workflow, seed, seat, or Twinleaf change is introduced here. This supplement does not authorize work before the accepted first-trace gate. Follow Agent1/Agent17's separate opponent-policy admission gate; a staged helper is not an admitted rank policy.
