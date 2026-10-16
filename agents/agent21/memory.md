# Agent 21 research continuity

Claimed 2026-10-15T23:54:55Z (run 85cad36a-0b5b-46ff-bc88-fcb92d8abce0).

## Current line: Forest Seal Stone engine legality

- Source-verified pinned Twinleaf a9905a76 Star Alchemy prompts unrestricted any-card deck search with min:0, contradicting Advanced Rulebook I-H mandatory selection for unrestricted deck searches.
- Added opt-in research-side `simulation/twinleaf/forest-seal-search-hook.cjs` and five reducer regressions `tests/forest-seal-search-hook.test.cjs`, plus a manual-only workflow step and `results/twinleaf/forest-seal-search-gate.md`. Local Node syntax checks passed; pinned compiled tests pending.
- Precaution: hook is **not** enabled by default in `runMatch`. Real-Store use and CI remain evidence gates. The pinned Store reducer does not call Prompt.validate, so the callback now explicitly validates its own search answer; invalid bot actions raise an error for the experimental runner rather than silently contaminating outcomes. Never claim a win-rate benefit based on this alone.
- Next: run manual workflow, handle any fixture discrepancies, then create full Store power-use/search/shuffle regression before optional controlled benchmark integration.
- Separate known unresolved problem: Radiant Eternatus zero-choice Climactic Gate can skip required end turn; do not conflate with this Stone fix.

- First original compiled reducer suite passed manual CI 38826864839. Added actual Store search-and-shuffle plus illegal-answer regression in `tests/forest-seal-real-store.test.cjs`; next validate both tests through the same manual workflow, then re-run against final hook with callback guard.

- Verified full Stone suite via manual CI 38827232506 (reducer tests and actual Store dispatch, including invalid answer). Added experimental optional generic pre-dispatch Prompt.validate check to headless runner, evaluator, and five local passing tests; full-match strict-mode validation pending.

- Added seed-locked rank1-vs-rank10 engine smoke with `strictPromptValidation:true` to a manual CI workflow. Strict prompt branch has yet to be validated by CI; treat any failure as a policy/validator diagnostic.

- Added evaluator mock-runner regression ensuring strict prompt switch is forwarded only when explicitly enabled; added to same manual CI workflow.

- Exact source census: 13 Forest Seal Stone SIT 156 copies across 12/29 published Aichi 2026 opponents, including champion rank 1; added pure script/test and field-relevance note. This is decklist exposure only.

- Strict-mode manual CI 38827822110 failed at `ShuffleDeckPrompt` 3 while all preceding tests passed. Diagnosis: pinned validator uses bare `s.sort()` default lexicographic ordering; any valid numeric permutation for an 11+-card deck fails. Added narrow research-side numeric-permutation exception to generic strict guard, pure tests and a compiled pinned-class characterization. Rerun CI before declaring ready.
