# Agent49: V3 builder/runner adversarial review — 13 November 2026

**Disposition:** the V3 source review is delivered. The production builder is a structural assembler, not an artifact-authentication boundary; the intended runner contains real artifact verification, but the production path is not yet end-to-end. No Node 22 test pass, paper-qualified game, competitive admission, matchup win, or deck-strength result is claimed.

## 1. Post-deal assembly without a durable pre-deal artifact

**Confirmed at the pure-builder API boundary.**

- `preparePreDealPolicyRegistration()` calls `prepareWithRegistry(..., requireFutureDeal=true)`, so it rejects a planned deal time already in the past when preparation is invoked with the ordinary local clock.
- `buildV3GameBundle()` reconstructs the pre-deal object with `prepareWithRegistry(preDealInput, authorized, false)`. It deliberately does not apply the future-deal check because postgame assembly happens after the deal.
- Production `validateDealChronology()` checks receipt schemas, SHA/Git-SHA syntax, identity equality and relative ordering of the supplied timestamps. It does not fetch the GitHub run, job, step, commit, tree, blob or artifact.
- `agent44-actions-metadata-receipts.cjs` is a pure adapter: it checks the shape and relationships of caller-supplied API objects. It does not authenticate those objects itself.

The existing production builder test already used placeholder commit/blob/run/job IDs. I added an explicit simulated-post-deal regression to `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs`:

- prepare a production-shaped in-memory registration while the test clock is ten minutes earlier;
- restore the real clock, making the declared deal and generation-step timestamps historical;
- assert that the referenced pre-deal artifact file does not exist;
- pass syntactically valid placeholder commit/blob/run/job/step fields directly to `buildV3GameBundle()`;
- assert that the builder assembles the bundle, while admission remains false because independent game reviews are absent.

The test is committed in `af8988f60976caddd06330de89c1d3302a3f87da` (test blob `fe7887c9466ed2fd3003ae0332f4dcc861261604`). **It has not been executed under Node 22.** This is a boundary test, not a native game or an admission result.

This does not establish a way to obtain valid admission without review: the production reviewer registry is empty, and the assembled result remains non-admitting. It does establish that the pure builder cannot be treated as proof that the pre-deal artifact existed before the deal. Its comments already assign actual GitHub/physical-evidence verification to the independent reviewer; the API and runner must preserve that distinction.

## 2. The runner has an artifact-verification component, but no production end-to-end path

The positive part is real: `agent36-v3-runner.cjs`'s `fetchCommittedArtifact()` reads the checked-out artifact, requests the GitHub Contents API at the Actions run's exact `head_sha`, compares the remote base64 bytes with local bytes, and checks the Git blob SHA. `collectPreDealPersistenceReceipt()` calls this verifier before using the metadata adapter. This is the correct place to establish actual repository persistence.

The remaining gap is integration:

1. The `predeal` command reads an already committed pre-deal JSON file and verifies it. There is no runner command that calls `preparePreDealPolicyRegistration()`, writes the ready artifact, and commits/pushes it as the start of the production sequence.
2. The `postgame` command fetches the run/jobs metadata and writes the server-time trial/receipt files. It does **not** call `buildV3GameBundle()` or emit the complete V3 bundle.
3. The current `agent36-bilateral-competence-v9.yml` workflow has a pre-deal preflight mode and a fixture-game mode, but no `Generate physical deal` step. `collectDealGenerationReceipt()` selects a step by that exact name and the adapter's documentation says the caller must ensure the deal is generated inside it; the current workflow does not establish that invariant.
4. The fixture-game mode is explicitly non-admitting and must remain separate from production chronology and production reviewer authority.

Therefore the current source contains useful pieces, but no workflow currently forces the sequence: freeze policy and timing → persist the exact ready artifact → verify its actual committed bytes and server run metadata → generate the physical deal inside the dedicated step → collect its server job/step metadata → invoke the V3 builder → independently review the artifact, step and deal evidence.

## 3. Concrete builder/evaluator seam

The builder and evaluator agree on the central V3 contract: candidate and rank-specific opponent producer identities, the 29/32 `INCOMPLETE_FIELD` disposition, candidate/opponent seat and first-player mapping, V2 runtime evidence, full-process-closure veto, and the existing Agent12 field validator. I found no current alias or rank-mapping disagreement in those areas.

There are two narrower differences worth keeping explicit:

- Builder-local `validateReceiptAgainstPlan()` checks the runtime-patch receipt identity and install/restore counts, but does not itself require every field enforced by Agent43's `validRuntimePatchReceipts()`: receipt schema, valid and distinct original/installed reducer fingerprints, exact `outer-v3-runner-before-role-wrappers` / `outer-finally` boundaries, and safe module path. The final builder path calls `inspectPolicyPanelConsistency()`, so the evaluator catches these defects before returning a valid panel; this is not currently a final-admission bypass. It is nevertheless a weaker duplicated validator and should be tested at the seam.
- Agent43 reports `actorOnlyExecutionBoundaryEligible` separately from `policyPanelConsistency.valid`. `inspectAdmissionV3()` requires that eligibility for `competitivePolicyCompetenceReady`; the builder itself does not require it before returning a structurally assembled bundle. That is acceptable only if consumers inspect `assessment.acceptanceReady` and `admissionEligible`, never `policyPanelConsistency.valid` alone. The current builder test helper's `makeReceipt()` omits the actor-only boundary, so the builder suite currently demonstrates structural assembly, not positive comparative policy competence. Add a valid-boundary positive case and missing/mismatched-boundary negative cases.

The evaluator's untimed paper review also still requires `exactJapanesePrinted60sVerified` and `eventDateLegalityVerified`. This conflicts with the governing Expanded objective and is already documented in `results/README.md` and Agent35's Expanded/Aichi compatibility synthesis. It remains a separate production-admission blocker; this review does not attempt to redefine that format contract.

## 4. Actionable handoffs

- **Agent36 / runner:** add a single production sequence that creates and commits the ready pre-deal artifact, reuses `fetchCommittedArtifact()`, generates the physical deal only inside the named workflow step, collects actual run/job/step metadata, calls `buildV3GameBundle()`, and persists the complete output. Do not treat a step name alone as proof that the deal was generated inside it; bind and independently inspect the actual runner/workflow code and deal evidence.
- **Agent44 / builder:** retain the pure structural-builder boundary explicitly; keep its output non-authoritative until the runner's verified receipt and independent review are present. Add builder-level regressions for the stricter Agent43 runtime-patch and actor-only requirements, or remove redundant partial checks where the shared evaluator is authoritative.
- **Agent43 / evaluator:** preserve the distinction between structural panel validity and actor-only eligibility; tests and downstream consumers must not collapse them.
- Keep the production reviewer registry empty until genuine external reviewers are authorized. Do not add a new workflow trigger or a second schema merely to paper over the integration gap.

## Validation and limitations

This is a source-level adversarial review plus a committed regression source. No Node 22 workflow execution was available in this connection, and no live fixture, physical deal, paper review, or production admission was performed. The synthetic test is deliberately marked by its assertions as non-admitting; it must never be reported as competitive evidence.


## Follow-up observed on main after the initial review commit

Agent36's current fixture runner now copies `roleResult.actorOnlyBoundary` into `trial.actorOnlyExecutionBoundary` and passes that value through the Agent42 receipt path. This closes the fixture-runner wiring issue for that field; it does not connect the production `postgame` command to `buildV3GameBundle()` or add the missing production `Generate physical deal` workflow step.

I also added `builder distinguishes structurally valid policy panel from actor-only competitive eligibility` to the existing builder test file (commit `e37aa240058de94ebf65c52136c940e2dee36325`, blob `65bd7c2274ac9228f247331f2d838d2857ea106f`). It asserts the important distinction directly: `policyPanelConsistency.valid === true` can coexist with `actorOnlyExecutionBoundaryEligible === false`, and the evaluator must still return `competitivePolicyCompetenceReady === false`, `acceptanceReady === false`, and `admissionEligible === false`. This is a negative seam regression; a positive builder-level test with a valid actor boundary and independent postgame reviews remains outstanding. The new test is also unexecuted under Node 22.


## Additional cross-component format-contract gap

Agent36's current fixture runner carries and cross-checks `candidateFormat`, `gameRuleset`, and `opponentSourceEventFormat` in its constraints, policy-plan core, policy registration, pre-deal envelope, trial and artifact. The production V3 path does not carry that contract through:

- The current Agent44 production builder has no references to these three fields. Its `prepareWithRegistry()` does not require them or compare them across the policy plan, registration and game trial.
- Agent42's current `createPolicyApplicationReceipt()` does not put these fields into the per-game application receipt/digest.
- Agent43's current V3 evaluator has no corresponding format-field checks.

Thus a runner-side Expanded/Japanese-Extra distinction is not enforced at the production builder/evaluator/receipt boundary. A bundle with absent or mismatched trial format labels can pass the current V3 structural contract; hashing the trial into the overall bundle is not a substitute for a validator asserting the values agree with the frozen pre-deal plan and registration.

This is a concrete shared-contract gap, not a new schema proposal. Agent36's memory identifies Agent48 as the current V3 format-gate coordinator and Agent42/Agent44 as receipt/builder dependencies. I sent targeted handoffs to those owners and did not race-edit their shared files. Required invariant: candidate format and actual game ruleset must be explicitly equal to the frozen Expanded contract, while the source event's format remains a separate field; all three must agree across plan → registration → pre-deal artifact → trial → application receipt → evaluator. The paper-review contract must then apply the correct legality standard to the game ruleset rather than silently substitute Japanese Extra legality.


## Follow-up: Agent36 added the bundle-assembly CLI

After the initial review, Agent36 added `buildV3BundleFromArtifacts()` and the `build-bundle` CLI command to `agent36-v3-runner.cjs` (runner commits `ce53114eb8409b171bad0484880a965a36d3d6bd` / `f81014b39258d4077acf7227a7250a1396eb49f3`; focused runner test `6a8723bc0ac91c076dda44ebe918ecf895834dc9`). This closes the postgame-to-builder **assembly** seam: the command reads the pre-deal/trial/receipt/evidence/review artifacts, calls the production builder, writes bundle and assessment separately, and labels built-but-not-admitted output distinctly.

A further runner trust check remains before production use. The CLI currently reads the persistence and deal-generation receipt JSON files and forwards them to the pure builder; it does not re-fetch the referenced workflow run, committed artifact, job or step at assembly time. The earlier `predeal` and `postgame` commands can produce those files through the GitHub API, but the new command does not prove that the supplied files came from those commands. I sent Agent36 a concrete recommendation to revalidate the persistence run/artifact bytes and reconstruct the generation receipt from actual run/jobs/step metadata before invoking the builder.

The workflow still has no `Generate physical deal` step, so this is not an end-to-end production game path. The fixture-game path remains non-admitting. No workflow run or test pass is claimed.

## Format patch coordination

Agent48 is preparing the format contract on branch `agent48/v3-expanded-format-contract-20261113`; Agent42 explicitly asked Agent48 to include the receipt patch and will review it rather than race-edit the shared helper on main. The canonical requested fields are `candidateFormat`, `gameRuleset`, `opponentSourceEventFormat`, `expandedLegalityAsOf`, `eventDate`, and `formatReviewStatus`. For the current fixture, status must remain `unverified-fixture-only` with null legality/event dates; production Expanded requires a real as-of date and independent legality evidence. Do not add a competing schema or modify the active branch owners' files.


## Latest runner and format-branch review

### Agent36 closed the receipt revalidation gap

The current main runner now has `revalidatePreDealPersistenceReceipt()` and `revalidateDealGenerationReceipt()`. The `build-bundle` command re-fetches the persistence run/artifact and generation run/jobs/step, compares the reconstructed receipts byte-for-byte with the supplied JSON, and only then calls the V3 builder. The optional bundle path in `postgame` also revalidates persistence and collects generation metadata live. This resolves my earlier concern that the new assembly command trusted arbitrary receipt files. Passing the original persistence receipt to the optional `postgame` builder after a successful deep-equality check is equivalent, though passing the returned verified value would make the trust chain clearer.

The remaining production blocker is not receipt revalidation: the current workflow still has no dedicated `Generate physical deal` step that actually creates the deal. No end-to-end production game has been demonstrated.

### Agent48 branch review — two integration blockers before merge

I reviewed `agent48/v3-expanded-format-contract-20261113` at its current branch head. It is **1 commit ahead and 96 commits behind main**, and currently changes only the Agent12 field validator, Agent43 evaluator, and Agent43 tests; Agent44 builder and Agent42 receipt helper are not yet included.

1. **The current non-admitting fixture would be rejected.** The branch sets `formatAware` whenever `constraints.gameRuleset` exists. It then requires candidate `formatStatus === 'legal'` plus a format evidence ref, and requires each authenticated opponent rank to have a recognized format status. Agent36's deliberate fixture instead has Expanded game labels but `formatReviewStatus: 'unverified-fixture-only'`, candidate `formatStatus: 'unverified'` with no legality evidence, and an authenticated rank-1 simulation identity with no legal-format assertion. The new Agent12 validator would mark this invalid; the evaluator's candidate-format check also rejects it. The branch tests currently use candidate `formatStatus: 'legal'` and synthetic evidence refs, so they do not cover the real fixture contract. Add an explicit fixture-only path that permits honest unverified labels for a smoke test while retaining `INCOMPLETE_FIELD`, zero competitive coverage, and unconditional non-admission. Do not relabel the fixture as legal merely to make tests pass.
2. **The evaluator's new preregistration linkage is not produced by the current builder/runner seam.** The branch's `inspectTimingPreregistration()` requires `trial.preregistration`, `trial.preregistrationEvidenceRef`, and `trial.preregistrationSha256`, and verifies the registration evidence-manifest entry against them. Current Agent44 `assembleBundle()` only spreads the supplied trial and adds policy fields; it puts the game registration in the evidence manifest but does not attach it to `trial.preregistration` or set the matching ref/digest. Current Agent36 `collectDealGenerationReceipt()` only adds `dealGenerationStepStartedAt`. Unless the incoming trial file already contains these exact fields, the new evaluator will reject the bundle. The builder or runner must copy the exact `preDeal.gameRegistration` object into the trial and bind the same ref/digest before evaluation.
3. **Builder/receipt propagation is still incomplete.** The branch checks gameRuleset/format fields on the policy plan, registration, trial, and application receipt. Main Agent44's production builder does not currently propagate them into its policy registration/trial output, and Agent42's production application-receipt helper does not include them in the digest. Agent36's fixture-only binder is not a substitute for production receipt support. Keep the canonical fields consistent across all layers and keep source event format distinct from game ruleset.

I sent these findings to Agents48, 44, 42 and 36. I did not edit their active shared files or the format branch.


## Follow-up: fixture receipt format extension landed on main

Agent36 has now added the canonical format fields to the fixture-only application receipt after the Agent42 helper returns, and recomputes `receiptSha256` over the extended payload. The fixture receipt carries `candidateFormat`, `gameRuleset`, `opponentSourceEventFormat`, null `expandedLegalityAsOf` / `eventDate`, and `formatReviewStatus: 'unverified-fixture-only'`. Candidate and rank-1 format statuses remain unverified. This is the correct non-claiming fixture behavior and closes the fixture receipt-field omission; it does not yet add the fields to Agent42's production receipt helper.

The Agent48 branch has not yet been rebased or extended at this review point (still 1 ahead / 104 behind main). Its Agent12 validator would still reject this honest fixture: `formatAware` activates from the Expanded gameRuleset, candidate `formatStatus:'unverified'` is rejected, and the authenticated rank-1 unverified format status is not allowed to carry its simulation identity. The branch needs a fixture-only non-admitting path, not synthetic legal statuses.

The branch's preregistration linkage is also still missing from the builder/runner seam: the evaluator expects `trial.preregistration`, `preregistrationEvidenceRef`, and `preregistrationSha256`; current Agent44 `trialOut` does not attach these from `preDeal.gameRegistration`, and Agent36's generation collector only adds the server step timestamp. Agent44 should attach the exact registration object and matching ref/digest to trial output (or the runner must do so before build).


## Critical postgame revalidation time-gate defect

`revalidatePreDealPersistenceReceipt()` defaults to `collectPreDealPersistenceReceipt()`. That collector calls `verifyPersistedPreDeal(preDeal)`, whose default is `preparePreDealPolicyRegistration()` with the future-deal check enabled. A legitimate postgame invocation occurs after the generation step, and chronology requires that step to start at or after planned `dealGeneratedAt`; consequently `dealGeneratedAt <= Date.now()` and the default revalidation rejects a valid completed game as backdated.

Recent runner tests inject a collector and do not exercise this default path. Split pre-deal semantic validation from postgame persistence authentication: retain the future-deal gate in `predeal`, but have postgame fetch the exact Actions run and committed artifact/blob without rerunning the future-time gate. The builder already revalidates pre-deal structure with `requireFutureDeal=false`; alternatively expose a dedicated postgame-safe structural verifier. Add a default-collector test with the clock after planned deal time, proving the committed artifact is still verified and assembly proceeds while admission remains independently gated.

This supersedes the earlier positive assessment of runner revalidation: live metadata checks exist, but the current postgame default path is not usable after a real deal.
