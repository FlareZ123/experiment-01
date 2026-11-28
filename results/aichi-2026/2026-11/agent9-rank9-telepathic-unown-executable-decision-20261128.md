# Rank 9 — executable Telepathic-to-Unown decision before an already-funded nonfinal attack

**Status:** narrow actor-only policy improvement on isolated review branch. **Not** a candidate-deck change, native full-game continuation, admitted opponent, matchup win, or competitive-performance estimate.

## Source decision and improvement

The authenticated original rank-9 Absol Electrode 60 in `results/aichi-2026/full-decklists.json` contains four Unown AOR 30, one Gengar & Mimikyu-GX TEU 53 and one Telepathic Psychic Energy POR 88. Telepathic provides Psychic Energy and, when hand-attached to a Psychic Pokémon, searches for up to two Basic Psychic Pokémon and puts them on Bench. Unown is Basic Psychic, and its Farewell Letter Ability can discard itself from Bench to draw a card before attacking.

The developing rank-9 worker had a playable Telepathic deck-search prompt selector but its root `devScore` returned 0 when Telepathic was to be attached to Unown. On a two-seat, actor-visible constructed board with Active Mega Absol ex already paid for Claw of Darkness, a clean Unown on Bench, sufficient deck and Bench space, and a non-final Iron Thorns ex target, the exact old worker chose **Claw immediately**. That ends the turn without using the available hand attachment to search and then draw before the same attack.

The new root prioritizes **Telepathic → existing Benched Unown → two fresh Unown from deck → Farewell Letter on the fresh Unown → pre-existing Claw**. On a genuine prompted search where fewer than two Unown are offered, it chooses only available Unown; if none are offered, it selects the legal empty option rather than expose the three-Prize Gengar & Mimikyu-GX. The native pinned printing `Telepath [P] Energy M3` is source-locked to the authenticated `Telepathic Psychic Energy POR 88` name. This is a read-only action-identity alias, never a changed physical card.

The source-specific root score 345 is deliberately conditional: Claw is already payable on an Active Mega, the Energy recipient is a clean Benched Unown, visible deck count exceeds eight, a Bench slot is available, and at least one of the original four Unown remains possible after subtracting known actor-visible board/hand/discard copies and certified owner-K1 Prize membership. It declines if Temple of Sinnoh suppresses the Energy's on-attach effect, or Silent Lab / explicitly observed Ability suppression prevents the intended Unown draw. Immediate final-Prize attacks outrank the setup. This is a tactical heuristic, not measured expected game value.

## Executed evidence

- **Review branch:** [agent9/rank9-telepathic-unown-root-20261128](https://github.com/FlareZ123/experiment-01/tree/agent9/rank9-telepathic-unown-root-20261128), based on Agent29's exact rank-9 integration head `4c23ca2fa6b31c4344ceb6581a8b8c7ac60d3028`.
- **Exact current review head:** `c6dc98faa7f3f74a80a7e76329c1e34971ab6b9a`; two changed files compared with the owner base: the developing [rank-9 source policy](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs) and a separate [source-specific regression suite](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/tests/2026-11/agent9-rank9-telepathic-unown-root.test.cjs).
- Executed **the exact fetched CommonJS policy and original protocol validator** in a V8 JavaScript runtime with no changes to either: the 19 existing test groups and the new regression suite passed, **271 counted assertions total**, plus a pre-existing unnumbered naming-compatibility group.
- The new suite contributes **70 decisions across both physical seats**, demonstrating the changed root choice, exact source-bounded two-Unown search, follow-through Farewell Letter choice in a constructed post-search public board, native M3 naming parity, and K0 uncertainty resolving to an empty K1 search rather than a risky Gengar Bench.
- Negative roots include full Bench, insufficient deck, exhausted visible Unown, fully Prized Unown in certified K1, only Gengar remaining, pre-energized Unown, non-Telepathic Energy, Temple of Sinnoh, Silent Lab, explicit Farewell Letter suppression, an unfunded main Mega, and immediate final-Prize Claw. Validator checks use the original source frontier, prompt and decision shapes.

**Evidence boundary:** These are synthetic, actor-visible root/prompt decisions using the exact source policy. They are not actual pinned Twinleaf Store action acceptance, same-Store card movement, mandatory shuffle, full turn, game, field comparison, or win-rate samples. The constructed no-lock public board does not establish the move is best against every opposing policy or in every actual game state.


## Direct downstream payoff: Rescue Carrier replays searched Unown

Rank 9's actual source 60 has **four Rescue Carrier**. A two-Unown Telepath search followed by two Farewell Letter uses deposits two original Unown in discard. A held Rescue Carrier can return both (90 HP or below) to hand, allowing **two new hand-to-Bench entries and two further Farewell Letter choices** before the same funded Claw. The current source-bound worker already scored and chose Carrier, both actor-discard Unown selections, subsequent hand-to-Bench plays, both Farewell abilities, and eventual Claw; no new implementation was needed for these later phases.

The new test staged seven additional source-bound decisions per physical seat after the original Telepath sequence. These are **constructed actor-visible post-effect boards** with protocol validation, not a same-Store native outcome: it does not certify actual card movements, repeatability in a game or a four-card draw yield in a particular hand. Still, it directly demonstrates that the root choice unlocks a pre-existing **Telepath → Unown ×2 → Farewell ×2 → Carrier → replay Unown ×2 → Farewell ×2 → attack** policy line that the original early-Claw decision missed. This is more important than isolated access because it shows connector and draw continuation.


## Better on-attachment recipient when a Gengar is already in play

A second executed two-seat counterexample arose from the same choice: with both a clean Unown and an **already-Benched, unenergized Gengar & Mimikyu-GX** as legal targets, the initial branch attached Telepath to Unown and left Gengar without a Psychic Energy. Attaching to the *existing* Gengar permits the same two-Unown search, funds a backup Psychic attacker, and does **not** add another three-Prize Pokémon. The branch now prefers that existing Gengar recipient (355 against the clean Unown's 345) only while the main Active Mega is already funded and the search/draw conditions hold. If Gengar already carries Energy, it instead prefers the clean Unown; the two-choice comparison is executable for both seats and adds four new assertions. This is a **conditional heuristic**: opposing gust/threats and future energy requirements may reverse its merit.

The tests also show the already-Benched Gengar alone can initiate the search when no Unown is yet on Bench; an already-energized Gengar instead rejects redundant hand attachment. This adds four independent two-seat decisions.


**Opponent-identity correction:** The positive synthetic control now uses an actual published Aichi source printing, **Iron Thorns ex TWM 77** (ranks 6/24/29), with 230 HP and Fighting Weakness. A funded Mega Absol's 200-damage Claw does not Knock Out this opponent. The original provisional Shadow Rider VMAX control omitted its actual Darkness Weakness, potentially hiding a direct 3-Prize KO; it was replaced rather than retained as matchup support. All original and extended tests still pass after the correction. Iron Thorns's Rule-Box Ability suppression is consistent with this Basic Unown's no-Rule-Box Farewell Letter route, but native Ability-suppression behavior remains an owner Store requirement.


## Benchmark-relevant non-final three-Prize KO sequence

The first test control against a real Iron Thorns ex allowed the new search decision before a non-KO attack. A more consequential card-accurate source state occurs against **Shadow Rider Calyrex VMAX CRE 75**: 320 HP, Darkness Weakness ×2, facing an Active Mega Absol ex with a fully paid 200-damage Claw. The attack does **400 and takes three Prizes**, but if the rank-9 player has six Prizes remaining and the opponent still has a Benched Lillie's Clefairy ex, that KO does **not** end the game.

The previous root had a hard non-final-KO gate and selected Claw immediately, even when the manual Telepath attachment plus two Unown draws could resolve before the **same** KO. The branch now scores this source-specific hand attachment slightly above the already available non-final KO and explicitly admits it through the root's guarded non-final setup branch. It does not defer a guaranteed final-Prize KO or sole-Active board-out. Two-seat staged tests verify: **Telepath first → two Unown selection → Farewell Letter before Claw**, and opposite **attack-first** decisions for both game-ending variants (10 added assertions). The available attack, Prize structure, and stated Weakness are authentic source/card-text facts; the continuation is still synthetically staged, not actual native Store execution. A complete replay would need to demonstrate the automatic Telepath deck prompt, both physical Unown transfers, their draws, then final KO on the same real turn.

**Strategic condition:** This is not an assertion that spending Telepath before every KO is optimal. It competes for the manual Energy attachment and may alter future attacker readiness, time management or matchup risks. The current code only invokes this extra priority when an existing funded Mega can still produce the non-final Claw and a disposable Unown-search route is actor-visible.

## Ownership, next action

A single consolidated [handoff to rank-9 owner Agent29](https://github.com/FlareZ123/experiment-01/blob/main/communications/agent29/2026-11/20261128T013300Z_agent9-telepathic-unown-executable-root-search.md) identifies the narrow source/prompt delta and complete regression. The owner should transplant only the reviewed two-file change onto their current integration branch and challenge its Energy opportunity cost in an owner-authorized same-Store continuation before using it to claim competence. No game, fixture, workflow, or merge was dispatched by Agent9.

The global benchmark remains 29/32 authenticated opponent source 60s, no qualified games, no selected final fixed candidate, and no demonstrated 99.5% win rate.
