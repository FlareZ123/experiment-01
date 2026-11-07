# Agent44: v9 Box/Fog native step failed on a new treatment ledger, not on the KO

**Run:** [42354244670](https://github.com/FlareZ123/experiment-01/actions/runs/42354244670)  
**Job:** 128348718372  
**Artifact:** 13566957017, `agent36-v9-42354244670.zip`  
**Date:** 7 November 2026

## Executive finding

The failed workflow step is explained by a fail-closed frozen-ledger assertion in `simulation/evaluation/agent43-native-box-ko-postsettlement-audit.cjs`. The current treatment did execute the Secret Box → Fog Crystal → Basic Psychic attachment → Hidden Power line and took a Prize. Its root-action ledger differs from the previously frozen treatment, so the old audit correctly refuses to certify the changed run under the old receipt.

This is a new treatment behavior that needs its own registration and evidence. It is not evidence that the one-Energy KO failed.

## Reproduction evidence

The current artifact contains `attempt.json` and `baseline.json`. The script failed before writing `settlement-audit.json`.

Current attempt:

- Trial: `11:1000:B:new-moon-lockbreaker-v1`
- Seed: `626469135`
- Physical source/candidate seats: 0 / 1
- Root actions: 260
- Outcome: `action-cap`
- Qualification: `root-cap-unqualified`
- Computed treatment ledger SHA-256: `d7d90456c2ab3ea174dd39afc6fd07bba99e30251e64935539b7ebaabb33973b`

The audit helper's frozen v1 expectation remains:

- `FROZEN.treatedLedger`: `a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e`

The previous run [42345161486](https://github.com/FlareZ123/experiment-01/actions/runs/42345161486) contains a successful `settlement-audit.json` with that exact frozen treatment hash. The current treatment hash differs, so the current `assert.equal(ledgerSha256(a.rootActionLedger), FROZEN.treatedLedger)` fails before the later settlement checks. The audit is behaving as a strict receipt gate.

## What actually happened in the current treatment

The current and previous 260-action ledgers are identical through action ordinal 120. The first difference is action ordinal 121, turn 18, candidate seat 1:

- Current treatment: plays `Gengar & Mimikyu-GX`.
- Frozen v1 treatment: plays `Solrock`.

The current treatment's root action ordinal 104 is still the Box/Fog attack line:

1. The candidate pays Secret Box with two physical Battle VIP Pass and one physical Rescue Carrier.
2. Secret Box resolves and selects Fog Crystal, Powerglass, Ace Trainer and Sky Field.
3. Fog Crystal selects a Basic Psychic Energy.
4. The candidate physically attaches the Basic Psychic Energy to its Active Unown.
5. Unown declares Hidden Power against the Active Trubbish.

The independent `candidateAttackSettlement` records the attack as settled, the source Active as Trubbish FST with 60 damage on 70 HP before the attack, the source post-attack Active as Tapu Lele-GX, and the candidate's Prize count changing from 6 to 5. The one-Prize KO therefore occurred.

The source's next turn in the current treatment played Mega Absol ex and passed without an attack. The game later reached the 260-root cap with no terminal winner; final Prize counts were source 5 and candidate 3. This remains an incomplete, unqualified game.

## Audit-field caveat

The current `nativeAdapterAudit.agent43OneEnergyBoxKo.actions` entry for the attack records `ownerPrizeBefore: 6` and `ownerPrizeAfter: 6`, while the independent settled-attack observer records the candidate's Prize count as 6 → 5.

The adapter's `ownerPrizeAfter` is sampled immediately after root dispatch, before the attack's asynchronous prompt/effect settlement has completed. It should be labelled as a dispatch-time snapshot or populated from the later settled-attack observer. Do not use that field to contradict the settled Prize transition.

## Required next step

1. Keep the frozen v1 receipt and `FROZEN.treatedLedger` unchanged.
2. If the turn-18 Gengar & Mimikyu choice is intended new policy behavior, register a new treatment/version with its own policy hash, root-ledger hash, and postsettlement receipt. Do not silently rewrite the v1 audit.
3. If the purpose is exact v1 reproduction, rerun the frozen policy code and require the original `a6d3...` ledger.
4. Clarify dispatch-time versus settled Prize fields in the native adapter audit.
5. Continue through a complete terminal game against the source response. The current run is action-capped and cannot support a matchup or win-rate claim.

No competitive game is qualified by this run, and no 99.5% claim follows.
