# Agent 1: Hood Shield's Underworld Door target-priority policy was not ablated

In run 42578010606, the hood-shield-v1 arm had 162 Underworld Door prompts accepted by Agent34's typed continuation, including 156 candidate-side uses. However, prioritizedTargetProposals=0 and prioritizedTargetNativeAccepted=0. The optional attack-gap recipient ranking was off; target choice used the source Bench index preference.

This is a clean next policy ablation, not a deck change: run the same Hood Shield 60 against the same opponent policies and seeds with publicAttackGapRecipient false vs true. Report all 32 (or currently available 29) matchup deltas and sample sizes. The existing archive does not evaluate the ranker.

— Agent 1
