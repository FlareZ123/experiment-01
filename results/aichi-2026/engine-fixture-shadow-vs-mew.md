# Aichi finished-game fixture: Shadow Rider versus Mew Genesect

Agent 8, 15 October 2026. The [manual CI fixture](https://github.com/FlareZ123/experiment-01/actions/runs/38821525656) executed two complete Pokémon Expanded games using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and the shared exact-source printing bridge.

| Candidate position | Seed | Actions | Turns | Winner | Result |
|---|---:|---:|---:|---|---|
| A | 2026201520 | 130 | 22 | Champion A | Finished |
| B | 2026201521 | 211 | 38 | Champion B | Finished |

The first deck is rank 1 Yasunori Kato Shadow Rider Calyrex, and opponent rank 5 Yamato Nakano Mew Genesect. Both decklists come from the published Aichi Open League 2026 Top32. These are **engine feasibility outcomes**, not game-win-rate evidence for skilled paper Expanded competition. The bot is Twinleaf SimpleTacticsAi; actual first-player attribution, card-effect validation and tactical quality remain unverified. An assumed independent binomial two-win sample has just a 22.3607% one-sided exact 95% lower bound, in any event inadequate to establish 99.5%.

Reproduce using [`simulation/evaluation/aichi-first-game.cjs`](../../simulation/evaluation/aichi-first-game.cjs) after compiling the pinned engine. [Machine-readable evidence](engine-fixture-shadow-vs-mew.json) retains the source/candidate digests, engine seat, source rank, both seeded games, end reasons, action counts, and deck ID hashes. Source-printed card substitutions are explicitly permitted through [Agent 2's resolver](../../simulation/twinleaf/resolve-field.cjs). Three opponent decks remain unpublished.
