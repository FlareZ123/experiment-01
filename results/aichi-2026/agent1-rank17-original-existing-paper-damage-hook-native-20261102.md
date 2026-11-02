# Original rank17 against fixed opponents: full native replay with Agent46 paper-damage hook

**Agent 1 | 2 November 2026 | one previously known four-seed source schedule, eight original 60 trials | zero competitive-qualified games.**

## What changed

The original authenticated Yuya Yamano rank17 Alolan Raichu/Electrode 60 was held fixed across two unchanged opponent candidates, champion-reference rank1 Shadow Rider and New Moon Lockbreaker v1, both physical seats, original registration seeds `3205004075`, `1975817274`, `3186938867`, `2082256034`. Symmetric actor root `actorNaturalEvolutionRoot:true` was enabled in all arms. This is a replay of the **previously analyzed developmental seeds**, not an independent blind validation. Exactly one simulator semantics component was changed: the already-established **Agent46** research-only `withElectroRainDamageHook` in `simulation/twinleaf/electro-rain-damage-hook.cjs`. It converts Electro Rain's originally incorrect counter placement to printed attack damage, aggregating repeated target rows so once-per-target attack damage modifiers are not erroneously multiplied. Pinned vendor unchanged `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Additional policy gap from code inspection

The actor-only root decoder in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` explicitly emits native Ability actions for Genesect Fusion draw, Unown Farewell Letter and Perfection. It has no `Extra Energy Bomb` intent/action case. Other native fallback decisions might still use that Ability, but the opt-in owner root cannot independently select it. This is consistent with the observed **zero** original Electrode-GX Extra Energy Bomb Ability roots. Future root policies must validate actual Ability availability, recipient, discard Energy transfer, self-KO, opponent Prize collection and the following attack.

## Native witness audit

[Successful rerun 41443947556](https://github.com/FlareZ123/experiment-01/actions/runs/41443947556) executed all **eight** registered original-source arms, archived the full raw JSON in [artifact 13142300129](https://github.com/FlareZ123/experiment-01/actions/runs/41443947556/artifacts/13142300129), compressed ZIP SHA256 `fee751aa204440a9e740c26d29e735a3a92b1ae53fde81d6bbfba25eeeafb7ea`, execution code head `1d389cf08b5b67d81818ab58a30e28c1f1a017bb`. Its actual post-Store accepted public root ledger reports:

| Source-rank17 original event, eight arms | Observed with established correction |
| --- | ---: |
| Accepted Stage1 natural evolution roots (Alolan Raichu or Electrode-GX) | **7** |
| Arms with at least one such evolution | **4 of 8** |
| Accepted original Alolan Raichu **Electro Rain attack** roots | **1** at global T22, ordinal103 |
| Accepted original Electrode-GX **Extra Energy Bomb** Ability roots | **0** |
| Native games terminating | **5 of 8** |
| Native nonterminal/censored records | **3 of 8** |
| Competitively qualified paper matches | **0** |

The Electro Rain root occurred on the original rank17 source in **physical seat 1**, repeat1 group source seed `3186938867`, versus New Moon in seat0. The source first evolved Alolan Raichu on T4 and Electrode-GX on T6, and attacked with Electro Rain on T22. Same original source seed/seat versus the Shadow Rider reference instead produced an Alolan Raichu T4 and Electrode-GX T6 but no Electro Rain declaration. This is direct matchup-dependent **policy action coverage** within the original source list, with no Ability acceleration demonstration.

Each of four registered seed/seat groups yields an identical native original-source setup fingerprint across the two opponent candidate identities:

- repeat0 source seat1: `a8b5193c69ba4f91266a682890f10801b779f2ad04cbddc738a72a02e64e4f7d`;
- repeat0 source seat0: `7380cdaffb8475163bdea9643c4d5cb73df96ff3c213744fd299ecdcf5ad28e7`;
- repeat1 source seat1: `390aa1097a4eec53f2a5309c1d480c3d3f82986c9828f43caf9d9ff245d27c97`;
- repeat1 source seat0: `e52505a73eb291d900f7716aa58f7cd57cd4287e1fdaa305e1c4c9253d15fc7b`.

This confirms repeatable **original source openings** inside the corrected replay, and preserves physical provenance. It does not imply full two-player deals coincide across different candidate lists, and the opponent decision policies are currently unqualified.

A preliminary failed run [41442211139](https://github.com/FlareZ123/experiment-01/actions/runs/41442211139) lacked the already-registered manifest file in the isolated experiment branch and failed before any match. That missing reference was repaired. A preliminary successful [41442517713](https://github.com/FlareZ123/experiment-01/actions/runs/41442517713) used Agent 1's narrower **superseded** provisional hook, reporting one conversion from 60 to 60 applied nominal points. The broader correct replay then passed [41443111114](https://github.com/FlareZ123/experiment-01/actions/runs/41443111114), followed by the rerun above with exact per-seat public root evidence. Use **Agent46's established hook**, not the unaggregated provisional one.

The direct follow-on source policy experiment was [prospectively registered earlier](registrations/agent1-rank17-prospective-evolution-policy-20261102.json) and independently made 7 stage1 evolution plays versus 0 in frozen v2. The corrected replay reuses those favorable developmental cases and is **observational**. A genuine competitive evaluation additionally needs actual legal Energy attachment and Extra Energy Bomb choice, print-faithful attack and prize settlement, two capable players, hidden-information safety, and authentic 25-minute end-time adjudication. The original Aichi field still has **29/32** authenticated original sixties and **0** qualified games. No 99.5% claim.
