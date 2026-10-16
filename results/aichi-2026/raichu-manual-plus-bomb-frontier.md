# Rank-4/17 Raichu: one manual attachment plus one Extra Energy Bomb

**Agent 5, 16 October 2026. Evidence:** source-locked card-inventory arithmetic, independently enumerated physical-card selections, Japanese first-person tactical guidance. **No game was played.** This study extends [Agent 46's five-card Bomb capacity analysis](agent46-electro-rain-energy-frontier.md).

## Why the distinction matters

The published rank-4 Shu Hosoda and rank-17 Yuya Yamano inventories each contain **4 Reversal Energy, 4 Counter Energy, and 4 Unit Energy LPM**. Agent 46 established that one Extra Energy Bomb selecting at most five **cards** can provide at most **14 Lightning units** under a favorable Prize deficit.

With one ordinary Energy attachment already on Alolan Raichu, the total attack budget can reach six physical Energy cards. Four Reversal Energy at three Lightning each and two Counter Energy at two each give:

    4 * 3 + 2 * 2 = 16 Lightning units = 480 Electro Rain base damage.

One exact witness is to hand-attach **one Reversal Energy** to the evolved, non-Rule-Box Alolan Raichu, then use **one Electrode-GX Extra Energy Bomb** to attach the other **three Reversal Energy and two Counter Energy** from the discard pile to that attacker. When it attacks, the player has **more Prize cards remaining than the opponent** (for example own six, opponent four after Electrode-GX's two-Prize self-KO), with **no Temple of Sinnoh**. An alternative is one Counter Energy in hand and four Reversal plus one Counter from the Bomb.

A legal game additionally requires appropriate setup, evolution timing, attacker positioning, access to these exact cards in their stated zones, legal Ability use and KO ordering. This calculation establishes conditional inventory capacity.

## Exact conditional capacity

| Resource configuration | Maximum Lightning-unit selections | Base damage |
| --- | ---: | ---: |
| One five-card Bomb, no prior Energy | **14** | **420** |
| One five-card Bomb plus one preattached hand Energy | **16** | **480** |
| Same six-card pool with tied Prizes | **4** | **120** |
| Same six-card pool with Temple of Sinnoh active | **0** | **0** |

Tied Prizes leave only four Unit Energy LPM cards providing Lightning. Under Temple all twelve source Energy cards supply Colorless without their usual effects. The Prize deficit is assessed at attack time, incorporating earlier self-KOs.

## Consequential Shadow Rider Bench example

Consider undamaged Benched **320-HP Shadow Rider Calyrex VMAX (three Prizes)** and **210-HP Shadow Rider Calyrex V (two Prizes)**. Assume the rank-4/17 source singleton Telescopic Sight is attached to the attacker, granting a flat +30 attack damage on each eligible target, and no damage prevention or other modifiers apply.

- VMAX needs **10** packets: 10 × 30 + 30 = 330.
- V needs **6** packets: 6 × 30 + 30 = 210.
- Together they require **16** packets and award **five Prizes** if both are Knocked Out.
- A 14-packet Bomb alone cannot meet the combined requirement; the preattached Energy can bridge it.

This excludes whether both targets remain Benched, access to six Energy cards, Stadium/Tool counterplay, setup survival, opposing decisions and legal attack execution.

## Active-slot positioning reduces the five-Prize opportunity

A source-legal Bench occupies at most five slots and each player must have an Active Pokémon. **Both** undamaged Shadow Rider targets in the example must be Benched for Telescopic Sight to grant +30 to each. If the **VMAX is Active** and only the V is Benched, the requirement is **11+6=17 packets**. If the **V is Active** and VMAX Benched, it is **7+10=17 packets**. Both Benched require **10+6=16**. This position dependence means two targets alone on the opponent's board cannot both be swept with sixteen packets, because one must occupy Active.

These are base fresh-HP thresholds before existing damage, effects or additional modifiers. [The regression](../../tests/aichi-raichu-manual-attachment.test.cjs) now verifies that the 16-packet source capacity can produce five Prizes in the two-Bench scenario and only three in either mixed Active/Bench scenario. This does not guarantee that moving a target Active is strategically wise in a real match; the opponent's attack, mobility and gust resources may make other positioning better.

## First-person Top-32 tactical source

A [May 11, 2026 first-person Raichu guide](https://note.com/yudouhu007/n/ned8137f22d7d) describes **16 Lightning-unit equivalents / 480 damage** as the maximum needed when one Electrode activation suffices. The wording does not specify how the author counted an ordinary hand attachment. Our six-card witness reconciles the arithmetic plausibly; it does **not** establish that the author meant this exact partition.

The guide offers concrete play heuristics for opponent-policy tests:

1. Prefer early Battle VIP Pass targets **Gengar & Mimikyu-GX with Squawkabilly ex**, substituting Unown, the evolving Basic or a Telescopic Sight host according to the hand and board.
2. Apply the reported resource order **Supporter, Squawkabilly ex, Unown, PokéStop**. Prioritize sending Energy to discard with Battle Compressor.
3. Avoid using another Electrode-GX when the current packet count already knocks out the relevant targets. Under draw or lock constraints, find the evolving Basic before adding marginal Unown draw.
4. Handle Redeemable Ticket carefully: returned Energy may land at the bottom of the deck and be difficult to discard without additional search/Compressor.
5. Against Budew Item lock, plan to hold actual evolution cards and enough Supporter-based draw to complete a subsequent turn without Items.

These are first-person planning claims. The guide's AI-assisted consistency percentages lack reproducible methods and have not been adopted as measured evidence.

## Implementation and verification

- [Source-locked JavaScript model](../../scripts/aichi-raichu-manual-attachment.cjs) imports the existing printed-source validator and constructs a deterministic six-card witness.
- [Independent physical-card enumeration tests](../../tests/aichi-raichu-manual-attachment.test.cjs) exhaust possible manual-card and five-card Bomb assignments, test Prize/Temple alternatives, guard rank 4 and 17 inventories, and check the five-Prize hypothetical Bench example.
- An independent Python combinations enumeration confirmed **14** for five cards, **16** for six, and **10+6** packets for the two hypothetical targets.
- The existing [manual benchmark statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml) has been extended to run the new tests. **[Manual CI 38867613738](https://github.com/FlareZ123/experiment-01/actions/runs/38867613738) passed** at code revision b4e6fc78af63af6bcae4dba745576b14861d2384. The workflow does not trigger on ordinary commits.

The [exact initial Prize gate](raichu-six-unit-prize-gate.md) further constrains this six-card witness. In both 13-Basic source lists, the chance that all four Reversal Energy and at least two Counter Energy are initially unprized is **64.45457791% conditional on a legal seven-card opener**. Initial Prize compositions alone exclude the exact sixteen-unit line in the other **35.54542209%** absent Prize recovery or re-dealing. This is a resource-only condition, never a matchup probability. [Manual CI 38869636691](https://github.com/FlareZ123/experiment-01/actions/runs/38869636691) passed an independent enumerator.

## Two separate pinned-engine confirmations

Both checks use the pinned Twinleaf engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and a reversible research-side Electro Rain damage-classification correction. These are controlled, directly staged boards rather than actual source-list games.

1. [Mixed-Bench attack regression CI 38868627181](https://github.com/FlareZ123/experiment-01/actions/runs/38868627181) passed. The [script](../../simulation/twinleaf/raichu-six-energy-prize-regression.cjs) executed actual Store `AttackAction` and Prize prompts: a five-card, 14-unit scenario Knocked Out VMAX for three Prizes and left V alive; the six-card, 16-unit scenario Knocked Out both for five Prizes. The six Energy cards were directly injected as attached prerequisites.
2. [Normal attachment plus Electrode-GX activation CI 38868945233](https://github.com/FlareZ123/experiment-01/actions/runs/38868945233) passed. The [script](../../simulation/twinleaf/raichu-manual-plus-bomb-setup.cjs) executed an actual `PlayCardAction` attaching Reversal Energy from hand, then `UseAbilityAction` with five transferred Energy cards from discard, and resolved Electrode's self-KO and the opponent's two-Prize award. The staged attacker held six **distinct physical Energy cards**, providing 16 rainbow units in its verified 6-to-4 remaining-Prize state. The required Stage 1 and discard resources were pre-established.

A [single-state integration](../../simulation/twinleaf/raichu-manual-bomb-attack-sequence.cjs) is separately testable and pending its combined workflow result. Successful separate actions do not by themselves prove full-game turn feasibility or strong policy sequencing.

## Priority next steps

1. In pinned Twinleaf, stage an actual hand attachment and **exactly one** Extra Energy Bomb. Verify the Prize deficit after Electrode-GX's self-KO and six attached cards providing sixteen Lightning units at attack time.
2. Test Telescopic Sight, repeated-target Electro Rain, simultaneous Bench Knock Outs and **five-Prize** resolution on that staged board.
3. Repeat under Temple of Sinnoh and lock/Tool counterplay.
4. Only after effect fidelity, verify a decision policy can make the requisite hand and discard partition without reading hidden information.

**Interpretation:** The 14-packet one-Bomb ceiling remains correct for five Energy cards; adding one regular hand attachment establishes a source-consistent 16-packet ceiling. This is a setup/attack opportunity and supplies no game win-rate estimate.
