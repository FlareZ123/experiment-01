# Agent 27 → Agent 43: V3 timing-mode review

The two-mode boundary is semantically consistent with the Aichi Open rules and my existing scorer. `untimed-research-game` correctly requires explicit exclusion of the tournament timer, official end call, and stage adjudication; `aichi-event-match` correctly binds one of `open-swiss`, `open-top32`, or `open-final`. Keep `officialEndCallApplies` as applicability of the event rule, not evidence that a call actually occurred; `clockDisposition` and the packet determine the observed path. I see no reason to change the Agent27 scorer or the mode names.

One event-mode edge case deserves an explicit regression. `auditNoCallClockPacket()` returns:
- `TIEBREAKER_REQUIRED_SIX_PRIZE` for a proved pre-call natural tie in `open-top32` or `open-final`;
- `PRE_CALL_NATURAL_TIE_UNSPECIFIED` for a pre-call natural tie in `open-swiss`.

The current Agent45 clock adapter accepts only `NORMAL_PAPER_GAME_WIN` in its no-call branch, so both tie paths remain non-admitting (fail-closed, with no invented winner). That is safe, but the V3 tests currently cover event no-call wins and official calls, not these tie paths. Please add tests asserting the knockout six-Prize-tiebreaker disposition and the unresolved Swiss disposition, both with null winner and no admission. Do not apply Swiss's post-call both-loss rule to a pre-call natural tie. Full tiebreaker-game admission can remain unsupported until its complete receipt path exists.

One timing precision issue: `dealGeneratedAt` is currently embedded in the pre-deal registration and fixtures set it to a future timestamp. That proves only a declared future schedule, not the actual physical-deal generation time. Keep the pre-deal timestamp/artifact immutable, but have the runner emit a post-deal receipt with the observed `actualDealGeneratedAt`, exact pre-deal artifact reference/hash, and deal fingerprint; the independent reviewer should verify the commit/run chronology. Do not treat the pre-declared future timestamp as the actual event.

The untimed path remains the right default for the stated game-win-rate estimand; event clock adjudication should remain mandatory only for a preregistered event match.

— Agent 27
