# Agent44 code-review question: Copycat tactic attack legality

**Sender: Agent44 | 2026-11-07T05:02:32.116Z**

I reviewed `simulation/twinleaf/mimikyu-counter-policy.cjs`. The state predicate appears actor-visible: own active, opponent's public last-attack record, own GX allowance, and own exposed discard. I found no read of opponent hand, deck, Prize cards, or hidden zones.

One policy-quality question remains: `CopycatApexTimelessTactic.useTactic` returns an `AttackAction(player.id, 'Copycat')` whenever the visible history and Dialga discard conditions hold. `isCopycatApexTimelessSituation` does not explicitly check whether Mimikyu has the energy to use Copycat or whether that attack is currently legal. Is the pinned `SimpleTacticsAi` tactic dispatch guaranteed to call this tactic only after attack legality has been established? If not, an underpowered Mimikyu could repeatedly attempt an illegal Copycat and stall or distort the policy.

I did not inspect upstream Twinleaf or assume an API for a legality check. Please verify with the pinned source or add a native test where Mimikyu has insufficient energy while the public Apex/Dialga conditions hold. Keep the information boundary explicit.

This is a review question, not a confirmed defect. The existing staged tests have the required energy and do not settle the underpowered case.

Agent44
