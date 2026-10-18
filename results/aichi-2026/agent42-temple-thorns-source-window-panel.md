# Agent 42: preregistered Temple Wobbuffet source-window panel

**Registered before CI outcomes, 18 October 2026 UTC.** Research objective: determine whether an unchanged Temple Shadow Rider candidate executes any Wobbuffet plus Latias plus charged VMAX opportunities in genuinely source-dealt games against the three exact Iron Thorns 60-card lists. This is an observation of weak autonomous policies. It is not competitive game evaluation or a win-rate estimate.

## Frozen registration and implementation

- Candidate: [Temple Shadow Rider v1 fixed 60](candidate-temple-shadow-rider.json), with singleton Wobbuffet PHF36 and Latias ex SSP76.
- Opponents: published exact rank **6, 24, 29** Iron Thorns ex sources in [the 29-deck manifest](full-decklists.json). Unknown ranks 23/25/28 stay unknown.
- Seeds: `2026101851`, `2026101852`, `2026101853`, `2026101854`, reused across each ranked opponent as a **paired deterministic design**, not independent samples across ranks.
- Physical candidate seats: both A=0 and B=1 for each rank/seed, **24 precommitted source pairs**. The genuine actual first player is read from the Store's draw-log-verified `firstTurnSlot`; no claimed 12/12 actual first split.
- Pinned Twinleaf engine revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Decision policy: existing shared opt-in `expanded-action-fidelity-probe-v1`, not a competent human opponent or source-specific optimal Temple pilot. Maximum 400 root actions per game.
- [Runnable panel](../../simulation/twinleaf/temple-thorns-source-window.cjs). Existing [manual-only engine workflow](../../.github/workflows/aichi-temple-engine.yml) adds an explicitly opt-in invocation and retains a 14-day raw archive. The original staged board tests remain unchanged.
- The source resolver's existing permitted Basic Energy printing and Japanese promo conversions are reported through the plan; unresolved source printings are not silently substituted.

## Observation and mechanical acceptance gates

The read-only adapter wraps the real bot's next-action selection and inspects the **acting Temple player's own hand and public board only**. It records the first ordinary decision of each own turn and distinct moments when Wobbuffet is Active: Latias on Bench, VMAX(s) on Bench, actual attached Psychic by location, and whether any VMAX has three attached Psychic. Opposing hand, face-down Prizes and hidden deck order do not enter bot choice or observation. Real Store attack declarations are counted separately from owner observed capability.

All 24 trials remain in the denominator if Wobbuffet is absent, never selected Active, removed before T2, or the game has no eligible readiness window. The first fixed rank-6/seed/seat source game is replayed with the adapter disabled and requires exact equality of a fingerprint of root action counts, printed attack traces, final visible board and terminal result. This tests **bounded observer noninterference** under one selected root-game signature, not full reducer, prompt, or clone correctness.

A ready-window witness requires all of: **Wobbuffet currently Active, Latias currently Benched, another Benched Shadow Rider VMAX holding at least three Psychic Energy**. Even that witness establishes only observed resources. It does not claim the owner legally performed the Wobbuffet→VMAX retreat, announced Max Geist, attacked twice, took Prizes, or defeated a competent Iron Thorns opponent.

## Status and interpretation rules

**CI outcome pending when this registration was written.** Report run ID, commit, success/failure, raw archive and every relevant negative exposure after execution. If no ready windows are found, the narrow conclusion will be absence of that specific observed state under the declared weak policy and sample; it will not be a proof the unchanged candidate cannot execute the line. Match outcomes, if any, are engine diagnostics, never a 99.5% field win-rate denominator.

Current field coverage: **29/32 exact published opponent 60s**. **Independently competitive-qualified games: 0.**
