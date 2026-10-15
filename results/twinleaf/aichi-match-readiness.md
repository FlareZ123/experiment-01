# First complete source-deck Aichi engine fixtures

**Agent 2, 15 October 2026.** **Status: actual finished games, weak bot, feasibility only.**

## Trial identities and controls

Pinned engine: `twinleafgg` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source lists: [29 published full lists](../aichi-2026/full-decklists.json) from [Limitless Aichi 2026 tournament 566](https://www.limitlesstcg.com/tournaments/566/decklists). Executable: [source-list fixture](../../simulation/twinleaf/aichi-fixture.cjs), [headless adapter](../../simulation/twinleaf/headless.cjs), [field print resolver](../../simulation/twinleaf/resolve-field.cjs). CI evidence: [run 38820381008](https://github.com/FlareZ123/experiment-01/actions/runs/38820381008), manual dispatch. All three fixtures completed. The required 60-card lists passed Twinleaf's deck validator. The original printings are retained in the manifest and engine ID mappings and exceptions are recorded by resolver.

`SimpleTacticsAi/defaultStateScores` plays both seats. Each trial has a 1,200-action maximum, seeded match RNG, Expanded rules, first-turn draw enabled, first-turn Supporter disabled, and no first-turn attack. With both decks seated under the same policy, wins **cannot** estimate a skilled player's matchup advantage.

| Trial | Seed | Seat 0 | Seat 1 | Actions | Turns | Winner | Remaining Prize cards 0 / 1 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| 1 | 20261015 | Aichi rank 1 Shadow Rider | Aichi rank 1 Shadow Rider | 122 | 26 | Seat 0 | 0 / 6 |
| 2 | 20261016 | Aichi rank 1 Shadow Rider | Aichi rank 10 Regidrago | 118 | 18 | Seat 0 (Shadow Rider) | 0 / 6 |
| 3 | 20261016 | Aichi rank 10 Regidrago | Aichi rank 1 Shadow Rider | 78 | 11 | Seat 1 (Shadow Rider) | 6 / 0 |

Rank-1 deck SHA256 (ordered expanded Twinleaf card ID array): `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. Rank-10 deck SHA256: `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`.

Across each trial, the bot took zero Prizes as Regidrago. This is a **diagnostic signal**. A candidate list's superiority, Regidrago's true matchup, or attack-copy implementation quality cannot be inferred without a targeted attack/action trace and strategic play validation.

## Confirmed feasibility

1. The pinned engine's research adapter completes an actual tournament-sourced 60-card Expanded mirror under a bounded policy, rather than stopping at a synthetic smoke action limit.
2. It completes a cross-archetype match when each list occupies either seat.
3. Random seeds, both ordered list SHA256 digests, final Prize outcomes, action counts, rules, and pinned engine version are reportable.
4. The experiment remains reproducible via manual-only CI without expensive persistent server or database infrastructure, using research-owned hooks outside vendor.

## Not yet demonstrated

- Regidrago `Apex Dragon` discarding, copied attacks, and other necessary advanced interactions actually work and are exercised correctly by the policy.
- Lock, energy, special-condition and Prize rules hold across complex Aichi matchups.
- Any bot makes decisions representative of skilled Japanese Expanded tournament play.
- Different first-player seats or several seeds produce unbiased comparisons: paired tests were small and three entirely missing opponent lists remain unavailable.
- The 99.5% field-win objective has any empirical support. There are no legitimate competitive win-rate observations to report yet.

## Next experiment

Collect per-seat action and attack names, list mutations, deck and hand resources, and whether `Regidrago VSTAR` actually used `Apex Dragon`. Distinguish a weak generic bot failing to construct the deck from engine errors that prevent legal intended lines. Validate paper rules with focused single-effect fixtures before revising candidate decks.

The [overall field evidence protocol](../aichi-2026/benchmark-validity.md) and [exact confidence model](../aichi-2026/evidence-protocol.md) should govern eventual matchup reporting.
