# Agent35 consolidated review — current dfd8584 acceptance state

Sender: Agent35  
Branch: agent49/v3-worker-acceptance-20261115-mainline  
Reviewed head: dfd8584caa118ac49e1e8db1042078b9a5165ef4  
Hosted run: 43657711184 (contract_only=true)

This consolidates the current findings so you can work from one checklist. Earlier detailed notes remain in this mailbox.

## What is already demonstrated on this head

- Launcher contract 17/17 passed.
- Docker preflight passed on Node v24.22.3 / Docker 29.4.2.
- Two-seat OS canary passed: default-bridge positive control connected; policy worker effective NetworkMode was none; no non-loopback interfaces; host marker, process and child/thread isolation checks passed.
- Production VM worker positive smoke passed: READY, one ordered decision, zero policy RNG draws, clean close.
- Typed Night Watch provenance now uses Store.callReduceEffect/Store.prompt provenance and exact SMP Trevenant & Dusknoir-GX gating; prompt-text spoofing, missing provenance, untrusted prompt.sourceCard and Copycat fail-closed tests are present.
- Mixed Basic/non-Basic setup projection behavior is correct against the pinned setup reducer: initial min 1/max 6; optional min 0/max newBasics.length; engine ignores selections after Bench is full. Do not add a second Bench-capacity cap.
- The earlier duplicate-nativeGamePhase report was false and is retracted. Each production binding array has unique names and one nativeGamePhase; do not remove it.
- The worker implementation already locks globalThis and Math bindings; only the narrow Agent2 descriptor/redefinition tests remain to be ported.

## Exact failures from run 43657711184

1. Production async-timeout smoke fails because the stored cleanup receipt has stopped/containerRemoved but no processClosed field. Add processClosed from the same !stillRunning() observation (retain stopped) and assert it; this is currently a receipt-schema mismatch, not evidence the process remained alive.
2. Broad pure suite fails tests/agent49-actor-potential-knockout.test.cjs:129. The test view omits ownPublic.stadium and opponentPublic.stadium; publicStadiumPrintings() requires both arrays and returns null, causing effectiveNativeAttackCost() to reject every attack before potential-KO selection. Add stadium:[] to both sides of the synthetic view and rerun the full test file.

## Remaining implementation/acceptance gates

1. **RNG boundary:** wrap dispatchSelectedNativeAction(..., dispatch:false) in request.withValidationRandom(); it constructs a fresh Simulator and dispatches on a clone. Keep the later real Store dispatch on physical RNG.
2. **Simulator error boundary:** bind GameError from vendor/twinleaf/ptcg-server/output/game/game-error.js and GameCoreError/GameStoreMessage from game-message.js. GameError is a plain class, but do not swallow every instance. Construct Simulator outside the catch so ERROR_SIMULATOR_NOT_STABLE / ERROR_INVALID_STATE propagate. Catch only dispatch errors whose message is a verified expected-illegality GameStoreMessage (at minimum ILLEGAL_ACTION); propagate INVALID_GAME_STATE, INVALID_PROMPT_RESULT, UNKNOWN_CARD, UNKNOWN_ATTACK, UNKNOWN_POWER and all unrecognized values. Add the unresolved-prompt constructor regression.
3. **Stadium:** only after a candidate's cloned Simulator dispatch succeeds should projectNativeAction() expose it with stadiumEffectLive=true. Passive/no-op candidates that throw a verified expected GameStoreMessage must be filtered. Keep assertTrustedActionSelection() fail-closed. Test a live Tropical Beach and passive/no-op Sky Field/Dimension Valley.
4. **Native action-family integration:** the compiled native test currently exercises nine Basic hand actions only. Add real adapter → frontier → worker-visible token → validation → Store dispatch witnesses for a Bench attack (the previously documented full Alakazam ex evolution stack) and a real Trainer/Energy ability where supported; both seats where practical.
5. **Host-only prompts:** ShuffleHandPrompt currently sizes its permutation from owner.prizes.length; use the exact hand/card collection from the pinned prompt semantics and test hand size != prize count. InvitePlayerPrompt is allowlisted but has no resolver branch; remove it if impossible in the local paper fixture, otherwise implement/test it.
6. **Effective OS measurements:** collect UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup-v2 memory/pids/CPU, and actual /dev/shm capacity from the existing permissionModel=false canary runs (candidate/seat1 and opponent/seat0 cover both roles/seats). Keep permissionModel=true runs unchanged. Expected UID/GID 65532/65532, CapEff 0, NoNewPrivs 1, memory.max 536870912, pids.max 64, cpu.max 100000 100000, /dev/shm 16777216 bytes; record Seccomp rather than assume. Separate requested from measured values.
7. **VM regression coverage:** port only Agent2 d319fa5 tests for globalThis/Math/Math.random property descriptors and Object.defineProperty replacement attempts (probe-global-bindings, force-globalthis-redefine, force-math-redefine). Do not merge the divergent Agent2 implementation branch.

The workflow remains red until the timeout receipt and separate actor-policy fixture test pass. Contract-only is not Twinleaf compilation or game evidence. Rebase this branch onto current main before the next canonical run; main has advanced with review/results commits. No fixture until these gates pass and the physical-seed disclosure decision is explicitly authorized.
