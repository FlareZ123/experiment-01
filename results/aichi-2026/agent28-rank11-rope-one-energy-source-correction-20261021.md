# Agent 28: rank-11 T6 Rope displaced a one-Energy Oranguru, not an attack-ready Oranguru

**21 October 2026 | source-archived native mechanical correction | one retrospectively selected source-first physical deal | zero competitively qualified games.**

## Finding

The historical rank-11 Absol/Garbodor versus New Moon Lockbreaker Escape Rope intervention is real and retains its observed native Store terminal reversal. Its commonly repeated explanation as stranding a **charged / attack-ready** Oranguru V is inaccurate. The identical physical source's original Oranguru V had **one Darkness Energy** at the T6 Rope, while its printed `Psychic` requires **three Colorless Energy**. Without Rope, source did not first attack until **T19**, after attaching the third Darkness Energy. This is a significant qualification on timing and causality: the card forced a partially built attacker to Bench and stranded an Energy-empty Garbodor; it did not turn off an immediately payable T7 Psychic.

## Independent original-artifact audit

I downloaded two already-published, original CI ZIPs and verified their actual bytes, rather than relying on descriptions of those runs:

| Native source | Authenticated immutable evidence |
| --- | --- |
| [Agent 42 canonical Rope control/treatment, manual run 39668297155, artifact 12378308188](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155) | downloaded ZIP SHA256 `9f2ac75ab15d6dc97af04540b09e14729d618b0fe16230b72336b7ddb2bf7b7f`; contains `agent8-near-term-no-ace-sourcefirst.json` and `agent42-escape-rope-sourcefirst.json` |
| [Agent 23 original source-owner T7 observer, run 39675936616, artifact 12382805740](https://github.com/FlareZ123/experiment-01/actions/runs/39675936616) | downloaded ZIP SHA256 `89e1d41950effcc6d57c83871f51f729f9d5c596f9de150a1e5e57c77402bb3a`; contains `agent23-source-t7.json` |

The rank-11 New Moon row in both match packets has original source-deal SHA256 `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`; the source actually started as player seat 0. Independently recomputing SHA256 on the compact JSON serialization of each complete `rootActionLedger` matches its archived digest: control `3ad102104924c931c612460c19897e4d89b63edaa584cdb3f996212b5ca9eda6`; Rope `b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`. The owner observer's `physicalArchiveMatches` and `observationUsable` are both true, and its `physical` fields reproduce the exact treatment SHA.

At the **first source-owned T7 decision** following T6 Rope, the archived `observationAudit.boundedRoots[0].root` reports:

- own Active `Garbodor BKP`: `energies: []`, no Tool, printed three-Colorless Retreat; 
- own Benched `Oranguru V ASR`: `energies: ["Darkness Energy MEE"]`, `Psychic.cost: [9,9,9]` (three Colorless);
- no physically held direct `Float Stone BKT`, `Guzma BUS`, `Escape Rope BST`, `VS Seeker PHF` or `Secret Box TWM` at that root;
- source owned Marnie and Crobat draw routes, as subsequently tested by Agents 23/43, but those single-variation native treatments did not create a source attack.

The full original *treatment* source action prefix confirms exactly **one source `PlayCardAction Darkness Energy` before T6**, on T5 at ordinal 34. There were no other source Energy card plays on T1 or T3. The T6 candidate Rope changed the Active/Bench positions; source had no attachment action between the candidate's T6 and the first source T7 owner-root. Consequently, the T7 own-board observation corroborates the immediately preceding T6 Energy state.

## Counterfactual comparison, preserved without overreach

| Observation | No-Rope original | T6 Rope treatment |
| --- | --- | --- |
| First divergent root | T6 ordinal 38, Pass | T6 ordinal 38, genuine Store-accepted Rope |
| Source T5 Energy attachment | Darkness, ordinal 34 | same |
| Source later Darkness attachments | T9 ordinal 50, T19 ordinal 96, T23 ordinal 117 | source had no settled attacks |
| First source `AttackAction` | **T19 ordinal 97**, following third Darkness attachment | **none** before terminal |
| Source settled Psychic attacks | 17 (T19 onward) | 0 |
| Untimed engine terminal | source wins, remaining Prizes [0,6] | New Moon wins, [6,0] |

The control's first attack settlement packet independently shows three Darkness Energy on its then-Active Oranguru V on **T19**, and a real Prize transition from source 6 to 5. The attack count and final terminal are original native outputs. The original attack receipts are **not** claims of early T7 attack readiness.

## Correction to shared interpretation

Previous reports, notably [Agent 7's recovery crosswalk](agent7-rank11-ropesource-recovery-crosswalk-20261021.md), stated that Oranguru V had three Darkness Energy at T6, calling it funded. That resource count is falsified for this exact replay. The source's **first natural three-Energy Psychic was at T19 in the no-Rope control**. An important part of the Rope effect was therefore attacking the opponent's *future* development while the source had few practical ways to move its unpowered Garbodor. This can still be tactically powerful, but an apparently dramatic unqualified same-deal engine victory cannot be used as a transferable matchup or 99.5% win-rate estimate.

Also see Agent 23's [real source T7 own hand and declined Crobat prompt](https://github.com/FlareZ123/experiment-01/blob/agent23-sourcefirst-turn7-owner-recovery-audit-20261021/results/twinleaf/agent23-sourcefirst-rank11-crobat-confirm-20261021.md) and [Agent 43's held-Marnie native negative](agent43-sourcefirst-t7-marnie-native-negative-20261021.md). The former and latter both generated genuine source actions, but neither restored source attacks or changed this selected game terminal.

**Next discriminating test:** run a source-owned state-general mobility and multi-action setup policy, with the same frozen 60s and actual starts, and distinguish ready-attacker displacement from preventing a future three-attachment attacker. Preserve both original starts, opponent information boundaries, outcomes and caps. Do not describe this incident as an already ready Psychic attacker being forced inactive.

**Evidence boundary:** correction of archived engine game-state and report interpretation, no new native match, no new win sample, no exact missing ranks 23/25/28, and no evidence that a fixed deck achieves 99.5% against the complete Top 32.
