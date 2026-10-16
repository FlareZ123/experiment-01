# Agent 25: New Moon Perfection / turn-two hand-lock candidate lead

**16 October 2026.** Evidence classification: contemporaneous first-person tournament account, independently checked card text, and proposed test design. **No runnable 60-card inventory ingested, no Twinleaf game result, and no game-win-rate claim.**

## Source and identity

A May 13, 2026 [first-person report by おっくわ / @sabpokemon](https://ottopoke.hatenablog.com/entry/2026/05/13/183822) describes an Expanded deck called **新月パーフェクション (New Moon Perfection)** used at CL Aichi 2026 Open. The report provides Japanese official deck code **`GxxDYx-a4rD4W-a8xYxc`** and a deck image, plus precise turn sequencing. The pilot explicitly credits friends with the original construction.

The pilot reports **6–2 Swiss, 52nd place**, with **4–0 against four Regidrago opponents** (rounds 2, 4, 5, 6), one win against Psychic Lopunny, one win against Dragon Lugia, and losses against Raichu/Electro Rain and Iron Thorns. The record is self-reported, unrandomized and extremely small. The author's stated participant count is 962, which differs from the repository's existing 926-person event figure; the discrepancy is not resolved here. This is a **potential non-Top32 candidate or adversarial fixture**, not evidence that it improves on the rank-1 reference.

## Exact two-turn tactical line to test

The article explicitly prefers choosing **second**. Its intended first attacking turn:

1. Put **Gengar & Mimikyu-GX** into Bench/discard as a copy payload, obtain **Mewtwo & Mew-GX** as the Active attacker, establish **Duskull** on the Bench, and place a Basic Psychic Energy in discard. Attach a Psychic Energy from hand and **Powerglass** to Active Mewtwo & Mew-GX.
2. Use **Perfection** to copy **Horror House-GX** (one Psychic Energy). During the opponent's next turn, that attack restricts playing cards from hand. The **Powerglass** end-of-turn trigger can attach the discarded Psychic Energy to its Active holder, bringing it to two. Crucial timing: Powerglass attaches *after* the GX attack; adding that energy does not retroactively activate Horror House's extra-Energy draw-to-seven clause.
3. On the pilot's next turn evolve Duskull into the **Cursed Bomb Dusclops**, apply Cursed Bomb and its self-KO so the opponent takes a Prize. Establish **Lunatone (New Moon)** and **Solrock** before or while setting up **Path to the Peak**. The New Moon Ability shields the pilot's Pokémon against Stadium effects while Path suppresses opposing Rule-Box Abilities.
4. Use **Ace Trainer** once the opponent has fewer Prize cards left: both shuffle their hands into their decks, then the pilot draws six and the opponent draws three. Attach a third Psychic Energy to Mewtwo & Mew, and copy **Trevenant & Dusknoir-GX's Night Watch**, dealing 150 damage and randomly returning two cards from the opponent's hand to their deck. With an otherwise unchanged opponent hand, three becomes **one**.

This is a **highly contingent ALS**. Each prerequisite is an independent possible failure: start/Active position; Perfection unblocked at attack time; Energy in hand/discard; Powerglass in time and still Active at end of turn; GX usage available; payload in discard/Bench; Duskull present a turn before evolving; Cursed Bomb accessible and legally activated; Ace Trainer's Prize deficit; Supporter not already used; Lunatone plus Solrock and Stadium availability; third Energy and Night Watch payload; opponent's other non-hand actions, replacement Stadiums, and opponent's board.

Card text cross-checks: the provided English card database includes **Mewtwo & Mew-GX UNM 71** (Perfection), **Gengar & Mimikyu-GX TEU 53** (Horror House-GX), **Trevenant & Dusknoir-GX SM217** (Night Watch), **Lunatone OBF 92** (New Moon), **Powerglass SFA 63** and **Ace Trainer AOR 69**. The official [Mewtwo & Mew text](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm11/71/), [Powerglass text](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv6pt5/97/), and [Pokémon's Lunatone/New Moon strategy explanation](https://www.pokemon.com/uk/features/arceus-vstar-strategy-improving-a-winning-deck-with-scarlet-violet-obsidian-flames) independently support central components. English set abbreviations are included as identifying examples, not verified Japanese list printings.

## Specific counter-pressure evidenced in the source

- **Iron Thorns / Ability lock:** Perfection is an Ability, so active Initialization can prevent the core copied-attacks line. The pilot describes trying the Gengar & Mimikyu attacker itself or setting up New Moon/Path, and reports losing that round after Psychic Energy Prize shortage, Energy disruption and deck-out. Do not count the four Regidrago wins as evidence of Iron Thorns competence.
- **Raichu / Klefki:** The first-round loss was attributed in part to choosing the wrong Cursed Bomb target and then lacking a way to clear the opponent's Klefki. The line needs an exact Active-lock escape and target-allocation policy.
- **Regidrago / Megaton Blower:** The fourth-round Regidrago win required the opponent to miss follow-up draws after a lucky surviving disruption line. The article explicitly describes this as luck, a warning against claiming deterministic lock strength.
- **Stadium ordering:** The author claims New Moon can continue through a later Silent Lab but cannot be switched on under an already active Silent Lab. Treat this as a rule/ordering hypothesis requiring independent paper ruling and engine regression before implementing a blanket immunity toggle.

## Next precise research tasks

1. Retrieve the **complete 60-card registered inventory** from the first-person official deck code or fully readable deck image; verify all counts, identifiers, Japanese paper Expanded legality, and permissions against the source. Until then, exclude from fixed-list leaderboard and 29/32 opponent manifest.
2. Add a direct **Powerglass-after-Horror-House fixture** checking the end-of-turn Energy attachment and verifying no retroactive extra-GX draw.
3. Add a staged **Dusclops self-KO -> opponent Prize -> Ace Trainer -> Night Watch** fixture with exactly three opposing hand cards and independently verified random selection. Check opponent's actual allowed actions under Horror House, including Ability availability.
4. Add **Path + New Moon ordering** and **Iron Thorns/Klefki Active suppression** fixture pairs. Validate both genuine damage and player-card restrictions, not only chosen action names.
5. Only after deck extraction and effect tests, quantify first-two-turn hand-lock availability and compare the unchanged 60-card candidate across all published Aichi ranks with both-seat policies. Preserve the 3 unknown rank inventories, failures and confidence limits. Candidate strength is currently **unmeasured**.

**Research implication:** This documented turn-two pressure package combines opponent hand compression, Stadium asymmetry and an attack copied by Perfection. It expands the range of attack/lock policies the swarm should benchmark beyond the three existing Shadow Rider lists. It is strategically vulnerable to exactly the Ability locks and aggressive non-hand disruption represented in the Aichi field, so adoption cannot be inferred from the report.
