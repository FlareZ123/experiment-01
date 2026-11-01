# Agent 4: completed original-Store four-source physical custody replay

**1 November 2026 | normal research Agent 4 | independently re-read archived 31 October pinned CI output**

## Evidence identity

This is a reporting-only replay and independently checked artifact audit of the existing prospective original-source paired experiment at [Agent 4 four-source Team Flare / Plumeria study](agent4-four-source-flare-plumeria-generalization-20261031.md). It introduces **zero new randomized games, seeds, interventions, deck printings or policy improvements**.

- Registered source protocol: [31 October immutable preregistration](registrations/agent4-crossrank-four-source-flare-20261031.json), Git blob `b8d9259cf7c71fe04efab4baac9f570791326bb8`.
- Fixed original deck roster Git blob: `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Twinleaf pinned revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Reporting-only physical-zone diagnostic: `AGENT4_CROSSRANK_PHYSICAL_GATE_DEV=true`; existing canonical original-Store driver and 260-root cap.
- [Successful manual CI 41233975688](https://github.com/FlareZ123/experiment-01/actions/runs/41233975688), head commit `bae48255655eb09ad451c83603465adf706c90e2`.
- [Complete 64-attempt ZIP artifact 13054888068](https://github.com/FlareZ123/experiment-01/actions/runs/41233975688/artifacts/13054888068). Downloaded ZIP SHA256 **`23743de4b2936c1b072c8edc0f839371f4606740d92081151b4d64af15bc8cf8`** (also GitHub artifact digest); single member `agent4-crossrank-four-source-flare.json`.

## Independent source-data check

Extracted the JSON and independently asserted all 32 records, unique `id`, physically matched initial candidate/source hands, both player starting seats, and the complete four source-rank roster. Each pair has `controlPhysicalZone.requested === true` and `treatmentPhysicalZone.requested === true`. Both reported `SETTLED_PHYSICAL_INTEGRITY_PASSED`, `physicalIntegrityQualified: true` and `pendingRootAnomalies: 0`; the report claimed no pair as competitively qualified. The same check asserted no recorded driver error, 15 original native-accepted first Team Flare substitutions, four confirmed second Energy removals and identical control/treatment engine winners.

| Original rank | Matched original source pairs | Physical control pass | Physical treatment pass |
| --- | ---: | ---: | ---: |
| 3, Snorlax | 8 | 8 | 8 |
| 7, Snorlax | 8 | 8 | 8 |
| 24, Iron Thorns | 8 | 8 | 8 |
| 29, Iron Thorns | 8 | 8 | 8 |
| **Total** | **32** | **32** | **32** |

Across original **control** attempts, the physical report checked **7,529** accepted root actions and **2,461** settled root actions, per-attempt checked-settlement range **19 to 91**. Across **treatment** attempts, it checked **7,529** root actions and **2,479** settled root actions, range **19 to 92**. The combined **64 attempts have 15,058 checked root actions and 4,940 checked settlements**; no `ENGINE_PHYSICAL_INVALID` report occurs.

The native game results remain **27/32 both-arm action caps** and **5/32 both-arm engine terminals**. All 15 genuinely substituted Team Flare choices, including both physical player seats, are accounted for; all 17 unaltered game pairs remained without any native-selected substitute. The four completed two-turn followups have actual subsequent source Plumeria payment and second opposing Energy discard evidence, as described in the original report. No engine winner changed.

## Narrow printed-card receipt checks, separately from Store acceptance

On the supplied English card database, `Team Flare Grunt XY` (`xy1-129`) discards one Energy attached to the opposing Active Pokémon; `Plumeria BUS` (`sm3-120`) discards two owner hand cards as a prerequisite for removing one opposing Pokémon's Energy. These are specific card-text predicates, distinct from any general engine prompt validation.

An independent pass over the same 32 JSON pairs found **15/15** native-accepted first Team Flare alternatives with all recorded narrow conditions satisfied: the source owner hand physically held the printed Team Flare and Plumeria at the recorded indexes; the Energy printing removed occurred among the original opposing Active's recorded attachments; each accepted Energy-removal receipt identifies the Active, one genuine Energy prompt, one settled removal, and zero owner hand cards discarded by Team Flare. The **15/15 baseline control Plumeria** first decisions also report a settled original Store two-card payment. In the four positive later treatment branches, the **4/4 future Plumeria** receipts contain two distinct original hand indexes, two real selected card printings, native accepted payment, a recorded second opposing Psychic Energy removal, and an actor-owned prompt origin. In all four, the two named payment printings match the original control's earlier payment printings.

The first Flare root's publicly visible opposing Active held exactly one Energy in **11** cases, two in **two**, three in **one** and five in **one**. This is a hand/Active-resource and original-receipt predicate check; it does not directly reconstruct source hand custody at the later root, native history between turns, possible overlapping prevention effects or every independent printed card rule. Treat all remaining paper-prompt properties as **`PROMPT_PAPER_UNVERIFIED`**, consistent with the current frozen-profile release veto.

## Exact qualification boundary

This test independently verifies the **presence and internal consistency of the archived original Store physical-zone-auditor receipts**. It does **not** independently reconstruct every physical card movement from raw event logs or certify that all prompt replies obey printed paper card text. The physical diagnostic is limited to settled roots and to the predicates the existing auditor checks. In particular, the [1 November Critic paper-prompt veto](../../communications/broadcast/20261101T0550Z_critic_prompt_dispatch_legality_frozen_profile_veto.md) remains applicable; an accepted Store prompt alone is insufficient. Original shared source and decision bots were still development-quality, timed tournament play was absent, and the benchmark is still **29/32 authenticated original opponent 60s, zero competitively qualified games, no demonstrated 99.5% fixed-60 win rate**.

The result supports the narrow statement that **the pending original Store physical-zone replay of these frozen 64 development attempts completed without a reported custody violation**. It does not support changing the candidate 60 or qualifying any engine terminal.

## Follow-on

Agent 41's single frozen bilateral release profile should retain this **bounded positive physical-custody observation** as a source-family regression reference, while separately incorporating native paper-prompt verdicts, owner-information-safe both-player action selection, 32-match coverage and the official tournament-clock gate. Avoid scheduling further independent seed runs from this report alone.
