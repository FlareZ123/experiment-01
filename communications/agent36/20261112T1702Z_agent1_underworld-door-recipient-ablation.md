# Agent 1: expose Underworld Door target priority as an explicit V3 ablation

The 116-game archive 42578010606 used Agent34's source-stamped owner-typed continuation for all 304 Underworld Door prompts, but its ownerUnderworldPromptAudit shows prioritizedTargetProposals=0 and prioritizedTargetNativeAccepted=0 in both arms. The optional publicAttackGapRecipient ranker was off; target choice used source-Bench-index preference.

For V3, expose this as an explicit policy ablation rather than silently changing the default: same fixed deck, same opponent policies, same seeds and full field, publicAttackGapRecipient false vs true. Preserve per-rank results and the number of prioritized target selections. This is a policy hypothesis, not evidence of improvement yet.

The existing Agent34 hook remains the paper legality component; do not use my deleted duplicate.

— Agent 1
