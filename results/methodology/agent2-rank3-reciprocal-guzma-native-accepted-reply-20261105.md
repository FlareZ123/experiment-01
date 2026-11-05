# Rank-3 reciprocal Guzma: actual native execution

**5 November 2026, Agent 2.** Zero competitively qualified paper games.

[CI 41967654243](https://github.com/FlareZ123/experiment-01/actions/runs/41967654243) **SUCCESS**, head `365e6b3d1c21c2378ab8c904a9ee9d609ba39b83`, artifact [13388793662](https://github.com/FlareZ123/experiment-01/actions/runs/41967654243/artifacts/13388793662), ZIP SHA `ef4aeb345dd47735869ce10afebd16f4166cc19bfee17bb37c79aa258a4bdf8f`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Fixed original 60-card rank3 Snorlax Stall seat0 versus rank1 Shadow Rider seat1, seed290134, all arms same full physical deal `e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb` and source fingerprint `ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a`. All six native controls true.

- Original control and repeat: rank3 deck-out win turn25, 133 actions, 12 Burrow, 11 rank1 Filch; exact root ledger repeated.
- Rank1 turn3 held Guzma only: rank3 native win turn87, 354 actions, one Burrow.
- Separately archived rank1 turn3 Guzma plus VMAX at turn29: rank1 native six-Prize win turn39, six Max Geist, [earlier CI](https://github.com/FlareZ123/experiment-01/actions/runs/41939024832).
- **Rank3 reciprocal held Guzma at turn16, rank1 held Guzma turn3 and contingent rank1 VMAX still enabled:** rank3 native deck-out win turn51, 238 actions, **19 total Burrow**, four rank1 Shadow Mist; both six Prizes, rank1 deck0, rank3 deck21.

Native rank3 Guzma root ordinal73 used genuine hand index9 and owner Supporter count0. Native validated prompt49 chose opposing `Dialga-GX UPR` (four legal choices); native prompt50 chose own `Bunnelby PRC` (three choices); rank3 attacked `Burrow` on turn16, root76. The 19 Burrows include one on turn2 plus 18 at even turns16–50, once per turn. Native Ω Barrage follow-through is still incomplete.

The rank1 native VMAX hook selected **zero evolution roots** after rank3 Guzma changed the active position. Thus this is a meaningful **conditional policy** counterexample, not a claim of defeating a competent rank1 opponent. Original player lists, native source/candidate scripting, paper costs, full field, match clock and opponent continuation remain unqualified.

Code: [reciprocal runner](../../simulation/evaluation/agent2-rank3-reciprocal-guzma-abaca.cjs), [owner native adapter](../../simulation/twinleaf/agent2-rank3-owned-guzma-reply.cjs). Later source revisions after the archived head require separate verification.
