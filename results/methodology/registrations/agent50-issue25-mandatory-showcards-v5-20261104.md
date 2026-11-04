# Agent50 Issue25 v5 preregistration: mandatory in-turn ShowCards acknowledgements and direct deal evidence

4 November 2026, before patch/test/compiled run. Previous [v4 CI 41766682884](https://github.com/FlareZ123/experiment-01/actions/runs/41766682884) passed all seven test groups, including owner-only 4 setup ShowMulligan and 10 Wait acknowledgements on the same original rank6/11 historical four-arm common runner. The next first blocked native fallbacks were **turn1 phase2 ShowCardsPrompt** (rank6/NewMoon seat1 and rank11/NewMoon seat0); champion references returned without a typed abort within cap. Original raw-State decoder executions remained zero.

## Single new policy primitive

Add separate research-owned `agent50-owner-mandatory-showcards.cjs`. It may answer only its own native `ShowCardsPrompt` during live player turn (phase `GamePhase.PLAYER_TURN`, turn >=1), when `prompt.options.allowCancel===false`, `prompt.message!==GameMessage.SETUP_OPPONENT_NO_BASIC`, and the prompt's `playerId` equals the acting bot's native owner ID. Answer with native `ResolvePromptAction(prompt.id,true)`, consistent with pinned original `ConfirmPromptResolver` for regular ShowCards prompts. Never inspect `prompt.cards`, concealed opponent cards, decks, prizes or private identities. Unsupported types or owners delegate to Agent4's outer quarantine as before. Public message code, actor seat, turn, phase only are allowed in audit.

Keep existing Agent6 `GO_FIRST=false`, own starting Basic selector, and own mulligan/Wait acknowledgement handlers. Re-execute identical four retrospective `developmentTrials()` with original source rank6/11, champion/New Moon candidate printed sixties, same historical seeds/seats, `actorOnlyComposition:true`, native root cap16. No modifications to shared historical runner's source-specific override behavior.

## Correct the observer in this preregistered replay

In previous v4 test, `row.game?.initialSourceDealFingerprint` and `row.game?.rootActionLedger` were wrong paths on successful rows, because actual runner returns those as direct `row.sourceDealFingerprint`, `row.rootActionLedger`, `row.rootActionCount`. In v5 record exact direct `row.sourceDealFingerprint`, `row.fullPhysicalDealFingerprint`, `row.actionCount`, `row.rootActionCount`, `row.turns`, `row.finished`, `row.winner`, plus `row.status` (or `returned` for no status), and any abort marker. Record all four attempts; never assume missing data means no deal.

## Acceptance and limits

Pure tests: both seats, wrong owner/message/phase/optional prompt delegated, concealed `prompt.cards` getter and opposing hand/deck/prizes protected by throwing accessors to detect private access, native action result must equal true, no Store pre-dispatch mutation, method restored. Compiled Store: all four retained attempts, prior setup choices and acknowledgements still selected, at least two new mandatory in-turn ShowCards prompts handled if they actually occur, zero raw-State native scorer executions, report next typed fallback or a no-fallback bounded result and authentic source-deal ledger. On failure preserve details, do not count qualified games. No new CI workflow or vendor changes.

**No total owner-only competitive policy or 99.5% win-rate evidence follows.**
