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

## Further actual actor decisions (same branch)

6. **Iron Thorns Sky Field counter:** detect a genuinely reachable Full Moon Rondo knockout needing one, two, or three additional Bench occupants; put Sky Field in play, then take the offered Unown/Minior Bench actions one at a time. Quick Ball can recover the final actual offered Unown from the actor's searched deck if no directly playable Basic remains and a safe discard is available. Do not burn that connector if a playable Basic is already in hand.
7. **Snorlax with Float Stone:** an unambiguous opponent Float Stone can be selected with a native Field Blower prompt, then one Psychic attachment enables Minior's optional Far-Flying Meteor promotion and a 160-damage Gravitational Tackle knockout; refuse the route if more than one Float Stone is visible and choice custody is ambiguous. Snorlax Block separately vetoes Float Stone used as our own retreat solution.
8. **Supported card draw:** Crobat V Dark Asset on-play prompt, Dedenne-GX Dedechange discard-then-six, first-turn Squawkabilly ex Squawk and Seize, Fezandipiti ex Flip the Script only with an affirmative signed prior-opponent-KO receipt, and actor-visible low-hand Marnie after needed attachments/Bench placement. Protect first-turn Battle VIP Pass and essential low-hand pieces from bulk reset. Pinned Twinleaf's printed `Dedenne GX UNB`/Tapu Lele GX fullNames are accepted alongside published source hyphenated names.
9. **Psychic Resistance:** apply the printed Resistance after weakness in Rondo/Guzma target damage forecasts; several 2/3-Prize choices flip at real KO thresholds.
10. **Tapu Lele-GX Wonder Tag:** with source-bound optional search and no public Ability lock, take a supported terminal Guzma or low-hand Marnie; do not select Raihan until its native attached-Energy/search continuation is implemented and certified.

## Reproducible bounded evidence

Exact fetched branch policy/test JavaScript source blobs were actually evaluated in a V8 synchronous CommonJS shim with stand-ins for Node's test/assert modules; **76/76 constructed decision cases passed** across both physical seats. Policy Git blob: `1de3c6139e6a1b15bfe97043be74cc806b05c997`; tests Git blob: `2c78f5d969cdbc74cdc12a712f3b1aca22dc9386`. This is source-logic execution, not a Node test runner, real native Twinleaf Store continuation, authenticated physical card movement, full game, or competitive result.

The original rank30 worker's earlier protocol-shaped and opt-in Wondrous Patch tests remain separate, and their results were not reclassified. No native CI, fixture, ranked matchup, owner-gated game, registration, or merge was dispatched.

## Actual remaining obstacle

The next decisive test is an **authorized** same-Store root/prompt continuation, first covering physical setup `CHOOSE_STARTING_POKEMONS`, followed by a real Skyliner free `RetreatAction` to funded Clefairy, then a printed Full Moon Rondo, including opposing ability-lock negatives. The worker still lacks end-to-end Copycat support; shared `agent36-prompt-projection.cjs` explicitly rejects Copycat without copied-attack provenance, and Wondrous Patch remains opt-in and unadmitted. Other source continuations such as Supporter Raihan/Rescue Stretcher remain incomplete. These must not be silently counted as policy competence.

**Status unchanged:** no qualified rank-30 game, no full-field result, no certified 99.5% win rate. Branch-only policy development; seek independent review and the owner-controlled native gate before admission.
