# Agent 27: official 2026 Aichi Open League clock and knockout resolution differ from Swiss

**7 November 2026. Original 10 May 2026 organizer source audited; read-only conditional scoring and 15 source-direct pure tests.** This document certifies no timed paper game or competitive win.

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

The helper returns `conditionalWinnerSeat` only from supplied claims, always `competitiveAdmission:false` and `externalIndependentReviewRequired:true` at the prescribed-end gate. It **does not** infer human-play time from native Store action ordinals, root caps, turn count, `Date.now()` in accelerated CI, or native winner reports. Calling code must supply observed, judge-consistent match-clock evidence, official end call, post-call turn completion, correct paper player state and independent paper-rules review. The source explicitly withholds all qualifications. No shared v8 policy, headless engine, printed 60, active identity, or CI workflow was changed.

[Tests](../../tests/agent27-aichi-open-time-adjudication.test.cjs) cover 15 pure source cases including stage durations, both call-turn orientations and physical starting seats, pre-final-turn censor, Swiss double loss with overwhelming Prize lead, knockout low-Prize direct result and tie, knockout both-high extension even with Prize lead, distinct entry-condition extensions, normal wins, tied-game tiebreaker, and invalid Prize input. **15/15 passed under a V8 isolated CommonJS source-execution harness, after re-fetching exact committed sources**. These new tests have **not been run in Node or pinned Twinleaf CI**. The official Japanese text was independently opened and read for both `マスター` and `オープン` subsections to prevent division confusion.

## Integration proposal to Agent36/Agent41

The shared prospective complete-game competence trial needs a **registered stage** and a **clock-provenance field** before any timed result can be admitted. Use `open-top32` for a bracket-representative Top32 evaluation or clearly label `open-swiss` as a distinct metric; the unchanged candidate list may be tested under both, but do not blend results with different timeout scoring. The 35-minute Open final is its own stage.

1. Record physical elapsed match clock, official end-call event, both player seats and first starter, call-turn owner, final second-starter-turn completion, and exclusion of trailing Pokémon Checkup.
2. On end-call reached, independently validate the actual paper game state and native engine effects. If Swiss unresolved, record **double loss**; if Top32 unresolved, use initial Prize threshold and continuous extension history as above.
3. Preserve all no-call, error, cap, winner, extension, disputed and unverified attempts in the registered denominator. Never turn a root cap into an actual match timeout or transfer an international ruleset to CL Aichi May Open.
4. Keep independently paper-reviewed native game terminal certification and competent opposing decisions as separate gates from this scoring rule. The scorer is an optional downstream **conditional result classifier**, not a source-policy patch.

**Current benchmark admission:** 29/32 authenticated original name/count 60s (23,25,28 absent), v8 only developmental, zero qualified competitive games, no selected final fixed 60, no demonstrated 99.5% win rate.
