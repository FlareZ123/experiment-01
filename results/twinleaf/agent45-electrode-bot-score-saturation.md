# Agent 45: source-derived two-of-five Electrode-GX bot selection

**Evidence level: deterministic source-code derivation, not a completed Store/CI observation (16 October 2026).**

## Impact on Aichi rank 4/17 source line

Both published Alolan Raichu/Electrode-GX decks use 4 each of Reversal Energy (PAL), Counter Energy (CIN), Unit Energy LPM (UPR). The Japanese official Q&A for Electrode-GX explicitly requires attaching all five Energy cards when five are in discard. A bot choosing two of five would therefore simulate a paper-illegal line.

Pinned Twinleaf `a9905a76` `simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` evaluates the state score after each prefix of Energy attachments (1, 2, 3, 4, 5), also including an empty choice if prompt `min===0`. It sorts candidate results by score descending and chooses the first. Its source `simple-bot/state-score/energy-score.ts` calculates resource satisfaction from the static `EnergyCard.provides` array rather than from `CheckProvidedEnergyEffect`.

All three relevant pinned Energy classes have **static `provides=[CardType.COLORLESS]`**. This ignores their dynamic Lightning provision when attached, so the bot sees every Reversal, Counter, and Unit LPM as one Colorless while scoring the already-evolved Alolan Raichu UNM. That Pokémon has a one-Colorless retreat cost, Electro Rain costing [Lightning], and Electric Ball costing [Lightning, Colorless, Colorless].

Using the exact `getMissingEnergies` and `mergeMissing` code with default `energy.active=30`, `missingMatch=-2` and `missingColorless=-1`:

| Static Colorless cards attached | Merged unpaid cost | EnergyScore from Raichu |
| ---: | --- | ---: |
| 0 | Lightning, Colorless, Colorless | -120 |
| 1 | Lightning, Colorless | -90 |
| 2 | Lightning | -60 |
| 3 | Lightning | -60 |
| 4 | Lightning | -60 |
| 5 | Lightning | -60 |

The other `StateScore` terms remain unchanged when these cards move from the discard into the one permitted Active Raichu: hand, deck, Prize state, Pokémon stats, damage, opponent board and Tool state are held fixed in the candidate-scoring loop. Therefore scores for selecting 2, 3, 4, 5 cards tie at the maximum. JavaScript's stable `Array.prototype.sort` keeps the earliest inserted tied candidate, predicting that the stock resolver selects **2 of 5**.

The prefix in the research fixture is Reversal, Counter, Unit LPM, Reversal, Counter. After Electrode-GX self-KOs and the opponent takes two Prizes, the paper-correct dynamic provision becomes 3+2=5 Lightning units for two cards and 3+2+1+3+2=11 Lightning units for five cards. That corresponds to potential Electro Rain allocations of 150 vs 330 damage, subject to target rules and the ability activation being legal. Neither number is a match win rate.

**Pending proof:** `simulation/twinleaf/electrode-gx-ability-contract.cjs` now includes a default `SimpleTacticsAi` five-energy, eligible Alolan Raichu test asserting exactly 2 selected; and a no-recipient zero-selection test. Actual pinned Store run has not yet completed, so this is a falsifiable prediction, not an observed trace. The source-locked Aichi campaign turns on `strictPromptValidation`, but `AttachEnergyPrompt.validate` allows partial picks because upstream Extra Energy Bomb declares min0/max5.

## Corrective principle

The repair needs a card-effect-level mandatory selection count and recipient legality check, plus bot decision-policy treatment of dynamic Special Energy provision. A general headless validator alone cannot infer the hidden required count from `AttachEnergyPrompt(min:0,max:5)`. Preserve the pinned upstream and apply research-owned versioned hooks. Benchmark corrected and uncorrected policies with identical seeds only after the card and bot fixtures pass.

Official card FAQ: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all
