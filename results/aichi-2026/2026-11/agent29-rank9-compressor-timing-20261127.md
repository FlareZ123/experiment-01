# Rank 9: defer exposed Compressor fuel on the opening turn

Agent29, 2026-11-27. Isolated rank9 tactical-slice branch, not an active policy or release. Base 9cc374a961c179a95b305f470262755c5d96b657, source rank-9 original 60 unchanged, Twinleaf pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. No native CI, fixture, game, merge or candidate change.

## Decision

Girafarig LOT94's Get Lost costs one Colorless and sends two cards from the opponent's discard pile to the Lost Zone (provided card pool, sm8-94). The original rank-9 source relies on discard Energy for Electrode-GX's Extra Energy Bomb. A legal ordinary first-turn evolution is unavailable, so early Compressor can expose scarce fuel before the rank-9 pilot can use it. The existing policy protected basic Darkness when selecting Compressor discards but still spent the Item prematurely. v16 now chooses not to play it, or prioritize obtaining it via a Trainer search, on the first own turn when an unconcealed opposing Girafarig is publicly in play and the Bomb source is not live. It retains the eager route without that visible threat and resumes Compressor valuation next own turn. It does not use an unseen opponent deck identity or hand. An already-authorized Compressor prompt retains its old cost-conscious selection; we do not claim that selecting fewer cards restores a consumed Item.

## Evidence and limitations

The existing restricted two-turn paired model in [the JSON result](agent29-rank9-bomb-opening-20261127.json), 10,000 legal physical opening deals, seed 20261127, found 287 ready eager vs 273 ready defer in the no-cut arm, 66 eager vs 270 defer under a hypothetical two-Energy discard cut, 204 paired gains and zero paired losses in that cut arm. Without the cut, defer gained 33 and lost 47 paired deals. These are model-specific setup outcomes, not actual Girafarig attack frequencies, not v16 policy frequencies, and not game win rates. The cut was imposed rather than produced by a competent opponent. The conditional root is therefore a testable tactical hypothesis, not a general prohibition or proof of optimal discard timing. Benched Girafarig might not reach Active; a new opposing Girafarig might appear from hand; hand disruption could remove the held Compressor; the implemented condition deliberately does not infer those hidden facts. The search preference is not a veto on every possible optional future resource pick (e.g. Secret Box may still obtain a low-priority Item).

Exact policy/test module bodies executed in the code-mode JavaScript runtime against the existing protocol module:

- passed 23 synthetic assertions
- passed 14 Bomb planner assertions
- passed 6 protocol-validated setup/Claw assertions
- passed 11 protocol-validated development assertions
- passed 9 Temple/payment/Max Geist threat assertions
- passed 9 mobility/source-inventory assertions
- passed 9 secondary-attack/Stadium assertions
- passed 6 Secret Box/Heavy Ball assertions
- passed 9 Bomb-to-mobility plan assertions
- passed 6 Rope/one-step winning-line assertions
- passed 10 first-turn Horror House route assertions
- passed 9 board-out and Prize-trade assertions
- passed 12 draw-reset, disruption, and intentional-decline assertions
- passed 9 active-source Bomb and promotion assertions
- passed 8 conditional Compressor timing assertions

150 tactical assertions total (142 previous + 8 new). This is synthetic root/prompt decision and frontier/decision-validator evidence only; no Node worker/native Store run. The primary full-policy blocker remains the native exact multi-transfer Extra Energy Bomb continuation. This change does not address that host capability or authorize it.

## Next
When a coordinated rank-9 release is permitted, evaluate the same immutable source with a competent candidate that can actually choose between Get Lost and competing attacks. Record protected fuel, lost opportunity to use Compressor, and same-turn Bomb conversion. Do not count constructed deals as field games.
