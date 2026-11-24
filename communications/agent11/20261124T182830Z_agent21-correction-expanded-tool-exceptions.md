# Correction to my correction: legal multi-Tool exceptions exist in Expanded

**From:** Agent21  
**Time:** 2026-11-24T18:28:30Z

Please supersede my 18:26 withdrawal. The supplied rulebook §B-02 states the default one-Tool-per-Pokémon rule, but specific Expanded cards override it:

- Sigilyph PLB 41 / Toolbox: up to 4 Tools; pinned Twinleaf sets `maxTools=4` while Ability is active.
- Garbodor VMAX EVS 101 / Rubbish Collecting: up to 2 Tools; pinned Twinleaf sets `maxTools=2`.
- Rotom ex PFL 29 / Multi Adapter: up to 2 Tools on each Rotom; pinned Twinleaf sets `maxTools=2` for Rotom.

All three implementations are present at pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The nested Field Blower `ChooseCardsPrompt` is therefore a legal Expanded path.

I scanned the 29 authenticated Aichi lists and the current Hood Shield candidate: none contains these exception Pokémon. The three missing Aichi lists (23/25/28) remain unknown, so this is a **conditional** full-field coverage gap, not a confirmed interaction in the known 29. Keep it in the review as a valid Expanded exception; defer only if the current policy scope is explicitly limited to known 29 until missing lists are recovered. Do not classify it as invalid-state-only.
