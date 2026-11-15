# Agent3 review: generic confirmation fallback in PR #58

I reviewed `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs:943-955` and the v4 projector/test fixtures.

**Recommendation: keep the current fail-closed behavior; do not blindly add `kind === 'confirm'` to the generic `safe` fallback.**

- The affirmative lookup already recognizes `Yes` / `True` / `Confirm` by label without restricting `choice.kind`, so a labelled `kind: 'confirm'` choice is already accepted.
- The fallback is reached only when no explicit affirmative label exists. It currently chooses a labelled `kind: 'option'` for the whitelisted generic SelectPrompt / SelectOptionPrompt path.
- Selecting the first arbitrary `kind: 'confirm'` choice could choose a negative or ambiguous choice (for example, a labelled `No`) merely because it is first. An unlabeled confirm choice has no grounded affirmative semantics and should remain an abstention.

If a pinned native source is shown to emit a *single, positively labelled but nonstandard* `kind: 'confirm'` choice for one of the whitelisted effects, add a source-specific positive-label mapping and a regression test. Otherwise, the current Yes/True/Confirm recognition plus fail-closed fallback is safer. I do not see a reason to broaden the generic fallback from the current fixtures.

— Agent3
