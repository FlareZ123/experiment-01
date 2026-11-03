# Agent 7: symmetric emergency Lillie before terminal Attack/Pass, retrospective success and prospective no-trigger

**3 November 2026 | Two-seat matched original-source policy experiment | pinned compiled native Twinleaf. No competitive game is qualified.**

## Why this rule was tested

The [unchanged original-rank6 game audit](agent7-rank6-last-attack-lillie-real-store-option-20261103.md) found an exact original champion owner-root attack at global turn40 with its deck at one, 34 cards in hand and two held Lillie's Determination, before a self-decking Filch. An actual detached native Store Lillie alternative refilled the deck to26. The existing Pass-only Lillie experiments never offered a selected Pass at that critical moment. The remaining question was whether a **real selected owner policy** could execute the physically held Lillie before Attack, and how often that rule helps in a fresh sampled source field.

## Registered policy: same owner decision for either physical seat

The new [owner-only reversible policy](../../simulation/twinleaf/agent7-emergency-lillie-before-terminal-root.cjs) observes only the current acting player's own hand, public deck/Prize counts and Supporter state via the existing immutable `actorObservation` contract. It only replaces a native **AttackAction** or **PassTurnAction** when that owner's deck has **exactly one** card, owner physically holds `Lillie's Determination M1L`, has not spent a Supporter, is not under an observed Supporter lock, the native card `canPlay` check succeeds and shuffling the other hand cards would leave at least one future deck card after the six- or eight-card draw. It applies **identically to both actor seats**, without comparing candidate identity, rank, random seed, opponent hidden cards or unsearched deck identities. No source-specific special pleading is present. The genuinely selected original action is replaced only where this narrow rule fires. The full original frozen policy is otherwise untouched.

Implementation tests cover both seats, exact last-deck threshold, zero benefit of reshuffling tiny hands, Suppporter lock/quota and native canPlay veto, scoped restoration, and registered composition. The same existing manual-only [CI workflow](../../.github/workflows/agent7-prospective-rank6-lillie.yml) gained an exclusive opt-in; no new workflow was added.

## Historical physical-seed development fixture

**This original source seed was already examined before the new policy design and must never count as prospective.** Using the existing original source register, exactly two original rank6 games (champion and New Moon) at seed **1855410067**, candidate physical seat A, were replayed with both control and the new symmetric rule.

The champion's unchanged control again ended in original-source native victory, source Prizes **6** and candidate Prizes **6**, source attacks **0**, candidate **12** Filch attacks. Its entire native root ledger SHA remained **`5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f`**. At the exact turn40 selected Attack, the treatment **actually played** a physically owned Lillie from its own hand. Native Store accepted it, all `Wait → ShuffleDeck → Wait` effects completed, and independent Agent24 audit verified **hand 34/deck1 → hand8/deck26, Supporter quota0→1, Lillie hand→discard**.

This one real original-source treatment diverged:
- **Control:** native source won by deck exhaustion, all six source Prizes remained, 194 native actions.
- **Treatment:** **action cap reached with no native winner**, source Prizes **5** and candidate Prizes **6**, 260 native actions. Candidate continued Filch after refilling. The source performed its first **Volt Cyclone** at global turn43 and took one Prize.

The other original New Moon game had **zero** emergency opportunities and both control and treatment remained action-capped with exactly matched native roots. Both original source and full initial physical-deal fingerprints matched across their control/treatment arms (**2/2**).

This is a **real causal native policy difference on an already observed physical seed**, not proof of a player win. Source's later attack and the hard action cap prevent treating the intervention as a real-paper victory.

## Fresh precommitted symmetric experiment

[Prospective registration](registrations/agent7-emergency-lastcard-lillie-prospective-20261103.json), commit **`f867e4cc41cf1f80a1624e5daa5cec5f4ec0d86f`**, was created **before any fresh game was run**. Eight unique secure-uniform 32-bit source seeds were sampled, **four for each physical candidate seat**. Each original source physical seed was paired with the unchanged champion and New Moon candidate 60s. The experiment used **16 registered native matches under control** plus **16 under symmetric treatment**, all independently seed-specified in advance. Both conditions used the original authenticated rank6 printed sixty and the same unchanged baseline 86-option policy; the only treatment difference was the new emergency Supporter priority.

| Metric | Observed |
|---|---:|
| Registered independent source seeds | 8 |
| Fixed candidate sixty × physical seat native trials per condition | 16 |
| Total native control/treatment games | 32 |
| Exact matched source initial physical deals | 16/16 |
| Exact matched full initial physical deals | 16/16 |
| Eligible last-deck-card emergency Lillie replacements | **0** |
| Physically settled emergency Lillie replacements | **0** |
| Matched native terminal disposition differences | **0/16** |
| Control/treatment native candidate wins (unqualified) | 3/3 |
| Control/treatment native original-source wins (unqualified) | 2/2 |
| Control/treatment native action caps | 11/11 |
| Competitively qualified paper games | **0** |

**Primary result: zero prospective intervention opportunities.** This policy remains unexercised across this small fresh rank6 source sample, so the identical control and treatment outcomes are expected. No positive or negative game-strength claim follows. The only nontrivial native effect and game-disposition difference comes from the explicitly retrospective seed, which must not be pooled into the prospective denominator. The two candidate sixties sharing each seed are correlated trials, and action-capped matches are unresolved, not ties.

## Reproduction and evidence

The pinned original Twinleaf revision is **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Frozen canonical source policy file: [agent20-frozen-rank6-canary-v1.json](../../simulation/evaluation/agent20-frozen-rank6-canary-v1.json), SHA256 **`6ff3ee325098cfc68253928a9dd5370da52c9cc64b86a4435be2b07a0d392dc6`**. Experimental emergency policy SHA256 **`fe67752fd731f53d40419005e6f22210e808496d262cd7725e31790bb97c7109`**. Original frozen source and every candidate 60 remain unchanged.

[Manual compiled CI run 41570919248](https://github.com/FlareZ123/experiment-01/actions/runs/41570919248) finished **successfully**, checking pure policies plus native pinned engine. The two explicit machine-record artifacts:
- [Retrospective exact-source four-arm witness, artifact 13200878863](https://github.com/FlareZ123/experiment-01/actions/runs/41570919248/artifacts/13200878863), downloaded ZIP SHA256 `f7c00d56ae38019388d978d5fe791520077508068d514698b1bd140998d8f556`.
- [Fresh matched 32-game fully recorded source ledger, artifact 13201577388](https://github.com/FlareZ123/experiment-01/actions/runs/41570919248/artifacts/13201577388), downloaded ZIP SHA256 `538399ac61fe8a2b89b9db52519f2b4376b7945e313f264c220b4528118e3351`.

The [native runner](../../simulation/evaluation/agent7-emergency-lastcard-lillie-prospective.cjs) executes the exact control and treatment against the historical seed with `--historical`, or all 16 preregistered trials without the historical flag. Each row records both complete original control/treatment native root-action ledgers, native winner/cap, actual original-source attacks, actual opponent responses, seed identity, candidate physical seat and exact initial deal fingerprints. The run's own atomic and locked output file is archived by the pre-existing workflow.

## Decision impact

The exact original late-game failure is addressable by a physically payable, owner-visible resource policy and **changes the native outcome from a source terminal to an action cap** under one observed seed. However, a one-card-deck threshold is **too rare in this new sample** to provide informative strength evidence. Earlier treatment rules that spend Lillie as soon as it is held after a Pass can be harmful by consuming valuable cards without a strategic plan. A stronger source/candidate policy should jointly evaluate the *draw-only Filch attack itself*, current opponent deck pressure, board mobility, opponent lock and other available Supporters, while preserving legal card flow. Policy evaluation requires representative held-out adversarial matches against all original 32 decks and the tournament clock, which remain unavailable.

**Project admission status: 29/32 authenticated original source 60s, rank23/25/28 exact originals missing; zero paper-competitively qualified games; no fixed champion sixty selected.** No result here supports a claim of 99.5%.
