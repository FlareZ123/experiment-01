# Original rank1 Dialga paid-retreat counterfactual: verified typed owner choice, native payment, and reply

**Agent 2, 5 November 2026, 13:37 UTC.** This is a same-initial-deal **retrospective developmental** experiment. **0 competitively qualified games, no 99.5% claim.** The target was preregistered before implementation: [v2 registration](agent2-rank1-dialga-decoder-retreat-v2-registration-20261105.md). It resolves the earlier [v1 Store-level replacement lineage gap](agent2-rank1-original-paid-dialga-retreat-native-aba-20261105.md).

## Execution and fixed controls

- Native [GitHub Actions 42036843547](https://github.com/FlareZ123/experiment-01/actions/runs/42036843547), SUCCESS; archived [artifact13419026712](https://github.com/FlareZ123/experiment-01/actions/runs/42036843547/artifacts/13419026712), ZIP SHA256 \`ec07dee64ef176b6671613f025d21971cc6112cb6b3ab4f754eaa1e34bd5cb9e\`, inner JSON SHA256 \`78493e9879136877da1c710d3c950c4d7ebe4b02856204e0b2431ac8cfc5b156\`.
- Repository head \`9c2dbe276cc7898dc44b47964bc4f395f2e06857\`, pinned Twinleaf commit \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`; native original-60 seed \`290134\`, rank3 Snorlax Stall seat0 versus original rank1 Shadow Rider seat1. Actual held rank1 Guzma turn3 and actual held rank3 Guzma turn16 preserved in each arm, same remaining native canonical policies.
- Exactly three preregistered arms: \`control\`, \`three-psychic-paid-retreat\`, \`control-repeat\`. All **four hard checks true**: unchanged actual physical opening in all arms; exact original repeated-control root ledger; both source-held Guzma roots; typed paid-retreat root plus physical payment.
- All three original full physical fingerprints \`e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb\`; source fingerprint \`ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a\`. Both control root-ledger SHA \`1d68f7ae41707d6554c22706d4fe3d19f29f9ae68b5c10c0cbc964d424dc01ba\`. No native errors or action caps in these three arms.
- Both-seat pure tests verify positive three-card physical payment, opponent concealed information unused, a nonthrowing native Store no-op rejected, control preservation, and insufficient public resources/status/acting-seat negatives. Existing v1 tests also pass.

## Exact causal source-continuation proof

Original turn33 rank1 owner AI selected \`PassTurnAction\` after its own normal turn actions; native \`Dialga-GX UPR\` Active had **three distinct Psychic Energy MEE**, printable retreat fee **three Colorless**, and Benched \`Shadow Rider Calyrex V CRE\` had **two Psychic**. Opponent rank3 Active \`Bunnelby PRC\`. In the treatment, one owner \`SimpleTacticsAi.decodeNextAction\` response changes **before native headless recording** to typed \`RetreatAction\`, selecting original bench index1. The native root ledger now explicitly has action **ordinal155** at global turn33, playerSlot1, \`RetreatAction\`. Baseline at identical ordinal155 has \`PassTurnAction\`, and the original repeat reproduces baseline exactly.

A separate read-only native Store observer sees exactly one dispatched typed Retreat, exact three *original physical* Psychic card objects in owner discard, original Active/Bench slots swapped, target Energy unchanged, former Active fee removed, retreat quota used, actual new Active \`Shadow Rider Calyrex V CRE\`. The observer reported **one verified payment, zero no-ops, zero errors, zero unsettled prompts**. Same bot then chose a real \`Shadow Mist\` \`AttackAction\` on global turn33 and continued native responses without further scripted treatments. This closes the v1 pre-Store ledger/custody mismatch.

## Native payoff (all development, no competitive admission)

| Outcome | Original control and repeat | Owner-selected paid retreat |
| --- | ---: | ---: |
| Native winner | Rank3 deck-out | Rank3 deck-out |
| Native terminal global turn | 51 | 59 |
| Native action count | 238 | 270 |
| Rank1 declared attacks | 4 | 17 |
| Rank3 declared Burrow attacks | 19 | 15 |
| Rank1 Prizes taken | 0 | 1 |
| Rank3 Prizes taken | 0 | 0 |
| Rank1 remaining deck | 0 | 0 |
| Rank3 remaining deck | 21 | 17 |

Source rank3 continued Burrow four more turns (34,36,38,40,42), then was unable to keep attacking after the rank1 damage response. Rank1's final active is funded Shadow Rider V, and source Snorlax ends Active with 110 damage. Native rank1 still decks out, despite an additional Prize. This demonstrates how an omitted **multi-unit paid Retreat** can radically change a full-game mechanism and still leave a broader policy deficit.

## What this result does and does not license

The treatment is a single historical seed selected after discovering the passive bot's weakness. It compares one necessary alternative to the original Pass. It does not validate a generic bot, prove timing optimality, test all Aichi sources/seats, establish a native paper-complete card-pool/rule engine or an official 25-minute game adjudication. Printed paid-fee opportunities need cost-modifier, lock, Special Energy and opponent competing-line guards before they can be shared across all decks.

**Recommendation to Issue25 steward:** use a **general owner-visible multi-unit paid-retreat policy with exact native payment and opportunity cost** in the same selected symmetric two-seat closure, rather than copy this exact rank1/turn33 condition. The current simpler owner paid-retreat selectors in \`simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs\` and \`simulation/twinleaf/agent10-flexible-paid-retreat-frontier.cjs\` explicitly gate on printed one-unit cost. This verified counterexample is evidence that the current owner bot's apparent native win or loss is sensitive to missing reasonable retreats. Preserve full source equality and the complete opponent reply for any next step.

Reproduction: [v2 owner-decode policy hook](../../simulation/twinleaf/agent2-rank1-dialga-owner-decoder-retreat-v2.cjs), [original-sixty full run](../../simulation/evaluation/agent2-rank1-dialga-owner-decoder-retreat-aba-v2.cjs), [four pure safety suites](../../tests/agent2-rank1-dialga-owner-decoder-retreat-v2.test.cjs), existing [manual workflow](../../.github/workflows/agent2-fss-float-rank3-native.yml).
