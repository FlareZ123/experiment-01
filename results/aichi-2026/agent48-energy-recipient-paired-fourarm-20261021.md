# Agent 48: registered same-revision bilateral Basic Energy recipient A/B, 21 October 2026

**Status: native executed, 3/4 analyzable rows per arm, both compiled jobs intentionally failed their fail-closed four-row guard. No competitively qualified games.** This is a development negative/mixed-result packet, not a candidate selection or paper-rule certification.

## Registration and reproducibility

Executed the already [registered Agent 44 Basic Energy recipient comparison](agent44-actor-energy-recipient-joint-contrast-registration-20261021.md) without changing either fixed 60, source list, native engine pin, or runner code. A dedicated immutable experiment branch `agent48/registered-energy-recipient-pair-20261021` points to exact repository checkout **`cbb2474be15a9a9e07da5b9a0c37e56d812657f0`** for **both** manually dispatched runs. Twinleaf pin reported by executable: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Registration selection remains historical, not prospective.

- **OFF/control**: [run 39619187219](https://github.com/FlareZ123/experiment-01/actions/runs/39619187219), [artifact 12353683804](https://github.com/FlareZ123/experiment-01/actions/runs/39619187219/artifacts/12353683804), ZIP SHA-256 `5365969e597adc5068d1511f99a26f10935f2afb4e58bd617b0145eb98c7b9c7`.
- **ON/treatment**: [run 39619220430](https://github.com/FlareZ123/experiment-01/actions/runs/39619220430), [artifact 12354178065](https://github.com/FlareZ123/experiment-01/actions/runs/39619220430/artifacts/12354178065), ZIP SHA-256 `7dcf0bf589f7759784f7494bbf23f22825be06437484d800e05dce3105ee765a`.

Both dispatches enabled `energy_frontier`, `owner_single_search`, `special_energy_root`, `actor_hand_discard`, `actor_choose_pokemon`, `actor_quick_ball_root`, and `native_generic_fallback`. The canonical actor composition, mandatory native options, native pressure audit, and paper Supporter guard were on identically. Both had `paper_cologne_quota=false`, `actor_paid_retreat=false`, and all other experimental knobs off. The **only changed input** was `actor_energy_recipient` false versus true. Each run requested the same four already-registered historical rank-6/rank-11 arms and used physical candidate seats A/B respectively.

## Failure-inclusive paired results

| Actual attempted arm | OFF | ON | Same source physical fingerprint |
| --- | --- | --- | --- |
| Rank 6, candidate champion reference, seat A | Postprocessing `engine-error`: native sudden-death turn 4→0 crossing rejected by `buildBilateralReplyPacket` at root 38/116 | Identical postprocessing error and identical raw 116-root action ledger | Not emitted by failed row; do not silently count certified |
| Rank 6, New Moon, seat A | 94 roots, engine terminal for source seat B, final Prizes [6,0] | Exactly the same 94 roots, terminal and Prizes | **Yes**, `2ce05954…` |
| Rank 11, champion reference, seat B | 260-root action cap, [6,6] Prizes, 22 recorded Get Lost candidate attacks | 260-root cap, [6,6] Prizes, same 22 attacks | **Yes**, `9bc69d70…` |
| Rank 11, New Moon, seat B | 260-root action cap, [6,6] Prizes, 20 recorded Future Sight candidate attacks | 260-root cap, [6,6] Prizes, same 20 attacks | **Yes**, `9bc69d70…` |

Both CI jobs report **3/4** completed actor coverage records, fail the existing `actorOnlyCellsWithAudits===4` assertion, and still upload the complete observed JSON. Their pure adapter tests passed; the compiled four-arm qualification guard **did not**. Exact source-line evidence and 32-matchup performance remain unqualified.

The root-38 failure is an **epoch boundary**: accepted `ResolvePromptAction/WaitPrompt` switches turn index 4→0 during native sudden-death handling. The bilateral reply attestor refuses a nonchronological root. Both runs observed the identical aborted source branch. Do not relax that assertion or treat a tiebreak epoch as a fresh independent game without authentic epoch partitioning.

## Consequential state mutation without Prize conversion

The ON mode made **11 accepted Bench-directed Basic Energy recipient intents** across the two rank-11 rows (eight in champion, three in New Moon); the native root receipts report public-zone changes and `confirmed-public-effect`. Their printed-card board snapshots visibly differ:

| Rank-11 candidate and seat | OFF final Active Energy / other attached on Bench | ON final Active Energy / other attached on Bench |
| --- | --- | --- |
| Champion, source Mega Absol ex | 4 / 0 | 2 / 2 |
| Champion, candidate Girafarig | 8 / 0 | 1 / 7 |
| New Moon, source Mega Absol ex | 3 / 0 | 2 / 1 |
| New Moon, candidate Duskull | 3 / 0 | 1 / 2 |

Counts are *cards attached on the visible final board*, not Energy units or qualified playable attacks. The current recipient policy changes **both players**, including redirecting the opponent's Darkness attachments off Mega Absol ex; this can weaken authentic source pressure. Printed attack choices and all Prize counts remain unchanged in these two stalled arms. Energy redirection alone did **not** cure the repeated low-impact attacks or action-limit censor, and the potential later attack feasibility of the newly funded Benched Pokémon was not executed.

## First causally located physical divergences

The recorded `detailedComponentAudits.root.nativeRootAcceptances` arrays offer a stronger action-level paired witness than the root-skeleton ledger. In rank11 champion, the **first public-zone divergence** is native actor-root acceptance **index 4**, candidate global turn **3**: same before-`publicZonesSha256`, the OFF policy attaches held Psychic Energy to its **Active** by generic Basic route, while ON selects **Bench index 0 Shadow Rider Calyrex V** with the printed Shadow Mist completion frontier. Both accepted the `PlayCardAction`, then the actual public-zone hashes differed. Rank11 New Moon remains physically equal through native actor-root acceptance index 40, first differing at **index 41, candidate turn 33**: ON attaches Psychic Energy to **Bench index 2**, selecting Future Sight's displayed gap, while OFF attaches generically to its Active. These are zero-based indices into each actor audit's accepted-root receipt array, **not** global Store action ordinals.

The game-facing Store accepted both versions at the same actor choice positions; the difference was the *attachment recipient*. This pinpoints the earliest state divergence without assuming that every later board/card state remained identical, and substantiates the recipient-controlled claim through independent pre/post public-zone digests.

## A concrete transcript-integrity caveat

**All four OFF/ON row pairs have identical `rootActionLedgerSha256` and identical serialized `rootActionLedger`** despite the visibly changed rank-11 final boards and native actor Energy target intent fields. Thus the existing root-ledger digest verifies the recorded root action classes/sequence, **not complete action target or Store/public-board equivalence**. A source-deal fingerprint separately constrains the physical deal but does not close this action-semantic gap. For policy-comparison integrity, check actual chosen recipient and Store-resolved public transitions, not ledger SHA equality alone. This is a directly reproduced limitation rather than a hypothetical hash break.

## Integration implication

The registered narrow result is mixed: **yes**, actor-visible recipient routing can move accepted Basic attachments to the Bench and change physical board; **no**, it made no Prize or useful attack-sequencing progress in rank 11. The rank-6 champion epoch attestor abort prevents a complete four-arm attested pair. The next policy test should join an actual reachable switch/retreat and attacking sequence with the funded attacker, retaining symmetric source policy and explicit pressure, while preserving the exact original negative fixtures. The existing canonical runner is the integration point. Do not proliferate a separate game executable or infer a competitive win from these development endpoints.

**Evidence class:** two compiled native same-commit, same-source-deal, deliberately failed-CI A/B development runs; no prospective opponent adaptation, no validated paper clock, no opponent competence assurance, no head-to-head field-wide claims; **0 qualified competitive games**.
