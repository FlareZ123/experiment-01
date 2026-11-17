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

## Other Tool targets in the same 60

The candidate has two additional Tool copies besides the two Hoods: **Forest Seal Stone ×1** and **Float Stone ×1** (four Pokémon Tools total). The field pressure therefore threatens more than the protection package:
- **Forest Seal Stone** is a one-use VSTAR search resource. If removed before Star Alchemy is used, the candidate loses that access line; after it is used, later removal does not undo the search already completed.
- **Float Stone** is a retreat resource. Tool Jammer can suppress it while the attached Pokémon is Active; Field Blower / Megaton Blower / Faba can remove it.
- **Bench timing:** Forest Seal Stone's VSTAR Power does not require the attached Pokémon V to be Active. Attaching it to a Benched Pokémon V and using Star Alchemy before it can be removed is a plausible way to keep it outside Tool Jammer's Active-only scope. This still does not protect it from Field Blower, Megaton Blower or Faba.

The later suite should track all four Tool copies as separate resources: Hood (Ability protection), Forest Seal Stone (one-use search), Float Stone (retreat), and any opponent Tool (Jammer / Fan) that must be removed. Do not collapse them into one generic "Tool count." Only one Pokémon Tool can be attached to a Pokémon at a time, so the Hooded engine Shadow Rider and the Forest Seal Stone carrier must be different Pokémon; include actual Bench capacity and Stadium state in the AMR ledger.

## Possible bench-Hood sequencing line (hypothesis, not yet validated)

Tool Jammer's text suppresses Pokémon Tools attached to the opponent's **Active** Pokémon while the Tool Jammer bearer is Active. Underworld Door is used by Shadow Rider Calyrex V from the Bench. Therefore a Hood attached to a benched Shadow Rider V is a plausible way to keep that Tool outside Tool Jammer's scope while still protecting the Pokémon that uses Underworld Door. If that Hooded Shadow Rider is promoted to the Active Spot, Tool Jammer can suppress the Hood; the candidate may need to remove Tool Jammer first or keep the engine Pokémon benched.

**Rules-text inference:** Stealthy Hood is expected to prevent Initialization from suppressing the attached Rule Box Pokémon's Ability, because Hood prevents effects of an opponent's Abilities done to the attached Pokémon, and Iron Thorns' Initialization explicitly removes Abilities from both players' Rule Box Pokémon. This is supported by (a) the official Japanese Iron Thorns Q&A ruling that Mega Clefable ex's Luminous Wings can prevent its Ability from being removed by Initialization ([official Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%86%E3%83%84%E3%83%8E%E3%82%A4%E3%83%90%E3%83%A9ex&regulation_faq_main_item1=XY)), and (b) the official Stealthy Hood card text ([card page](https://www.pokemon-card.com/card-search/details.php/card/36191/regu/all)) and its Q&A examples showing that it prevents opposing Ability effects applied to the attached Pokémon ([official Stealthy Hood Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89)). The official Q&A is **not** a direct Stealthy Hood ruling, so this remains a strong text-based hypothesis rather than a confirmed interaction; preserve a pinned native test and paper-judge check before treating it as verified. The existing rank-7 analysis separately notes that Wobbuffet PHF 36 suppresses Abilities of non-Psychic Pokémon, while the candidate's Psychic Shadow Rider core is exempt; do not spend Hood on that Wobbuffet interaction without a distinct reason.

## Tool-recovery boundary in the candidate 60

The candidate has **no direct Item/Tool recovery from the discard pile**:
- `Acerola` ×1 can return a damaged Pokémon and all cards attached to it to hand. This is the only conditional route in the list that can preserve/recover a Stealthy Hood, and only if the Hood is still attached when Acerola is played.
- `Night Stretcher` ×1 returns a Pokémon or Basic Energy from the discard pile, not a Pokémon Tool.
- `VS Seeker` ×2 returns a Supporter, not a Tool.
- `Arven` ×1 searches an Item and a Tool from the deck; it cannot recover a Hood that has already been discarded or put in the Lost Zone.
- `Forest Seal Stone` can search the deck, but it does not recover a Tool from the discard pile.

Therefore, if Field Blower or Megaton Blower discards both Hoods, or Faba sends one to the Lost Zone, the candidate has no direct way to retrieve that Tool from that zone. Acerola is a pre-removal bounce line, not post-removal recovery. This makes the two-Hood count a finite resource; quantify the opportunity cost of using Acerola for Hood preservation versus healing/picking up an attacker in the later policy challenge suite.

## Stadium-removal and Bench-capacity risk

The same candidate 60 also has **Sky Field ×1** and **Dimension Valley ×1**:
- Sky Field expands the Bench to eight. If it leaves play, the Bench limit returns to five and the player must discard excess Benched Pokémon. This can force a choice between Shadow Rider engine pieces, the Hooded engine carrier, the Forest Seal Stone carrier and support Pokémon.
- Dimension Valley reduces the attack cost of Psychic Pokémon. Losing it can change whether the next attack is payable with the current Energy layout.
- Field Blower, Faba and Megaton Blower can also remove Stadiums, not just Tools. **20/29 available lists contain at least one of these three Stadium-removal cards** (ranks 1/2/3/5/6/7/8/10/12/13/14/19/20/21/22/24/29/30/31/32). A single Megaton Blower can therefore sweep all candidate Tools and remove a Stadium; Field Blower can select up to two Tools/Stadiums; Faba can Lost Zone one eligible Tool/Special Energy/Stadium.
- The current 60 has no direct Stadium recovery card. Forest Seal Stone searches the deck, not discard; VS Seeker recovers Supporters, Night Stretcher recovers Pokémon/Basic Energy, and Arven searches the deck. Dowsing Machine could recover a Stadium as a Trainer, but would compete with Forest Seal Stone as the ACE SPEC.

The post-trace suite should test **which board resources the opponent removes**, not just whether the candidate can keep one Hood attached. Bench-capacity collapse and attack-cost changes are distinct outcomes from Tool removal.

## Possible post-trace Tool / Stadium-recovery architectures (not recommendations)

Three BW-onward options offer distinct ways to address discard-based Tool / Stadium loss; none retrieves a card from the Lost Zone, and none changes the current fixed 60:

- **Dowsing Machine (BW8 128):** discard two cards from hand, then put any Trainer from the discard pile into hand. This can recover one discarded Hood or Field Blower directly, but it competes with the candidate's current Forest Seal Stone ACE SPEC and has a real hand-cost / DCI / AMR burden.
- **Eco Arm (XY7 71):** shuffle up to three Pokémon Tool cards from the discard pile into the deck. This can recycle multiple Hoods, but a subsequent search is required to access one; it is an Item and may be unavailable under Vileplume Item lock.
- **Lusamine (SM2 110):** return two Supporter and/or Stadium cards from the discard pile to hand. This can recover Sky Field / Dimension Valley or a Supporter, but does not recover Tools; it consumes the turn's Supporter play and can be reused with VS Seeker.

Neither card recovers a Faba'd Tool from the Lost Zone. Eco Arm also does not solve a live Tool Jammer until the candidate can play an Item and remove it. Compare these as **structurally different resource plans** against Forest Seal Stone's one-time broad search, using the same rank policies and challenge suite after the current gate. Do not treat either as an automatic one-card upgrade or alter the candidate before the first-trace review.

## Coupled failure hypotheses to test

1. **Hood removed or suppressed:** two Hoods are a finite protection budget. A Field Blower can remove up to two Tools; Megaton Blower removes all Tools; Faba can send one to the Lost Zone; Tool Jammer suppresses the Tool on the candidate's Active. Test the exact sequence and recovery rather than assuming the second Hood makes the lock durable.
2. **Ability engine suppressed:** the candidate relies on Shadow Rider's Underworld Door. The rules-text inference is that Stealthy Hood should protect its attached Rule Box Pokémon from Initialization, but the official Japanese Q&A found so far concerns Mega Clefable ex's Luminous Wings rather than Stealthy Hood itself. Treat the direct Hood interaction as strongly supported but not yet formally confirmed; resolve it with a paper-rules review and pinned native test before production admission.
3. **Field Blower unavailable under Item lock:** the candidate has one Field Blower, an Item. Rank 2 and rank 15 are Vileplume lists. Test sequencing and the exact timing of Item lock; do not assume Arven searching Field Blower makes it playable while locked.
4. **Energy stripped or moved:** Plumeria can discard from any opposing Pokémon after its two-card cost; Team Flare Grunt targets the Active; Team Yell Grunt returns an Energy to hand; Handheld Fan can move Energy from the attacker to the opponent's Bench after damage. Test whether the candidate can continue attacking and retreating after these effects, not just whether it can attach an Energy once.
5. **Resource contention:** the candidate's one Arven, two VS Seeker, one Field Blower and two Hoods create competing access/recovery demands. Model realistic Supporter-per-turn, hand-discard, Bench, attachment and search costs (AMR/DCI); do not treat theoretical card connectivity as an available line.

## Candidate decision envelope to validate

The following is a concrete policy hypothesis for the current 60, not a claim that the line has already been validated:

1. **Protect the engine from the Bench.** If the paper ruling confirms the Hood/Initialization inference, attach Stealthy Hood to a benched Shadow Rider V that will use Underworld Door. Tool Jammer only suppresses Tools on the candidate's Active, so a bench Hood should remain effective while the engine Pokémon stays benched.
2. **Do not promote through Tool Jammer blindly.** Before moving the Hooded Shadow Rider into the Active Spot, check whether the opponent's Active still has Tool Jammer. If so, compare removing it with Field Blower (which can also remove a Handheld Fan) against using another attacker or delaying the promotion. Field Blower is one Item and is unavailable while an Item lock is active.
3. **Preserve the second Hood.** Keep one Hood in hand while the first is protecting the engine when possible. If a Hooded Pokémon is damaged and removal is imminent, Acerola can pick up the Pokémon and its attached Hood; after the Tool is discarded or Lost Zoned, the current 60 has no direct recovery.
4. **Respect Handheld Fan before attacking.** If the opponent's Active has Handheld Fan, evaluate the Energy that would be moved from the attacking Pokémon to the opponent's Bench on damage. Prefer removing Fan first, using a lower-investment attacker, or accepting the transfer only when the resulting Energy position is still favorable.
5. **Budget Supporter and Energy denial.** Against Plumeria / Team Flare Grunt / Team Yell Grunt, model their different target and cost restrictions and preserve enough attached Energy for the next attack and retreat. Do not treat their registered copy counts as same-turn access.
6. **Compare recovery alternatives only as complete architectures.** Forest Seal Stone, Dowsing Machine, Eco Arm and Acerola solve different resource problems; evaluate their full cost and access lines, including Item lock, rather than swapping an ACE SPEC from card text alone.

The suite should capture the decision envelope before the candidate is exposed to each pressure case, then compare the chosen action with the available legal alternatives and full cost ledger. All six points remain hypotheses until source-natural/native-staged evidence exists.

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
