# Operational content contract for V3 policy-competence challenge suites

**Agent2 · 17 November 2026 · methodology synthesis, not a policy or game result**

## Decision

The V3 plan already binds a `challengeSuiteSha256` for the candidate and every authenticated rank-specific opponent. The repository also has a useful policy-coverage matrix. What is still missing is one shared, inspectable definition of what evidence the hashed suite must contain. A digest alone does not tell an independent reviewer whether the policy can actually pilot its declared deck.

This note turns the earlier [Agent2 challenge-suite proposal](../../communications/agent43/20261112T0641Z_agent2_policy-challenge-suite-coverage.md) and [protocol-versus-competence synthesis](agent2-policy-protocol-vs-competence-synthesis-20261114.md) into an operational content contract. It adds no second V3 validator, no CI workflow, no policy code, no game, and no deck recommendation. It is intended to make the existing V3 competence attestation substantive rather than create another gate.

## 1. Required suite package

Every candidate-policy suite and every authenticated rank-specific opponent-policy suite should be a versioned, canonical manifest frozen before policy registration and deal generation. The suite digest already has a place in the V3 policy-plan core; the content below is the proposed minimum for that digest.

### Suite header

Record:

- suite schema/version and unique suite ID;
- role (`candidate-policy` or `opponent-policy`) and, for opponents, exact source rank;
- exact 60-card physical-print/deck fingerprint;
- policy, entry/dependency-manifest, and common-constraints hashes;
- engine/submodule and research-hook revisions used by native cases;
- suite author/producer, creation time, frozen time, and evidence references;
- explicit split between development cases and held-out review cases.

For an unavailable source rank, keep the existing V3 `source-unavailable` entry with null deck, policy, entry-manifest, challenge-suite, and producer identities. Do not create a proxy suite from an archetype description.

### Scenario record

Each scenario should contain enough information for another reviewer to replay the decision without seeing the other player's hidden zones:

| Field | Required content |
|---|---|
| `caseId` | Stable unique case identifier |
| `objective` | The strategic objective or threat being tested |
| `evidenceClass` | `source-natural`, `native-staged`, or `synthetic` |
| `sourceBinding` | Exact deck/rank, card-print references, engine pin, and source trace or fixture reference |
| `actorView` | Digest of the exact actor-visible observation and public history supplied to the policy |
| `decisionEnvelope` | Acceptable action families/strategic outcomes, forbidden outcomes, and rationale; not necessarily one exact action |
| `costLedger` | Cards, Energy, once-per-turn effects, Bench capacity, Supporter use, discard/recovery, and other relevant costs |
| `promptCoverage` | Native prompt family, selection bounds, choice-index/cancel/visibility semantics when applicable |
| `executionEvidence` | Actual chosen action, native acceptance/effect receipt, trace digest, budget, timeout/fallback status |
| `disposition` | `pass`, `blocked`, or `fail`, with reviewer explanation |

The manifest should include the complete scenario contents and evidence references before hashing. A reviewer must inspect representative traces and the coverage matrix, not merely sign the digest.

## 2. Evidence classes and what they prove

- **`source-natural`:** the opportunity occurred in a natural game from the exact source deck and a recorded deal/trace. This is the strongest evidence that the line occurs under real play.
- **`native-staged`:** a controlled state uses actual pinned-engine card objects and native action/Store validation, with a replayable construction and full cost accounting. It can prove a legal action path and native effect, but not natural frequency or strategic value by itself.
- **`synthetic`:** a mock, schema fixture, or simplified policy-only state. It is useful for boundary and regression tests, but cannot be the sole evidence for a deck's core plan or a policy's strategic competence.

Every core win-condition line must have native execution evidence (`source-natural` or `native-staged`), and the suite must identify which core lines have only synthetic coverage. Unsupported or unobserved lines remain explicit gaps; presence in the 60, search for a card, a returned action token, or a successful worker handshake is not proof that the policy can execute the line.

## 3. Required scenario families

The exact cases are deck-specific. The following families are the minimum common vocabulary, extending the existing Agent2 matrix rather than prescribing one strategy for every deck.

1. **Core plan and board construction.** The policy must demonstrate the deck's declared win condition, including the complete path from available card to legal play/action and the consequential effect. Test important search targets through to actual use, not merely search selection.
2. **Resource, discard, and Prize management.** Cover once-per-turn resources, competing search/draw/gust choices, Energy payment and attachment, retreat funding, discard/recovery, singleton protection, and K0/K1 or other legitimate Prize-information states. Every proposed line needs a complete cost ledger.
3. **Opponent threats and counterplay.** For each rank-specific opponent, test its own principal plan and at least the important responses/counter-responses relevant to the declared deck. A policy that can execute its own opening but cannot answer the field's obvious counterline is not independently competent.
4. **Locks and board constraints.** Cover the lock types and board restrictions relevant to that deck: Active/Bench conditions, Ability/Item/Supporter/Tool constraints, Stadium interactions, and any self-lock risk. Record exact card/rule references and use native validation for disputed effects.
5. **Tactical conversion.** Cover attack selection and sequencing, gust/target choice, Prize mapping, weakness/damage constraints, retreat and Energy conservation, and turn-ending effects. The decision envelope may permit several strategically equivalent lines.
6. **Native prompt completion.** Exercise every prompt family used by the policy's core lines, including legal min/max, owner visibility, choice indices, cancel semantics, and both physical actor seats. Unsupported prompts must fail closed rather than delegate to a broader hidden-state decoder.
7. **Negative controls.** Include impossible or unpayable lines, wrong-source abilities, invalid selections, unsupported prompts, private-information/seed access, fallback/delegation, and timeout cases. A policy must reject these without leaking private state or silently substituting a different decision.

These families correspond to the earlier ALS/counter-ALS, DCI/UDP/AMR, connector/Supporter contention, lock/board, Prize/information, and tactical-conversion proposal. Human-concept notes may suggest cases, but every case must be resolved against exact card text, source evidence, and pinned native behavior before it is treated as a passing policy line.

## 4. Review and pass semantics

The independent reviewer should answer four questions for each critical scenario:

1. **Reachability:** is the state source-realizable or a correctly constructed native state, and can the declared action actually be offered?
2. **Legality and cost:** is the selected action legal and fully payable under the exact card text, rules, and current state?
3. **Strategic adequacy:** does the action fall within the declared decision envelope after accounting for competing lines and opponent response, rather than merely being legal?
4. **Execution integrity:** did the frozen actor-only policy choose it under the frozen budget, without hidden information, physical seed access, native fallback, unsupported delegation, or timeout?

Use `pass` only when all four are supported. Use `blocked` when source, engine, or observation evidence is unavailable; use `fail` for a reproduced illegal, strategically unacceptable, or integrity-violating decision. Do not turn missing evidence into a pass, and do not invent a numerical competence percentage without a calibrated sampling model.

A suite is ready for attestation only when every declared critical plan line has native execution evidence, every relevant prompt family is covered, all negative controls behave correctly, both physical seats are tested, and remaining gaps are explicitly bounded. The reviewer may reject a suite even when every test passes if the suite omits an important deck function or field response.

## 5. Freeze and independence rules

- Freeze suite membership, decision envelopes, and review criteria before any confirmatory game outcomes are observed.
- Keep development cases separate from held-out review cases. Do not use the confirmatory games to add cases, tune heuristics, or change expected outcomes.
- If a policy, deck, dependency closure, engine hook, or common constraint changes, produce a new suite/policy hash and new pre-deal attestation. Old games remain bound to the old identities.
- Candidate and every opponent policy receive the same observation, information, compute, timeout, and randomization constraints. The candidate policy is invariant across ranks; each opponent policy is invariant across that rank's seat/first-player cells.
- Candidate-policy and opponent-policy reviewers remain distinct, authorized, and independent of every policy producer and the bundle producer. Post-game paper/clock/strategy reviewers remain separate.
- The current production trust registry `simulation/evaluation/agent45-authorized-reviewers.json` is empty. No identity should self-authorize or populate it by inference. The owner/trust authority must provision the required reviewer roles before production competence attestations can be signed.

## 6. Post-trace execution order

1. **Complete the current V3 worker acceptance sequence** on the exact approved research SHA and pinned Twinleaf revision. The contract-only, compile/no-fixture, and both-role/both-seat native no-game witness are separate gates; no fixture precedes all three.
2. **Run one diagnostic natural-terminal game** with the unchanged approved candidate/reference decks, frozen policies, and registered public seed. Agent6 reviews the full trace. This is a diagnostic, not a paper-qualified matchup, policy attestation, or statistical sample.
3. **Resolve only trace-supported blockers.** A concrete engine/prompt/policy mismatch may create a new versioned policy or hook. Re-run the affected challenge suite and freeze new hashes; do not multiply games or tune from an ambiguous trace.
4. **Build the rank-specific challenge panel.** Use exact source decks and policies for available ranks, preserving ranks 23/25/28 as unavailable. The 29 available ranks may support explicitly labeled per-rank diagnostics, but they do not constitute the full primary field.
5. **Obtain owner-authorized independent reviewers and sign pre-deal competence attestations.** The empty reviewer registry is a hard comparative-competence dependency. Do not fabricate attestations or use producer identities as reviewers.
6. **Select one fixed candidate using a separate development cohort.** Compare genuinely different deck architectures under the same frozen, independently competent opponent policies and equal constraints. Keep all candidate tuning off the confirmatory sample; the current Hood v1 is a challenger hypothesis, not a selected final 60.
7. **Freeze the one 60 and the full 32-rank panel**, then register the 128 rank × candidate-seat × first-player strata before generating deals. Missing ranks stay missing; no byes or inferred lists.
8. **Use the existing Agent12 statistics, not a new estimator.** Report both the equal-weight field-mean claim and every opponent-specific interval. The 640-game all-win field-mean floor does not certify every matchup; the stronger simultaneous per-opponent all-win design is 323 games in each of 128 cells (41,344 total), with existing heterogeneous-KL extensions for nonwins. Apply the existing paper, source-binding, independence, and censoring vetoes.
9. **Publish every rank's wins, losses, ties, censored/errors, sample size, confidence bound, policy hashes, engine pin, and failure cases.** A full-field aggregate is unavailable until all 32 exact source lists and policy identities are admitted.

## 7. What this note does not establish

This is an operational content proposal. It does not certify the current candidate or any opponent policy, fill the empty reviewer registry, authenticate ranks 23/25/28, establish paper admission, validate the V3 runner, create competitive games, or demonstrate a 99.5% win rate. It does not replace the existing V3 evaluator/builder, Agent12 field ledger, or statistical methods.

## Canonical references

- [Agent2 policy protocol-versus-competence synthesis](agent2-policy-protocol-vs-competence-synthesis-20261114.md)
- [Agent2 earlier challenge-suite coverage proposal](../../communications/agent43/20261112T0641Z_agent2_policy-challenge-suite-coverage.md)
- [Agent43 V3 deck-aware competence gate](agent43-v3-deck-aware-policy-competence-20261112.md)
- [Agent50 V3 deck-aware competence/admission contract](agent50-v3-deck-aware-policy-competence-contract-20261112.md)
- [Agent12 simultaneous 128-stratum per-matchup confidence method](../../statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md)
- [Agent12 heterogeneous field KL confidence method](../../statistics/agent12-heterogeneous-kl-field-confidence-bound-20261107.md)
- [Agent17 source-bound full-field claim gate](../../aichi-2026/agent17-full-field-claim-gate.md)
- [Current fixed-60 decision board](../../README.md)
