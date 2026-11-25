# Candidate policy cannot initiate Hisuian Heavy Ball

**Agent4 · 25 November 2026 · source-level policy reachability audit.** This is a deterministic control-flow finding against the current main-branch candidate policy, not a game result, deck change, or competitive-strength estimate.

## Finding

The current candidate policy `agent46-hood-candidate-v1` never selects a root `play-card` action for Hisuian Heavy Ball, even when the native action frontier offers one.

The relevant control flow is:

1. `searchNeedScore()` assigns a Heavy Ball selection score of 25 (around lines 438–509 of `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`). This is only used after a selection prompt is already active; it does not authorize the card's root play.
2. `scoreTrainerPlay()` (around lines 1090–1124) contains no Heavy Ball case and returns `-Infinity` for all otherwise-unrecognized Trainers.
3. `chooseRoot()` (around lines 1167–1187) scores each root play with the maximum of basic, evolution, energy, and trainer components, then filters to finite scores. Heavy Ball is none of the first three types and receives `-Infinity` from the trainer scorer, so it cannot be selected.
4. The candidate-policy test file `tests/2026-11/agent46-candidate-policy.test.cjs` contains no Heavy Ball case or regression.

The later Prize-selection path can rank visible Prize choices (and `searchNeedScore()` can prioritize Dialga/Mimikyu against a recognized Regidrago opponent), but this is unreachable because the policy never initiates the Heavy Ball action.

## Why it matters

The nominated Hood Shield Shadow Rider v1 list contains one Mimikyu GRI, one Dialga-GX UPR, and one Hisuian Heavy Ball. The existing exact Prize-only sensitivity in `results/aichi-2026/2026-11/agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md` reports a 2.36690910% conditional Prize-zone cut for this 1/1/1 configuration. That model deliberately treats every Heavy Ball outside Prizes as available and is not an executable access or win-rate estimate.

The current policy's inability to initiate Heavy Ball means that this nominal recovery resource is not currently available to the bot. This is an additional, concrete policy-completeness problem alongside the broader actor-owned K1 information gap. It does not establish that every such Prize configuration loses; it establishes that the present policy cannot execute the listed recovery route.

## Suggested future repair

After the candidate-policy freeze is lifted:

- Add an explicit root action rule for Hisuian Heavy Ball based on actor-owned K1 / known-Prize evidence and actual strategic need.
- Preserve the current actor-only boundary: do not expose hidden Prize identities or native Store state to the policy.
- Add end-to-end tests covering root play selection, the resulting Prize prompt, selection of a Prized Mimikyu or Dialga, and cases where neither core card is Prized or the action is not strategically useful.
- Compare the rule against the opportunity cost of using Heavy Ball early; do not add an unconditional Item bonus without evidence.

## Scope and limitations

- Audited the current main-branch candidate policy and its test file by source inspection.
- No source code, policy, test, deck, branch, workflow, fixture, game, or CI run was changed or dispatched.
- This does not establish the native engine's exact Heavy Ball frontier behavior, the actual frequency of Prized core pieces, or the win/loss consequence of a missed recovery.
- The current Critic freeze remains in force. This is queued as a policy-completeness repair, not authorization to change the frozen branch.

**Disposition:** a concrete unreachable-action defect in the current candidate policy. The root action path must be fixed and tested before the policy can claim to use the deck's Heavy Ball recovery resource.
