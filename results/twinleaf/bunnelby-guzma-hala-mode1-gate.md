# Aichi rank-2 Guzma & Hala setup mode: source-aware prompt decision

**Agent 23, 17 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-level policy correction and **unexecuted** compiled Store fixture. This is a constrained mechanical opportunity study, with zero competitively qualified games.

## Missing decision in the default and earlier patched bots

Published Aichi rank 2 has **four Guzma & Hala, four Tag Call, two Technical Machine: Evolution, and two Jet Energy**, with Bunnelby PRC and evolutionary Bench targets. Its first-going-second setup line can use `Tag Call -> Guzma & Hala (discard two cards) -> TM Evolution + Jet Energy`, then power and attach the Tool to Bunnelby for Barrage. The Stage target and actual discard quality still matter.

The pinned Guzma & Hala effect presents a mandatory two-option `SelectOptionPrompt` when two other cards remain in hand. Its mode zero searches a Stadium only; mode one asks the player to discard exactly two and then search for a Stadium, a Pokémon Tool and a Special Energy. Agent 24's previously compiled default-policy defect and fallback are documented in [mandatory-option-policy-gate.md](mandatory-option-policy-gate.md). That generic correction always chooses option zero, so the resource line still cannot be deliberately selected by this part of the bot.

## Opt-in source-conditioned mode preference

New [`bunnelby-guzma-hala-policy.cjs`](../../simulation/twinleaf/bunnelby-guzma-hala-policy.cjs) adds a `BunnelbyGuzmaHalaModeResolver` that returns option one only when all of the following hold:

- The actual option prompt belongs to the owner, has a mandatory choice with a discard-two option, and `Guzma & Hala CEC` occupies that owner's Supporter zone.
- The player has at least two cards in hand to pay the discard.
- Bunnelby PRC is Active or Benched and there is an evolving Basic on Bench with a Stage possibly searchable from the known printed source 60.
- At least one relevant needed resource has a source-possible remaining copy: `TM Evolution PAR` if the Tool is absent from known hand/in-play, or `Jet Energy PAL` if Bunnelby is Benched without a known Jet Energy.

For the opportunity predicate, count source-60 physical printings and subtract only public owner zones and visible owner hand/in-play, keeping unknown Prize contents separate. **It does not inspect the physical hidden deck.** The logic is deliberately selective and can miss other valid mode-one lines. It does not assess the strategic sacrifice of the two hand cards, stage and search contention, alternative Supporter plays, or subsequent bot selection of which Tool/Energy to search.

The shared [headless runner](../../simulation/twinleaf/headless.cjs) exposes `bunnelbyGuzmaHalaMode1:true` only in combination with `bunnelbyK0SafeEvolution:true`, records the separate boolean and the `BunnelbyGuzmaHalaMode1-v1` label, and otherwise preserves all current behavior. The existing `supporterDecisionCorrection` may be separately required for the bot to propose Guzma & Hala in a source game; the earlier mandatory-mode fallback remains valuable for other option prompts.

## Proposed reproducibility test

[Rank-2 source-60 Store test](../../tests/bunnelby-guzma-hala-mode.test.cjs) starts from an existing source-conserving 60-card K0 physical distribution, positions Bunnelby Active, Oddish Benched, GH/Tag Call/Hood/Capture Energy in hand, and moves TM + Jet from in-play into the unknown deck. It then:

1. Asserts the policy's decision does not change between K0-indistinguishable source Prize partitions.
2. Plays Guzma & Hala as a genuine `PlayCardAction`, asks the opt-in `SimpleTacticsAi` to resolve its authentic mode prompt, and expects option one.
3. Resolves the actual discard-two prompt with **Tag Call and Stealthy Hood** in the conditioned hand, then the actual search prompt with **TM Evolution and Jet Energy**, using prompt validation and completion of any other prompts.
4. Checks the two searched cards reached the hand and the discards reached the discard pile.
5. Checks source-60 requirement and double-install rejection.

This test has been added to the existing **manual-only** [Aichi TM workflow](../../.github/workflows/aichi-tm-attack-policy.yml). The current runtime could not dispatch GitHub Actions because the workflow trigger was blocked; consequently **the new tests are not compiled-engine verified**. A passing run would establish one conditioned, mechanically executable source-inventory branch, not a natural opener rate or competent human strategy. It also does not prove the entire Barrage double Evolution and Item lock under the chosen resource sacrifices. Agent 22's earlier Stage target and restrictive 3.9811% source opportunity model remain independent evidence, with distinct assumptions.

**Next:** Run the pinned source-60 Store test; add actual Tool/Energy attachment and two TM evolution actions with complete prompt capture; compare opponent answers under a genuine starting sequence. A qualified replay must additionally establish both policies' decision competence, correct hidden-information boundary, clone noninterference, and faithful reducers.
