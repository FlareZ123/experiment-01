# Fixed Hood 60: Max Geist lethal manual Energy must precede already-legal attack (28 November 2026)

**Disposition:** exact card-text arithmetic + executable actor policy/protocol regression; not a native Store game, matchup win rate, owner approval or safe all-effect battle evaluator.

## Immediate tactical error in candidate-engine PR #95

The source `Shadow Rider Calyrex VMAX CRE 75` **Max Geist** does **10 + 30 damage per Psychic Energy attached to all own Pokémon**, and costs three Colorless Energy. Once three Energy are attached to the Active, a normal manual Psychic attachment can still be worth **an additional 30 damage** and turn an already-payable attack into an immediate Knock Out. Existing `agent46-candidate-policy.cjs` on [Agent32 PR #95](https://github.com/FlareZ123/experiment-01/pull/95) (`321302d`) scored ordinary Energy on VMAX only when the *whole board* had fewer than five Psychic (and otherwise only when target itself had fewer than three). Consequently, with **at least three already on Active and at least five across the board**, it scored manual attachment to Active **-∞**, then attacked immediately, even if the extra Energy would change the Prize swing.

**Source-printed exact 60 / Aichi rank-10 type of board** (constructed, not extracted from the 116-game archive):

- Own Active: Shadow Rider Calyrex **VMAX CRE75**, three attached Basic Psychic Energy MEE13. Own Bench: Marshadow UNB81, three Basic Psychic. Whole board: six Psychic.
- Opposing Active: Regidrago **V SIT135**, 220 remaining HP, no defensive Tool/Ability/Stadium in this deliberately bounded scenario. The native actor action frontier offers both a lawful manual Psychic-to-Active attachment and lawful Max Geist attack.
- **Before attachment**: `10 + 30 × 6 = 190`, fails to KO 220 HP. **After attachment**: `10 + 30 × 7 = 220`, exactly KOs a two-Prize Regidrago V in the constructed unobstructed board. The PR #95 worker selected the 190-damage attack, consuming the turn and forfeiting the immediate two-Prize knockout line.

## Bounded executable correction

[Agent1 isolated source-based review branch](https://github.com/FlareZ123/experiment-01/tree/agent1/candidate-maxgeist-legal-lethal-attach-20261128), based directly on PR #95 head, with **only two files changed**: [worker repair `11110ea`](https://github.com/FlareZ123/experiment-01/commit/11110ea00c6c1973fbc17f6ead29a4c804050143) and [two-seat 14-case strict regression `0557ba2`](https://github.com/FlareZ123/experiment-01/commit/0557ba2b320d475dd30d2abab04cca08617c5035).

- Pass the **actually offered native root actions** to the manual-Energy score (no fabricated attack action). Only when a Max Geist root is presently offered, the Active is exactly source-printed CRE75, and at least three attached Energies already make it payable, compare existing `estimatedDamage` to its one-energy-attached projection.
- Score this manual attachment ahead of the current attack **only when `before < remaining HP <= after`**, leaving already-lethal attacks and nonlethal increments in their existing order.
- Current narrow implementation **fails closed** on nonempty Stadium zones, defensive Tools, or Abilities on opponent Active, rather than claiming immunity has been modeled. This is an intentionally limited tactical improvement; future general planner must handle bench abilities and effects on the defender explicitly. No proof is asserted beyond the bounded plain-damage situation.
- After the attachment is reflected in the actor view and hand is empty, the next native-attacker frontier correctly selects Max Geist. The code uses no change to base deck, engine, source projection, V3 fixtures, CI, registration or unrelated players.

**Reproducible in-process strict protocol results: PR #95 baseline 12/14 versus bounded patched 14/14**, testing two physical actor seats and seven cases each: exact HP threshold, next-root attack, previously lethal immediate attack, still-nonlethal after attachment, defender Ability, Stadium uncertainty, and no native attack action. Uses exact committed worker + protocol `validateDecision` / `validatePolicyAudit`. **Not** 14 games.

## Relationship to old actual Store traces

The archived pre-PR #95 116-attempt Hood/Champion native Store run (GitHub Actions run **42578010606**, artifact **13656062292**, 0 paper-qualified games) has an independent opportunity-cost warning: matched rank-7 slot B, candidate physical seat 1, saw the earlier Hood policy lose after **65 turns without declaring a candidate attack**, with six accepted Underworld Door attachments deposited on Benched **Marshadow** while Active VMAX ended on one Psychic. At turn 31 the native declared manual Psychic attachment went onto a Benched **Girafarig** (accepted action ordinal 133), whereas the champion-reference arm manually attached to Active VMAX on turn 21 (accepted action ordinal 100, reaching three Psychic) and used Max Geist on turn 21 (root 98), ultimately winning the same source-rank matchup. The initial source opponent deal was matched, candidate hands/policies were not. **This is not the exact 190→220 threshold reproduction**, and it would be incorrect to infer the new patch fixes that loss; it underscores why Energy placement should be evaluated against attack payoffs rather than aggregate energy count.

**Owner choice:** The more developed Agent46 two-profile successor already calculates post-attachment attack changes; prefer its established model and use this exact-HP test as an acceptance criterion if integrating that worker instead. Do not merge this short helper on top of an advanced scorer without review. Overall field remains **29/32 authenticated lists, 0/32 qualified matchups**, no 99.5% evidence.
