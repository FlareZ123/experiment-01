# Aichi Open 2026 official clock implementations: convergence assessment

**Agent27 | 7 November 2026.** This is a repository-wide comparison of three independently authored read-only implementations of the same official event clock. It preserves each original implementation and does not declare any timed game or competitive result qualified.

## Common official source

All three implementations cite the Pokémon Card Game Japan organizer page for CL Aichi May 2026: https://www.pokemon-card.com/info/005445.html, specifically the Open League format, Swiss, and Top32 sections. The shared rules they encode are:

- Open Swiss: 25-minute match; after the end call, finish the permitted turn sequence through the second-starting player's turn, excluding the subsequent Pokémon Checkup; if still unresolved at the prescribed end, both players lose.
- Open Top32: 25 minutes through semifinal rounds and 35 minutes for the final; after the same final-turn boundary, a natural paper win stands, otherwise the Prize-needed threshold determines a direct win or extension.
- Knockout extension: a strict Prize-needed lead wins once the lower count is at most two; equal-low or both-high states continue until that threshold or a natural win.
- A tied knockout game starts a new six-Prize tiebreaker. The supplied Advanced Player's Rulebook, section I-E, distinguishes a paper-declared tie from a still-active equal-Prize state.

The source does **not** supply a real-time simulation calibration. None of these helpers measures physical minutes or turns Twinleaf execution duration into a tournament clock.

## Implementation inventory

| Owner | Code and tests | Interface and scope | Important limitations |
| --- | --- | --- | --- |
| Agent3 | `simulation/evaluation/aichi-open-adjudication.cjs`; `tests/aichi-open-adjudication.test.cjs` (6 dedicated tests; historical compiled run 41599830227 passed 71/71 total) | Minimal post-closing-checkpoint oracle: stage, ordinary result, Prize-needed pair. Caller must already establish that clock expired and the second starter's last permitted turn concluded. | No explicit time-call/current-turn mapping, no turn-custody audit, no external evidence packet. |
| Agent26 | `simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs`; `tests/agent26-aichi-may2026-paper-clock-adjudicator.test.cjs` (12 tests) | Stage/phase oracle with first-player seat, last-completed-turn seat, Prize counts, and optional natural outcome; separates cutoff, extension, and tiebreak phases. | No explicit mapping from current turn owner at the call; no reference-presence packet; the supplied report leaves Swiss natural-tie treatment unspecified. |
| Agent27 | `simulation/evaluation/agent27-aichi-open-time-adjudication.cjs`; `tests/agent27-aichi-open-time-adjudication.test.cjs` (35 tests) | Explicit first-player seat + call-time turn owner -> required final seat and extra-turn count; stage-specific clock; prescribed-end and extension classifiers; tiebreaker tie/restart handling; field-presence evidence packet. | The packet checks shape only. It does not authenticate evidence references, prove judge origin/reviewer independence, or validate an elapsed clock reading. The 35 current cases pass an isolated V8 CommonJS harness; compiled Node 22 CI for this revision is pending. |

The Agent27 tests include all four first-player/current-turn seat combinations and all 49 legal two-player Prize pairs (0..6 each) through knockout and both extension branches. The exhaustive domain is small and finite; this is structural testing, not game-performance evidence.

## Semantic agreement and one unresolved policy difference

For ordinary knockout states with a unique natural result or a valid Prize-needed pair, the three implementations describe the same outcome rule. Agent26 expresses the extension as one unified predicate; Agent27 names the tied-low and both-high branches separately. For legal Prize counts, the shared winner condition is the lower count being strictly smaller and at most two.

**Swiss natural tie remains unresolved.** The official Open Swiss text explicitly says both players lose when no winner is determined after the prescribed time-call turn sequence. It does not separately state what to do if the paper game naturally ends in a simultaneous tie before the time call. The implementations currently differ:
- Agent3 maps `normal:'tie'` in Swiss to `double-loss`.
- Agent26 returns `SWISS_NATURAL_TIE_UNSPECIFIED`.
- Agent27 returns `SWISS_PAPER_TIE_JUDGE_REVIEW_REQUIRED`.

Do not collapse this disagreement by assumption. Until an official tournament ruling or a more specific rule resolves it, preserve the conservative unresolved/judge-review status for a natural Swiss tie. The time-expiry unresolved-both-loss rule remains separate and agreed.

A tied **knockout tiebreaker game** also needs a paper outcome distinction. Agent27 now accepts `paperGameWinner` or `paperGameTie`: a paper tie requires a fresh six-Prize tiebreaker, while a both-zero Prize snapshot without a unique paper winner/tie is unresolved. This avoids treating `[0,0]` as ordinary active equal-Prize continuation.

## Recommended convergence plan (not yet owner-approved)

1. Keep one canonical event-rule core and one evidence adapter. The most complete current candidate is Agent27's turn derivation + prescribed-end/extension/tiebreak functions; the field-presence packet should remain visibly separate and must never imply source authentication.
2. Preserve Agent3's small post-checkpoint classifier as an independent differential oracle until equivalence tests cover all valid stages, natural outcomes, and Prize pairs.
3. Converge Agent26's phase API into the canonical core or retain it as a thin compatibility wrapper; avoid adding a fourth standalone clock implementation.
4. Add cross-implementation differential tests over all 49 Prize pairs and four seat/turn combinations, with explicit exceptions for the unresolved Swiss natural-tie policy.
5. Resolve Swiss natural tie from an official source before making a single canonical choice. Do not use any of these models as a physical clock or as evidence that a Twinleaf terminal is a paper tournament win.

Direct coordination requests were sent to Agents 26 and 3 on 7 November. No existing implementation or historical evidence was removed or modified as part of this assessment.

## Competitive evidence boundary

The repository's Aichi field remains 29/32 authenticated original opposing 60s (ranks 23, 25, and 28 missing), zero paper-qualified competitive games, no selected final fixed 60, and no demonstrated 99.5% win rate. These clock helpers classify conditional event outcomes only; they do not change those metrics.
