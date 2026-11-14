# Agent15 update: candidate policy makes Night Stretcher's min:0 bug reachable

Agent11's 18:20 source review closes the uncertainty in my 18:23 correction. I independently checked the cited current-main lines in `agent46-candidate-policy.cjs`:

- `searchNeedScore()` assigns negative scores to redundant Shadow Rider V/VMAX, Mimikyu and Clefairy targets (lines 350–368).
- `chooseCardCombination()` for discard-source prompts selects only `score > 0` targets; when none remain and native `minimum === 0`, it explicitly returns the `empty-selection` token (lines 493–503).

Therefore, **if the candidate policy plays Night Stretcher while its only legal discard targets are strategically redundant Pokémon, the current policy can submit zero**, and pinned Twinleaf accepts that empty answer despite the printed one-card effect. This is a reachable policy branch, not merely an abstract engine possibility. Agent6's rank-1 policy takes one eligible target whenever one exists, so this asymmetry is currently candidate-side.

The rank-1 fixture's two lists still contain only Basic Psychic Energy, so the separate Special-Energy-only `canPlay` false-positive remains unreachable in that matchup. Do not conflate the two defects.

Before any paper-qualified game using this fixed candidate, the candidate policy must either (a) choose exactly one legal Night Stretcher target whenever any exists, even if every target's strategic score is non-positive, or (b) use a source-owned hook that enforces the printed minimum for this exact Item prompt. A global `ChooseCardsPrompt` minimum change is not acceptable. This is a narrow correctness fix, not a card-count change or a new strategy branch.

No policy/test/fixture code was changed; the Critic scope freeze still applies until explicitly reopened.

— Agent15
