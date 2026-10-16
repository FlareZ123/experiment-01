# Agent 44: v3 rank-10 post-choice pass probe and noninterference

**16 October 2026 UTC.** Evidence class: exact pinned-engine attack-announcement probes at recorded source states and deterministic action-signature comparison. **No qualified game wins.**

## Provenance

[Manual bounded workflow 38853671870](https://github.com/FlareZ123/experiment-01/actions/runs/38853671870) succeeded under `seat_seed_protocol=decorrelated-slots-v3`, `pilot_ranks=10`, `audit_passed_attacks=true`, `shadow_rider_opening_pivot=false`, and a fixed-core decision policy. Complete diagnostic ZIP artifact **12026009950** contains the six rank-10 source-locked records, quality screen and pass-attack probe ledger. The previous six-game [baseline 38852887516](https://github.com/FlareZ123/experiment-01/actions/runs/38852887516), artifact **12025629963**, used the same fixed plan digest `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`, candidate inventories, opponent inventory and physical-slot seeds, with pass probes disabled.

The later archive includes `seedBase=20261016`; the quality screen independently rederives v3 physical-seat seeds when that field is present.

## Actual read-only pass probe

The source-grounded post-choice probe recorded **51 PassTurnAction events**. It inspected **23**, skipped **28**, and returned **zero probe errors**. In **two distinct trials** it showed the pinned Store would accept a printed `Retribution Strike` `AttackAction` at the exact point where the opponent's current policy passed:

- `pilot:10:0:champion-reference:A`, opponent side, global turn 5.
- `pilot:10:0:hood-shield-v1:A`, opponent side, global turn 5.

In both, the opponent's Active was **Koraidon ex** with one attached Double Dragon Energy and Muscle Band. The pinned engine accepted the printed two-Colorless-cost `Retribution Strike` declaration on an isolated clone. This is stronger than a printed cost heuristic: the detached Store included its current effect state. It proves the existing bot passed on an engine-legal attack announcement in those source states. Whether attacking would have improved game success is not tested. These two passes belong to different source-locked candidate games, and they should not be pooled as independent competitive matchup games.

None of the sampled candidate passes in the zero-attack Temple A record produced an accepted attack in this bounded pass audit. That **does not** prove no useful alternative line earlier in the turn. In particular, resource placement during a preceding `PlayCardAction` may foreclose an attack before the probe is applied.

## Noninterference check

I inspected the two downloaded ZIP archives locally, parsed every `chronologicalActionTrace`, removed only the newly introduced `attackPassProbe` annotation from the probe-enabled traces, and compared the remaining JSON objects one-for-one. All **six** source-game action sequences matched the unprobed baseline **exactly**, including their captured action ordinals, named actions, cards, attacks, turns and existing public/pass evidence; the lengths were **87, 75, 51, 99, 78, and 48 events**. Original trace digests naturally differ because the optional attack-probe annotations change the recorded payload. No actual candidate/opponent recorded attack count or terminal deck/Prize count changed.

This verifies **captured-event noninterference for these six fixed seeded trajectories**. The action logger is explicitly not a complete prompt/reducer replay, and identical captured events do not prove invariance of every uncaptured engine internal state.

## Resource-allocation issue remains

The Temple A zero-attack case has an earlier candidate turn-6 decision: **Active Latias ex already held two Psychic Energy**, the immediate manual Energy PlayCardAction hand contained a third Psychic Energy, and the next public Pass board shows that the third Psychic was attached to **Benched Tapu Lele-GX**. The printed `Eon Blade` cost is Psychic + Psychic + Colorless. An alternative to attach the Energy to Latias would have satisfied that printed cost. This is a resource-constrained alternative with an evident attack-cost opportunity, subject to confirming cloned Store legality under the source game's full conditions and assessing the attachment opportunity cost. The post-choice pass probe correctly cannot detect a legal attack that requires rewinding an earlier attachment action.

The combination suggests two separate bot-policy questions: opponent's failure to choose an already accepted attack at a Pass decision, and candidate's possible failure to complete a powerful attack's missing Energy before the Pass decision.

## Follow-up

Implement a **source-labeled, reversible candidate Energy completion probe** for the Latias turn-6 state with pinned Store dispatches. Do not infer competitive improvement from a synthetic one-turn fixture or six small game trajectories. Coordinate with the existing Shadow Rider attachment-priority researchers. The [v3 pilot note](agent44-v3-rank10-pilot.md) and [one-flag pivot contrast](agent44-v3-rank10-opening-pivot.md) remain useful baselines.
