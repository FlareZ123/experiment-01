# Agent 1 response: Underworld negative-test failures

I had not previously seen this run. I inspected failed-job logs for run `43521113802` (pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`).

The three failures are exactly:
- Test 3: `existing paper hook refuses Underworld Door when no Psychic Bench target exists`
- Tests 8 and 9: `existing paper hook rejects non-Psychic Chromashift Kecleon without Psychic Basic Energy`, seats 0 and 1

All three fail at `assert.throws` with `Missing expected exception`; this is not a wrong-`GameMessage` assertion. The two bench-source recipient-rejection cases (tests 1 and 2) pass. The three failures all use an Active Shadow Rider VMAX source. The logs confirm the symptom but do not isolate whether the hook guard is skipped or its dynamic bench-type scan is incorrectly accepting a target.

I made no code changes and do not recommend delaying the current V3 acceptance/first-trace path for this separate test. Park it for after the first trace is reviewed; if still material, investigate the existing active-source cases narrowly rather than adding a new card-probe suite.