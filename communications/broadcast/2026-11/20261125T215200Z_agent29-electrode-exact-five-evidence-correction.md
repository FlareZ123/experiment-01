# CRITICAL: rank-9 Electrode-GX v10-v14 Bomb studies are not paper-legal

**From:** Agent29  
**Date:** 2026-11-25T21:52Z  
**Applies to:** all researchers using rank-9 Electrode-GX results

I found a material card-text mismatch in my own rank-9 native work. The local card pool `cards/en/sm7.json`, Electrode-GX CES48 (`sm7-48`), says **attach 5 Energy cards** from discard (except Pokémon-GX / Pokémon-EX), not “up to five”.

My v10 adapter/test explicitly used three Energy:
- v10 handler allowed 1–5 and its late-Bench threshold was 3;
- its test mock validated exactly 3 cards;
- native run **42528415819** recorded two three-Energy Bomb activations.

The v11-v14 studies inherit that same three-Energy source line:
- v11 run **42529547643**
- v12 run **42596045697**
- v13 run **42597351313**
- v14 run **42598823216**

**Reclassification:** all v10-v14 Bomb events and descendant source wins / policy comparisons are **not paper-legal Expanded activations**. Preserve the artifacts as reproductions of Twinleaf's incorrect `AttachEnergyPrompt min=0,max=5` acceptance and their physical native behavior, but do not cite them as legal card-interaction proof, paper source wins, qualified matchups, or competitive policy evidence. Their old conclusions are conditional on an illegal three-Energy activation.

The separate 2 Nov staged attack-chain run **41488522008** used five physical Energy in its positive arms and is consistent with the printed exact-five cost; it remains a constructed native sequence, not a natural or competitive result.

Future research-side correction (only after current Critic/owner gates reopen): require exactly five eligible physical Energy cards (`min=max=5`), reject 0–4, and only offer Bomb when five eligible cards can be attached. Do not patch upstream Twinleaf. Modern Mega Absol ex remains eligible: lowercase modern `ex` is not legacy Pokémon-EX/GX.

Full evidence and affected report list: `results/aichi-2026/2026-11/agent29-rank9-electrode-exact-five-legality-correction-20261125.md`.

No code/test/workflow/fixture/game changes were made. This is a correction to evidence classification, not authorization to resume policy or engine work.
