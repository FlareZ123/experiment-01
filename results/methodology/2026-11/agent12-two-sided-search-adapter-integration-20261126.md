# Two-sided search adapter integration

**Status:** the integrated source and contract tests passed the existing native-search-only workflow on code/test commit [776ad812](https://github.com/FlareZ123/experiment-01/commit/776ad812f04029b052e2fb1b6d484b65f055ea29), run [45774958528](https://github.com/FlareZ123/experiment-01/actions/runs/45774958528). The run used the pinned Twinleaf submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and `native_search_only=true`. This is integration evidence, not a completed game or competitive result.

## Integrated components

- **General-sum search:** two-sided PUCT maximizes each physical seat's own win probability. The optional fixed-opponent mode searches a root best response without changing the opponent policy.
- **Typed terminal evidence:** `typed-terminal-outcome-v2` distinguishes seat wins, adjudicated draws, and adjudicated no-winner outcomes. Draw/no-winner results retain their rule ID, reason, and evidence ID in per-rollout receipts; raw unresolved/invalid/aborted outcomes fail closed.
- **Prompt-event receipts:** `actor-safe-prompt-event-v2` records the transition actor separately from the prompt owner, actor-observation and prompt-projection digests, selected opaque tokens, policy ID, native-validation success, and stable successor digest. Prompt-policy randomness has a separate per-rollout protocol ID, `per-rollout-independent-prompt-policy-rng-v1`.
- **Native Twinleaf adapter:** actions and prompt continuations execute on the same registering Store. The adapter settles automatic and player-owned prompts before returning a stable successor; the prompt callback records only actor-visible data and uses the core's canonical schema/random protocol IDs.
- **Perfect-recall boundary:** own-decision history is maintained separately for each physical seat and transferred across actor-relative redeterminization. Root prefixes are cloned through the safe actor-value boundary, checked against the versioned event schema and physical-seat attribution, and attested by both the root-state digest and canonical prefix digest (`agent12-actor-history-attestation-v2`).
- **Existing CI integration:** the existing `.github/workflows/agent5-owner-root-native.yml` lane now runs the core, actor-history, native prompt-continuation, and adapter tests. The workflow derives the engine pin from the checked-out submodule gitlink; no new workflow or upstream Twinleaf change was introduced.

## Validation

Run 45774958528 completed successfully on code/test head 776ad812. The configured lane passed:
- general-sum objective and typed terminal-outcome tests, including adjudicated no-winner receipts;
- prompt-event schema, per-rollout context closure, independent prompt RNG, and empty/60-token selected-token boundary tests;
- actor-history projection and redeterminization-transfer tests;
- root-prefix wrong-seat and prefix-digest mismatch rejection tests;
- pinned Twinleaf Quick Ball/Confirm continuation tests;
- the Switch `ChoosePokemonPrompt` same-Store continuation test for both physical seat assignments.

The adapter's Switch provenance callback is scoped to the registering player's actual `ChoosePokemonPrompt`; automatic prompts such as `WaitPrompt` do not claim Switch provenance. The source-zone lookup accepts either direct arrays or `.cards` containers. These are test/adapter contracts only; they do not establish complete coverage of all Expanded cards or prompt types.

## Important limitations

- No complete game was played. No Aichi Top 32 matchup was simulated, no deck was selected, and no win-rate estimate is available.
- The tests use controlled fixtures and a test prompt sub-policy. They do not demonstrate a strong competitive decision policy.
- The adapter still depends on caller-supplied `redeterminize`, actor-knowledge data, legal-action enumeration, terminal adjudication, and leaf evaluation. The production K1 belief provider and complete paper Expanded action frontier are not integrated or validated here.
- The core validates terminal-outcome structure and evidence references but cannot verify the underlying paper-rules adjudication. The Aichi caller must supply evidence-backed draw/no-winner classifications; Twinleaf's generic FINISHED phase or equal Prize counts are insufficient.
- `cPuct` and the probability-scale leaf evaluator remain uncalibrated.
- Repeated `search()` calls on the same core currently restart the iteration-seed schedule from the configured seed. Prompt and transition RNG streams are independent within a rollout, but successive decision searches can reuse the same per-iteration streams. Add a per-search ordinal or caller-advanced seed before treating sequential decisions as independently randomized.

## Next work

1. Add and test a per-search RNG ordinal/seed protocol while preserving reproducibility.
2. Integrate a verified actor-relative K1 sampler and establish complete legal-action coverage for the pinned Expanded pool.
3. Implement a paper-rules terminal adjudicator that emits evidence-backed typed outcomes, including draws and no-winner cases.
4. Calibrate leaf evaluation and PUCT exploration against controlled, representative opponents.
5. Only after the Stage-A owner gate, run the first complete diagnostic game; then evaluate the single fixed candidate against all 32 verified Aichi Open League 2026 Top 32 lists.

## Reproduction

The repository workflow run above used the existing `agent5-owner-root-native.yml` lane with `native_search_only=true`. The focused tests can also be run with:

```sh
node --test tests/2026-11/agent5-general-sum-search.test.cjs
node --test tests/actor-history-projection.test.cjs
node --test tests/2026-11/agent14-native-store-prompt-continuation.test.cjs
node --test tests/2026-11/agent12-twinleaf-two-sided-search.test.cjs
```

The run and code revision are linked above so the evidence is distinguishable from future changes.
