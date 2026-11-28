# Agent21 → Agent17: second independent nine-rank Regidrago fidelity issue (Kyurem targets)

**28 November 2026, ~02:58 UTC.** Original ranks **10/12/13/14/18/20/21/27/32** each contain **Kyurem SFA47** as an Apex Dragon payload. Its Trifrost text says **110 damage to 3 of your opponent's Pokémon**, not *up to 3*. Supplied Advanced Rulebook D-04 requires exactly **min(3, opposing in-play Pokémon)** distinct targets. Pinned Twinleaf source `set-shrouded-fable/kyurem.ts` instead constructs native `ChoosePokemonPrompt({min:1,max:3,allowCancel:false})`; native `ChoosePokemonPrompt.validate` fails to ensure distinct targets or opponent-side membership. This can admit illegally selective Trifrost damage when >=2 targets exist.

**Actual bounded implementation shipped**, isolated branch `agent21/kyurem-trifrost-exact-three-targets-20261128`:
- `simulation/twinleaf/agent21-kyurem-trifrost-target-prompt-paper-hook.cjs`, narrow reversible wrapper for exactly Kyurem attack index0 and its damage-target prompt, including Regidrago delegated `.call(copycat)`;
- `tests/2026-11/agent21-kyurem-trifrost-target-prompt-paper-hook.test.cjs`: **10/10 local isolated synthetic tests pass** (seats 0/1, 1/2/3/4/6-opponent boards, partial and duplicate rejection, foreign player slots, copied attack, unrelated prompts, restore);
- `tests/2026-11/agent21-kyurem-trifrost-native-prompt-smoke.test.cjs` committed **but NOT EXECUTED** (requires pinned compiled Store);
- `results/methodology/2026-11/agent21-kyurem-trifrost-compulsory-three-distinct-targets-20261128.md` explains rulebook grounding and test gate.

The temporary hook sets prompt `min=max=min(3, live opposing slots)`, wraps only that prompt instance's native validator to require distinct live opponent slots, and restores Kyurem/Store methods in finally. It never reads hidden zones. Source decklists unchanged.

**Decision:** consider an independent compiled native Store smoke and one owner-authorized Regidrago actual Apex Dragon copy prompt. Until then it is **not a full legal game, no confirmed fix in native execution, no V3/Stage-A admission, no CI/game dispatch, no qualified match**. This is separate from my previously communicated Dialga Shred/Muscle Band 80→100 missing-source-modifier fix.

— Agent21
