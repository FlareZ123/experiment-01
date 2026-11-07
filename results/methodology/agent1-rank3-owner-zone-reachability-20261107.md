# Rank-3 Handiwork and Rototiller reachability under the developmental common policy

**Agent 1 | 7 November 2026**

## Finding

Across the two preregistered physical-seat panels, the pinned Twinleaf engine reproduced **32/32 original rank-3 versus rank-1 physical deals** with zero fingerprint, deck-mapping, status, winner, or action-count parity failures. The owner-only observer captured 1,149 source-owner decision states. Team Rocket's Handiwork was observed in the source owner's hand in 18/32 games and in 434 decision snapshots. It was never observed in the source owner's discard, so the registered structural Rototiller predicate was never satisfied.

This is a **policy-conditioned reachability result**. The existing weak common policy does not play Handiwork even when it is held and the current-turn Supporter quota is open. It does not establish that a competent Snorlax Stall player cannot create the Handiwork-to-Rototiller line.

## Frozen experiment

- Source: original Aichi rank-3 Snorlax Stall 60; converted-deck SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`.
- Reference: original Aichi rank-1 Shadow Rider 60; converted-deck SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Fixed seeds: 290130–290145, run once in each physical source-seat orientation. The seed labels repeat across seats; the physical deals are distinct and are identified by their full-deal and source-deal fingerprints.
- Source-seat 0 panel: source rank 3 at seat 0, rank 1 at seat 1; 16 rows. Prospective schedule: [registration](registrations/agent1-rank3-owner-zone-scan-20261107.md). Native run [42413722272](https://github.com/FlareZ123/experiment-01/actions/runs/42413722272), artifact 13590347257, ZIP SHA-256 `16d096ff706b69148229c41ebbd21df3fd134d134b8f0d242d64a1f8e9064d3c`, JSON SHA-256 `84b1fd72e1852facf91d27dd8285aa2cd32c94fabe680741677a2c45b9d8cf91`.
- Source-seat 1 panel: source rank 3 at seat 1, rank 1 at seat 0; 16 rows. Prospective schedule: [registration](registrations/agent1-rank3-owner-zone-scan-seat1-20261107.md). Native run [42420139127](https://github.com/FlareZ123/experiment-01/actions/runs/42420139127), artifact 13592869386, ZIP SHA-256 `b2a6c7911ba6c2e89a37ad7a03ccaed505128e34d8edeeafd0b02b01090edd6f`, JSON SHA-256 `6df5ebaf102d2cdf743c7a57ca38814346a4b7bbddf09d2cad9031ab714dca81`.
- Policy and game conditions were unchanged between panels: canonical actor-only policy, actor-only root policy, native paper Supporter discipline, same-target Energy selection, 260 native action-root cap, and no card or policy intervention. The owner-zone observer was installed around the real Store dispatch and never supplied to the policy.

## Results

| Measure | Source at seat 0 | Source at seat 1 | Combined |
|---|---:|---:|---:|
| Original physical deals | 16 | 16 | 32 |
| Fingerprint / outcome parity failures | 0 | 0 | 0 |
| Native terminals | 8 | 3 | 11 |
| Action-capped games | 8 | 13 | 21 |
| Competitively qualified games | 0 | 0 | 0 |
| Owner decision snapshots | 504 | 645 | 1,149 |
| Owner-root snapshots | 427 | 552 | 979 |
| Owner-prompt snapshots | 77 | 93 | 170 |
| Handiwork-in-hand snapshots | 193 | 241 | 434 |
| Handiwork-in-discard snapshots | 0 | 0 | 0 |
| Structural Rototiller candidates | 0 | 0 | 0 |
| Games with Handiwork observed in hand | 8 | 10 | 18 |
| Games with Handiwork observed in discard | 0 | 0 | 0 |

Across all 1,149 owner snapshots, the exact Handiwork location counts were:

| Owner zone | Snapshots |
|---|---:|
| Deck | 554 |
| Hand | 434 |
| Face-down Prizes | 161 |
| Discard | 0 |
| Lost Zone | 0 |
| Stadium | 0 |
| Resolving Supporter zone | 0 |

The counts are repeated observations within 32 games, not independent samples. They must not be used as a binomial denominator.

## Policy-conditioned opportunity

The observer's `owner.supporterTurn` field is Twinleaf's count of Supporters already used during the current owner turn. In all 434 snapshots with Handiwork in hand, that count was zero and `cannotPlaySupporterCards` was false. Eleven snapshots occurred on global turn 1 and remain subject to the first-player Supporter restriction. The other **423 later-turn snapshots** passed the observer's basic Supporter quota/lock/turn screen. This screen is not a printed-paper legality or benefit certificate.

The supplied card pool identifies Bunnelby PRC 121 (XY5-121) with Ω Barrage and both one-Colorless attacks: Burrow discards the opponent's top card, while Rototiller shuffles one card from the owner's discard into the deck. Team Rocket's Handiwork FCO 112 (XY10-112) is a Supporter that flips two coins and discards two cards from the opponent's deck per heads. The local card pool marks both printings Expanded legal. The public opponent deck count was nonzero in all 423 later-turn Handiwork-in-hand snapshots (range 1–46), so an empty opposing deck was not the reason the policy skipped the Supporter. The rulebook's Supporter section also confirms the one-per-turn limit.

In those 423 later-turn snapshots, the existing policy dispatched 371 owner-root actions and 52 prompt resolutions. Root action classes were:

| Root action while Handiwork was held | Snapshots |
|---|---:|
| PassTurnAction | 303 |
| PlayCardAction | 56 |
| AttackAction | 12 |

No Supporter was played in any of the 434 Handiwork-in-hand snapshots. I also compared each of the 58 `PlayCardAction` roots with the immediately following owner snapshot (the next native Store ordinal). The hand delta removed only Pokémon/Energy printings: Capture Energy (12), Water Energy (11), Snorlax (10), Galarian Stunfisk (9), Rotom V (5), Girafarig (4), Regirock (3), Mimikyu (3), and Bunnelby (1). No Trainer printing left the hand. This is a retrospective adjacent-state inference, not a selected hand-index receipt, but it independently corroborates that the baseline root policy played no Trainer while Handiwork was held.

The source-seat-0 panel contained 30 Handiwork-in-hand snapshots with Bunnelby PRC Active and printed Rototiller. In 14 of those, Bunnelby had an attached Energy and had not attacked that turn. The policy chose Burrow in 12 of those 14 paid-attack snapshots. The source-seat-1 panel contained no Bunnelby-Active Handiwork-in-hand snapshot. In neither panel did Handiwork enter the discard, and no Rototiller structural candidate existed.

This identifies a material weakness in the current opposing policy: it does not exercise a held Handiwork line. Any future matchup evaluation that treats this common policy as a competent Snorlax Stall opponent risks understating the rank-3 deck's pressure. The appropriate correction belongs in opponent-policy strength and evaluation, after the current whole-policy owner-safe vertical-slice blocker is resolved. This result does not justify another card-specific resolver or a change to the selected shared policy.

## Native interaction versus natural reachability

The separate native fixture in `tests/agent1-rank3-handiwork-rototiller-burrow.native.test.cjs` stages Handiwork in the owner's discard, starts Rototiller, resolves the owner-discard selection, the opponent ShowCardsPrompt, the owner ShuffleDeckPrompt, Omega Barrage confirmation, and the second Burrow. It passes for both physical seats and verifies that the exact Handiwork object moves from discard to deck. That fixture establishes the staged Store sequence. This 32-deal scan establishes that the sequence was not naturally reached under the unchanged common policy in this registered cohort. These are different claims.

## Validation history and artifact caveats

- Earlier run [42412579717](https://github.com/FlareZ123/experiment-01/actions/runs/42412579717) is excluded because its source/candidate physical seat mapping was wrong.
- Run [42413276656](https://github.com/FlareZ123/experiment-01/actions/runs/42413276656) had one false parity flag for seed 290145: the expected full-deal hash ended in `bc9`, while the original baseline and observed deal ended in `bc8`. The observed game fingerprint matched the original baseline. The expected constant was corrected; run 42413722272 then passed all 16 source-seat-0 rows.
- The source-seat-1 raw artifact's free-text `caveat` field mistakenly says `source-seat-0`. Its structured fields say `sourceSeat: 1` and `candidateSeat: 0`, and all 16 source/full-deal fingerprints, deck hashes, statuses, winners and action counts match the preregistered source-seat-1 baseline. The runner now formats this caveat from the requested seat, and the native test asserts the source-seat-1 label. The original artifact is preserved unchanged.

## Limits and next action

These are native diagnostics under a weak development policy, not paper-qualified games. Eleven engine terminals do not establish paper terminal correctness. Twenty-one rows were censored at 260 action roots. The Aichi source list's Japanese Extra printing boundary and full event paper rules remain separate admission gates. No matchup win rate, optimal-policy probability, or competitive deck-strength claim follows.

Preserve the negative result as a policy warning. Do not extend this component lane with more seeds or another Handiwork-specific resolver while the shared whole-policy vertical slice remains blocked. The next useful action is to notify the common-policy steward and rank-3 source owner that the current baseline never uses Handiwork in 423 later-turn structurally open observations, then prioritize the existing owner-safe native decision and complete-game release gate.
