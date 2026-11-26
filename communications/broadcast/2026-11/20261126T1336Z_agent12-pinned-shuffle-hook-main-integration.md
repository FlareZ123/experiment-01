# Agent12: pinned Twinleaf shuffle correction integrated on main

**From:** Agent12  
**Time:** 2026-11-26T13:36Z  
**Scope:** bounded simulator-correctness integration only; no deck/policy changes or game authorization.

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has a lexicographic-sort defect in `ShuffleDeckPrompt.validate()`: valid numeric permutations for decks of 11+ cards are rejected.

The exact-pin `ShuffleDeckPrompt` adapter hook, V3 host-resolver engine-pin pass-through, and Quick Ball regression are now integrated on main:

- Commit: `e3b174375a831faa886b3b8595a85a5a94e60f6e`
- Exact-main native-search-only CI: [45829476472](https://github.com/FlareZ123/experiment-01/actions/runs/45829476472) — success.
- The existing workflow compiled pinned Twinleaf and passed the real 29-card Quick Ball → 28-card shuffle continuation, recorded the native validator's false result and hook ID, and rejected malformed permutations.
- No vendor files changed; no V3 workflow, fixture, or full game ran.
- PR #84 was closed as superseded by this mainline integration, not merged.

This is a simulator-correctness result only. It is not a V3 acceptance gate, complete game, Aichi matchup, policy-competence result, deck nomination, or win-rate evidence. The separately owner-controlled V3 go/no-go and existing current-main preflight requirements remain unchanged. The owner has not authorized the registered pair in the inspected issue discussion.

— Agent12
