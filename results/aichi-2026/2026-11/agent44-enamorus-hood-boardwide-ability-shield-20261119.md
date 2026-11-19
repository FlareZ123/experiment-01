# Agent44 addendum: concrete Enamorus 60-card arm and rank31 double-Cursed-Blast counterline

**Agent 44 · 19 November 2026 · supplement to Agent43's existing Enamorus research**

## Scope and de-duplication

This is **not** a second Enamorus rules investigation. Agent43 already established the main hypothesis and documented the official Enamorus Q&A, Hood/Garbotoxin/Initialization composition, access enumeration (including Forest Seal Stone), Energy coverage, Underworld Door bootstrap uncertainty, Latias / Fairy Zone / Marshadow value, Tool-removal policy, and the deferred native test matrix. Read and reuse:

- [Agent43: Enamorus V board-wide Ability shield hypothesis](agent43-enamorus-v-board-shield-hypothesis-20261117.md)
- [Agent43: Forest Seal Stone / Star Alchemy access extension](agent43-enamorus-forest-seal-access-20261119.md)
- [Agent17: two-Hood deployment rule](agent17-two-hood-deployment-rule-20261117.md)
- [Agent50: Hood Shadow Rider DCI/AMR policy spec](agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md)

My contribution is limited to (a) one concrete fixed-60 slot arm, with its explicit Quick Ball cost, and (b) a rank31 double-Cursed-Blast counterline that should be added to the existing test matrix. The broad Ability-shield mechanics and matchup coverage are Agent43's prior work; do not duplicate them or rerun the already-completed Hood/Initialization test.

## Concrete 60-card arm

The attached machine-readable and human-readable lists are:

- [Hooded Guardian Shadow Rider v1 JSON](../candidate-hooded-guardian-shadow-rider.json)
- [Hooded Guardian Shadow Rider v1 decklist](../candidate-hooded-guardian-shadow-rider.md)

Exact diff from Hood Shield Shadow Rider v1:

- **Add:** 1 Enamorus V (SWSH11 82).
- **Cut:** 1 Quick Ball (FST 237).
- All other 59 card identities and counts remain unchanged.
- New category counts: **19 Pokémon / 30 Trainers / 11 Basic Psychic Energy**; 60 total. Basic Pokémon rise from 14 to 15 because the added Enamorus is Basic and the cut is a Trainer.

This is a concrete experimental arm, **not** an endorsed or optimized slot choice, not nominated, not tested, and not evidence of a stronger deck.

## Quick Ball is a provisional cut, not an expendable card

The type-coverage argument for the cut is real but incomplete: every Pokémon in this list is Psychic- or Dragon-type; the existing four Mysterious Treasure search either type, and four Fog Crystal search Basic Psychic Pokémon. Quick Ball adds no unique target *type*.

However, Quick Ball is still a ninth direct Pokémon-search out and an independent connector. Agent50's DCI/AMR analysis explicitly treats Quick Ball as a live Dialga/Mimikyu connector. Removing it lowers the direct-search Item count from nine to eight and removes one alternative route to the existing Dialga/Mimikyu counterline.

Agent41 has since completed a stronger **20-million-valid-opening DCI-aware access sensitivity**: [report](agent41-enamorus-dci-aware-access-sensitivity-20261119.md), [C++ source](agent41-enamorus-dci-aware-access-sensitivity-20261119.cpp), [raw output](agent41-enamorus-dci-aware-access-sensitivity-20261119.txt). On a different hypothetical 60 that adds Enamorus and provisionally cuts Pokémon Ranger (therefore **retaining Quick Ball**), strict duplicate-only discard raises Enamorus + Hood access by **1.8970 / 2.5337 percentage points** going first/second over its Fog Crystal / Heavy Ball / Arven / Forest Seal Stone baseline. Intersected with the unchanged natural-only Shadow Rider V turn-one + VMAX turn-two core, the joint event rises only **0.4320 / 0.7045 points**. The unrestricted-discard ceiling is invalid; the report quantifies why.

Those rates do **not** apply to this Quick Ball-cut arm: Agent41's hypothetical keeps Quick Ball and uses Pokémon Ranger as a bookkeeping cut, explicitly not a recommendation. A matched DCI-aware rerun is required for this exact 60. The simple 9-to-8 opening-search-out count is not a substitute for that model.

## New rank31 counterline: two Dusknoir PRE can double-blast the anchor

Agent43 already identifies rank31 as the Dusknoir Chimecho list with **Dusknoir PRE ×3** and **Field Blower ×1**, and correctly notes that Enamorus V is excluded from its own Guardian of Love. The additional counterline to test is:

1. Follow Agent17's deployment rule: attach one Stealthy Hood to Enamorus and keep the second Hood in hand/deck while the one-copy Tool-removal window remains.
2. If Field Blower removes the attached Hood, Guardian of Love should still protect the other Psychic-Energy-attached Pokémon from Cursed Blast because rank31 has no Ability suppressor. Enamorus itself is now exposed.
3. One Cursed Blast places 130 damage on a healthy 210-HP Enamorus and self-KOs Dusknoir, leaving Enamorus at 80 HP. The candidate can potentially use Acerola on its next turn to heal/bounce Enamorus before another Cursed Blast.
4. If **two Dusknoir PRE are already in play and both can use Cursed Blast in the same turn**, they can place 260 damage counters on Enamorus and KO the two-Prize anchor before the candidate can respond. Each Dusknoir still self-KOs: a nominal two-Prize-for-two-Prize exchange, but the board-wide shield disappears during the opponent's turn. Any remaining Dusknoir BCR / Radiant Alakazam counter-moving Abilities may then have a window to act; whether they can convert that window depends on the remaining damage-counter sources and must be tested.

This is a conditional rules-derived opponent line, not a demonstrated sequence. The exact timing of multiple Cursed Blasts, the ability to use BCR / Radiant Alakazam after the anchor is Knocked Out, and the candidate's Acerola / Night Stretcher recovery windows should be added to Agent43's existing rank31 test cases. Do not assume that the one-copy Field Blower alone makes the anchor safe.

## Deferred validation and status

No new fixture, workflow, CI run, policy edit, seed edit, Twinleaf change, or competitive game was made. The current V3 acceptance / first-trace stopline remains in force; do not alter the registered candidate or dispatch a test before it clears.

Post-gate, compare this exact 60 against a Quick Ball-retaining or alternative-cut Enamorus 60 under the same policy, opponent lists, seeds, and seat balance. Add the two-Dusknoir counterline above to Agent43's existing Enamorus / rank31 test matrix. Until then:

- The candidate is untested and not nominated.
- No matchup result or win-rate claim is made.
- The 99.5% Aichi Top 32 objective remains unachieved and unsupported by this work.
