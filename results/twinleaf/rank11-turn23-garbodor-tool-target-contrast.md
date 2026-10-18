# One authentic rank-11 Float Stone target swap exposes meaningful Garbotoxin counterplay

**Agent 8, 18 October 2026.** A bounded **same-source counterfactual** of a single real bot-selected Tool placement. It is intended to challenge the weak opponent policy in a previously selected source-dealt positive-control game. **Zero independently qualified competitive games.**

## Provenance and exact intervention

- Opponent: published Aichi 2026 **rank 11 Wataru Yano Absol/Garbodor exact 60**, actual physical seat A (0), actually first.
- Candidate: original **New Moon Lockbreaker 60-card English-equivalent mechanics proxy**, physical seat B (1), actually second. Neither card inventory changes.
- Actual source seed `1111464409`, conditioned retrospectively on a previous favorable candidate terminal and therefore unsuitable for win-rate inference.
- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Verified compiled regression: existing manual workflow [39160770372](https://github.com/FlareZ123/experiment-01/actions/runs/39160770372) **completed successfully** on code commit `7adc43a7c2a2fdc00f0c8b1bcb5b6c7c8042204b`. Authentic source JSON artifact `rank11-copied-attack-selection` **12149315474**, independently downloaded ZIP SHA256 `e395d50684ca7cbda96ad6807e85979822fb426995cc6b1d79c273f010656ba3`. The artifact includes `retrospectiveTurn23GarbodorToolTargetContrast` and prior uncensored source evidence.
- Reproduce with `simulation/twinleaf/rank11-turn23-garbodor-floatstone-fork.cjs`, wired to additive field in existing `simulation/twinleaf/newmoon-rank11-perfection-delegated-source.cjs`. The wrapper intercepts `SimpleTacticsAi.decodeNextAction` **only** when rank11 actually selects its own-hand Float Stone, at **global turn23**, targeting it to an **already-evolved, Tool-less Garbodor** on its genuine Bench instead of the engine policy's original Active Mega Absol ex. It uses real `PlayCardAction` through pinned Store with the same owner hand index and valid Bench index. Source actor identity and public board are checked before replacement. Every root action preceding **ordinal217** was asserted byte-equivalent on the selected fields between original and alternative game. Exact deck hashes and first-turn source validation match.

## Observed source and counterfactual outcomes

| Source property | Original generic rank11 bot | Float Stone onto Garbodor counterfactual |
| --- | --- | --- |
| Opponent Float Stone action | ordinal217 | same ordinal217, same own-hand card |
| Floated source Active Mega Absol ex at Pass | **yes**, holds one Darkness | **no**, still holds one Darkness |
| Benched Garbodor Pokémon Tool at source Pass | **none** | **Float Stone** |
| Tool still on Garbodor at first next candidate turn24 | absent | **present** |
| Final engine actions | 274 | 318 |
| Final global turns | 36 | 47 |
| Engine winner | candidate B | candidate B |
| Final source/candidate Prizes remaining | [2, 0] | [2, 1] |
| Candidate Perfection declaration count | 2 | 1 |

The alternative created a real source game with a Tool-equipped Garbodor at candidate's turn24; the original source had its Float Stone on the unable-to-attack Mega Absol ex. The model's subsequent outcome and root decision path changed materially. In the alternative, the candidate won with one Prize still unclaimed, emphasizing that raw win/Prize counts do not alone convey tactical quality or why the engine terminated.

This is **one source-dealt Store intervention**. It establishes action **availability and mechanical continuation**, not that the alternative was a game-winning lock against optimal play, that a particular candidate action was blocked by Garbotoxin in this replay, or that policy quality became competitive.

## Printed mechanism and competing uses

- Exact Garbodor BKP 57 **Garbotoxin** applies while it has any Pokémon Tool attached, suppressing every Pokémon Ability in play, hands and discards except Garbotoxin. It would suppress Mewtwo & Mew-GX's Ability-based **Perfection** if the candidate cannot neutralize the Tool or lock.
- Existing independent pinned staged actual-Store test `simulation/twinleaf/new-moon-lockbreak-ability-gates.cjs`, manually compiled [CI 39021653996](https://github.com/FlareZ123/experiment-01/actions/runs/39021653996), confirms equipped Benched Garbodor prevents Perfection visibility and Field Blower can restore it. That fixture does not by itself establish full continuous Ability status on the present source turn24.
- Lunatone OBF 92's **New Moon** concerns protection against Stadium effects when Solrock is present; it does not provide general immunity to Pokémon Ability lock.
- The original active-target Float Stone made Mega Absol's Retreat Cost zero, which might enable other tactical actions. But the source's turn23 completed with a Pass, and independent [energy-exhaustion proof](rank11-turn23-energy-conservation.md) establishes all eight Darkness committed to in-play attachments before the previous KO and no Darkness in the resulting own hand or deck. Neither printed Mega Absol attack was payable with its lone attached Darkness.
- Garbotoxin could also suppress useful **source player's own Pokémon Abilities**; the alternative's opportunity cost, Field Blower response, Tool bounce/replacement, multi-turn prize policy, and alternative early setup lines are not established.

## Evidence quality and next checks

The derived snapshot proves a Tool-equipped Garbodor survived Shopping Center and the candidate's first following decision. The next fidelity gate is to call the pinned `IS_ABILITY_BLOCKED` / printed-power availability check at that actual **live first candidate turn24**, with observer-on/off noninterference and source-objective consistency, and to preserve actual Mewtwo action/reply choices. Also record source Bench occupancy after removing Sky Field and final engine **endReason** so a Stadium-related board-rule or deckout artifact is not mistaken for a stronger attack line.

This result is a **specific counterexample to treating default generic-bot opponent replies as competent**, and a regression seed for future rank11-adversarial policy improvement. It does not add a prospectively sampled match to the target field. **29/32 exact lists; zero qualified competitive games; 99.5% target unproven.**

## Agent 6 follow-up: live next-turn Perfection blockade

The original same-source Float Stone target fork now includes a **detached cloned-Store `IS_ABILITY_BLOCKED`** probe at the candidate's first real non-prompt decision on global turn **24**. It uses the pinned `Simulator(state)` cloning boundary and never passes probe data into the bot action. Exact source seed, physical decks/seats, original prefix through ordinal 216, rank11 Tool placement at ordinal 217 and bot policies remain unchanged. The live candidate Active was **Mewtwo & Mew-GX UNM**, and its Ability-block check returned **`true`**, while Garbodor BKP on the opposing Bench still held Float Stone BKT. This closes the previously unverified actual-decision ability-suppression step.

[Manual compiled CI 39171792486](https://github.com/FlareZ123/experiment-01/actions/runs/39171792486) **passed** on head `2ebb2fd7e7eebab1b1d4f8ddeddd6ca8ca23cd2e`; artifact [12153081516](https://github.com/FlareZ123/experiment-01/actions/runs/39171792486/artifacts/12153081516), ZIP SHA256 `456cbe26d430f8d2922ef96078179d3f59f5da9f8f5c215775fe855c4fc06579`, JSON SHA256 `e1e223e367b440b833b844d939cee3b5959d2e7c957d6e7b7ffe54440f54e725`. The original and altered engine summaries exactly reproduce the prior 274/318 actions, 36/47 turns, respectively, with same winners and prizes. The probe establishes **one live in-engine block**, not full paper fidelity, optimal Tool allocation, observer-on/off complete root parity, a 25-minute paper-clock outcome, or statistically independent candidate performance. Zero competitively qualified games.
