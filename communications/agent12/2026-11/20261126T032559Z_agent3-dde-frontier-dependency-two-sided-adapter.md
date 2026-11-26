# Agent 3: DDE frontier dependency in the new two-sided adapter

**Time:** 2026-11-26T03:25:59Z  
**Scope:** read-only integration dependency audit; no card ruling, deck change, game dispatch, or change to PR #65.

## Finding

The new two-sided adapter at simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs calls buildNativeActionFrontier() from agent36-native-action-frontier.cjs for every non-prompt decision. On current main, EXPECTED_PLAY_CARD_REJECTIONS.ENERGY contains only ENERGY_ALREADY_ATTACHED and BLOCKED_BY_EFFECT. A native Energy GameError: CANNOT_PLAY_THIS_CARD therefore propagates and aborts frontier construction.

The shared uncapped enumerator deliberately proposes each held Energy to every occupied Pokémon. For Double Dragon Energy, the pinned native reducer rejects non-Dragon recipients. The available Aichi source inventory contains DDE in 10/29 lists (ranks 10, 12, 13, 14, 18, 19, 20, 21, 27, and 32; 38 copies total); each of those ten lists also contains both Dedenne-GX and Tapu Lele-GX. Consequently, when DDE is in hand while either non-Dragon is in play, the current mainline frontier can abort instead of retaining the valid Dragon attachment and rejecting only the incompatible proposals.

This is a **field-coverage dependency**, not a reason to delay the first authorized rank-1 diagnostic if that frozen list does not contain DDE. It does mean the new generic adapter is not yet demonstrated to cover the full 29-list source field.

## Existing correction — do not duplicate it

PR [#65](https://github.com/FlareZ123/experiment-01/pull/65), branch agent3/dde-energy-frontier-mainline-20261124, already contains the narrow correction: an isolated throwaway Simulator probe uses the pinned CheckPokemonTypeEffect to determine whether the exact ROS #97 DDE target is currently Dragon-typed. It does not broadly suppress CANNOT_PLAY_THIS_CARD for Energy, and a separate non-DDE Energy control remains fatal. Both physical seats are covered.

The focused selector passed on the exact PR code/test SHA 281af576b8ac180b965334a9dbe8d8f17bc355fb (run [45428035882](https://github.com/FlareZ123/experiment-01/actions/runs/45428035882)); the later report-only PR head 420ad63774c51b6eeb97fd78174958ad2a8205d7 also passed its report-only focused check (run [45433665467](https://github.com/FlareZ123/experiment-01/actions/runs/45433665467)). PR #65 remains open and has not been merged to main. Preserve the repository-owner review requirement; do not transplant or merge the change around that gate.

## Suggested handling

- Keep the first authorized rank-1 trace and the DDE-bearing-rank coverage claim separate.
- Record this exact limitation in the two-sided adapter integration/coverage notes.
- Before evaluating any DDE-bearing Aichi list, obtain the required owner disposition for PR #65, integrate the reviewed correction through the normal route, and rerun the existing focused selector on the exact resulting mainline SHA.
- Do not create another frontier implementation or repeat the existing DDE probe investigation.

This is an integration dependency identified from current mainline source and the already-tested PR #65 artifact; it is not a matchup result or competitive-strength evidence.

— Agent 3