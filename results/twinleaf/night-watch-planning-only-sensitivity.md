# Registered planning-only Night Watch counterfactual: no root-action sensitivity in one source replay

**Agent 3, 19 October 2026.** Compiled mechanical **negative**. This was registered before execution and applies to one *previously selected* Aichi source-dealt seed only.

## Experiment and evidence

The [protocol was frozen before running](night-watch-planning-only-sensitivity-registration.md), after a prior [compiled audit](night-watch-speculative-chance-accounting.md) had found **six** hypothetical Night Watch chance-prompt precommits inside `SimpleTacticsAi.decodeNextAction` per corrected replay.

Run two source-identical variants using `simulation/twinleaf/night-watch-planning-sensitivity.cjs` and the opt-in `planningRandomSource` parameter in `simulation/twinleaf/night-watch-uniform-hand-hook.cjs`. The live game random stream, per-seat decision RNG other than hypothetical Night Watch sampled positions, printed decks, original genuine start, autonomous source first-turn opening, engine corrections, and action cap stay fixed. Both variants use the exact rank-11 Absol/Garbodor and rank-1 Shadow Rider Calyrex published 60s, **retrospective** original match seed `2809154458`, source physical seat 0, candidate seat 1 **actually first**. Unchanged pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The intervention changes only the *opaque indices* sampled when the Night Watch effect is *simulated inside a bot decision*. The low-index stress returns random value 0.0, while the high-index stress returns 0.999. Live Store card effects retain their original seeded random sampling. These stress streams **are intentionally nonuniform** and not valid paper gameplay profiles; they are diagnostic hypothetical evaluations.

**Compiled source proof:** [manual GitHub Actions run 39180457939](https://github.com/FlareZ123/experiment-01/actions/runs/39180457939) succeeded at repository head `102cf209eba70c6bfac0667d150638a347d33ff5`. Archived full JSON [artifact 12156480205](https://github.com/FlareZ123/experiment-01/actions/runs/39180457939/artifacts/12156480205), ZIP SHA256 `31cb4da57cddf8f67b6869c65171951d80f4858feea26c2b04457440e0e870c7`. The same workflow compiled pinned upstream, ran the existing real-root journal and conditioned source regression, and executed both stress arms.

## Frozen, reported outcome

| Registered observation | Low planning sample | High planning sample |
| --- | --- | --- |
| First *simulated* Night Watch opponent hand size | 5 | 5 |
| First *simulated* selected opaque positions | **[0, 1]** | **[4, 0]** |
| Total speculative Night Watch precommits | 6 | 6 |
| Real-root Night Watch declarations | 3 | 3 |
| Engine game finished | Yes | Yes |
| Engine winner, actual seat | 1 | 1 |
| Full recorded real-root Store action ledger | **Identical across variants** | **Identical across variants** |
| Selective meaningful decision trace | **Identical across variants** | **Identical across variants** |
| Independently qualified competitive games | **0** | **0** |

The opt-in opaque witness collector established a genuine first hypothetical sampled-card difference at **sample index 0**. The stress comparison explicitly fails if these sampled subset witnesses never diverge. No first real-root action divergence was found (`null`), and no first meaningful decision-trace divergence was found (`null`); the entire stored action ledgers compared equal. This is a verified, bounded **negative sensitivity result** for that source game, including its three real Night Watch declarations.

The high sample `[4,0]` still overlaps one of the low sample `[0,1]` positions. The two hypothetical subsets are demonstrably different, while their overlap and the particular sample scenario limit the adversarial strength of this one test. A stronger disjoint-pair or multiple planning-random-stream test would need its own frozen protocol and should only be run if it addresses a concrete relevant policy decision.

## Inference boundary

The first audit exposed an inflated **aggregate prompt creation counter**, even though this repeated source-policy stress produced exactly the same real actions and engine finish despite changed hypothetical selections. The result does not establish hidden-state information safety or lack of bias across other states, decks, real hands, or RNG seeds. The current test does not use independent match seeds, evaluate game outcomes for competitive strength, independently replay the printed card effect, or model the official 25-minute paper event.

For downstream research, the **physical root Store ledger and actual printed attack/reducer witness** must determine real effect exposure. Any future policy-choice sensitivity claim should freeze one *actual* owner-visible decision state and show a legal alternative choice caused by different hypothetical outcomes, while preserving the opponent's own hidden cards and unrelated chance streams. The Critic's [opponent-pressure-to-candidate-response priority](../critic-review-70.md) takes precedence over additional low-yield replay branches.

**Overall:** original Top-32 exact 60 coverage **29/32**, competitive-qualified games **0**, no demonstrated single-deck 99.5% field win rate.
