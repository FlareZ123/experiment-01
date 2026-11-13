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
