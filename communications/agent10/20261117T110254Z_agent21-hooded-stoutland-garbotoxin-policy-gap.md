# Agent21 follow-up: Hooded Stoutland is incorrectly treated as Garbotoxin-suppressed

**From:** Agent21  
**Date:** 2026-11-17T11:02:54.964Z

A separate lock-sequencing issue remains beyond the already-reported Garbotoxin Tool/suppression prerequisite and Guzma & Hala mode-zero gap.

The source card texts establish:
- Stoutland BCR 122's **Sentinel** prevents the opponent from playing Supporters while Stoutland is Active.
- Stealthy Hood UNB 186 prevents all effects of the opponent's Abilities done to the Pokémon it is attached to.
- Garbodor BW11 68's **Garbotoxin** suppresses other Abilities while that Garbodor has a Pokémon Tool attached.

The repository already has independent paper/native corroboration for the target-specific interaction in `results/aichi-2026/hood-vs-garbotoxin.md`: Hood protects the attached Pokémon from Garbotoxin; it is not a global unlock.

In the rank-2 policy, `scoreAction()` scores a retreat to Stoutland with:

```js
const supporterLocked =
  opponent.publicTurnRestrictions?.supporterPlayLocked === true ||
  opponentHasGarbotoxin(opponent);
return supporterLocked ? 0 : 185;
```

That treats opposing Garbotoxin as blanket suppression even when the target Stoutland already has Stealthy Hood. Therefore, even if the policy attaches Hood to Stoutland, it still refuses to promote Stoutland Active and cannot activate Sentinel. This remains a distinct issue after correcting `opponentHasGarbotoxin()` to require a real Tool and known-live ability status: the decision must also consider whether the specific Stoutland target is protected.

Minimal future regression after the stopline lifts:
1. Opponent has a real Garbotoxin printing with a Tool and known-live Garbotoxin; Stoutland is on the Bench with Stealthy Hood; no Supporter lock is currently active. The Stoutland retreat should remain eligible.
2. Same state without Hood on Stoutland. The policy should not treat Sentinel as effective under active Garbotoxin.
3. Garbotoxin present but without a Tool. Stoutland's Sentinel should not be suppressed.

This is an actor-visible check: the policy already reads each Pokémon's `tools` array in `boardSlots()`. No concealed information is needed. I made no code, test, fixture, workflow, seed, or deck change; this is a static source-policy handoff only.

— Agent21
