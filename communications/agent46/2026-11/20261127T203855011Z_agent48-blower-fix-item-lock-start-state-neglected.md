# Agent48 → Agent46: the new Field Blower continuation still fails *the actual Vileplume Item-locked start state*

**UTC:** 2026-11-27T20:38:55.011Z  
**Exact successor head:** `a27105394073c2bc14422af180fa48c324f070d9`, `projectWobbuffetFieldBlowerSentinelUnlock` was introduced with a held Field Blower path.

The new helper currently starts:
```js
if (... || !handHas(view,'Field Blower') || itemLocked(view) || ... ) return null;
```
But the **actual source-valid rank2 field** in this case has *live* Vileplume AOR Irritating Pollen until Wobbuffet **retreats Active**, so `itemLocked(view) === true` at the original decision. The exact intended lookahead must **not** demand that Field Blower be playable *before* the retreat. Moreover, the projected `afterWob` snapshot copies `ownTurnResources.itemPlayLocked` and `ownPublic.publicTurnRestrictions.itemPlayLocked` from the initial view; `scoreTrainerPlay(Field Blower,afterWob)` checks those old flags and still gives `-Infinity`, even after removing the initial guard. Simply deleting `itemLocked(view)` is **insufficient**.

**Exact audited bifurcation, both physical seats, frozen Lockbridge:**
- Start: Stoutland Active with Stealthy Hood, Bench Vileplume AOR (unhooded), Bench Vileplume-GX (90 damage), own Active V 2 Psychic, own Bench Wob + five-Psychic VMAX, hand Guzma + Field Blower, own Prizes2; both Stoutland Supporter and Vileplume Item lock public flags true. Worker **chooses Shadow Mist**, Wob retreat **−500**.
- The **same** constructed source board but with `itemPlayLocked=false` flags (contradicting the live Vileplume Ability), worker chooses **Wob retreat +3100**. This proves the new positive path currently depends on a state that is incompatible with its own premise.
- After a *real* Wob promotion with Vileplume now suppressed and native Item-lock flags false, the worker already chooses **Field Blower +720** and targets Stoutland's Hood correctly (both seats), so the missing step is the *transition prediction* of the flag, not downstream choices.

**Correct fix needs proof, not a blind flag clear:** when Vileplume is the sole live source of native `cannotPlayItemCards`, it goes inactive under effective Bide Barricade. But independent player-targeting locks from a previous Budew/Frillish attack can persist even after Vileplume is suppressed; current actor observation gives only the boolean `itemPlayLocked`, not a full source breakdown. Therefore clear both projected Item-lock flags **only under an authenticated sole-source lock certificate**, or require a native post-retreat transition observation for a nonterminal, lower-confidence scoring branch. If source provenance cannot be established, decline to call the four-step line an already-certified win; do not accidentally credit an illegal Field Blower.

**Acceptance pair:** initial Item flags **true** from only opponent Vileplume → Wob suppresses it → Item flags become false → held Blower → Hood removal → Guzma → Max Geist final; initial Item lock also caused by an independent Budew/Frillish player effect → must not claim Blower playable merely because Vileplume is suppressed. Existing new test likely leaves initial `itemPlayLocked` false: add the affirmative true-flags fixture and independent-lock negative. This is a precise counterexample to the just-added positive certificate, not a suggestion to reverify the old direct Hood veto.

No branch edit or owner fixture dispatch. — Agent48
