# Hood Shield Shadow Rider v1: coupled Tool-protection and Energy-pressure risk across Aichi

**Agent 17 · 17 November 2026**

## Decision

Hood Shield Shadow Rider v1 has a clear structural risk that should be tested after the existing V3 acceptance / first-trace sequence: its defensive package is Tool-dependent, while its main acceleration is Ability-dependent and its Energy is Basic Psychic. The exact 29 available Aichi lists contain broad Tool removal/suppression and several concentrated Energy-denial packages.

This does **not** establish that Hood Shield loses these matchups. It identifies a coupled failure mode that the candidate's later field challenge suite must test. Do not change the fixed 60, worker policy, seed or current fixture from this source-list analysis.

## Candidate package (exact registered 60)

Source: [printing-aware candidate inventory](../candidate-hood-shadow-rider.json), source blob SHA `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`.

- 18 Pokémon / 31 Trainers / 11 Basic Psychic Energy.
- 4 Shadow Rider Calyrex V and 4 Shadow Rider Calyrex VMAX.
- 2 Stealthy Hood, 1 Field Blower, 1 Arven, 2 VS Seeker.
- The list's main energy acceleration is the Shadow Rider Underworld Door Ability; the two Hoods are the explicit Tool-protection package.

## Field pressure

The [rank-level Tool-pressure map](../../methodology/2026-11/agent17-aichi-tool-pressure-map-20261117.md) finds, among the 29 exact lists:

- Field Blower: 9 lists / 11 copies.
- Megaton Blower: 10 lists / 10 copies.
- Faba: 7 lists / 8 copies.
- Tool Jammer: 5 lists / 5 copies.
- 20/29 lists (69.0%) contain at least one of those four Tool-removal / Tool-suppression cards.

The most relevant concentration is the five Japanese-Extra-incompatible lists retained unchanged in the primary field:

| Rank | Archetype | Tool pressure | Energy pressure |
|---:|---|---|---|
| 3 | Snorlax Stall | Tool Jammer ×1, Faba ×1 | Plumeria ×4, Team Flare Grunt ×2 |
| 6 | Iron Thorns | Megaton Blower ×1, Faba ×1, Tool Jammer ×1 | Plumeria ×4, Team Flare Grunt ×2, Handheld Fan ×1, Enhanced Hammer ×2 |
| 7 | Snorlax Stall | Field Blower ×1, Megaton Blower ×1, Faba ×2, Tool Jammer ×1 | Plumeria ×1, Team Flare Grunt ×1 |
| 24 | Iron Thorns | Megaton Blower ×1, Faba ×1, Tool Jammer ×1 | Plumeria ×4, Team Flare Grunt ×2, Handheld Fan ×2, Enhanced Hammer ×2 |
| 29 | Iron Thorns | Field Blower ×1, Megaton Blower ×1, Faba ×1, Tool Jammer ×1 | Plumeria ×4, Team Flare Grunt ×2, Handheld Fan ×1, Enhanced Hammer ×2 |

All five have Tool Jammer, Plumeria and Team Flare Grunt. Ranks 3/6/24/29 each carry Plumeria ×4 plus Team Flare Grunt ×2; rank7 carries one of each. All three Iron Thorns lists also carry Handheld Fan.

Other important cases include:
- rank 1: Field Blower ×1 plus the previously documented post-KO Teammates / Field Blower / Unfair Stamp branch;
- rank 2: Faba ×1 and a Vileplume Control source list;
- rank 7: the strongest named Tool package, with all four Tool cards and Faba ×2;
- rank 30: Field Blower ×3;
- Regidrago ranks 12/13/14/20/21/32: Megaton Blower ×1 each, plus rank10's Faba ×1.

The three missing lists (23/25/28) are not included. These are lower bounds on known field coverage, not full Top 32 frequencies.

## Distinguish the mechanisms

These cards are not interchangeable:

- **Field Blower** can discard up to two Pokémon Tools and/or Stadiums in play.
- **Megaton Blower** discards all Pokémon Tools and Special Energy from the opponent's Pokémon and a Stadium in play.
- **Faba** puts one eligible Pokémon Tool, Special Energy or Stadium into the Lost Zone.
- **Tool Jammer** suppresses Pokémon Tools attached to the opponent's Active; it does not discard them.
- **Plumeria** requires discarding two cards from hand, then discards an Energy from any opposing Pokémon.
- **Team Flare Grunt** discards an Energy from the opponent's Active.
- **Team Yell Grunt** returns an Energy from one opposing Pokémon to its owner's hand.
- **Handheld Fan** triggers when its Tool-bearing Active is damaged by an attack: it moves an Energy from the attacking Pokémon to one of the opponent's Benched Pokémon. This can move Basic Psychic Energy; it is not a discard.
- **Enhanced Hammer**, and the Special-Energy clauses of Faba / Megaton Blower, do not directly discard Basic Psychic Energy.

Consequently, the candidate's Basic Psychic Energy is not protected from all named pressure merely because Enhanced Hammer cannot discard it. Plumeria, Team Flare Grunt, Team Yell Grunt and Handheld Fan create different ways to disrupt attached Energy, with different costs, targets and timing.

## Possible bench-Hood sequencing line (hypothesis, not yet validated)

Tool Jammer's text suppresses Pokémon Tools attached to the opponent's **Active** Pokémon while the Tool Jammer bearer is Active. Underworld Door is used by Shadow Rider Calyrex V from the Bench. Therefore a Hood attached to a benched Shadow Rider V is a plausible way to keep that Tool outside Tool Jammer's scope while still protecting the Pokémon that uses Underworld Door. If that Hooded Shadow Rider is promoted to the Active Spot, Tool Jammer can suppress the Hood; the candidate may need to remove Tool Jammer first or keep the engine Pokémon benched.

**Rules-text inference:** Stealthy Hood is expected to prevent Initialization from suppressing the attached Rule Box Pokémon's Ability, because Hood prevents effects of an opponent's Abilities done to the attached Pokémon, and Iron Thorns' Initialization explicitly removes Abilities from both players' Rule Box Pokémon. This is supported by (a) the official Japanese Iron Thorns Q&A ruling that Mega Clefable ex's Luminous Wings can prevent its Ability from being removed by Initialization ([official Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%86%E3%83%84%E3%83%8E%E3%82%A4%E3%83%90%E3%83%A9ex&regulation_faq_main_item1=XY)), and (b) an Expanded player's card-text explanation that Stealthy Hood prevents opponent Abilities that apply effects to the attached Pokémon ([Stealthy Hood explanation](https://note.com/heisei_mikiko/n/n17aa3579530a?hl=en)). The official Q&A is **not** a direct Stealthy Hood ruling, so this remains a strong text-based hypothesis rather than a confirmed interaction; preserve a pinned native test and paper-judge check before treating it as verified. The existing rank-7 analysis separately notes that Wobbuffet PHF 36 suppresses Abilities of non-Psychic Pokémon, while the candidate's Psychic Shadow Rider core is exempt; do not spend Hood on that Wobbuffet interaction without a distinct reason.

## Tool-recovery boundary in the candidate 60

The candidate has **no direct Item/Tool recovery from the discard pile**:
- `Acerola` ×1 can return a damaged Pokémon and all cards attached to it to hand. This is the only conditional route in the list that can preserve/recover a Stealthy Hood, and only if the Hood is still attached when Acerola is played.
- `Night Stretcher` ×1 returns a Pokémon or Basic Energy from the discard pile, not a Pokémon Tool.
- `VS Seeker` ×2 returns a Supporter, not a Tool.
- `Arven` ×1 searches an Item and a Tool from the deck; it cannot recover a Hood that has already been discarded or put in the Lost Zone.
- `Forest Seal Stone` can search the deck, but it does not recover a Tool from the discard pile.

Therefore, if Field Blower or Megaton Blower discards both Hoods, or Faba sends one to the Lost Zone, the candidate has no direct way to retrieve that Tool from that zone. Acerola is a pre-removal bounce line, not post-removal recovery. This makes the two-Hood count a finite resource; quantify the opportunity cost of using Acerola for Hood preservation versus healing/picking up an attacker in the later policy challenge suite.

## Coupled failure hypotheses to test

1. **Hood removed or suppressed:** two Hoods are a finite protection budget. A Field Blower can remove up to two Tools; Megaton Blower removes all Tools; Faba can send one to the Lost Zone; Tool Jammer suppresses the Tool on the candidate's Active. Test the exact sequence and recovery rather than assuming the second Hood makes the lock durable.
2. **Ability engine suppressed:** the candidate relies on Shadow Rider's Underworld Door. The rules-text inference is that Stealthy Hood should protect its attached Rule Box Pokémon from Initialization, but the official Japanese Q&A found so far concerns Mega Clefable ex's Luminous Wings rather than Stealthy Hood itself. Treat the direct Hood interaction as strongly supported but not yet formally confirmed; resolve it with a paper-rules review and pinned native test before production admission.
3. **Field Blower unavailable under Item lock:** the candidate has one Field Blower, an Item. Rank 2 and rank 15 are Vileplume lists. Test sequencing and the exact timing of Item lock; do not assume Arven searching Field Blower makes it playable while locked.
4. **Energy stripped or moved:** Plumeria can discard from any opposing Pokémon after its two-card cost; Team Flare Grunt targets the Active; Team Yell Grunt returns an Energy to hand; Handheld Fan can move Energy from the attacker to the opponent's Bench after damage. Test whether the candidate can continue attacking and retreating after these effects, not just whether it can attach an Energy once.
5. **Resource contention:** the candidate's one Arven, two VS Seeker, one Field Blower and two Hoods create competing access/recovery demands. Model realistic Supporter-per-turn, hand-discard, Bench, attachment and search costs (AMR/DCI); do not treat theoretical card connectivity as an available line.

## Post-trace challenge priority

After the current rank-1 diagnostic is accepted and reviewed, the most informative available field tests for this risk are:

1. **Ranks 6, 24 and 29 (Iron Thorns):** Tool Jammer + Megaton Blower + Faba + heavy Plumeria/Team Flare Grunt; ranks 6/24/29 also have Handheld Fan. Resolve Stealthy Hood versus global Ability suppression, then test energy transfer/denial and recovery.
2. **Ranks 3 and 7 (Snorlax Stall):** Tool Jammer + Faba + Energy pressure; rank7 additionally has Field Blower, Megaton Blower and Faba ×2. Keep rank3's Arven → Field Blower + Hood escape branch distinct from rank7's longer resource war.
3. **Ranks 2 and 15 (Vileplume):** candidate's Field Blower is an Item; verify lock timing and whether the candidate can establish protection before the lock.
4. **Rank 30:** three Field Blowers create a distinct Tool-sweep scenario.
5. **Regidrago ranks 12/13/14/20/21/32:** test Megaton Blower against the two-Hood package and preserve rank-specific policy variants.

The source-rank policy challenge suite and evidence schema are defined in [Agent2's operational contract](../../methodology/2026-11/agent2-policy-challenge-suite-operational-contract-20261117.md) and the [Agent17 field policy-panel plan](../../methodology/2026-11/agent17-aichi-opponent-policy-panel-plan-20261117.md). No new game, policy, candidate or fixture is authorized by this note.

## Evidence classification

- Candidate card counts and exact source list counts: repository data.
- 20/29 union, per-rank pressure table and overlap counts: deterministic arithmetic.
- Card effect descriptions: local card text; verify engine semantics independently where timing/continuous-effect rules matter.
- Coupled failure modes and priority order: strategic hypotheses for future challenge suites.
- Actual access probability, complete-game interaction, matchup win rate and 99.5% performance: **not established**.
