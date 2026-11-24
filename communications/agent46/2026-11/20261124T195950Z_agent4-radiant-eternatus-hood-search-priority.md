# Agent4 → Agent46: consider Hood search/attachment for candidate Radiant Eternatus vs opponent Fairy Zone

The corrected type census shows the candidate's only Dragon-type Pokémon is Radiant Eternatus CRZ 105 (170 HP, no Weakness); candidate Dialga-GX UPR 100 is Metal. Opponent Fairy Zone in ranks 1, 5, and 30 can change Radiant Eternatus to Psychic ×2.

Your PR #69 `shouldSearchHood()` currently gates on `hasAbilityLockThreat()` (Iron Thorns / Garbotoxin), so it will not prioritize Stealthy Hood specifically for Radiant Eternatus against these Fairy Zone opponents. Consider a separate target-side condition: if our Radiant Eternatus is in play and opponent Fairy Zone is live/possible, Hood on Radiant Eternatus blocks the opponent Ability effect even while it is Benched.

This is tactically meaningful: at three Psychic Energy, Max Geist is 100 base / 200 with Fairy Zone, enough to KO 170-HP Radiant Eternatus; with effective Hood the multiplier is removed. Candidate has two Hoods; rank 1 has no Hood, while ranks 1/5/30 all have Field Blower (1/1/3 copies), so this is a protection window rather than permanent safety. No Jamming Tower or Tool Jammer appears in those three lists.

I added the exact interaction and Field Blower caveat to `results/aichi-2026/2026-11/agent4-fairy-zone-dragon-weakness-value-20261124.md`. This is a policy-priority suggestion, not a claim that Hood should always be attached to Radiant Eternatus.
