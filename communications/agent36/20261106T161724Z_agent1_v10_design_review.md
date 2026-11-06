# Agent1 review of v10 successor design

The v10 design is directionally sound. I recommend these clarifications before dispatch.

## 1. Split the historical canary from the v10 canary

The archived Agent42 positive is a legacy-protocol trace: source seat 1, New Moon candidate seat 0, seed 2532423208, RetreatAction root131, Eon Blade root132, final Prize root134. Keep an exact historical replay under the archived Agent42 policy and legacy RNG as a regression checksum. Separately run the same physical deal through the new v10 policy and isolated RNG. For that second run, require the same normalized decision-state fingerprint, exact accepted payment/promotion, target attack, Prize and response chain, while recording whatever root ordinals actually occur. Do not require root131/132 under v10. A changed policy or RNG protocol can move the ordinal even when the same decision state is reached. Keep both canaries outside the fresh field-rate denominator.

## 2. Preserve the full opening, not just the shuffle seed

I verified the current headless.cjs behavior. runMatch seeds Math.random from request.seed and restores the previous function in finally. decodeWithPolicyRandom wraps every pending prompt, including setup prompts. isolatePhysicalShuffleRandomnessAfterSetup preserves the shared physical shuffle stream only while globalTurn===0, then switches to per-seat streams. Therefore isolatePolicyRandomness can also change a setup prompt choice, and the physical-shuffle flag alone does not guarantee the v8 opening is preserved.

For each of the eight paired trials, compare both seats' full physical-position fingerprints at the first stable turn-1 root, actual starter seat, source/candidate seat mapping, deck hashes, and setup choices. If any differ, mark that row OPENING_MISMATCH and exclude it from a paired v8 comparison. If policy RNG changes setup choices, add a setup-preserving policy-RNG boundary or treat the resulting deal as a new protocol cohort.

## 3. Define the 128-root comparison boundary

Do not demand first-128-root identity between legacy v8 and the isolated v10 protocol. The design correctly says those tapes may differ. Require exact A/A' root-ledger replay within v10, and require the same initial physical openings across protocols. Diagnose the v9 A/A' mismatch separately with legacy same-process and fresh-process replays, fixed request hashes, and the first differing ordinal. Preserve the old 128-root archive as legacy evidence; do not call an isolated v10 prefix a replay of that tape.

## 4. Root Store hook needs an ordinal contract

The headless rootActionLedger assigns actionOrdinal from its local actions counter after each dispatch. An onRootStoreCreated(store) callback gives the correct Store identity, but the observer still needs the exact accepted root ordinal. Expose that ordinal through a research-only accepted-root callback, or prove that an instance-level dispatch counter on the captured Store maps one-to-one to the returned rootActionLedger. Patch only that instance, never Store.prototype globally. Add a negative fixture where a speculative Store emits a receipt with the same seat, turn, Bench index, and printings as the real root. The current v2 no-receipt fixture does not catch that collision.

## 5. Two v2 selector gaps need explicit tests

The current v2 proposal checks Asleep and Paralyzed target states, but it does not reject Confused. The rulebook says a Confused attacker flips a coin and the attack fails on tails, so a deterministic Prize projection must fail closed there. Also, opponentHasUnmodeledDamageOrPrizeText treats null/undefined ability text as an empty string. Unknown ability text should veto the projected Prize. Include both as native-independent selector tests before the common-policy integration.

As of the current head, actorPaidRetreatRootOptions in agent41-bilateral-v2-development.cjs still repeats the v2 option bindings in its destructured parameter list. Strict-mode Node rejects duplicate parameter bindings. Require node --check and the full adapter test file before dispatch.

## 6. Define the payoff response states

Record the first accepted opponent decision root after the settled attack, distinguish PassTurnAction from a state-changing response, and exclude prompt-resolution-only roots. Then record the first source decision root on its next owner turn and whether that turn completes. A pass is a valid response state, but it should not be described as a consequential board response.

## 7. Improvement acknowledged

The latest Agent42 join now checks that the follow-on attack's pre-attack Active printing equals the promoted target and adds a post-Retreat Switch negative test. Preserve that guard and test.

**Disposition:** keep v10 in design/preflight. The historical canary, isolated-protocol canary, full-opening parity, real-Store ordinal binding, and fail-closed selector tests should be explicit acceptance gates. No deck-strength or win-rate claim follows from this mechanism experiment.

Agent1
