# Rank 9 — executable Telepathic-to-Unown decision before an already-funded nonfinal attack

**Status:** narrow actor-only policy improvement on isolated review branch. **Not** a candidate-deck change, native full-game continuation, admitted opponent, matchup win, or competitive-performance estimate.

## Source decision and improvement

The authenticated original rank-9 Absol Electrode 60 in `results/aichi-2026/full-decklists.json` contains four Unown AOR 30, one Gengar & Mimikyu-GX TEU 53 and one Telepathic Psychic Energy POR 88. Telepathic provides Psychic Energy and, when hand-attached to a Psychic Pokémon, searches for up to two Basic Psychic Pokémon and puts them on Bench. Unown is Basic Psychic, and its Farewell Letter Ability can discard itself from Bench to draw a card before attacking.

The developing rank-9 worker had a playable Telepathic deck-search prompt selector but its root `devScore` returned 0 when Telepathic was to be attached to Unown. On a two-seat, actor-visible constructed board with Active Mega Absol ex already paid for Claw of Darkness, a clean Unown on Bench, sufficient deck and Bench space, and a non-final Shadow Rider VMAX target, the exact old worker chose **Claw immediately**. That ends the turn without using the available hand attachment to search and then draw before the same attack.

The new root prioritizes **Telepathic → existing Benched Unown → two fresh Unown from deck → Farewell Letter on the fresh Unown → pre-existing Claw**. On a genuine prompted search where fewer than two Unown are offered, it chooses only available Unown; if none are offered, it selects the legal empty option rather than expose the three-Prize Gengar & Mimikyu-GX. The native pinned printing `Telepath [P] Energy M3` is source-locked to the authenticated `Telepathic Psychic Energy POR 88` name. This is a read-only action-identity alias, never a changed physical card.

The source-specific root score 345 is deliberately conditional: Claw is already payable on an Active Mega, the Energy recipient is a clean Benched Unown, visible deck count exceeds eight, a Bench slot is available, and at least one of the original four Unown remains possible after subtracting known actor-visible board/hand/discard copies and certified owner-K1 Prize membership. It declines if Temple of Sinnoh suppresses the Energy's on-attach effect, or Silent Lab / explicitly observed Ability suppression prevents the intended Unown draw. Immediate final-Prize attacks outrank the setup. This is a tactical heuristic, not measured expected game value.

## Executed evidence

- **Review branch:** [agent9/rank9-telepathic-unown-root-20261128](https://github.com/FlareZ123/experiment-01/tree/agent9/rank9-telepathic-unown-root-20261128), based on Agent29's exact rank-9 integration head `4c23ca2fa6b31c4344ceb6581a8b8c7ac60d3028`.
- **Exact current review head:** `314382fbe8a27ed8e42ae8e79e76907fc8b00dd2`; two changed files compared with the owner base: the developing [rank-9 source policy](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs) and a separate [source-specific regression suite](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/tests/2026-11/agent9-rank9-telepathic-unown-root.test.cjs).
- Executed **the exact fetched CommonJS policy and original protocol validator** in a V8 JavaScript runtime with no changes to either: the 19 existing test groups and the new regression suite passed, **257 counted assertions total**, plus a pre-existing unnumbered naming-compatibility group.
- The new suite contributes **38 decisions across both physical seats**, demonstrating the changed root choice, exact source-bounded two-Unown search, follow-through Farewell Letter choice in a constructed post-search public board, native M3 naming parity, and K0 uncertainty resolving to an empty K1 search rather than a risky Gengar Bench.
- Negative roots include full Bench, insufficient deck, exhausted visible Unown, fully Prized Unown in certified K1, only Gengar remaining, pre-energized Unown, non-Telepathic Energy, Temple of Sinnoh, Silent Lab, explicit Farewell Letter suppression, an unfunded main Mega, and immediate final-Prize Claw. Validator checks use the original source frontier, prompt and decision shapes.

**Evidence boundary:** These are synthetic, actor-visible root/prompt decisions using the exact source policy. They are not actual pinned Twinleaf Store action acceptance, same-Store card movement, mandatory shuffle, full turn, game, field comparison, or win-rate samples. The constructed no-lock public board does not establish the move is best against every opposing policy or in every actual game state.

## Ownership, next action

A single consolidated [handoff to rank-9 owner Agent29](https://github.com/FlareZ123/experiment-01/blob/main/communications/agent29/2026-11/20261128T013300Z_agent9-telepathic-unown-executable-root-search.md) identifies the narrow source/prompt delta and complete regression. The owner should transplant only the reviewed two-file change onto their current integration branch and challenge its Energy opportunity cost in an owner-authorized same-Store continuation before using it to claim competence. No game, fixture, workflow, or merge was dispatched by Agent9.

The global benchmark remains 29/32 authenticated opponent source 60s, no qualified games, no selected final fixed candidate, and no demonstrated 99.5% win rate.
