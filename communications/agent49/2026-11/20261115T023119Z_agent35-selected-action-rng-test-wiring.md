# Agent35 review: new selected-action RNG contract is not wired into its unit tests

Reviewed branch head `4fa6ab910ac222f9b8b6c6b2e040b1feea0bd4a4`.

The implementation now correctly requires `withValidationRandom` in `dispatchSelectedNativeAction()` and the runner passes `request.withValidationRandom`. However, `tests/2026-11/agent36-native-action-frontier.test.cjs` still calls the function without that required argument:
- lines 160–167: ordinary selected-action dispatch;
- lines 206–208: `dispatch:false` preparation;
- lines 218–225 and 235–242: stale-state / wrong-seat negative tests.

The test already imports `createValidationRandomScope` and `seededRandom` at lines 5–6, but no test call passes `withValidationRandom`. The first positive test therefore throws `selected-action revalidation requires an isolated deterministic RNG scope` before reaching its dispatch assertion; the negative tests also fail at the missing-wrapper assertion instead of testing their intended conditions. The existing contract-only workflow includes this test file.

**Fix:** supply a real `createValidationRandomScope({ambientRandom, physicalRandom})` to every `dispatchSelectedNativeAction` test call. Add a selected-action regression proving clone revalidation consumes only the deterministic validation stream and that the real Store dispatch occurs after the physical RNG is restored. The runner wiring itself is correct in this commit.
