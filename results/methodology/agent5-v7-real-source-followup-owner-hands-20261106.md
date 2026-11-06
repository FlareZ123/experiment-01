# Agent5: Original rank6 native source-owner hands at five verified post-Volt decisions

**6 November 2026 | Agent5 | developmental, read-only owner decision audit | no competitive games**

## Purpose

The existing common two-seat v7 retrospective policy successfully settled five genuine original-rank6 Iron Thorns ex *Volt Cyclone* attacks and their immediate opposing actions. Agent9 independently reconstructed five next original-source owner turns: four Pass actions and one Capture Energy followed by Pass. The critical unresolved question was which *actual physically held* source resources the actor could see before making each decision. A root action census alone cannot tell whether useful alternatives existed.

This experiment adds a **read-only native Store dispatch observer** to the already existing v7 runtime, without adding or changing any move-selection logic or card text. The observer snapshots the source owner's actual hand and face-up own board immediately before each Store-returned voluntary root following an observed source-owned Volt attack declaration, along with opponent's face-up Active and Stadium. It observes no opponent hand, unopened deck or Prize identities, and it never constructs or submits game actions. Actual settled attacks and source-return anchors are independently established by the preexisting v7 archive and Agent9 postgame audit; the new observer's attack-declaration count by itself is expressly insufficient to certify settlement.

## Compiled evidence and reproduction

- **Native CI:** [run 42225278402](https://github.com/FlareZ123/experiment-01/actions/runs/42225278402), successful, at source commit `c82f37418c5a666f558c4428d2985ec1a1865697`; job `127917081365`. The pinned Twinleaf submodule remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its six newly introduced witness tests all passed.
- **Complete native artifact:** [ID 13505372427](https://github.com/FlareZ123/experiment-01/actions/runs/42225278402/artifacts/13505372427), provider ZIP SHA-256 `e5265702d8b5cf18a3d963def03d0bddda93e5e03d645d124d7ea099dc25c090`. The ZIP contains the full v7 return and passive observation JSON with its locked SHA-256 sidecar.
- **Native observer:** [`simulation/twinleaf/agent5-v7-source-followup-owner-witness.cjs`](../../simulation/twinleaf/agent5-v7-source-followup-owner-witness.cjs).
- **Registered runner:** [`simulation/evaluation/agent5-v7-owner-followup-census.cjs`](../../simulation/evaluation/agent5-v7-owner-followup-census.cjs). It reuses the exact original 8 IDs, v7 algorithm, physical starting decks/seats, seeds and 96-root horizon from [the v6 registration](../aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json).
- **Six pure tests:** [`tests/agent5-v7-source-followup-owner-witness.test.cjs`](../../tests/agent5-v7-source-followup-owner-witness.test.cjs). New manual opt-in `agent5_v7_followup_owner_audit` reuses the existing `.github/workflows/agent5-paid-ghala-thunder-volt-v10.yml`; no push-triggered workflow was added.

The native runner retained **all eight original games**, including capped/error status, and successfully matched **five of five** independently recovered Agent9 owner-return action-kind anchors. The two contenders in source seedgroup 200 share a physical original source deal, so the five postattack observations are correlated and are not five independent competitive games. The post hoc owner snapshots are observational; they do not certify a complete per-action paper-affordability decision set.

## Original actor's real physically held hand before choices

| Original registered trial | Source owner turn | Actually accepted source actions | Number held before final Pass | Examples of exact held cards |
| --- | ---: | --- | ---: | --- |
| `6:200:A:champion-reference` | 16 | Pass | **13** | Guzma BUS ×2, Crushing Hammer POR ×2, Lusamine CIN ×2, Faba LOT, Enhanced Hammer TWM, VS Seeker PHF, Tropical Beach BWP 50 |
| `6:200:A:new-moon-lockbreaker-v1` | 16 | Capture Energy RCL, Pass | **13** after Energy (14 beforehand) | Same 13 as champion-source matched owner hand; Capture Energy RCL consumed by the preceding accepted PlayCard root |
| `6:201:B:champion-reference` | 5 | Pass | **6** | Team Flare Grunt XY, Crushing Hammer POR ×2, Lusamine CIN, Plumeria BUS, Guzma BUS |
| Same `6:201:B:champion-reference` | 13 | Pass | **13** | Same six plus Guzma & Hala CEC, Tropical Beach BWP 50, Enhanced Hammer TWM, VS Seeker PHF, Megaton Blower SSP, Player's Ceremony SP 127, Trainers' Mail ROS |
| Same `6:201:B:champion-reference` | 17 | Pass | **17** | Turn13 cards plus Plumeria BUS ×2, Guzma BUS and Palace Belt BWP |

The explicit card list at turn 16 (both seed-200 contenders after Capture Energy attachment, if any) is: `Palace Belt BWP`, `Tropical Beach BWP 50`, `Enhanced Hammer TWM`, `Lusamine CIN` ×2, `Faba LOT`, `Tool Jammer BST`, `Guzma BUS` ×2, `Crushing Hammer POR` ×2, `VS Seeker PHF`, `Sidney FST 241`.

The exact turn17 17-card hand is: `Team Flare Grunt XY`, `Crushing Hammer POR` ×2, `Lusamine CIN`, `Plumeria BUS` ×3, `Guzma BUS` ×2, `Guzma & Hala CEC`, `Tropical Beach BWP 50`, `Enhanced Hammer TWM`, `VS Seeker PHF`, `Megaton Blower SSP`, `Player's Ceremony SP 127`, `Trainers' Mail ROS`, `Palace Belt BWP`.

## Interpretation and next discriminating test

These hands prove that the original decision actor held abundant potentially interactive Trainers on genuine postattack Pass turns. **A large hand is evidence of a policy bottleneck worth examining; it does not by itself establish a missed legal or beneficial action.** Legality and value depend on the live opposing board, Item/Supporter/Stadium restrictions, active/bench targets, per-turn quotas, coin outcomes, discard requirements and the best competing line.

Prioritize a **read-only paper-opportunity census over the exact five turn anchors**, using the already captured full owner-visible public snapshots in the complete native artifact. First select potentially decisive, sharply testable effects: Energy-removal access via Team Flare Grunt or Plumeria where the opponent really has Energy, VS Seeker only with a qualifying Supporter in discard, and relevant Guzma gust with both occupied Benches, correct Supporter quota and a genuine attack/lock payoff. Any proposed playing alternative must then run through real Store with full physical payment and a valid opponent continuation, preserving the existing seeds and separately preregistering the intervention.

No strong-play conclusion follows from this owner-hand report. The selected developmental release remains Agent36's historical v4; the frozen v7 is a separate tested policy. The whole Aichi Top32 still has 29/32 authenticated name/count lists (ranks23/25/28 missing), **zero qualified competitive games**, no selected best 60, no defensible 99.5% win rate.
