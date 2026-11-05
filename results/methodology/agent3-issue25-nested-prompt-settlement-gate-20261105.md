# Issue25 nested native prompt acceptance: same-closure adversarial test

**Agent 3 | 5 November 2026 | development-only pure component integration.**

## Experiment and implementation

The pinned Twinleaf `Store.reducePrompt` can return a state unchanged when the pending prompt or its internal prompt item is missing. That behavior makes a no-exception dispatcher receipt insufficient for prompt settlement. Separately repaired owner-visible native wrappers implement exact pending-prompt resolution checks:

- `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs`, v2: origin-bound Pokémon-choice selection, prompt must remain identical to the selected source object, then `result === action.result` before native acceptance.
- `simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs`, v2: analogous origin and actual resolution for optional Confirm and informational ShowCards, even if a legitimately resolved prompt is subsequently removed from `state.prompts`.

An [explicit two-seat nested integration suite](../../tests/agent3-issue25-owner-prompt-settlement-composition.test.cjs) drives these **same actual adapter sources** in the v14 wrapper order. Both physical seats face three traces: successful Confirm followed by successful ChoosePokemon, silent Confirm no-op, and successful Confirm followed by a silent ChoosePokemon no-op. The test checks the native submitted action, exact physical Pokémon target, accepted/settled/unsettled counters, and restored wrapper state. Both prompt types are exercised under the owner-only detached observation callbacks.

## Executed evidence

The exact committed integration test and both exact committed production modules were evaluated with real V8 JavaScript execution and injected dependencies. **All 6/6 integration tests passed**, with 2 positive nested traces and 4 negative no-op traces. Prior direct test files passed 11/11 Pokémon cases and 10/10 owner-modal cases, for a combined **27/27 actual test cases run under V8 dependency shims**.

The new test was subsequently added as a test-only preflight within the **preexisting manually dispatched** `issue25_v14_only` job in `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`. Existing job already checks out, installs and compiles pinned Twinleaf. [Workflow change commit](https://github.com/FlareZ123/experiment-01/commit/74ad748215ecfda6fdc6d6f392a071714e038287), exact running command:

`node --test tests/agent8-actor-only-choose-pokemon.test.cjs tests/agent4-owner-modal-acknowledgements.test.cjs tests/agent3-issue25-owner-prompt-settlement-composition.test.cjs`

The Node20 GitHub Actions job has **not been freshly dispatched or observed passing at the revised revision**. V8 injected-store execution establishes the behavior of the scoped pure module paths under test; it is not a full pinned native Store or completed match. No tournament win, source roster qualification, whole-player information noninterference or paper rules fidelity is certified here.

## Integration guidance

Treat `selected`, `Store dispatch returned`, `genuine pending prompt resolved`, `physical effect settled`, and `paper-legal/tactically useful` as separate measures. A native prompt can resolve without generating the needed attack, hand-custody or Prize tempo. [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25) remains FAIL/UNRESOLVED; this test is an input to one steward-controlled shared-policy acceptance panel, not a new selected policy. Native v13/v14 historical receipts remain archived as originally executed under v1.

The field remains 29/32 authenticated original print-count inventories, with ranks 23/25/28 missing; zero competitively qualified games, no nominated best immutable 60, no substantiated 99.5% performance.
