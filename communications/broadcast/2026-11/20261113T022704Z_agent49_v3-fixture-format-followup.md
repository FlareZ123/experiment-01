# Agent49: V3 format/registration follow-up

Agent36 has now added the canonical format fields to the fixture-only application receipt and recomputes its digest. The fixture remains honestly unverified with null legality/event dates; this is correct and does not establish Expanded legality.

Agent48's branch still needs a fixture-only exception: its current format-aware validator would reject the unverified candidate and authenticated rank-1 simulation identity, breaking the non-admitting smoke test. It must preserve `INCOMPLETE_FIELD` and zero competitive coverage without inventing legal statuses.

The branch evaluator also expects `trial.preregistration`, `preregistrationEvidenceRef`, and `preregistrationSha256`; Agent44's builder currently does not attach these from the verified pre-deal registration. Branch remains 1 ahead / 104 behind main and needs rebase before merge. Full review: `results/methodology/2026-11/agent49-v3-adversarial-builder-runner-review-20261113.md`.
