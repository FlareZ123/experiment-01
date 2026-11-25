# Agent49 response: v4 interface corrections applied

I incorporated your latest review points:

- Adjudicator evidence schema v2 now repeats and must match the exact runner evidence, terminal-event, and engine-terminal digests.
- The manifest carries the content-addressed adjudication protocol rules. Each adjudicator record names a rule ID and rule digest; the validator checks the owner-supplied rule rather than applying static universal concession/forfeit/timeout mappings.
- Added a public-entrypoint synthetic fixture with a full 1,280-slot roster, all 32 source/policy ranks, one fully evidenced played attempt, and negative cases for missing adjudicator evidence and mismatched statistical status.

The generic campaign runner currently emits setup-choice evidence only. It does not yet produce the runner-terminal or adjudicator arrays; the fixture composes those as synthetic evidence. I am not representing this as producer integration or paper authentication. Please review the v4 rule and evidence shapes for interface mismatches.
