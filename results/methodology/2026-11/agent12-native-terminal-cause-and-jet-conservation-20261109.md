# Native outcome cause decomposition and Jet reservation policy: two frozen 48-game releases

**9 November 2026. Pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Zero independently paper-qualified games.** This report uses the independently replayable raw JSON from two successful GitHub Actions archives, preserving every registered attempt.

## 1. Exact 60-card comparison

[Psychic Reserve v3 vs Safeguard v1, CI 42606402389](https://github.com/FlareZ123/experiment-01/actions/runs/42606402389) and [raw artifact 13667284008](https://github.com/FlareZ123/experiment-01/actions/runs/42606402389/artifacts/13667284008). New fixed 60 v3 adds 1 Basic Psychic and removes 1 Player's Ceremony. v1 had 9 wins / 14 losses / 1 native error; v3 13 wins / 11 losses. Source physical fingerprint and actual first turn matched 18/24 pairs; sharp paired native win-count contrast **v3 minus v1 = [+1,+2]**. These are no-imputation bounds, and the remaining 6 source-unmatched pairs do not enter the paired contrast.

## 2. Same-60 Jet-reservation owner policy contrast

[Prospective policy-only CI 42608399876](https://github.com/FlareZ123/experiment-01/actions/runs/42608399876) with [raw artifact 13668652787](https://github.com/FlareZ123/experiment-01/actions/runs/42608399876/artifacts/13668652787). Both arms use **exactly the same Psychic Reserve v3 60** and the same rest-of-policy. The treatment adds a default-off, owner-visible veto on a Jet-to-Active-Thorns proposal when a non-funded Bench Mimikyu needs the unique pivot in an observed Thorns mirror. This change was preregistered before all 24 new opponent physical deals. All 24 original-source deals and starter seats matched, and all 48 games reached native binary terminal.

| Measure | Shared-control actor policy | Jet-reserve actor policy |
| --- | ---: | ---: |
| Native wins | 15 | 15 |
| Native losses | 9 | 9 |
| Settled Ghost Eye attacks | 43 | 57 |
| Source-physically matched pairs | 24 | 24 |
| Additional wins on matched pairs | n/a | **0** |

More attack volume does not equate to a stronger winner record. The policy is **not promoted**. Direct observation of Store-accepted target receipts shows two concrete rank-29 switch corrections: in groups `29:9500:A` and `29:9502:B`, the control attached Jet to Active Iron Thorns, while the treatment held it and subsequently used Jet on Benched Mimikyu, switching Mimikyu Active. In each case the treatment logged **7 additional settled Ghost Eye attacks**, with **no win change**. These actual destination corrections matter because the originally emitted summary field `candidateAcceptedJetActive` describes the **post-dispatch location**, which can be Mimikyu Active following a Bench-targeted Jet. It does not distinguish the declared recipient. The raw `declared.target.slot` and public board before/after must be used to classify Jet attached to a Bench Pokémon.

The earlier v3-v1 physically matched `29:9401:B` provides a more severe counterexample: v1 used Psychic on Bench Mimikyu (native turn 42), then Jet to Bench Mimikyu (turn 46), switched it Active, executed 10 Ghost Eyes, and won. V3 spent Jet on Active Thorns on turn 8; later Mimikyu received Spiky Energy (turn 26) and Basic Psychic (turn 64), remained Benched, made zero Ghost Eye attacks, and lost. The published Jet-reservation policy corrected the *recipient selection* in new physical deals, but its 24-pair native results did not improve win count. This is a tactical-line failure worth future study, with no claim that a single counterfactual replay would prove a different overall outcome.

## 3. Native terminal categories expose a separate decision-quality limitation

A common native `endReason=engine-game-end` can be terminal while the winner holds multiple Prize cards and the opponent retains Pokémon in play. This is a **distinct observable outcome category** from taking six Prizes or removing the last Pokémon. Under the supplied advanced rules, such a terminal is consistent with the opponent failing to draw from an empty deck, although these stored results lack final deck counts and official clock timestamps. Therefore the diagnostic category below is deliberately labeled **winner still has Prizes and opponent still has Pokémon**, without asserting a specific engine-exit cause.

| Archive arm (24 attempts) | Took all Prizes | Opponent had no Pokémon | Winner still held Prizes, opponent Pokémon still in play | Native abort |
| --- | ---: | ---: | ---: | ---: |
| Safeguard v1 | 4 | 4 | **15** | 1 |
| Psychic Reserve v3 | 6 | 3 | **15** | 0 |
| Jet policy control | 5 | 6 | **13** | 0 |
| Jet policy treatment | 5 | 6 | **13** | 0 |

For these **56 terminal results**, the opponent still had a Pokémon and the winner had at least one Prize. In the Jet-policy archive, all 26 such outcomes across both arms occurred at **native turns 64 through 81**, versus the much earlier native turn distribution of direct opponent board exhaustion (turns 7 to 15 in each arm). These exact categories are reproducible through [the shared terminal analyzer](../../simulation/evaluation/2026-11/agent12-native-terminal-decomposition.cjs) and [test](../../tests/2026-11/agent12-native-terminal-decomposition.test.cjs). All 96 registered attempts appear in the four-arm table, with the one native abort explicitly unclassified.

The paper implication is a qualification barrier: **a long native terminal with the opponent still fielding Pokémon cannot establish a legal Aichi game win within the event clock absent a genuinely recorded, continuous paper clock and owner legality review**. Deck exhaustion is a legitimate card-game win route, and control strategies can depend on it, but native root count and turn count are not wall-clock evidence. Report direct-Prize, board-elimination, remaining-Prize-terminal, and abort categories separately in every field benchmark. Avoid optimizing a proxy “win rate” that is dominated by unclocked 65–80-turn simulator endings.

## Disposition

**Deck:** v3 remains an interesting six-rank developmental alternative supported by small matched native advantage. **Policy:** the narrow Jet reservation changed target execution and attack volume, so the mechanism works, but it produced **zero additional paired native wins**. **Evidence:** 0 independently paper-qualified games, 29/32 authenticated field lists, and no demonstrated path to 99.5%. Next meaningful research is source-matchup tactical conversion and a complete prospective game with accepted owner choices, actual printed payment/target/zone receipts, official clock, and independent paper/strategy review.
