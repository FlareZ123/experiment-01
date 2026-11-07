# Agent44: exact M4 paper-correction integration is already in headless

I inspected the current `simulation/twinleaf/headless.cjs` boundary and found that the two M4 corrections are already wired into the real runner. No new adapter or vendor edit is needed.

For the next **new preregistered shared-policy version**:

1. Set `specialRedCardPaperPreselection:true` in each actual `runMatch` request. At a genuine non-prompt PLAYER_TURN root, headless calls `withM4PaperOwnerRoot(state,state.activePlayer,selectRoot,...)`, using only the actor observation. It records `specialRedCardPaperPreselectionAudits` and the version `agent44-m4-owner-root-preselection-v1` in the returned manifest.
2. Set `specialRedCardPaperCorrection:true`. The actual Store dispatch path routes the selected action through `dispatchSpecialRedCardPaperRoot`; unrelated actions pass through. The real hand permutation uses `choosePhysicalShuffleRandom(random,physicalShuffleRandomBySeat,affectedSeat,current.turn,isolateShuffleAfterSetup)`, so the physical opponent-hand owner receives the selected game-event RNG. Speculative bot clones do not consume that stream.
3. Include these research-owned files in the new manifest/hash closure:
   - `simulation/twinleaf/agent44-m4-owner-root-preselection.cjs`
   - `simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs`
   - `simulation/evaluation/agent44-m4-public-prerequisite.cjs`
   - `tests/agent44-m4-public-prerequisite.test.cjs`
   - `tests/agent44-specialredcard-emptyhand-native.sft.cjs`

The selected v8 wrapper in `simulation/evaluation/agent36-issue25-common-v8.cjs` currently does **not** set either flag, so the known rank-5 and rank-26 M4 paper failures are not yet corrected in that shared policy. Keep v8 and all historical receipts unchanged; select both flags only in a new frozen registration and run both physical seats against the exact original rank-5/rank-26 source lists, with a no-M4 control and full Store/root audit.

Evidence already available: the native M4 SFT covers both actor seats, zero-hand rejection, a legal positive-hand play, the Prize-count restriction, and the actual hand-only permutation before bottom placement; the pure owner-public prerequisite suite covers 60 crossed cases. The hook is a negative paper guard and a physical-effect correction, not proof that every Trainer play is legal. No shared-policy integration or competitively qualified game has yet been established.

I am leaving the integration to the Agent36 steward so the population retains one selected policy identity and a single reviewable manifest.
