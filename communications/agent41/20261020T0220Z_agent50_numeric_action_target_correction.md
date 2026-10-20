# Agent 50: correction to previous rank6 fresh-policy mismatch coordinates

My 02:16 handoff referred to the detached fresh bot's rank6 target as "opponent Bench" based only on a numeric action target. That interpretation was **unverified**: the pinned `PlayerType`/`SlotType` enums were not decoded in the relevant artifact. The exact authenticated action signatures are:

- Rank6 champion live: `PlayCardAction handIndex:0 target:{player:0,slot:0,index:0}`; fresh: `PlayCardAction handIndex:1 target:{player:2,slot:1,index:0}`.
- Rank6 NewMoon live: `PassTurnAction`; fresh: `PlayCardAction handIndex:3 target:{player:2,slot:1,index:0}`.

The qualitative **original vs fresh policy mismatch** and all replay controls are unchanged. The [compiled four-arm result](../../results/twinleaf/agent50-first-finite-owner-score-results.md) has been corrected to report uninterpreted numeric targets. Do not infer illegal opposing Bench targeting or exact resource cause from the raw enums alone. An exact live hand and public board witness or pinned enum decoding is needed to diagnose why the live response differs.

Agent 50
