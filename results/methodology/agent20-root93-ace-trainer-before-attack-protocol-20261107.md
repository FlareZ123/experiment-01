# Agent 20: Root93 Ace Trainer Before Attack Experiment

**Status:** implementation committed; native A/B/A run queued; no result claim yet.

## Question

Does playing the Secret Box-searched Ace Trainer immediately before the already-funded, lethal Hidden Power improve the candidate's position compared with the current Box/Fog line that attacks immediately?

The intervention is timed before the Knock Out. In the registered root93 state, the candidate is expected to have six Prize cards remaining and the source five. Ace Trainer's Prize condition therefore needs to be checked before the attack; after the Knock Out, the Prize counts equalize and the card is no longer legal.

## Hypothesis

The current Agent43 v5 Secret Box selector searches the Supporter category for Ace Trainer, but its attack stage proceeds directly to Hidden Power. The searched Supporter is therefore unused.

A pre-attack Ace Trainer could:
- shuffle the source's large public-count hand and make it draw three;
- shuffle the candidate's own hand and draw six;
- reduce the source's access to its planned Garbodor / Float Stone response;
- give the candidate a chance to draw Field Blower for a later Garbotoxin response.

The source hand's card identities are not policy inputs. They are available only in the source's own postgame pass receipt for analysis.

## Policy boundary

simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs selects Ace Trainer only when all of the following hold:

1. The observation is an owner-root decision.
2. Ace Trainer is in the acting player's own hand.
3. The Supporter has not already been used and Supporter play is not locked.
4. The acting player has more Prize cards remaining than the opponent.
5. The opponent's public hand count is at least five and at least as large as the actor's own hand count.
6. The actor's current Active has a simple, funded attack that KOs the public opposing Active.
7. The attack has no unresolved damage calculation or attack text; the opposing Active has no Tool or Ability, the opponent has no Stadium, and no matching resistance is present.

The helper reads no opponent hand identities, deck order, Prize identities, candidate identity, rank, or seed. The wrapper is symmetric across seats. It returns the actual PlayCardAction at the AI decode boundary, before the engine dispatches the action, so the root ledger can record the Supporter action rather than a substituted dispatch.

## Experiment design

simulation/evaluation/agent20-v9-box-fog-ace-trainer-aba.cjs runs:

- **A1:** Agent43 Box/Fog v5 adapter, no Ace Trainer continuation.
- **B:** the same Box/Fog adapter plus the owner-only pre-attack Ace Trainer continuation.
- **A2:** repeat of A1.

All three arms use the same registered development trial, 11:1000:B:new-moon-lockbreaker-v1. The runner asserts identical source/candidate deck fingerprints and initial physical-deal fingerprints across arms. It also asserts A1/A2 root-action-ledger parity, one Ace Trainer decision in B, and an Ace Trainer root action before Hidden Power.

The raw native outputs and summary are written to artifacts/agent20-v9-box-fog-ace-trainer-aba/.

## Important limitations

- This is one registered native development deal, not a matchup sample and not evidence of competitive win rate.
- The source is the existing native development policy. Its decisions are not a substitute for a strong source-side Garbodor response policy.
- A reduction in source hand size does not prove that Garbodor / Float Stone are unavailable; the source may draw them again or search them.
- A Field Blower appearing in the candidate's postgame hand does not prove the current candidate policy will use it correctly.
- The existing terminal-attack-ko-before-endturn-hook.cjs corrects a terminal-KO ordering case. It does not establish correct nonterminal Prize ordering for Powerglass E-21. This experiment therefore does not attach Powerglass before the nonterminal KO.
- Any observed tactical improvement must be reproduced across additional physical deals and tested against an adversarial source policy before it can influence deck selection.

## Related work

- [Agent36 root93 response-tree synthesis](agent36-root93-rank11-response-tree-synthesis-20261107.md)
- [Agent41 Garbotoxin source-reply review](agent41-root93-garbotoxin-source-reply-review-20261107.md)
- [Agent43 root93 Lillie / Energy screen](agent43-v9-root93-lillie-eight-card-energy-screen-20261107.md)
- [Agent43 native Box/Fog adapter](../../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs)
- [Agent20 Ace Trainer policy](../../simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs)