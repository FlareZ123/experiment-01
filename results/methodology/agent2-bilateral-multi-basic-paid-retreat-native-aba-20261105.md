# A source-independent two-seat paid-retreat planner reproduces the native three-Psychic rescue

**Agent 2, 5 November 2026 ~13:50 UTC.** Experiment preregistered [before implementation](agent2-bilateral-multi-basic-retreat-policy-registration-20261105.md). This is a **developmental historically selected single opening**. It is a general **owner-only identical-two-seat** addition in this run; the outer previously selected rank-specific Guzma wrappers and base Twinleaf opponent policy are still unqualified. **0 competitively qualified games and no field-level win-rate estimate.**

## Registered execution and custody

- Three fixed arms: \`control\`, \`bilateral-multi-basic-retreat\`, \`control-repeat\`. Both original rank3 Snorlax Stall seat0 and original rank1 Shadow Rider seat1 keep the same original printed 60s and seed290134, both original held Guzma roots, all other policies fixed.
- Native manual [CI 42038553414](https://github.com/FlareZ123/experiment-01/actions/runs/42038553414) SUCCESS on repository \`40b9fb2e0980da05df198d26f0f2eac7d5839acb\`, pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. [Artifact13418864781](https://github.com/FlareZ123/experiment-01/actions/runs/42038553414/artifacts/13418864781), ZIP SHA256 \`a79f255028c4ed312f99712fb3290a9a1049d9ff4a2d08b4b0eedf94a9d6c38a\`, inner JSON SHA256 \`69caf042094f021c4ac4d8bcc9bb8c8c93a090aa7b3fbe690585f1dd286abbf2\`.
- All four hard checks **true**: the source and full physical-deal fingerprints are unchanged across all arms; baseline and repeated control have identical complete native root ledger; both earlier source Guzma actions remain actual printed Store roots; a treatment typed original owner Retreat is in the native ledger with exact three original Psychic cards physically discarded and original slot promotion.
- Full physical deal fingerprint \`e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb\`, source deal \`ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a\`. Original control and repeat root SHA256 \`1d68f7ae41707d6554c22706d4fe3d19f29f9ae68b5c10c0cbc964d424dc01ba\`.
- Separate pure positive, insufficient-payment/status/Tool/funding/draw-race negatives and both-seat owner-hidden invariance tested through the existing manual workflow. Native Store-specific read-only witness additionally rejects a nonthrowing no-op and checks source and target physical card objects.

## Crucial distinction: no rank-specific knowledge in the added policy

The same [pure planner](../../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs) and [generic owner-decode adapter](../../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs) run for both player seats. Neither examines original rank, turn number, specific printing, seed or opponent's hidden cards. The planner uses detached \`actorObservation\`, immutable public card catalog, native-cost-labelled intent, and only offers a **nominal** paid retreat from an Active with a printed 2–4 Colorless fee whose *entire fee* is exactly funded by attached Basic Energy, no visible retreat lock/tool/status, no presently payable damaging attack, a funded Benched fixed-positive-damage attack, and an owner public deck deficit. It conservatively excludes ambiguous Special Energy or extra-card payment choices and does not claim its projected damage is the actual native damage.

Native treatment audit shows:

| Owner-side observation | Seat 0 (rank3) | Seat 1 (rank1) |
| --- | ---: | ---: |
| Original genuine Pass proposals evaluated | 14 | 12 |
| Nominal generic retreat offers | 0 | 1 |
| Typed Retreat choices | 0 | 1 |

On rank1 global turn33 only, the generic policy independently chooses the same rescue line uncovered by the earlier **rank-specific** tests: own Active \`Dialga-GX UPR\` with three physically distinct \`Psychic Energy MEE\`, paid bench slot1 \`Shadow Rider Calyrex V CRE\` with two Psychic, opponent Active \`Bunnelby PRC\`. The public planner computes nominal 6 attack turns to KO this Bunnelby from its then-current public HP/damage, with owner deck19 and opposing deck30. This is a **proposal calculation**, not a guarantee of damage or winning. Native headless root ledger has exact \`RetreatAction\` global turn33, source actor seat1, ordinal155. Read-only physical custody has exactly **one verified payment, zero unverified returns, zero outstanding prompts**.

## Reproduced developmental native results

| Metric | Baseline and repeated control | Generic same-policy treatment |
| --- | ---: | ---: |
| Native terminal winner | Rank3 by deck-out | Rank3 by deck-out |
| Global terminal turn | 51 | 59 |
| Native action count | 238 | 270 |
| Rank1 declared Shadow Mist attacks | 4 | 17 |
| Rank3 declared Burrow attacks | 19 | 15 |
| Rank1 Prize cards taken | 0 | 1 |
| Rank3 Prize cards taken | 0 | 0 |

This reproduces **exactly** the tactical effect of the earlier [rank-specific typed-retreat v2](agent2-original-rank1-typed-three-psychic-retreat-native-v2-20261105.md) without using its printing/turn/seat identifiers in the **decision algorithm**. The source-specific v2 observer was retained as a passive physical validator and did not choose the treatment's root. The outcome remains one selected historical deal.

## Integration recommendation and explicit vetoes

This closes a concrete **multi-unit owner paid-retreat decision gap** under a narrow source-independent policy, plus gives an executable native A/B/A with real owner root, physical Energy custody and actual opponent follow-through. It is a proposed component for Agent36/41's full selected two-seat policy. It is not a whole-policy qualification: no extra-pressure matchup discovery, draw/stadium/Ability cost modifications, paper-rule completeness, all source ranks/seats, prospective independent seeds or clock adjudication are certified. The simple own-deck-deficit and nominal-KO criteria are conservative heuristics needing further falsification, especially under Damage prevention, accelerated deck milling or locks. Retain the 29/32 authenticated opponent-inventory deficiency and post-event printing caution.

Reproduce with [pure planner](../../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs), [native shared adapter](../../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs), [A/B/A runner](../../simulation/evaluation/agent2-bilateral-multi-basic-retreat-native-aba.cjs), [pure planner tests](../../tests/agent2-actor-multi-basic-paid-retreat-frontier.test.cjs), [same-seat/hidden-zone tests](../../tests/agent2-bilateral-multi-basic-retreat-bot.test.cjs), and [existing manual workflow](../../.github/workflows/agent2-fss-float-rank3-native.yml).
