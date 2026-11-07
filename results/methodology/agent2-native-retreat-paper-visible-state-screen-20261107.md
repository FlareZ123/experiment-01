# Agent 2: paper retreat necessity screen for one genuine historical native action

**7 November 2026 · historical original physical deal · one selected action · zero qualified games**

## Question

Did the exact native selected, Store-accepted **rank-1 Shadow Rider / seat-1 turn-33** paid RetreatAction in the previous original rank-3 Snorlax Stall game have a *publicly visible paper-rule reason to fail*? The earlier physical-identity receipt proved exact motion and a three-Basic-Energy discard, but neither a comparison of printing strings nor a successful native dispatch is an independent paper-law determination.

The preconditions and extra observation were preregistered before each native rerun:
- [Basic physical custody](registrations/agent2-paid-retreat-basic-physical-native-canary-20261107.md).
- [Public decision context](registrations/agent2-retreat-pre-action-public-context-20261107.md).
- [Full owner-Bench scope](registrations/agent2-retreat-own-bench-effective-cost-20261107.md).

All runs replayed the **same original rank-3 seat0 / original rank-1 seat1 printed 60s** under seed **290134**, pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, 520-action cap and the unchanged policies. No resampling or deck comparison.

## Full owner-visible board at the exact selected root

The canonical detached `actorObservation` was captured on the same real typed `RetreatAction` object before native `Store.dispatch`. The five owner Bench slots and opposing Bench slots were retained **without removing empty positions**.

| Paper-rule consideration | Exact pre-Root observation | Interpretation |
| --- | --- | --- |
| Actor and turn | Seat 1, global turn 33; `ownRetreatedTurn=0` | No same-turn retreat recorded. |
| Retreating Active | **Dialga-GX UPR**, three printed Colorless cost symbols | Printed three-Energy fee. |
| Attached Energy on Dialga | Three exact physical **Psychic Energy MEE** cards | Three single-unit Basic Energy cards can pay the printed Colorless fee. |
| Attached Tool, status and direct restrictions | No Tool; no Special Condition; `cannotRetreatNextTurn=false`, `cannotRetreatWhileActive=false` | No tracked direct prohibition or Tool-based fee change. |
| Intended new Active | **Shadow Rider Calyrex V CRE** in its original physical Bench slot | Same *physical card object* promoted by native acceptance. |
| Own Bench | Mimikyu GRI; two Shadow Rider Calyrex V CRE; Lillie's Clefairy ex JTG; Girafarig LOT | **Latias ex is absent.** No Skyliner Ability is in play. Clefairy's Fairy Zone modifies Weakness, not retreat. |
| Opposing Active | **Bunnelby PRC**, Barrage Ability | No Active-based retreat lock from this Pokémon. |
| Opposing Bench | **Snorlax PGO** (Block), Galarian Stunfisk SSH (Snap Trap), Rotom V LOR (Instant Charge), Girafarig LOT; fifth empty | Snorlax Block and Stunfisk Snap Trap both explicitly require the Pokémon to be **Active**; here both are Benched. Other listed Abilities do not prohibit retreat. |
| Stadiums | None on either side | No Stadium-based modifier observed. |
| Real action effect | Exactly 1 selected and 1 accepted Store `RetreatAction`; three **same physical** Psychic Energy objects newly in owner's discard; outgoing and target physical identities exact; damage and target attachments preserved | Consistent with a paid three-Colorless retreat. |

Rules cross-check: `resources/manual/EN_advanced_manual-2025-transcription-structured.md` A-03 permits one normal retreat per turn with enough Energy to discard for the effective retreat cost, subject to Asleep/Paralyzed and other preventing effects. `resources/cards/en/sm5.json` (Dialga-GX UPR 100) prints three Colorless retreat. `resources/cards/en/pgo.json` (Snorlax PGO 55) prints Block only **as long as this Pokémon is in the Active Spot**. `resources/cards/en/sv8.json` (Latias ex SSP 76) prints Skyliner removing the Retreat Cost of one's Basic Pokémon if it is in play. It is **not in play** in this observed state. The only other visible opponent Ability potentially relevant to a forced Energy discard is Snap Trap, which requires Galarian Stunfisk to be Active and damaged by an attack.

## Native evidence and disposition

- [CI 42409546955](https://github.com/FlareZ123/experiment-01/actions/runs/42409546955): original action-object and physical Energy payment receipt, full original-deal and root-ledger fingerprint guards all passed.
- [CI 42410754714](https://github.com/FlareZ123/experiment-01/actions/runs/42410754714), native stdout artifact **13589905221**: printed actor Active, both Stadiums and full opponent Bench, success.
- [CI 42411067910](https://github.com/FlareZ123/experiment-01/actions/runs/42411067910), native stdout artifact **13588619660**: added **all owner Bench** printings, abilities, Energy/Tools; both pure and compiled native jobs passed; the public-only `AGENT2_PUBLIC_RETREAT_CONTEXT` line is directly auditable in the native job log. Historical frozen source physical deal and complete native root ledger pass the same original checks.
- Previous [native report](agent2-native-basic-retreat-physical-identity-20261107.md) documents the object-reference receipt. Eight pure tests include a same-printing different-physical-card rejection.

**Disposition:** For this precise action, the observed full public board, printed card texts and original source 60 support the ordinary *paper-rule preconditions* of a three-Basic-Energy paid retreat. The actual native result is consistent with those requirements; no relevant visible retreat prohibition or free-cost Skyliner was present. This is a strong **single-action paper-consistency sanity check**. It does not certify the engine's correctness for every card and lingering attack effect, all future retreat decisions, a competent opponent, or an entire paper-valid match. No performance difference was measured.

**Collective qualification:** 29/32 authenticated original opponent 60s; three missing original lists; **0 qualified competitive games**, no selected final fixed 60, no demonstrated field win-rate estimate. Future common policy work may reuse this specific native receipt as a validated restricted settlement example without generalizing it to untouched games.
