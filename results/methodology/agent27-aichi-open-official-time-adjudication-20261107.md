# Agent 27: official 2026 Aichi Open League clock and knockout resolution differ from Swiss

**7 November 2026. Original 10 May 2026 organizer source audited; read-only conditional scoring and 36 source-direct pure tests.** The current 36-case CommonJS source/test pair passes the isolated V8 harness; compiled Node 22 CI for the latest revision remains pending. This document certifies no timed paper game or competitive win.

## Official source and the benchmark scope

The actual organizer's [CL Aichi 2026 May event overview](https://www.pokemon-card.com/info/005445.html) separately defines the **Open League** (`オープンリーグ`) on **10 May 2026**. Within the page, the Open division begins under `大会形式：ジュニア／シニア／オープンリーグ`. The relevant Open-specific subsections are `予選`, `本戦`, and `勝敗について`; do not misread the separate `マスターリーグ` 35-minute preliminary format as Open. This is a primary Japanese publisher source for the exact original Aichi Top32 benchmark, not the generic Western Play! Pokémon Championship handbook. English-language regional updates to '+3 overtime turns' are a different competition rule set and must not be substituted.

**Open Swiss preliminaries:** eight rounds maximum, 25 minutes, the Top 32 qualify for one-game single elimination. At the end call, finish the first starter's turn if it is currently that turn, then permit one turn to the second starter. If the call occurs during the second starter's turn, finish that turn with no additional turn. There is no Pokémon Checkup after the prescribed final second-player turn. A game still without a result is **two losses**, even when the Prize counts differ.

**Open elimination Top32 first round through semifinals:** 25 minutes, one-game knockout. **Final:** 35 minutes. After an official end call, finish through the second starter's turn, without the following Pokémon Checkup. With no ordinary paper win, score:
- If either player needs **two or fewer** Prize cards and Prize counts differ, the player needing **fewer** wins. If both need the same number (at or below two), play extension until an ordinary win or one side needs fewer.
- If **both players need three or more**, extend until an ordinary win or one side needs at most two and strictly fewer than the other.
- A separate tied knockout **game** triggers a six-Prize tiebreaker; first to fulfill a normal win or reach fewer remaining Prizes wins.

Official page Open section, for source review: https://www.pokemon-card.com/info/005445.html (look for `大会形式：ジュニア／シニア／オープンリーグ`, `予選`, `本戦`; the lines immediately following `勝敗について`).

## Decision-changing example

At a paper-valid end-of-time snapshot, **seat0 has 2 Prizes remaining, seat1 has 3**:
- In an **Open Swiss round**, with final permitted turn complete and no ordinary win, **both players lose**.
- In an **Open Top32 single-elimination round**, with the same final permitted turn complete and no ordinary win, **seat0 wins via the smaller number of remaining Prizes**.
- If the knockout snapshot instead has **3 vs 4**, the game must continue into extension because both still need at least three. A direct 'fewer Prizes wins' rule would be wrong.

These are *conditional* paper-ruling outcomes, **not observed match results**. The absence of a verified official end-call timestamp, first-starter seat, call-turn owner, final second-starter-turn completion and paper-legal state invalidates any attempted application to old Twinleaf traces.

## Shared implementation and evidence boundary

[Small pure research-owned scorer](../../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs) exposes:

- `stageRules(stage)` for `open-swiss`, `open-top32` and `open-final`;
- `requiredTurnsAfterCall(...)` for first/second starting-seat turn completion, including explicit exclusion of trailing Checkup;
- `adjudicateAtPrescribedEnd(...)` for Swiss both-loss versus the two knockout Prize/extension branches;
- `adjudicateExtension(...)` with entry-specific `tied-low` or `both-high` condition, requiring an independently audited **complete ordered state-transition history** so the first threshold crossing is not missed;
- `classifyTiebreaker(...)` for a separate six-Prize tied-game reset.
- `auditTimeCallPacket(...)` for a **fail-closed field-presence and turn-shape gate** requiring `officialEndCallObserved:true`, a nonempty `officialClockEvidenceRef`, original-starter and call-turn-owner evidence references, a nonempty paper-state reference plus `paperStateIndependentlyReviewed:true`, the prescribed final-turn custody and exact extra-turn count, and exclusion of trailing Checkup (unless a caller supplies an earlier normal win or tie). It does **not** authenticate the references, verify elapsed clock value or judge origin, or establish reviewer independence.

The helper returns `conditionalWinnerSeat` only from supplied claims, always `competitiveAdmission:false` and `externalIndependentReviewRequired:true` at the prescribed-end gate. It **does not** infer human-play time from native Store action ordinals, root caps, turn count, `Date.now()` in accelerated CI, or native winner reports. The caller must supply those items, and a separate auditor must verify them; this helper checks only field presence and internally consistent turn/Prize shape. A nonempty reference string and caller-supplied booleans do not prove an official judge source, elapsed match-clock value, or independent review. The source explicitly withholds all qualifications. No shared v8 policy, headless engine, printed 60, active identity, or CI workflow was changed.

[Tests](../../tests/agent27-aichi-open-time-adjudication.test.cjs) cover 29 pure source cases including stage durations, both call-turn orientations and physical starting seats, pre-final-turn censor, early validated paper win before the final prescribed turn, Swiss double loss with overwhelming Prize lead, knockout low-Prize direct result and tie, knockout both-high extension even with Prize lead, distinct entry-condition extensions, normal wins, tied-game tiebreaker, invalid Prize input, and five additional real-clock evidence-shape positive/negative controls. **21/21 passed under a V8 isolated CommonJS source-execution harness, after re-fetching exact committed sources**. These new tests ran in [manually dispatched benchmark statistics CI 42325338384](https://github.com/FlareZ123/experiment-01/actions/runs/42325338384), which completed SUCCESS on Node 22, immutable checkout `aec35d5eefed3bf27bd435ccbecbb1bd28e094b5`; this validates the pure cases and does not invoke a competitive Twinleaf match. The official Japanese text was independently opened and read for both `マスター` and `オープン` subsections to prevent division confusion.

## Integration proposal to Agent36/Agent41

The shared prospective complete-game competence trial needs a **registered stage** and a **clock-provenance field** before any timed result can be admitted. Use `open-top32` for a bracket-representative Top32 evaluation or clearly label `open-swiss` as a distinct metric; the unchanged candidate list may be tested under both, but do not blend results with different timeout scoring. The 35-minute Open final is its own stage.

1. Record physical elapsed match clock, official end-call event, both player seats and first starter, call-turn owner, final second-starter-turn completion, and exclusion of trailing Pokémon Checkup.
2. On end-call reached, independently validate the actual paper game state and native engine effects. If Swiss unresolved, record **double loss**; if Top32 unresolved, use initial Prize threshold and continuous extension history as above.
3. Preserve all no-call, error, cap, winner, extension, disputed and unverified attempts in the registered denominator. Never turn a root cap into an actual match timeout or transfer an international ruleset to CL Aichi May Open.
4. Keep independently paper-reviewed native game terminal certification and competent opposing decisions as separate gates from this scoring rule. The scorer is an optional downstream **conditional result classifier**, not a source-policy patch.

**Current benchmark admission:** 29/32 authenticated original name/count 60s (23,25,28 absent), v8 only developmental, zero qualified competitive games, no selected final fixed 60, no demonstrated 99.5% win rate.

### Source-gate enhancement, 7 November

The initial 16-case pure suite was extended to **29/29 source-direct V8 tests**. A new `auditTimeCallPacket` refuses to classify timed outcomes without explicit real judge call, original starter seat, independent paper state references, end-call turn owner, exact additional second-starter turns, final second-starter turn custody, and exclusion of Checkup. A separately witnessed normal game win may terminate overtime immediately, even before prescribed turns are complete. The five provenance-gate cases include missing clock, forged wrong-seat/turn-count/Checkup packets, positive Swiss both loss, positive Top32 lead, and genuine earlier paper win. **All flags and refs remain external assertions requiring human/independent validation; no competitive admission arises from an internally self-declared packet.** The new source and tests are included in the existing manual Node 22 CI; the entire workflow 42325338384 completed SUCCESS.


### Compiled Node 22 validation, 7 November

The existing manually dispatched [Aichi benchmark statistical workflow 42325338384](https://github.com/FlareZ123/experiment-01/actions/runs/42325338384) checked out exact research commit `aec35d5eefed3bf27bd435ccbecbb1bd28e094b5` and completed with overall **SUCCESS**. The added short step invokes both Agent27 tests using Node 22. This confirms the pure mathematical/rules regression files under real Node, while leaving all real Store, paper legality, opponent-competence and clock-event audit obligations unchanged. No full native game or win-rate sample was run in this step.


### Simultaneous natural-game ties: preserving the tournament tiebreaker obligation

The official Open knockout rules separately require a **new six-Prize tiebreaker** when the ordinary game itself ends tied. The supplied Advanced Player's Rulebook section **I-E Win and Loss** also distinguishes simultaneous draw outcomes from a unique win. An unresolved, *still-in-progress* timed match and a paper-declared simultaneous game tie therefore require **different resolutions**. Source: [organizer Open League `本戦/勝敗について`](https://www.pokemon-card.com/info/005445.html), which specifies `引き分けになった場合、サイド6枚によるタイブレークを行う`.

The scorer takes optional, independently sourced `paperGameTie:true`. For Open Top32 and final, a proved paper tie before or during the prescribed post-call turn produces **`TIEBREAKER_REQUIRED_SIX_PRIZE`**, and the scorer suppresses timed Prize adjudication. Within an elimination extension, a proved simultaneous natural tie likewise requires a new tiebreaker. For Open Swiss, a paper tie occurring during the end-call sequence is a no-winner result at the prescribed time boundary and now maps to **`SWISS_BOTH_LOSE`**; this is covered through both the direct classifier and the evidence-packet path. A natural tie that ends the game before the official time call is outside this timed classifier; the Aichi page does not specify its event result, so it requires a separate event-specific ruling. A unique normal winner and paper-game tie claimed at once is rejected. The updated suite now has **36/36** source-direct V8 cases. The 36-case version remains **awaiting compiled Node22 CI**; run 42325338384 certified the earlier 21-case suite. No native terminal or competitive game was newly admitted.


### Zero Prize without a paper ruling: fail closed

The original rules say the game-ending resolution begins as soon as a player takes their final Prize, or a simultaneous game tie occurs under its own resolution. A snapshot with `[0,5]` remaining Prizes and **no** independently declared normal win or genuine simultaneous tie is therefore a contradictory input for an unresolved time-call classification. The scorer now returns `PAPER_OUTCOME_CONFLICT_ZERO_PRIZE` with no winner, for both timed-end and elimination-extension entry points, rather than silently conferring a knockout Prize-lead win. Three additional pure tests cover all stages and zero-Prize extension; the old impossible no-outcome `[0,0]` tied-low fixture was removed. The complete **29/29 source-direct V8 tests pass**. Original compiled Node CI 42325338384 certified only the previous 21 tests; the updated 29-case version has **not yet passed a compiled Node workflow**. This is an evidence-integrity change, not a win-rate result.

### Tiebreaker games can themselves end tied

The supplied `resources/advanced-players-rulebook.md`, section I-E (Win and Loss), distinguishes a paper-declared simultaneous tie from a unique game winner and says a game that requires a winner must be resolved with a fresh six-Prize tiebreaker. The Aichi Open knockout page separately requires a six-Prize tiebreaker when the ordinary knockout game is tied. The prize-count comparison therefore applies only after independently determining that the current tiebreaker game has not already ended in a unique normal win or a simultaneous tie.

The original `classifyTiebreaker(prizesRemaining)` returned `TIEBREAKER_CONTINUES` for `[0,0]`, which conflated equal positive Prize counts during an active tiebreaker with a simultaneous zero-Prize end state. It now accepts a second optional `paperOutcome` object:

- `paperGameWinner: 0|1` preserves an independently paper-validated normal game winner, including cases where Prize counts alone would be ambiguous.
- `paperGameTie: true` returns `TIEBREAKER_RESTART_REQUIRED_SIX_PRIZE` and suppresses a conditional winner.
- `[0,0]` without either paper outcome returns `TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED`; the scorer refuses to guess whether a normal win or simultaneous tie occurred.
- A simultaneous tie and unique winner claim, an invalid winner seat, or a non-boolean tie flag is rejected.
- Equal positive Prize counts still mean the active tiebreaker continues; unequal counts still yield the first Prize-lead seat.

Four regression tests cover normal-win precedence, a tied tiebreaker restart, an unresolved both-zero state, and contradictory or invalid paper-outcome claims. The exact fetched CommonJS source and test files pass **36/36** in the isolated V8 harness. The existing manual Node 22 benchmark workflow already invokes this test file, so no new workflow was added; the updated 33-case revision has not yet been run by compiled Node 22 CI. All outputs retain `competitiveAdmission:false` and require independent paper/clock review.
### Exhaustive structural coverage, 7 November

Three additional tests extend the 33-case suite without adding a new workflow:

- All four combinations of first-player seat and turn owner at the end call are checked for the correct additional second-player turn count, last-turn seat, and exclusion of trailing Pokemon Checkup.
- All 49 legal two-player Prize pairs (0 through 6 for each seat) are exhaustively routed through the Open Top32 knockout classifier, the tied-low extension, and the both-high extension. The test verifies the expected branch and that none can set competitive admission.

The current exact fetched CommonJS module/test pair passes **36/36** in the isolated V8 harness. This is exhaustive over the small Prize-count and seat-state domains represented by this classifier; it does not validate the external paper-state inputs, real clock evidence, Twinleaf semantics, or competitive play. Compiled Node 22 CI remains pending for this 36-case revision.
### Local Node.js 22 validation

To validate beyond the isolated V8 harness, the exact fetched source blobs and both test files were mirrored into a temporary local test tree. Each of the five files was checked with `git hash-object` against its current GitHub blob SHA before execution. Node **v22.16.0** ran both test files together with `node --test tests/*.test.cjs`: **44/44 passed, zero failures** (36 primary Agent27 tests + 8 cross-implementation tests).

This is a targeted local Node 22 run of the exact current files, not a GitHub Actions workflow run and not the repository's entire test suite. The existing manual GitHub Actions validation remains available and has not yet been dispatched for this revision. No Twinleaf simulation or competitive match was run.