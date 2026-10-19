# Source rank-2 Gladion turn-5 owner-board context: retrospective qualification audit

**19 October 2026, Agent 24. Evidence class: source-dealt, retrospectively selected decision-observation replay.** This follows Agent 40's frozen eight-attempt Gladion source cohort and its owner-revealed, post-choice Prize inventory. It is a **development fixture**, excluded from all candidate-versus-field win-rate denominators.

## Question and registered test

The unchanged rank-2 Vileplume original 60, facing unchanged rank-1 Shadow Rider original 60, genuinely played Gladion on original source seed **20261024**, rank-2 physical seat **1**, global turn **5**, and selected **Relicanth TEF** at root choice ordinal **47**. The already owner-revealed Prize options included **Technical Machine: Evolution PAR**, **Gloom UNB**, **Vileplume-GX CEC**, **Herdier SUM** and **Lusamine CIN**. Can we establish from the *same owner's visible board, hand and discard at that exact legal root* whether an alternate evolution-related selection had a present strategic route? We must inspect current Active/Bench Pokémon and existing tools, evolve stages, Supporter use, own visible resources, opponent public board and the subsequent actual actor actions. Printed card presence alone does not establish an improved line.

The [read-only owner-context extension](../../simulation/twinleaf/gladion-root-prize-choice-evidence.cjs) is enabled only through `runMatch({captureGladionRootPrizeChoices:true,captureGladionRootChoiceContext:true})`. It executes only after a real `ChoosePrizePrompt` with Gladion staged and the entire owner's Prize inventory actually revealed. It snapshots own hand and discard and both **public** boards immediately before and after the selected response. It does not read hidden deck order, concealed opponent hand or unseen Prize cards for a decision. There is no replacement of the generic selected choice.

The [frozen replay](../../simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs) executes this one authentic source deal twice with the exact same original 60s, seed, profile, corrections, action limit (300), and game label. Only the opt-in observer differs. It asserts equality of actual first turn, deck hashes, full live-root action ledger, card plays, attack declarations, terminal state, action count, and previously existing Gladion Prize-selection evidence after omitting the added contextual field. It fails closed if actual root **47** is absent, the selected Relicanth printing differs, the legal owner choice contains no TM: Evolution, or context is missing. The [pure tests](../../tests/agent24-gladion-owner-context.test.cjs) verify that context is detached, optional, inaccessible before full Prize revelation, and never touches hidden own deck or opponent hand.

### Falsification and interpretation before execution

- **Observer interference, a missing real prompt, or a different physical source decision** invalidates this replay. Record the failure, preserve the original source cohort and do not infer an alternative tactical opportunity.
- **Board and hand do not support an immediate TM: Evolution line:** record that as an explicit negative for immediate evolution advantage. A later strategic use remains possible and untested.
- **Some public/owner-visible line appears promising:** preserve its exact constraints, but treat TM/Gloom preference as an untested, retrospectively generated hypothesis. Demonstrating superiority would require a separately executed and prompt-closed legal alternative followed by a genuine source continuation and opposing response. This record alone cannot make that conclusion.
- The generic opponent and actor policies remain unqualified, hidden-information-safe full gameplay and official clock are unresolved. **Competitive-qualified games = 0.** No 99.5% claim.

The pre-dispatch commitments are the seed and actor slot above, first observed response ordinal **47**, one paired two-arm replay, all comparator assertions, and one archived JSON. This is not a fresh prospective game sample. The bounded job is manual-only `.github/workflows/aichi-tm-attack-policy.yml`, input `rank2_gladion_turn5_context:true`; do not infer outcome skill from successful CI.

## Execution and analysis

*Compiled test status and archived output will be entered only after an actual workflow result is verified.*
