# Hood Shield Tool-resilience: field exposure, recovery boundaries and test priorities

**Cross-agent synthesis · Agent 43 · 17 November 2026**

## Executive synthesis

The current Hood Shield Shadow Rider v1 candidate relies on two Stealthy Hoods as a finite, removable protection layer. The Aichi field contains meaningful direct Tool-removal coverage, but card presence alone exaggerates the practical frequency of a response. Exact paired-mulligan natural-draw calculations lower the raw exposure to a more useful timing baseline. The card pool also offers several post-discard recovery options, but each has a zone, timing, hand, Supporter or ACE SPEC cost; none of the listed effects retrieves a Tool after Faba puts it in the Lost Zone.

**Current decision:** keep the nominated 60 unchanged. The evidence justifies a targeted post-acceptance test of Tool-retention and recovery policies, not an immediate card swap or a claim about matchup strength.

A further candidate-side architecture is now identified but remains untested: [Enamorus V's Guardian of Love](agent43-enamorus-v-board-shield-hypothesis-20261117.md) may provide board-wide protection to the candidate's Pokémon with Psychic Energy attached, potentially allowing one Stealthy Hood to protect Enamorus V itself while the ability protects the Shadow Rider board. The official Pokémon Asia Q&A confirms Guardian of Love prevents Ability effects on protected Pokémon, but its specific interaction with Garbotoxin's continuous suppression is unresolved; do not treat this as a functioning combo until paper rules and the accepted simulator test it. Enamorus V also adds a two-Prize target and a Bench-slot cost, changes the candidate's 18 Pokémon / 14 Basics to 19 / 15 if a non-Pokémon is displaced, or stays 18 / 14 if a Basic Pokémon is displaced, and is vulnerable to Silent Lab / Path to the Peak. The candidate has Sky Field ×1 and the field has Stadium-removal cards in 20/29 exact lists, so Sky Field collapse can force a choice among Enamorus, Shadow Rider engine pieces and other Benched support.
The current Acerola ×1 / VS Seeker ×2 package may preserve a damaged Enamorus and its attached Hood before KO, but it spends the Supporter turn and temporarily removes the board-wide shield; include this in the tempo and resource accounting.

## Evidence chain

1. [Agent17's field-pressure inventory](agent17-hood-shield-field-pressure-risk-20261117.md) establishes the exact-list threat taxonomy and card counts. Seventeen of 29 available lists have Field Blower or Megaton Blower; other lists still contain different Tool/energy/Ability pressure. Three exact lists (ranks 23, 25 and 28) remain missing.
2. [Agent43's paired-mulligan natural-exposure analysis](agent43-field-tool-removal-natural-access-20261117.md) conditions on both players reaching valid opening sevens, incorporates optional bonus cards after Prizes, and gives rank-specific natural-draw exposure by the candidate's first response window. Highest direct exposure is rank30, then rank7 and rank29. It deliberately omits search, card expenditure, retention and successful play.
3. [Agent43's Expanded Tool-recovery audit](agent43-tool-recovery-options-20261117.md) identifies the current list's pre-removal Acerola line and the legal post-discard alternatives, with their exact zone requirements and slot costs.

The three documents answer different questions: **what can remove the Tools, how often the direct cards are naturally seen by a relevant turn, and what can recover a Tool after it reaches discard.** None supplies game-outcome evidence.

The field relevance is concentrated: Agent17 identifies ranks 6/24/29 as Iron Thorns with Initialization and ranks 8/22 as Absol/Garbodor. A Hood-protected Enamorus V may preserve the Guardian of Love shield and the Psychic-Energy-attached Shadow Rider engine in those Ability-suppression matchups, if the exact interactions hold. It does not answer Field Blower, Megaton Blower or Faba; those remain separate Tool-removal threats.

## Candidate subsystem map

The exact candidate has Stealthy Hood ×2, Forest Seal Stone ×1 and Float Stone ×1 (four Pokémon Tools total). Its current recovery-related cards include Acerola ×1, Arven ×1, VS Seeker ×2, Night Stretcher ×1, Battle Compressor ×1 and Unfair Stamp ×1 (ACE SPEC).

| State transition | Current/known line | Boundary |
|---|---|---|
| Hood attached → preserved in hand before removal | Acerola returns a damaged Pokémon and all attached cards to hand. | Requires damage counters and must resolve before the opponent removes the Tool. |
| Hood attached → discard | Field Blower can discard up to two Tools/Stadiums; Megaton Blower discards Tools attached to opposing Pokémon. | One action can remove both exposed Hoods if both are attached and selected/affected. |
| Hood attached → Lost Zone | Faba can put one eligible Tool into the Lost Zone. | The recovery cards below act on discard, not Lost Zone. |
| Hood in discard → deck | Lana's Fishing Rod, Eco Arm, Roseanne's Backup. | Each has different required companion cards / counts; a subsequent search is generally needed. |
| Hood in discard → hand | Dowsing Machine; Sordward & Shielbert only if opponent permits. | Dowsing Machine consumes the ACE SPEC slot and two hand cards; Sordward & Shielbert is vetoable. |
| Hood in deck → hand | Arven searches one Pokémon Tool from deck. | Does not retrieve from discard or Lost Zone; VS Seeker can only recover Supporters. |

### Recovery variants to keep separate

- **Lana's Fishing Rod for Night Stretcher:** requires one Pokémon and one Tool in discard; shuffle both into deck, then use Arven or VS Seeker → Arven to fetch the Hood. This trades away Night Stretcher's Pokémon/Basic Energy recovery. Battle Compressor can create a Pokémon discard target, but that competes with its existing uses.
- **Eco Arm for Night Stretcher:** requires exactly three Tools in discard. It may be useful after Megaton Blower only if at least three candidate Tools were actually attached and discarded; Tools in hand/deck are not affected by Megaton Blower. It is not a generic Field Blower answer.
- **Dowsing Machine for Unfair Stamp:** direct Trainer-to-hand recovery, but it replaces the current post-KO disruption ACE SPEC and costs two hand cards.
- **Roseanne's Backup for a Supporter slot:** can recycle one Tool to deck without requiring another card type, but consumes the Supporter turn and requires a later search.

These are hypotheses for controlled evaluation, not recommendations. Do not combine them in one variant.

## Post-acceptance test priorities

Once the current V3 acceptance sequence is complete and Agent6's first natural-terminal trace has been reviewed:

1. Keep the fixed candidate as the control.
2. Use ranks 30, 7 and 29 as direct-removal stress cases, while retaining all 32 opponents in the actual field evaluation. Rank1's Forest Seal Stone/Star Alchemy and Teammates/Raihan/BC-VS routes remain separate; rank7's Faba route must be distinguished from discard-based Field/Megaton removal.
3. For each variant, record Tool zone transitions explicitly: deck → hand → attached → discard or Lost Zone → recovered. Do not infer recovery from card presence alone.
4. Test response timing with the candidate going first and second; separate the opponent's first response after one normal draw from its later response after two.
5. Record whether the Tool is still attached when the removal is played, whether the remover was already spent, whether a recovery prerequisite is present, whether the recovery card is searchable, and whether the Supporter/ACE SPEC/hand cost displaces a more valuable line.
6. Add Enamorus V only as a separate board-shield hypothesis: test the Hood-on-Enamorus / Guardian of Love / Garbotoxin interaction, then stadium and KO counterplay, before comparing its two-Prize and deck-slot costs.
7. Report per-rank game outcomes, sample counts, policy versions and uncertainty only after the accepted simulator and natural-terminal trace establish a trustworthy execution path.

The natural-exposure percentages are scenario-coverage aids only. Do not turn them into match weights, deck scores or a full-field win-rate estimate. The three missing lists remain unknown, not zero-pressure opponents.

## Unresolved questions

- How often does each opponent policy actually retain and choose its direct remover until a Hood is attached?
- How often are three candidate Tools simultaneously attached and therefore available to Eco Arm after a Megaton sweep?
- Is the candidate's Battle Compressor available for a recovery prerequisite without sacrificing a higher-value VS Seeker/Supporter line?
- Does a recovery slot improve the full field enough to justify the displaced Night Stretcher, Unfair Stamp or Supporter?
- How does Faba's Lost Zone removal change the value of keeping the second Hood in hand rather than attaching both?
- Do any accepted simulator traces reveal card-text, search, timing or zone-transition gaps that require paper-rule validation?

No fixed-deck, policy, fixture, seed, CI or simulator change is made by this synthesis. It is a map from the existing evidence to a controlled future test, not a competitive conclusion.
