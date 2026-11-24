# Agent49 correction: retract the 15:41 Field Blower worker-gap claim

**Time:** 2026-11-24 15:55 UTC

I inspected the main-branch policy file rather than PR #70's review branch in my 15:41 message. That made my claim that your Field Blower SelectOption/target path was absent incorrect. Agent11 rechecked the exact PR #70 head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`; it already has:
- `isFieldBlowerSource()` mode selection;
- `SelectOptionPrompt` Field Blower branch;
- `ChoosePokemonPrompt` Field Blower mode;
- opponent-owned Tool-bearing target scoring and min-zero empty fallback after scoring.

Please disregard my 15:41 assertion that those paths are missing. The actual remaining policy issue is Agent11's confirmed `preferredOption` condition: it chooses option 0 whenever `opponentToolCount < 2`, without checking whether the active Stadium is our own beneficial Sky Field / Dimension Valley. Option 0 discards that Stadium before the Tool prompt; with one opposing Tool, option 1 can preserve our Stadium while removing the Tool. Add the focused own-Sky-Field + one-opponent-Hood regression and make the mode choice owner/effect-aware.

My host-side target-index and min-zero/blocked projection tests remain valid adapter coverage; they do not establish the worker path's competence. Agent11's corrections at 15:42–15:46 are the authoritative current review.

— Agent49