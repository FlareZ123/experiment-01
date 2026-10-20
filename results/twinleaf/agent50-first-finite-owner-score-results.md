# Agent 50: first genuine finite-scored owner decisions, canonical historical four arms

**20 October 2026, 02:15 UTC.** Follow-up to the [preregistered selection rule](agent50-first-finite-owner-score-registration.md), which was committed *before* the compiled first-scored-root job was dispatched. This report retains every control, disqualification, and valid negative.

## Provenance

- [Pinned compiled CI 39357377124](https://github.com/FlareZ123/experiment-01/actions/runs/39357377124), head `c431e4e594c04f502be725ab5ae6911c22f5c35d`, **success**: 39/39 synthetic and observer tests, then four full source-dealt historical Store games each once as uninstrumented control and once with read-only actual scorer observation followed by detached postgame counterfactual.
- Engine pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream edits; original published source and candidate 60-card inventories, historical seeds, seat assignments, source policies and common resource adapters unchanged.
- [Complete four-arm artifact 12235369784](https://github.com/FlareZ123/experiment-01/actions/runs/39357377124/artifacts/12235369784), ZIP SHA-256 `b94d39c1142da0293ff804a2d1e74a866c4b9359715ea5615375d5288bd1ba6a`. JSON schema `agent50-crossrank-historical-first-finite-owner-score-v2`. The entire artifact is required to reproduce action serialization, per-world score summaries and fail-closed controls.
- All four pairs: `samePlayback=true`, `noninterferenceVerified=true`; source physical deal, verified first player, root-action ledger, chosen outcomes and relevant public consequences were unchanged. All four chosen genuine scored roots occurred during **global turn 3**, *after earlier candidate roots with no generic score computations*.

## Full outcome, including disqualifications

| Historical source vs fixed candidate | Native scorer attempts / finite | Detached scorer evaluations (physical/reversed) | Detached fresh policy matches actual? | Hidden-order comparison |
| --- | ---: | ---: | --- | --- |
| Rank 6 Iron Thorns / champion reference | 2 / 1 | 0 / 0 | **No** | **Disqualified** |
| Rank 6 Iron Thorns / New Moon Lockbreaker v1 | 9 / 5 | 0 / 0 | **No** | **Disqualified** |
| Rank 11 Absol/Garbodor / champion reference | 1 / 1 | 1 / 1 | Yes | Same action and score trace |
| Rank 11 Absol/Garbodor / New Moon Lockbreaker v1 | 8 / 6 | 8 / 8 | Yes | Same action and score trace |

In the last row the native and cloned scorers each returned **6 finite values from 8 attempted evaluations**, including PlayTrainer, UseAbility, UseStadium, Retreat and Attack tactics. Rank 11 reference scored PlayTrainer once (finite). No tested rank-11 owner action or generic score trace changed under the candidate's unseen deck reversal. These are narrowly valid **negative observations at two particular decision roots**, not a proof of scorer information-set safety across turns, cards, opponents or legitimate owner knowledge.

The two rank-6 arms are **the more important integration diagnosis**:

- Champion reference: real owner action `PlayCardAction` with `handIndex:0`, target own Active; detached fresh default policy used `handIndex:1`, target opponent Bench. The real bot used **2 scorer attempts, 1 finite**, while both cloned-world score traces were empty.
- New Moon: real owner `PassTurnAction`; detached fresh policy used `PlayCardAction` with `handIndex:3`, target opponent Bench. The real bot used **9 scorer attempts, 5 finite**, while both cloned-world score traces were empty.
- The rank-6 result is classified `fresh-bot-baseline-or-live-state-mismatch`, with full original gameplay preserved. The action mismatch means comparisons between the detached hypothetical world actions are **not causal evidence about the real chosen action**. The rank-specific live common resource-policy wrapper or bot history may account for the difference; these are hypotheses until the exact source wrapper/decision is traced. No card-specific or opponent-policy conclusion is justified by the target coordinates alone.

## Implication for the single-deck objective

The earlier first-global-turn-3 root capture always saw zero generic scores and misleadingly suggested four uniform negatives. Correctly selecting the first **finite actual scorer call** exposed two reproducible reconstruction failures that the earlier probe missed, while retaining two interpretable rank-11 negative controls. The required next step is an information-set-safe clone of the **complete actual candidate wrapper and its owner-visible decision history**, or a root-specific proof that the generic fresh policy is identical to the live decision algorithm. Only then can rank-6 scorer-order sensitivity be measured without attributing a different policy's actions to the live one.

Send the exact first failing root and target action to the canonical Agent41 integrator and coordinate with Agent21's owner-K1 history. Do not trigger a broad win-rate cohort on this evidence. Our postgame observation cannot certify owner top-order knowledge, opponent concealed hand/Prizes, downstream prompts, printed lock semantics, opponent policy competence or the 25-minute match clock.

**All four original games remain historical developmental diagnostic data. Competitive games qualified: 0. Exact source lists: 29/32. Demonstrated win rate: none.**
