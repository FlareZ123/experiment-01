# Original Aichi rank13 Regidrago: live first-turn Treasure payment arbitration

**Status: Native first-turn owner payment and search verified in original registered 60s. Two original-source payment variants, both fixed-seed physical orientations, four registered attempts. No complete competitively qualified games.**

## Actionable first-turn decision

The selected v8 original rank13 Regidrago versus rank3 Snorlax canary formerly chose Pass on its first rank13 owner root despite holding original-print Mysterious Treasure FLI. A default-OFF canonical owner policy `mysteriousTreasureRoot:true` now chooses the Item and can alternatively spend the source-registered Muscle Band XY by setting `mysteriousTreasureMuscleBandPayment:true`.

The actual exact original rank13 source state has Benched Regidrago V SIT, and held Mysterious Treasure FLI, Crispin SCR, Muscle Band XY, VS Seeker PHF and Battle Compressor PHF. Its initial first-player turn cannot play Crispin as a Supporter. Two legally prompted discard candidates are available:

| Policy branch | Physical Treasure payment | Immediate remaining resources after target search |
| --- | --- | --- |
| Existing narrow default | Crispin SCR | Muscle Band, VS Seeker, Battle Compressor and searched Regidrago VSTAR; Crispin in discard can be retrieved by VS Seeker |
| Experimental alternate | Muscle Band XY | Crispin, VS Seeker, Battle Compressor and searched Regidrago VSTAR |

These branches are genuinely different: reserving VS Seeker can preserve a future flexible Supporter retrieval, whereas preserving Muscle Band can change later damage thresholds. Neither has demonstrated superior end-to-end value.

## Actual source-registered live Store result

Shared manual [CI 42526465379](https://github.com/FlareZ123/experiment-01/actions/runs/42526465379) passed code/build and four registered native canary attempts. It found the exact source Treasure opportunity only in candidate physical seat 1; source seat 0 had a different first hand and remained an explicit quarantined control. Both arms and both orientations were registered; same printed opponent and candidate deck SHA pairs and source seed. Same-seed runs are not independently certified to have identical physical card deals.

The strict read-only Store-zone upgrade [CI 42527225044](https://github.com/FlareZ123/experiment-01/actions/runs/42527225044), artifact 13635773051, **passed**. The native source prompts were 8 (mandatory one-card owner-hand payment) and 9 (owner-deck Dragon search). Four physical selected-card transitions were accepted and checked:

| Executed rank13 seat1 branch | Card object selected | Native validated before | Exact physical zone afterward |
| --- | --- | --- | --- |
| Crispin payment | Crispin SCR, id 85 | In owner hand, absent from discard | Absent from owner hand, present in owner discard |
| Muscle Band payment | Muscle Band XY, id 107 | In owner hand, absent from discard | Absent from owner hand, present in owner discard |
| Crispin branch owner search | Regidrago VSTAR SIT, id 66 | In owner deck, absent from hand | Absent from owner deck, present in owner hand |
| Muscle Band branch owner search | Regidrago VSTAR SIT, id 66 | In owner deck, absent from hand | Absent from owner deck, present in owner hand |

All four transitions were from the real pinned Store, matching the actual same physical card object before and after. The source-registered 128-root cap did not reach a complete game. The two rank13 seat1 source attempts subsequently recorded 14 accepted native roots and quarantined the first unsupported owner decision. Opponent source was an original 60-card rank3 Snorlax list, but complete meaningful replies and paper adjudication were not qualified.

## Strategic discovery and next integration

The same exact source trace exposes an immediate recipient failure after Treasure: the common actor policy attaches held Grass Energy MEE to Active Dedenne-GX while an energy-free Regidrago V SIT remains Benched. Grass could instead start Regidrago's future attachment plan and satisfy Regidrago V's printed Colorless Celestial Roar cost. The first player cannot attack during the first turn. I added an independent default-OFF actor-visible `firstRegidragoBenchGrass` proposal and a registered native two-seat comparison, keeping the existing policy default and Agent2's separately evolving owner Mail follow-up.

**Prioritize** real source-game progression through the next own turn and meaningful opponent reply, then compare preserving the Muscle Band's damage breakpoint versus retaining the VS Seeker resource under matchup-specific conditions. Neither setup probability nor connectivity alone settles the card choice.

## Reproducible location and strict limits

- Shared canonical chooser: `simulation/twinleaf/agent34-actor-only-root-policy.cjs`
- Opt-in discard decision: `simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs`
- Source registered pair: `simulation/evaluation/agent49/treasure-payment-pair.cjs`
- Read-only physical zone observer: `simulation/twinleaf/agent49/treasure-payment-zone-observer.cjs`
- Original rank13/3 two-seat runner: `simulation/evaluation/agent2-v8-common-first-owner-root-canary.cjs`
- Existing manual workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`
- Exact pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Printed source roster is the published rank13 and rank3 original 60 each. Japanese physical printing admission remains provisional.
- No dynamic source-deck introspection before legal owner-deck prompt, no hidden opponent hand or Prize identities, no final elected fixed60, **0** competitively qualified full games, and no evidence that the 99.5% benchmark is achieved.

This is a native tactical choice with certified physical transitions. It is not a qualified matchup win-rate experiment.
