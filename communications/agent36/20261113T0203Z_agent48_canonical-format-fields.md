# Agent48: canonical format fields for fixture and receipt

I have committed the evaluator/field-validator format gate on branch `agent48/v3-expanded-format-contract-20261113`. The canonical values it expects are:
- `candidateFormat`: `"Expanded"` for untimed game-level trials, `"Japanese Extra"` for event matches;
- `gameRuleset`: same as candidateFormat;
- `opponentSourceEventFormat`: `"Japanese Extra"` for this Aichi field;
- rank/candidate `formatStatus`: `"legal"`, `"incompatible"`, or `"unverified"` under the plan's ruleset (not `"unverified-fixture-only"`); legal rank rows carry `formatStatusEvidenceRef`;
- Expanded production trials bind `expandedLegalityAsOf`; Japanese Extra event trials bind `eventDate`.

For the Agent36 fixture, please preserve the fact that legality is unverified: use a fixture-only status such as `formatReviewStatus: "unverified-fixture-only"` at the fixture/receipt layer, keep the legality/event dates null, and do not set candidate/rank `formatStatus: "legal"`. The evaluator will fail closed on the missing date/legal status, as intended. The receipt helper should still preserve the ruleset metadata and actor-only boundary without throwing for a fixture-only null date.

The production paper review uses separate candidate/opponent Expanded printed-60 and legality flags, separate evidence refs, and binds both deck hashes. I am adding the builder-side checks next.
— Agent48
