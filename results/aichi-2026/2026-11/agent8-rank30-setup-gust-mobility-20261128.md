# Aichi original rank 30: executable setup, gust, mobility, and Energy decisions

**Agent 8 · 28 November 2026 · development only.**

## Decision changed

The existing exact-original rank-30 Clefairy worker could choose some card roots but had no engine setup decision and no native retreat root. This update turns those previously unhandled game transitions into actor-only decisions and repairs a concrete Guzma target miss. No decklist, paper source inventory, shared runner, source admission, workflow, or frozen candidate is changed.

Development branch: `agent8/rank30-gust-psychic-weakness-20261128`.
Worker: [agent8-rank30-clefairy-opponent-policy.cjs](../../../simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs)
Tests: [agent8-rank30-clefairy-opponent-policy.test.cjs](../../../simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.test.cjs)
Original exact source remains `results/aichi-2026/full-decklists.json`, rank 30, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, 60 unchanged copies.

## Actual decisions

1. **Initial setup and mulligans:** the source-bound `engine` `CHOOSE_STARTING_POKEMONS` selection now places Clefairy Active when offered, followed by a useful Latias ex/Unown/Clefairy Bench subset; it avoids prematurely deploying draw-on-play support liabilities, handles post-bonus Bench choices, answers `GO_FIRST`, and selects the largest legal `WANT_TO_DRAW_CARDS` bonus. Off-source and wrong-phase prompts abstain.
2. **Guzma:** projected Full Moon Rondo damage against a Benched Pokémon now includes printed Psychic Weakness even while the current Active is not Clefairy. A genuine future 3-Prize or 2-Prize winning gust takes precedence over generic Trainers' Mail; VS Seeker recovers an available Guzma if the observed Supporter turn permits it. An offered root and actual actor-owned opponent-/own-Bench choice tokens are required.
3. **Native retreat:** when actor-visible Latias ex Skyliner is explicitly live, a Basic Active Pokémon may select an offered native `retreat` to a physically identified, two-Energy Benched Clefairy. Do not guess paid retreat: printed zero may be raised by unknown costs and the Energy-payment continuation is unsupported. Explicit Path to the Peak, Silent Lab, suppression and restriction checks prevent unsupported selection.
4. **Manual Energy:** prefer an offered, actor-owned target action funding the current underpowered Clefairy; next fund a reserve Clefairy. Prefer Telepathic Psychic Energy when its Bench-search value is available; do not overfund two already-ready attackers or invent target indices.
5. **Exhausted turn:** select native `pass` only if every offered root is pass; do not hide an unsupported Copycat or other real action as a successful pass.

## Reproducible bounded evidence

Exact fetched branch policy/test JavaScript source blobs were actually evaluated in a V8 synchronous CommonJS shim with stand-ins for Node's test/assert modules; **50/50 constructed decision cases passed** across both physical seats. Policy Git blob: `5a059dee53f37457889a3052845e109fe2f061de`; tests Git blob: `21439ec3339aef3bd5a36b4b57f71a0964c32e8e`. This is source-logic execution, not a Node test runner, real native Twinleaf Store continuation, authenticated physical card movement, full game, or competitive result.

The original rank30 worker's earlier protocol-shaped and opt-in Wondrous Patch tests remain separate, and their results were not reclassified. No native CI, fixture, ranked matchup, owner-gated game, registration, or merge was dispatched.

## Actual remaining obstacle

The next decisive test is an **authorized** same-Store root/prompt continuation, first covering physical setup `CHOOSE_STARTING_POKEMONS`, followed by a real Skyliner free `RetreatAction` to funded Clefairy, then a printed Full Moon Rondo, including opposing ability-lock negatives. The worker still lacks end-to-end Copycat support; shared `agent36-prompt-projection.cjs` explicitly rejects Copycat without copied-attack provenance, and Wondrous Patch remains opt-in and unadmitted. Other source continuations such as Supporter Raihan/Rescue Stretcher remain incomplete. These must not be silently counted as policy competence.

**Status unchanged:** no qualified rank-30 game, no full-field result, no certified 99.5% win rate. Branch-only policy development; seek independent review and the owner-controlled native gate before admission.
