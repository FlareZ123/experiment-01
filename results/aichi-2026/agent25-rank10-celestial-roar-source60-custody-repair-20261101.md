# Agent 25: original rank10 Regidrago V Celestial Roar drops a physical card after Basic Energy selection

**1 Nov 2026 | exact original rank10 original60 native source physical failure | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | zero competitive games.**

## Root cause, independently traced to printed source

The original pinned `Regidrago V SIT 135` *Celestial Roar* reduces top-three deck cards by moving them to a temporary `CardList`, prompts to attach Basic Energy cards, then discards nonselected cards with:

`temp.cards.forEach(card => MOVE_CARDS(store, state, temp, player.discard, { cards: [card], sourceCard: this }));`

`MOVE_CARDS` calls into `CardList.moveCardsTo`, which **splices each selected card from `temp.cards`**. JavaScript `Array.forEach` increments its index while the same array shortens. When exactly two non-Energy cards remain, it visits the first and **skips the second**, which is no longer present in any persistent zone. The original printed text calls for **discarding all three top cards, attaching any revealed Energy cards**; the skipped second card is a gameplay-engine bug.

[Actual exact pinned source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts) is stronger evidence than speculating from the HNS candidate. The source also incorrectly restricts selected Energy to Basic Energy; **Agent47 already found that distinct print-fidelity discrepancy and implemented a broader, reversible paper-correct `withPaperCelestialRoarEnergy` hook** in [the shared research repository](../../simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs). Its callback uses `[...temp.cards]`, avoiding the same splice-skip. The new Agent25 Basic-only snapshot hook below is an **independent narrow confirmation**. For actual paper gameplay, prefer Agent47's established broader correction.

### Illustrative top-three composition, separated from real attack incidence

This specific source rank10 original 60 has **six Basic Energy cards** (four Grass, two Fire), four Double Dragon Special Energy and fifty other cards. If one were to sample a uniformly random three-card subset of that untouched full 60, the chance of *exactly one Basic Energy plus two non-Basic cards*, the source's physical-skip condition, is exactly `C(6,1)·C(54,2)/C(60,3) = 25.0905903%`. The chance of at least one Double Dragon Special Energy in those three is `1 - C(56,3)/C(60,3) = 18.9947399%`. These are **illustrative combinatorial deck-composition probabilities only**. Actual Celestial Roar triggers after the opening hand, Prize placement, prior draws, energy attachments, and evolving board state; neither fraction estimates a matchup failure rate or even actual attack occurrence. They show why both independent printed-fidelity errors deserve direct tests.

## Controlled original Store attack plus prompt experiment

A fresh [12-arm native fixture](../../simulation/twinleaf/agent25-regidrago-v-celestial-roar-native-card-custody.cjs) constructed two **60-physical-card players** under the pinned actual Store. It dispatched Regidrago V's real `AttackAction('Celestial Roar')`, responded to its actual `AttachEnergyPrompt`, drained real `WaitPrompt`s, and audited original physical card references. Three deterministic, printed-card top-three sets × owner seat0/1 × original/reversible correction = **12 arms**. Manual original Store CI [41273938855](https://github.com/FlareZ123/experiment-01/actions/runs/41273938855) passed; independently downloaded [native artifact 13070641077](https://github.com/FlareZ123/experiment-01/actions/runs/41273938855/artifacts/13070641077), ZIP SHA256 `3afc99db524aa6544be66ead38f17e6b985a4bc6f899791f50bc85cd344ff324`.

| Exact top-three composition | Unmodified native physical cards | Corrected native physical cards | Native original vs corrected discard evidence |
| --- | ---: | ---: | --- |
| 1 Basic Grass Energy, Quick Ball, Arven | **59** | **60** | Original: Grass attached, only Quick Ball discarded. Corrected: Grass attached, **Quick Ball and Arven** both discarded |
| Quick Ball, Arven, Field Blower, 0 Basic Energy | 60 | 60 | All three Trainers discarded in both |
| 2 Basic Energy, Arven | 60 | 60 | Both Energy attached, Arven discarded in both |

Each row passed independently with the Regidrago source occupying seat0 and seat1. The [Agent25 reversible narrow hook](../../simulation/twinleaf/agent25-regidrago-v-celestial-roar-card-custody-hook.cjs) restores the original prototype after every completed arm and mutates no vendor files. It deliberately preserves pinned Basic-only selection, so **it is insufficient to replace the broader Agent47 paper-correct hook in real Expanded games**.

## Naturally dealt original Aichi source reproduction and bounded repair

The actual original **rank10 Haruku Yoshioka Regidrago 60** contains four Double Dragon Energy, four Grass Energy and two Fire Energy; source from [original reconstructed 60 archive](full-decklists.json). The challenger is the *identical frozen* post-event Dhelmise v2 60, in physical seat1. Seed **1304508082**, max **120 native root actions**, all original source printings fixed. The original rank10 source seat0 native action stream contained *Celestial Roar* on global turn12:

- At the first attack root, native ownership was **57 permanently located cards plus 3 temporary prompt cards** for source seat0, as expected while the native attack was resolving.
- Once the attachment and Wait prompts resolved, the first settled action in global turn13 found **59 permanently located cards, 0 temporary**, without duplicated references or ghost Energy. This proves a source deck physical card disappeared under the original engine.
- Exact forensic [run 41273322779](https://github.com/FlareZ123/experiment-01/actions/runs/41273322779), archive [13069984373](https://github.com/FlareZ123/experiment-01/actions/runs/41273322779/artifacts/13069984373), reproduced the original **default bot first settled failure** at conservation witness ordinal **75**, and **candidate-only Compressor first failure** at witness ordinal **79**. The root-ledger action ordinal is one less (74/78) because the witness uses a one-based next-root label. Both failures follow **the same source turn12 `Celestial Roar` prompt sequence**.

[Registered narrow paper-custody repair](../als/registrations/agent25-rank10-regidrago-celestial-roar-custody-hook-20261101.json) reproduced both original-source failures then replayed the exact same source60/seed with an optional corrected remainder snapshot, without touching upstream code. The [native run 41273938855](https://github.com/FlareZ123/experiment-01/actions/runs/41273938855), artifact [13070746100](https://github.com/FlareZ123/experiment-01/actions/runs/41273938855/artifacts/13070746100), SHA256 `d4abb275e32ee0856513a5b2a07c15e937bf4d7240b23ba7cf6472480611d6b0`, produced:

| Candidate owner policy (rank10 source seat0) | Pinned original Store | Narrow corrected remainder |
| --- | --- | --- |
| Unchanged SimpleTacticsAi | **Physical-60 hard failure** | 120 native root cap, 17 turns, **0 settled physical anomalies** |
| Candidate-only Dhelmise Compressor | **Physical-60 hard failure** | 120 native root cap, 18 turns, **0 settled physical anomalies** |

Both corrected runs recorded **8 actual `Celestial Roar` uses**; seven settled correction callbacks before cap, **2 Basic Energy attached, 19 other cards sent to discard, zero temporary remainder cards** on each fully settled callback. The corrected runs are **unfinished 120-action development trials**. Their source Winner/Prize states cannot be converted into competition results. The original rank10 physical failures are invalid sample worlds, now correctly diagnosed.

## Relation to existing Agent47 correction and release gate

The candidate source bug is independently reproduced in the actual original rank10 60 and repaired by a card-only hook under the same seed. The **full paper-regulation question additionally requires Special Energy**. Agent47's existing [printed all-Energy hook](../../simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs) both fixes the leftover discard and selects eligible Double Dragon Energy; his existing [native controlled source fixture](../../simulation/twinleaf/agent47-celestial-roar-double-dragon-pinned-native.cjs) tested original-60 staged Special and Basic combinations. The separate [frozen Agent25→Agent47 natural source replay](../als/registrations/agent25-agent47-celestial-roar-natural-rank10-20261101.json) will use that **existing** broader hook on rank10 for a more faithful native result.

**Benchmark remains 29/32 authenticated original Top32 60s; zero competitively qualified games; no demonstrated 99.5% fixed-deck success.** Preserve the original raw Store bugs as explicit excluded trials, never quietly repair old game results.
