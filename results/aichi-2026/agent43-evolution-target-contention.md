# Agent 43: Shadow Rider evolution target contention and a reversible policy probe

**16 October 2026, normal research Agent 43.** This is a source-level decision-policy diagnosis and an exact opening resource model. It is not comparative gameplay evidence.

## Pinned-source diagnosis

The committed upstream Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, checked out under `vendor/twinleaf`.

- `ptcg-server/src/simple-bot/simple-tactics/evolve-tactic.ts` collects evolution-ready Pokémon through `Player.forEachPokemon`, then takes the **first** matching evolution found in hand.
- `ptcg-server/src/game/store/state/player.ts` implements that enumeration with the Active Pokémon first and the Bench afterward, in index order.
- `ptcg-server/src/simple-bot/simple-bot-definitions.ts` lists `EvolveTactic` before ordinary `PlayBasicTactic` and Energy attachment tactics.
- `resources/cards/en/swsh6.json` identifies Shadow Rider Calyrex VMAX CRE 75 as an Evolution with `Underworld Door`, which attaches Psychic Energy to a Benched Psychic Pokémon and draws cards, and `Max Geist`, whose damage scales with Psychic Energy in play.

The default policy therefore selects an older Active Shadow Rider Calyrex V for a singleton VMAX in hand before considering a second, equally eligible Benched V, even if that Bench V already has more attached Psychic Energy. This source-level selection behavior is deterministic. Whether the alternative is better depends on available attachments, locks, switching, survival and later decision lines.

## Exact natural resource opportunity

I modeled an intentionally narrow opportunity event, conditional on a legal seven-card opener:

1. At least two Shadow Rider Calyrex V copies have been seen by the end of the player's first turn (opening seven plus normal first-turn draw).
2. Exactly one Shadow Rider Calyrex VMAX has been seen by the start of that player's second turn (including the second ordinary draw).
3. Both Vs *could* have been placed on the board. Their actual placement and their attached Energy are **not** modeled.

The exact finite-population probabilities from the source-locked 60-card counts are:

| Fixed inventory | Basics | V | VMAX | Natural two-V, one-VMAX opportunity |
| --- | ---: | ---: | ---: | ---: |
| Rank-1 champion | 14 | 3 | 4 | **1.772754686%** |
| Hood Shield v1 | 15 | 4 | 4 | **3.239984280%** |
| Temple v1 | 15 | 4 | 3 | **2.734296813%** |

The [reproducible BigInt enumerator](../../scripts/first-evolution-contention.cjs) sums the multivariate hypergeometric probability over 8 cards, conditions on the Basic in the original 7, and checks whether the ninth card leaves exactly one VMAX. Six hidden Prizes are integrated out under a uniform shuffle. [Independent exhaustive tests](../../tests/first-evolution-contention.test.cjs) enumerate 40,320 distinguishable eight-card physical decks for both zero and one optional bonus cards. The three 60-card totals have an independent Python combinatorial oracle.

This resource event is a **strictly broader precondition** than the actual policy-target error. It still requires two eligible Vs on the board, a more-Energized later target, a single VMAX, suitable evolution timing and no interfering effects. It also excludes additional search and draw, which can greatly expand access. Neither the small percentages nor their ordering estimates deck strength.

## Reversible research-side counterfactual

[Target selector](../../simulation/twinleaf/shadow-rider-evolution-priority.cjs) inspects only the player's **own visible board and hand**, with no hidden deck/Prize observations, no speculative Simulator, and no process-global randomness. It activates only when exactly one matching VMAX exists in hand, at least two Vs are eligible under the pinned `pokemonPlayedTurn` criterion, and a later V has *strictly more attached Basic Psychic Energy* than the first eligible one. Ties and all other actions fall back to the original EvolveTactic. The selector never assumes the altered decision wins.

[Reversible runner](../../simulation/twinleaf/shadow-rider-evolution-runner.cjs) temporarily inserts the tactic before the pinned `EvolveTactic` for a synchronous experiment and restores the original constructor array even after an error. It does not edit upstream. Both players get the same conditional policy if they play Shadow Rider. The return value identifies the experimental policy.

The [pinned real-Store fixture](../../simulation/twinleaf/shadow-rider-evolution-board.cjs) sets an Active V with zero Psychic Energy, a Benched V with two Psychic Energy, one VMAX in hand, and both Vs older than the current turn. It attempts the default Active evolution and the opt-in Bench evolution on fresh game states, dispatches `PlayCardAction`, and asserts that the Energy remains on the chosen Bench after each legal evolution. This is conditional board testing with actual pinned reducers, excluding match context and opponent responses.

The [manual-only workflow](../../.github/workflows/agent43-evolution.yml) installs and compiles the pinned submodule, runs pure CJS tests and the two real Store actions. [Workflow run 38851996267](https://github.com/FlareZ123/experiment-01/actions/runs/38851996267) was dispatched; at report creation the pure tests and dependency installation passed, while compilation and reducer validation were pending.

## Methodological implications

This intervention is narrower than a general Shadow Rider policy overhaul. It isolates one action-selection axis, uses an exact source-grounded opening event to measure how often its prerequisites can arise naturally, and retains fair same-policy comparisons for any subsequent fixed-seed campaign. For next-stage evidence, retain full action traces, test both starting seats and a realistic opponent response, and measure whether the target switch ever alters a genuine attack line under a legal full match. The eventual 99.5% whole-field win target remains unverified.
