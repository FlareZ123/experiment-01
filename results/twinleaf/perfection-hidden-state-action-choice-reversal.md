# Hidden rank-11 hand reverses the selected Perfection action at a knockout threshold

**Agent 10; 19 October 2026. Compiled pinned-engine staged action-choice result.**

## Two complete observationally identical actor worlds

The printed rank-11 Wataru Yano Absol/Garbodor **exact 60** is preserved in both worlds. Its Active Mega Absol ex (280 HP) has **80 pre-existing damage**. Its four unrevealed hand cards are alternatively four Darkness Energy or four Battle VIP Pass, moved correspondingly to/from its still-unrevealed deck. Hand/deck/Prize counts, public Pokémon, current turn, actor's cards and legal observations are equal. The hypothetical actor's synthetic full 60 contains Mewtwo & Mew-GX UNM71 Active with two Basic Psychic Energy, Gengar & Mimikyu-GX TEU53 in the discard as Perfection's Poltergeist payload, and remaining Basic Psychic Energy; GX allowance already spent. Neither proposed list is a competitive deck.

The pinned default `UseAbilityTactic` scores simulated actions by the complete hidden `State`; `Perfection` is a `UseAbilityAction`, and the existing `AttackAction`-only sampler never intercepted it. With the defender already damaged, four opposing Trainers permit copied Poltergeist's 200 damage to reach the visible 280-HP KO threshold. The bot must nevertheless choose Perfection **before** seeing the opponent's hand.

## Passed choice-level evidence

[Actual compiled manual CI 39320237157](https://github.com/FlareZ123/experiment-01/actions/runs/39320237157) passed the [single-stage regression](../../tests/perfection-hidden-choice-decision.test.cjs), after the same compiled pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and [executable](../../simulation/twinleaf/perfection-hidden-choice-decision.cjs). It reproduced:

| Identical player observation | Four hidden Darkness Energy | Four hidden Battle VIP Pass |
| --- | --- | --- |
| Original public/owner pre-action state score | 266 | 266 |
| **Original selected UseAbilityTactic action** | **None** | **Perfection** |
| **24-sample detached opponent-hidden-pool action choice** | **None** | **None** |

The paired action difference is a real **bot-selection** reversal across hidden-only states. An independent zero-damage paired test had selected no Perfection in either world, even though its hypothetical score was 161 versus 421: the pinned `UseAbilityTactic` includes a `-1000` end-turn preference in its current policy. Adding the same 80 visible defending damage to both worlds made the Trainer-hand KO consequential enough to cross the bot's decision threshold.

The opt-in `includePerfectionAbility:true` extension to [opponent-hidden-pool-attack-sampling.cjs](../../simulation/twinleaf/opponent-hidden-pool-attack-sampling.cjs) restores matched selected actions, deterministically choosing neither across both worlds under these sample settings. It is a **parity** correction. This test does not show declining Perfection is the strategically optimal decision. After the reversible correction is removed, the original choices were again reproduced. Earlier compiled [score-level report](perfection-hidden-pool-score-fidelity.md) gives scores 161/421 versus corrected 323.5/323.5 at zero defending damage, and an independent [native-attack twelve-pair grid](rank11-hidden-choice-grid-followup.md) demonstrates six raw attack-selection reversals versus zero after its own opt-in sampling.

## Scope and integration

These are purpose-built 60-card actor worlds rather than naturally dealt actual matches. The hidden-pool sampler assumes the opponent's complete source 60 is known, with no individually observed concealed cards/positions. These premises must be checked in any complete-game application and might not hold in a real closed-decklist match. The sampler is merely a deterministic finite-24-state heuristic; potential other tactics, prompt resolution, full-Store rule defects, paper timing, opponent strategy and deck construction remain unqualified.

This action-level result establishes a defect in **unmodified bot decision evaluation**, and it demonstrates that a bounded, reversible source-aware observation correction can remove the tested discrepancy. It neither authenticates full policy safety nor supports 99.5% matchup claims. The shared v2 hard-rank runner must version the correction and account for its own observable-card model. Unqualified complete-game outcomes must not be converted to deck-strength claims.

Published field: 29/32 exact source 60s, ranks 23/25/28 missing, zero competitive-qualified games.
