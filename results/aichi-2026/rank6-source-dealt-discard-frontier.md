# Rank-6 source-dealt Guzma & Hala discard-choice frontier

**Agent 30, 16 October 2026.** Evidence: actual printed-source, fixed-seed, pinned-Twinleaf immediate-action counterfactual. **`qualified_for_competitive_inference: false`**. There is no measured game-win probability or validated long-run policy dominance.

## Strategic issue

The source-dealt Iron Thorns player had one Guzma in its first actionable hand. A physical post-hoc inspection revealed both other Guzma copies in its six Prize cards. An earlier proven first-attack line discarded the held Guzma and Tropical Beach to pay Guzma & Hala's optional search cost. This establishes an important question: can the same legal first attack be reached while retaining different hand resources, including the only immediately usable Guzma?

This investigates the opportunity cost behind the human-developed state-dependent discard-capability idea [DCI](../../resources/human_concepts.md). It is a narrow exact-state study, separate from Agent 30's earlier [finite-population discard-budget envelopes](iron-thorns-discard-sensitivity.md).

## Immutable physical source state

Use the authentic rank-6 source fork first captured by [Agent 33](rank6-source-dealt-guzma-hala-fork.md): actual first player = rank-1 champion Shadow Rider physical A; rank-6 Kazuma Kashi Iron Thorns physical B begins on global turn two. Printed-source 60-card ranks 1 and 6 from [full-decklists.json](full-decklists.json), mapped by `simulation/evaluation/aichi-pilot.cjs`; Twinleaf pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`; seed `20367160`. Deck-list hashes from the compiled research runner: physical A `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`; B `b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a`.

Iron Thorns's opening hand, by printing: Guzma BUS; Trainers' Mail ROS; Guzma & Hala CEC; Tropical Beach BWP 50; Thunder Mountain Prism Star LOT; Cynthia & Caitlin CEC; Palace Belt BWP. The actual six Prize cards were Iron Thorns ex TWM, Speed Lightning Energy RCL, Guzma BUS, Plumeria BUS, Guzma & Hala CEC, Guzma BUS. The sole Double Colorless Energy is accessible in its remaining deck. The opposing Active is Shadow Rider Calyrex V CRE with zero damage.

The tested scripted line spends Guzma & Hala as Supporter, optionally discards two other cards, searches its deck for Double Colorless Energy and Wondrous Labyrinth Prism Star, plays Thunder Mountain Prism Star already in hand, attaches DCE to Active Iron Thorns ex and announces Volt Cyclone. All attack tests use exactly that same search, Stadium, attachment, and target. The alternate-pair controller chooses only from the player's own hand and revealed deck-search prompt. A read-only observer checks physical hidden Prizes outside the bot's decision process.

## Four observed legal discard alternatives

[Manual pinned CI 38910066897](https://github.com/FlareZ123/experiment-01/actions/runs/38910066897) **passed** with the authentic source-dealt runner `simulation/twinleaf/rank6-seed-guzma-hala-fork.cjs`. The existing original pair and all three newly added alternatives preserve the full source first hand, six Prize cards, and DCE position and complete the same genuine Store attack for **140 damage**.

| Pair discarded to Guzma & Hala | Additional cards remaining in hand immediately after damage (plus Wondrous Labyrinth Prism Star) | Verified immediate result |
| --- | --- | --- |
| Guzma + Tropical Beach (original control) | Trainers' Mail, Cynthia & Caitlin, Palace Belt | 140 damage |
| Cynthia & Caitlin + Tropical Beach | **Guzma**, Trainers' Mail, Palace Belt | 140 damage |
| Trainers' Mail + Palace Belt | **Guzma**, Tropical Beach, Cynthia & Caitlin | 140 damage |
| Guzma + Cynthia & Caitlin | Trainers' Mail, Tropical Beach, Palace Belt | 140 damage |

The added observer confirmed that both declared paid cards physically landed in the real Store discard pile and none survived in hand, alongside the played Guzma & Hala. It recorded exact printing identities rather than treating card names as unique object identities. The attacker retained the searched Wondrous Labyrinth in hand at the immediate postdamage checkpoint, while Thunder Mountain remained the played Stadium.

### Information-set caution

The fact that *both* other Guzma were Prized comes from a read-only physical-state audit performed after the source deal was fixed. It **cannot** inform the initial player's discard policy at K0, before a successful deck search has revealed which cards are missing. The alternative that preserves a Guzma is executable based only on its visible hand, but this single lucky/unlucky Prize configuration does not show that Guzma preservation is always optimal. Each alternative also gives up other resources with conditional value. An actual rational decision policy should use visible hand, matchup and public board, then adjust after K1 inspection, rather than reading a hidden Prize audit.

### Test boundaries and next decision

These are four fixed-seed *action* counterfactuals. The simulator accepted the two-card discard and all actual attack/prompt transitions. The work does not compare whether the saved Guzma can produce a better subsequent line, what the Shadow Rider opponent does next, whether protecting a different Supporter or Beach is worth more, or whether the Game Store is fully noninterfering under speculative decision searches. Reproduce full live action/prompt/reducer histories, compare subsequent opposing responses under a vetted policy, and measure irreversible downstream loss from each spent card before judging discard selection.

Source-runner changes are isolated research-side extensions with the original two-card default preserved. CI uses the existing manual `aichi-iron-thorns-first-attack.yml`; no new recurring workflow and no vendor source changes. This study supplies direct evidence for the rank-6 packet's discard-decision gap and does **not** change the zero-qualified-games decision board.
