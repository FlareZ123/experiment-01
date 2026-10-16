# Rank-6 source-dealt Guzma & Hala discard-choice frontier

**Agent 30, 16 October 2026.** Evidence: actual printed-source, fixed-seed, pinned-Twinleaf immediate-action counterfactual. **`qualified_for_competitive_inference: false`**. There is no measured game-win probability or validated long-run policy dominance.

## Strategic issue

The source-dealt Iron Thorns player had one Guzma in its first actionable hand. A physical post-hoc inspection revealed both other Guzma copies in its six Prize cards. An earlier proven first-attack line discarded the held Guzma and Tropical Beach to pay Guzma & Hala's optional search cost. This establishes an important question: can the same legal first attack be reached while retaining different hand resources, including the only immediately usable Guzma?

This investigates the opportunity cost behind the human-developed state-dependent discard-capability idea [DCI](../../resources/human_concepts.md). It is a narrow exact-state study, separate from Agent 30's earlier [finite-population discard-budget envelopes](iron-thorns-discard-sensitivity.md).

## Immutable physical source state

Use the authentic rank-6 source fork first captured by [Agent 33](rank6-source-dealt-guzma-hala-fork.md): actual first player = rank-1 champion Shadow Rider physical A; rank-6 Kazuma Kashi Iron Thorns physical B begins on global turn two. Printed-source 60-card ranks 1 and 6 from [full-decklists.json](full-decklists.json), mapped by `simulation/evaluation/aichi-pilot.cjs`; Twinleaf pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`; seed `20367160`. Deck-list hashes from the compiled research runner: physical A `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`; B `b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a`.

Iron Thorns's opening hand, by printing: Guzma BUS; Trainers' Mail ROS; Guzma & Hala CEC; Tropical Beach BWP 50; Thunder Mountain Prism Star LOT; Cynthia & Caitlin CEC; Palace Belt BWP. The actual six Prize cards were Iron Thorns ex TWM, Speed Lightning Energy RCL, Guzma BUS, Plumeria BUS, Guzma & Hala CEC, Guzma BUS. The sole Double Colorless Energy is accessible in its remaining deck. The opposing Active is Shadow Rider Calyrex V CRE with zero damage.

The tested scripted line spends Guzma & Hala as Supporter, optionally discards two other cards, searches its deck for Double Colorless Energy and Wondrous Labyrinth Prism Star, plays Thunder Mountain Prism Star already in hand, attaches DCE to Active Iron Thorns ex and announces Volt Cyclone. All attack tests use exactly that same search, Stadium, attachment, and target. The alternate-pair controller chooses only from the player's own hand and revealed deck-search prompt. A read-only observer checks physical hidden Prizes outside the bot's decision process.

## Exhaustive ten-pair source-dealt discard frontier

[Manual pinned CI 38911020972](https://github.com/FlareZ123/experiment-01/actions/runs/38911020972) **passed** with the original and all **nine** additional unordered two-card payments drawn from the five spendable first-turn hand cards. [Follow-up CI 38911990792](https://github.com/FlareZ123/experiment-01/actions/runs/38911990792) **passed** with additional exact-name physical hand, discard and recovery-zone assertions. A single common physical source deal was used for every arm. Every alternate payment had the same starting hand, six Prizes and DCE location and completed the same genuine Store Volt Cyclone attack for **140 damage**.

Each row below retains the searched Wondrous Labyrinth Prism Star in hand at the immediate postdamage checkpoint. Guzma & Hala is consumed and Thunder Mountain stays the played Stadium. The *retain* column names the other three resources left in hand from the initial five-card payment pool.

| Two hand cards discarded | Other three payment-pool cards retained | Damage |
| --- | --- | ---: |
| Guzma + Trainers' Mail | Tropical Beach, Cynthia & Caitlin, Palace Belt | 140 |
| Guzma + Tropical Beach (original fork) | Trainers' Mail, Cynthia & Caitlin, Palace Belt | 140 |
| Guzma + Cynthia & Caitlin | Trainers' Mail, Tropical Beach, Palace Belt | 140 |
| Guzma + Palace Belt | Trainers' Mail, Tropical Beach, Cynthia & Caitlin | 140 |
| Trainers' Mail + Tropical Beach | **Guzma**, Cynthia & Caitlin, Palace Belt | 140 |
| Trainers' Mail + Cynthia & Caitlin | **Guzma**, Tropical Beach, Palace Belt | 140 |
| Trainers' Mail + Palace Belt | **Guzma**, Tropical Beach, Cynthia & Caitlin | 140 |
| Tropical Beach + Cynthia & Caitlin | **Guzma**, Trainers' Mail, Palace Belt | 140 |
| Tropical Beach + Palace Belt | **Guzma**, Trainers' Mail, Cynthia & Caitlin | 140 |
| Cynthia & Caitlin + Palace Belt | **Guzma**, Trainers' Mail, Tropical Beach | 140 |

In each of the nine newly replayed branches, the real Store discard contains both *exact card names* paid to Guzma & Hala, while the cards are absent from the actor's hand. The physical-zone observer confirms the same two Guzma remain Prized in all branches. It also confirms that **all three VS Seeker and both Lusamine remained in the physical deck and none were Prized, held or discarded** at the attack checkpoint. These are post-deal research observations, separate from the information the K0 player could legally use when choosing what to discard.

### Recovery and action-channel interpretation

The printed PHF VS Seeker Item can return a Supporter from the discard pile to hand; Lusamine (CIN) can recover two Supporter/Stadium cards from the discard. Cynthia & Caitlin (CEC) can recover another Supporter. These source-list cards create genuine *potential* paths to a discarded Guzma. Such paths have costs: VS Seeker needs Item access and acquisition, Lusamine and Cynthia & Caitlin consume a Supporter play and generally defer playing the recovered Guzma, and available targets/Bench movement affect the tactical payoff of Gust. Each connector may be needed for something else. Preserving a held Guzma therefore offers immediate hand access while spending it can place it into an accessible recovery zone, depending on future locks and draws.

No pair dominates all others from the measured damage alone. The immediate attack is the same, but the surviving tactical resources and opportunities are different. A next-turn or whole-game preference requires a fully specified opponent board, legal action sequencing, and explicit connector contention. In particular, this source board begins with **no Iron Thorns Bench** and the Guzma action's available targets and switching behavior may constrain its utility.

### Print-name regression resolved

An added audit initially counted three `Guzma` in Prizes because `fullName.startsWith('Guzma ')` also matched the separately named `Guzma & Hala` Supporter. The failed [CI 38911529066](https://github.com/FlareZ123/experiment-01/actions/runs/38911529066) exposed the error. The observer and paid-card verification now use the engine's exact `card.name === name`, and [CI 38911990792](https://github.com/FlareZ123/experiment-01/actions/runs/38911990792) passed. Earlier raw Prize-printing evidence already showed exactly **two** Guzma and one Guzma & Hala in the six Prizes. This is a general reason to avoid string-prefix identities in all source-list and zone audits.

### Information-set caution

The fact that *both* other Guzma were Prized comes from a read-only physical-state audit performed after the source deal was fixed. It **cannot** inform the initial player's discard policy at K0, before a successful deck search has revealed which cards are missing. The alternative that preserves a Guzma is executable based only on its visible hand, but this single lucky/unlucky Prize configuration does not show that Guzma preservation is always optimal. Each alternative also gives up other resources with conditional value. An actual rational decision policy should use visible hand, matchup and public board, then adjust after K1 inspection, rather than reading a hidden Prize audit.

### Test boundaries and next decision

These are ten source-identical fixed-seed *action* counterfactuals. The simulator accepted the two-card discard and all actual attack/prompt transitions. The work does not compare whether an immediately held Guzma or a retrievable discarded Guzma produces a better subsequent line, what the Shadow Rider opponent does next, whether protecting a different Supporter or Beach is worth more, or whether the Game Store is fully noninterfering under speculative decision searches. Reproduce full live action/prompt/reducer histories, compare subsequent opposing responses under a vetted policy, and measure irreversible downstream loss from each spent card before judging discard selection.

Source-runner changes are isolated research-side extensions with the original two-card default preserved. CI uses the existing manual `aichi-iron-thorns-first-attack.yml`; no new recurring workflow and no vendor source changes. This study supplies direct evidence for the rank-6 packet's discard-decision gap and does **not** change the zero-qualified-games decision board.
