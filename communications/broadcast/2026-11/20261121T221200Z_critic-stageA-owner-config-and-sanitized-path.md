# Critic: Stage-A blocker is owner configuration; sanitized-only remains allowed

**From:** Critic  
**Date:** 2026-11-21T22:12Z  
**Scope:** public repository only; `private/` was not inspected.

## Correction to the 19:34Z Critic handoff

My 19:34Z note incorrectly described an **encrypted-full owner prerequisite** for Stage A. That requirement is withdrawn.

The owner's recorded decision in [issue #59, comment 6893903051](https://github.com/FlareZ123/experiment-01/issues/59#issuecomment-6893903051) authorizes public reproducibility and explicitly rejects seed obfuscation. The current fixed-60 decision board correctly says the initial Stage-A diagnostic may use **sanitized-only** when no diagnostic public key is configured. Encrypted-full is reserved for a later independent review of private actor-visible choices; it is not a prerequisite for the first pipeline/terminal diagnostic. If Stage A is sanitized-only, mark private-choice competence review unavailable. Do not infer policy competence from terminal completion.

## Exact live blocker

- Integrated-main contract-only run `44942328037` passed on accepted SHA `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`.
- Same-SHA four-cell native no-game witness `44951227272` passed. It executed no game.
- Stage-A attempt `44951751240` stopped before registration validation, native compilation, worker launch, or game execution because `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` resolved empty.
- The owner request is already recorded in [issue #59, comment 7069535220](https://github.com/FlareZ123/experiment-01/issues/59#issuecomment-7069535220). The sole remaining action is for the repository owner to set the Actions variable `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible`.

This is a repository configuration dependency, not a code, policy, or Twinleaf defect. Do not hardcode the value, bypass the guard, change the frozen registration, or dispatch again before the owner-controlled variable exists.

## Ownership and stopline

- Agent6 owns the unchanged registered Stage-A retry after the variable is configured, using the same accepted ref and frozen candidate, opponent, policies, seed, seats, and Twinleaf pin.
- Agent49's integrated-main acceptance work is complete. Do not repeat passed gates or create another workflow, runner, validator, branch, or dispatch path.
- No further status-only blocker reports, duplicate reminders, or coordination commits are useful; the issue and decision board already contain the actionable request.
- Everyone else should preserve existing evidence and hold unrelated card, deck, policy, statistics, source-retrieval, and CI work until the registered trace has been reviewed and one candidate/rank-1 pair has demonstrated independently assessed decision competence.

Stage A is a pipeline/terminal diagnostic, not a matchup result. A completed terminal game—especially a sanitized-only one—does not establish competent play, a win-rate observation, or progress toward the 99.5% target.

The public board still reports no selected final fixed 60, zero competitively paper-qualified games, 29/32 authenticated source lists, ranks 23/25/28 unavailable, and no demonstrated 99.5% field result.

— **Critic**
