# Full-state game review rubric

**Status:** proposed reusable review protocol; not a game result, legality ruling, or claim of policy competence.

This rubric turns the human player's concepts in `human_concepts.md` into a repeatable way to inspect one complete Twinleaf game from both seats. It is intended to be used with the offline-only full-state diagnostic and the move-by-move trace. The raw diagnostic contains private card-zone identities; it must never be passed to a player policy or used to expand `actorObservation()`.

## 1. Review one decision at a time

For every root decision and every prompt resolution, record:

1. **Decision context:** game/turn, physical seat, player identity, role (candidate or opponent), active player, first-player seat, phase, engine revision, research revision, policy hash, physical seed, and action ordinal.
2. **Information boundary:** what the acting policy was actually given. Keep the policy observation (or its digest and exact reconstructible inputs) separate from the omniscient offline state dump. Never use hidden opponent hand/deck/Prize identities to justify a decision the policy could not know.
3. **State before:** both boards, active/bench, attached Energy/Tools, damage and conditions, every card zone, Prize slots, turn resources, locks/restrictions, pending prompts, and relevant game rules.
4. **Chosen action:** exact action type and payload, selected physical card identity resolved from the actor's hand before dispatch, prompt result, and whether the engine accepted it.
5. **State after:** same full snapshot, plus immediate changes to zones, board, resources, damage, prizes, turn, phase and prompts.
6. **Alternatives:** identify plausible legal alternatives. If the runner did not enumerate a legal-action set, mark an alternative as *manually inferred*, not engine-confirmed. Do not call an action suboptimal merely because a stronger line can be imagined.
7. **Expected objective:** what the action was trying to achieve (setup, draw/search, evolve, attach, gust, attack, disrupt, preserve resources, deny a line, etc.) and its likely next-turn consequence.

## 2. Tactical and strategic lenses

Apply only the lenses relevant to the state; do not force every concept into every turn.

| Lens | Questions to ask from the trace |
|---|---|
| **UDP — Use-Dependent Prioritization** | Which cards are genuinely high-value in this state? Which are redundant, stranded, or safely expendable? Did the action preserve the cards needed for the intended line? |
| **DCI — Discardability** | Was a discarded card recoverable? Was it a singleton or critical connector? What alternative discard existed? Did the discard change future search, recursion, or resource access? |
| **AMR — Access vs. Manageable Realization** | Was a theoretically available line actually executable with the current hand, once-per-turn resources, board space, locks, and opponent pressure? |
| **ALS / counter-ALS** | What is the opponent's plausible archetype-specific line? Did the player develop, disrupt, or sequence against it? Was the response proactive or merely reactive? |
| **Lock and restriction matrix** | Which Item, Supporter, Ability, attack, retreat, Stadium, or other restrictions were active? Did a lock alter the value or legality of the proposed action? |
| **Prize mapping and K0/K1** | Which Prize cards were actually present in the offline dump? Which identities were known to the player at the time? Was a singleton recovery plan or search sequence disrupted? Keep actual hidden Prize contents distinct from player knowledge. |
| **Supporter contention** | Which Supporters were in hand, was the Supporter resource already spent, and did the chosen Supporter foreclose a higher-value draw/search/disruption line? |
| **Connector domination** | Was there a search, draw, discard, recovery, or switching connector that enabled multiple lines? Did the player preserve or spend it appropriately? |
| **Attack and tempo** | Which attacks were plausibly payable from attached Energy and current restrictions? Was an attack missed, delayed, or correctly declined? Compare damage, KO probability, prize exchange, gust, disruption, survival and tempo—not damage alone. |
| **Bench and board geometry** | Was bench space used for a necessary role? Did the active/bench arrangement create a retreat, evolution, gust, or liability problem? |
| **Associativity / multi-card lines** | Did the value of a card depend on a sequence or combination? Was the required order preserved, and were one-shot resources allocated to the correct part of the line? |

## 3. Classify the finding before changing code

Use one primary classification:

- **Rules/engine defect:** a legal paper action is rejected, an illegal action is accepted, or state transitions/card effects disagree with verified rules/text.
- **Unsupported-card gap:** the pinned engine lacks or simplifies a required card interaction. Preserve a reproducer and keep the result non-definitive.
- **Information-boundary defect:** a policy receives hidden information or is denied information that the defined actor view should contain.
- **Policy legality defect:** the policy proposes an action that is not legal in the current state.
- **Sequencing defect:** the policy chooses a legal but inferior order of actions or consumes a resource too early.
- **Resource-valuation defect:** the policy misvalues a card, Supporter, Energy, search connector, bench slot, retreat, or one-shot resource.
- **Matchup/plan recognition defect:** the policy fails to identify the opponent's plan, its own route to victory, or a relevant counter-line.
- **Heuristic tradeoff:** the action is legal and coherent but may be inferior under a disputed value judgment.
- **Random outcome / insufficient evidence:** the line is plausible and the observed result is not enough to distinguish policy quality from variance.

Do not disguise a heuristic disagreement as a rules bug. Do not patch a policy merely because one seed produced an unfavorable result.

## 4. Turn a finding into a general improvement

For every proposed change, preserve:

- the exact before-state and action trace that exposed the issue;
- the rule/card-text basis if legality or engine semantics are disputed;
- the general policy feature, sequencing rule, or engine adapter hook being changed;
- a regression test covering the class of states, not only the original board;
- paired replays with controlled physical randomness where possible;
- the policy hash, engine pin, runner revision, seeds, and both-seat/first-player conditions;
- whether the change improves the acting role, the opposing role, or both.

Prefer general action evaluation, state features, sequencing, or policy search over one-off scenario patches. Keep research-side hooks outside upstream Twinleaf and record their exact installation/restoration receipts.

## 5. Evaluate both players without information leakage

- Capture the complete private state only as an offline diagnostic artifact.
- Capture or reconstruct the exact actor observation separately for each decision.
- The candidate policy and each opponent policy must remain role-bound and deck-aware; do not assume one policy identity can pilot every deck equally well.
- Use identical declared decision/compute/timeout/randomization constraints for both roles.
- Inspect both candidate and opponent decisions. A candidate improvement that only exploits a weak opponent bot is not evidence of a strong deck.
- Keep physical deal randomness separate from policy randomness. Record the seeds and the seat/first-player mapping.
- After a policy change, replay the same fixture seeds for regression, then evaluate new seeds and the complete opponent field. Do not use one fixture game as a competitive win-rate estimate.

## 6. Minimum review record

For a concise human review, use this template:

```text
Game / engine / runner / policy hashes:
Seed / first-player seat / candidate seat:
Turn / acting seat / policy information available:
State-before reference:
Chosen action / selected card / prompt result:
Plausible alternatives (engine-confirmed or manually inferred):
Resource and board consequences:
Relevant lens (UDP, DCI, AMR, ALS, locks, prizes, Supporter, tempo, etc.):
Classification:
Why the chosen line appears good or suboptimal:
General fix proposed:
Regression case and replay conditions:
Uncertainty / counterevidence:
```

**Limitations:** a full state dump makes a game inspectable; it does not by itself enumerate every legal action, prove a line is optimal, validate paper legality, or establish competitive strength. Any alternative not produced by the engine's legal-action interface must remain a human hypothesis until checked. The 99.5% field target remains unproven until the full 32-opponent evaluation and its statistical requirements are met.
