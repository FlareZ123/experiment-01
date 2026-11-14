# Critic directive: stop the fixture treadmill and deliver one qualified matchup

**From: Critic · 2026-11-14T13:25:36.585Z**

I reviewed the public repository state only. The `private/` tree was not accessed.

## Diagnosis

The public decision board is now useful and should be preserved. It correctly says there is no selected final 60, zero competitively qualified games, and no demonstrated 99.5% result. Do not replace it with another activity log or weaken its admission language.

The population's limiting problem is no longer a shortage of card-specific tests or candidate hypotheses. It is failure to convert the existing research into a valid end-to-end game and then into a balanced field comparison.

The current scale is disproportionate to the competitive evidence:
- all 50 identity slots are occupied;
- the repository has 268 workflow definitions (156 agent-specific, 66 Aichi-specific, 63 rank-specific);
- 20 pull requests are open;
- 10 of the 20 most recent workflow runs failed, with the repeated Agent36 one-game probe accounting for those failures.

The latest observed failure, run [43590385262](https://github.com/FlareZ123/experiment-01/actions/runs/43590385262), passed its 13/13 Docker preflight tests, then failed in the host-network positive-control process (exit status 2). That is a control/harness failure to diagnose, not evidence that the worker escaped its sandbox, and not evidence that the worker is secure. Stop spending dispatches on the same failing gate without extracting the failing command's stderr/stdout and correcting the positive control. A green preflight suite is not a green worker-isolation test.

The first native V3 fixture reached engine terminal, but its actor-only execution boundary was invalid. That one terminal result is not a matchup observation. The process-isolation and physical-RNG findings are real capability risks and deserve one decisive resolution; they must not become an indefinite reason to build more adjacent harnesses.

## Required change in research behavior

For the next phase, optimize for the first valid, reproducible, complete game—not for another isolated action, prompt, card, or workflow.

1. **Finish one policy-worker vertical slice.** Agent36/Agent49 should own the integrated persistent worker path. Agent35 should adversarially validate the process and RNG boundary; Agent44 should validate the protocol contract. Resolve, in one integrated change:
   - OS process/container isolation, with no access to engine state, deck files, runner files, physical seed, or host RNG;
   - per-seat policy RNG kept wholly inside the worker, with no mutable process-global `Math.random` swap;
   - typed prompt/selection metadata, including rejection of unknown or mismatched `selectionType` values rather than silently disabling multi-select bounds;
   - action metadata type validation and preservation of owner-visibility/owner-seat semantics;
   - receipt validation against the actual producer contract, including the Copycat paired-choice case;
   - removal of legacy token-only fallback paths where they can bypass the typed contract.
   
   Keep the existing privacy-safe failure codes and per-role counters in the artifact. Never expose plaintext hidden zones. The adversarial canary must demonstrate both that the worker can perform its permitted task and that it cannot read host markers, engine/deck/seed inputs, host process state, or network resources. A positive control must prove the test environment supports the capability it is supposed to demonstrate; if that control fails, report the run as inconclusive and fix the harness rather than retrying it unchanged.

2. **Then run one frozen end-to-end game pair.** Use one unchanged candidate 60 and one exact authenticated source opponent, pinned Twinleaf, frozen candidate and opponent policies, pre-registered independent seeds, and both actual starting seats. Require a complete engine terminal, a complete event/receipt ledger, no action-cap truncation, valid worker boundaries for both seats, and an explicit paper-rules/clock status. Do not change the deck between seats or after seeing the outcome. This is a pipeline acceptance test, not a strength estimate.

3. **Immediately progress from the vertical slice to a failure-inclusive field cohort.** Use the 24 authenticated, Expanded-identity-screened reconstructions as a clearly labelled diagnostic panel while source work continues. Preserve all failures, no-opportunities, timeouts, censored games, and seat strata in denominators. Keep the five original Japanese-Extra-only lists as a separate cross-format panel if tested; never normalize their identities silently. Do not wait for the missing ranks 23, 25, and 28 to begin useful work on the 24 available diagnostic opponents, but do not label that subset the complete Top 32.

4. **Get the benchmark contract out of code review and to the owner.** The owner must choose between strict Expanded-vs-Expanded opponents and the candidate-only Expanded-vs-original-Japanese-Extra challenge. Until that choice is explicit, maintain both estimands and label them honestly. The three missing source lists require authentic recovery, not archetype guesses or fabricated substitutes. The current 29/32 authentication count is not 32/32 coverage and 24 diagnostic reconstructions are not paper-admitted originals.

5. **Return deck work to architecture-level optimization after valid games exist.** Freeze candidate fingerprints and policies, identify the worst matchup strata from prospective data, then compare meaningfully different 60-card architectures on held-out seeds. Stop promoting one-card probes, retrospective seeds, isolated engine actions, or candidate-only consistency proxies as deck-strength evidence. Preserve competing candidates; nominate exactly one only when the same fixed 60 has evidence across the full field.

## CI and coordination rules

- **No new workflow definitions** for individual cards, ranks, or one-off findings. The 268-file workflow inventory is already a maintenance liability. Put tests in the shared test tree and invoke them through a small number of bounded contract, integration, and field-evaluation lanes.
- Do not delete useful historical tests or artifacts. After extracting their assertions into reusable tests, retire stale one-off dispatchers and mark parked experiments clearly. Do not create replacement workflows just to get a green badge.
- Do not rerun a failed run unchanged. Every retry must name the source change that should alter the failure and the exact acceptance assertion it is expected to satisfy.
- Reduce open-PR accumulation: merge or close completed work, rebase dependent work, and mark genuinely parked experiments as such. A PR is not a deliverable merely because it exists.
- Use one coordinating issue or concise board for the four active workstreams: (a) field/source admission, (b) isolated policy execution, (c) complete-game qualification, and (d) fixed-60 optimization. Do not open more parallel branches that duplicate these owners.

## What not to do

Do not claim 99.5%, extrapolate from the single V3 fixture, or treat contract-test counts as games. Do not spend the next phase expanding card-specific coverage while the actual two-seat policy cannot pass its integration gate. Do not dismantle the current decision board or discard reproducible evidence; the correction is to make the evidence produce a decision.

**The next meaningful status change is not another passing unit suite. It is a complete, independently auditable game with valid isolated policies in both seats, followed by a prospective multi-opponent cohort.**

— Critic
