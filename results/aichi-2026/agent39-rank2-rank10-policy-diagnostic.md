# Agent 39: rank-2 Vileplume and rank-10 Regidrago bounded policy diagnostic

**Date:** 2026-10-16 UTC. **Status:** exploratory engine and bot-policy evidence only; zero qualified competitive outcomes.

## Provenance

- [Manual GitHub Actions run 38845353476](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476) finished successfully; downloaded artifact `aichi-campaign-diagnostic`, ID **12023246166**, GitHub ZIP digest `sha256:35ed9e01b55ba4c7634940aabe84297f0ae9892000b1933e48c3953d0177e7ab`.
- Exact frozen plan digest: `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`; research source commit `0d1c18f744f1f16561a2657e2918b19582701fd7`; pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- `campaignSchemaVersion=2`; `seedProtocol=independent-slots-v2`; `maxActions=600`; policy flags include `strictPromptValidation`, `forestSealSearchCorrection`, `doubleDragonRecovery`, `supporterDecisionCorrection`, `isolatePolicyRandomness`, `captureDecisionTrace`, `leleEntryAbilityLockCorrection`, and `radiantGateLockCorrection`. `shadowRiderEnergyPriority=false`.
- Exactly three fixed candidates: champion-reference, hood-shield-v1, temple-v1. Two physical engine slots per opponent/candidate. All 12 were `completed-engine-game`. All 12 chronological trace digests valid, **none** captures a complete event-and-prompt replay. All 12 qualification flags remain false. The archive contains **1,222 captured meaningful action events**, not necessarily all game actions.

## Observed action and board diagnosis

| Rank | Candidate | A: candidate attacks / opponent attacks | B: candidate attacks / opponent attacks | Zero-attack candidate trials |
| --- | --- | ---: | ---: | ---: |
| 2 Vileplume | Champion | 11 / 2 | 6 / 8 | 0 |
| 2 Vileplume | Hood | 2 / 1 | 4 / 13 | 0 |
| 2 Vileplume | Temple | 3 / 4 | 17 / 3 | 0 |
| 10 Regidrago | Champion | **0 / 7** | 5 / 1 | **1** |
| 10 Regidrago | Hood | 4 / 8 | 8 / 6 | 0 |
| 10 Regidrago | Temple | **0 / 7** | 5 / 5 | **1** |

In the rank-2 trials, slot A's *candidate* went **second** and slot B's candidate went **first**. In rank 10, slot A went **first** and slot B **second**, independently corroborated by the first-draw log. Thus engine-slot labels should never be used as proxies for starting order.

All six rank-2 and six rank-10 games ended without an empty deck on either terminal board, unlike the earlier rank-6 diagnostic. The terminal Prize totals are mechanically observed, but must not be interpreted as calibrated wins or archetype performance. The quality report detects no zero-attack opponent trajectories in these 12 games.

### Repeated active-position / Energy allocation symptoms (rank 10, candidate slot A)

**Champion reference, seed 20371256:** At its first recorded own pass on turn 1, the champion had Active Latias ex with one Psychic Energy, plus two benched Shadow Rider Calyrex V with no Energy, and no candidate attack. At turns 3, 5 and 7, Latias remained Active; Energy was also assigned to Tapu Lele-GX and Latias. By turn 11 an Active Shadow Rider Calyrex VMAX had **zero Energy**, with zero candidate attacks through game end (turn 14); opponent recorded seven attacks.

**Temple v1, the same slot seed 20371256:** Its first own pass had Active Dialga-GX with **no Energy**, with a benched Shadow Rider Calyrex V unpowered and a benched Lillie's Clefairy ex holding the Psychic Energy. Subsequent own passes showed Active Latias ex with one or two Energy; later Shadow Rider VMAX was Active with zero Energy. This candidate likewise recorded zero attacks across 13 turns while Regidrago attacked seven times.

**Hood v1, the same slot seed:** Started with Active Latias ex holding one Psychic Energy and benched unpowered Shadow Rider V, but eventually moved to an attacking line (one Eon Blade and three Max Geist) after multiple pass turns. Different candidate deck contents mean that equal numeric seeds do not equate starting hands or matching decisions.

These are observed decisions and public boards, not proof that a particular move or retreat was legal at an omitted decision point. The trace lacks a complete enumeration of legal options and resolved cost-bearing decisions. They motivate a reproducible **starter-selection, Energy-targeting and Active-retreat opportunity audit**, especially for early turns against rank-10 Regidrago.

## Integrity improvement applied after this run

[The quality-screen module](../../scripts/aichi-campaign-quality-screen.cjs) previously accepted an archive merely because its record count matched `totalScheduled` and trial IDs were pairwise distinct. An otherwise superficially valid archive could omit a rank/candidate/slot cell while introducing a different unique string. Agent 39 added strict reconstruction of the full rank × candidate × repeat × A/B Cartesian product, trial identity/phase checks, opponent digest agreement within rank, matched seeds across candidates, and distinct A/B seeds for independent-slot v2. [Regression tests](../../tests/aichi-campaign-quality-screen.test.cjs) cover omission, mismatched seeds, opponent drift and malformed identity. The raw run above predates these guard changes; its original source execution contains its own fixed-plan identity check. Do not confuse the post-run check with cryptographic proof of complete semantic replay.

**Next:** Confirm new quality-screen tests in manual CI; inspect rank-10 first-turn starter/attachment choices with explicit legal-action evidence, and compare a controlled counterpolicy under identical fixed decks and seeds. Keep a source-locked archive before drawing any conclusions.
