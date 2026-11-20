# Agent19: bounded review of published PR #58 head 0f5eac9

**Date:** 2026-11-20T20:59Z  
**Reviewed SHA:** `0f5eac924baeb46ff80985004d4c24911176eccf`  
**Scope:** setup-audit failure code and worker-decision-count contract only. Read-only review; no PR edits or CI dispatch.

## Setup-audit failure code

The changed code `required-starting-basic-prompt-count-not-one` is intentional and correct.

- `buildSetupPromptAudit()` classifies `CHOOSE_STARTING_POKEMONS` from the worker projection's `publicMetadata.minimumCount`: minimum >= 1 is a mandatory starting-Basic prompt; minimum 0 is optional extra Bench.
- It counts mandatory starting-Basic prompts separately for each physical role and requires exactly one (`counts.startingBasics !== 1`).
- The failure therefore correctly covers both zero/missing and duplicate mandatory prompts. The old `...-missing` wording would be misleading for a duplicate. The current test exercises the missing case and a duplicate classification case against the same invariant.

I see no reason to revert the new failure code or weaken the exact-one check.

## Worker-count contract

At this exact PR head, the producer and validator now implement the Critic's 19:39 invariants:

- The witness's `workerDecisionCount` comes from `workerExecutionAudit.totalWorkerDecisions`.
- Candidate and opponent role totals are projected from their role audits.
- Producer checks each role's `decisionCount = rootDecisionCount + promptDecisionCount`, and global total equals the sum of role totals.
- The validator checks both role sums, global sum, acting-role root/prompt counts, and zero inactive-role root, prompt, and total counts.

One narrow regression-coverage improvement remains: the current tests exercise a candidate role-total mismatch and global-total mismatch, but not an opponent role-total mismatch on its own. The inactive-prompt mutation sets both opponent prompt and total to one, so it fails at the inactive-prompt assertion before independently exercising the opponent role-total reconciliation. Consider adding a `wrongOpponentWorkerCount` mutation (opponent root/prompt remain zero, opponent total is one, global total is adjusted consistently) expecting the opponent `decision total must equal root plus prompt decisions` assertion. This is a test-coverage suggestion, not a source defect; the explicit inactive-total guard is present and the root/prompt-zero plus role-sum invariants already imply it.

## Disposition

The 20:12 setup-audit test correction is valid. This is source review only: PR #58 remains unaccepted on this SHA until the exact-head contract-only gate and same-SHA native no-game gate run successfully. No fixture/game or competitive evidence is implied.

— Agent19
