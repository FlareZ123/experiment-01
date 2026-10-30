# Untested first-turn attack ALS: exact 29-source absence and prize-aware access frontier

**Agent 2, 30 October 2026.** Research type: **card-text scan + exact original-source printing join + mathematical opening probability**. This is a **candidate discovery screen**, not a native card-effect validation, banlist ruling, optimized decklist, opponent evaluation or competitive result. The primary benchmark remains 29/32 authenticated original Aichi Open League Top32 lists, ranks **23, 25, 28 unresolved**, zero qualified games and no supported 99.5% win rate.

## Method: compare exact printed attacks, not species names

Scan [the supplied BW-onward English card archive](../../resources/cards/en/) for Pokémon attacks whose *own attack text* mentions `first turn` and `go first` or `go second`; classify the printed clause; deduplicate the card name, attack name, cost and full effect. [Executable scanner](../../scripts/agent2-firstturn-attack-vocabulary.cjs) with [pure tests](../../tests/agent2-firstturn-attack-vocabulary.test.cjs) preserves every matching print identity and the distinction between first-player exceptions, second-player-only restrictions, second-player bonuses and second-player prohibitions.

It identifies **50 English printed card records and 29 distinct effect families** across the eligible BW-onward prefix set files:

| Text category | Distinct attack families |
| --- | ---: |
| Can attack *even going first* on the first turn | 12 |
| Usable *only going second on first turn* | 10 |
| Stronger / different effect going second on first turn | 6 |
| Cannot use going second on first turn | 1 |
| **Total** | **29** |

An additional exact printing join against [all 29 authenticated original Aichi 60s](full-decklists.json) finds **zero original card copies of those first-turn-specific attack printings**. This is an inference about those *exact published printed decks*, and it says nothing about undisclosed ranks 23, 25 and 28. **Important false-positive trap:** rank26 includes **Exeggcute PLF 4**, whose actual Seed Bomb text has no first-turn exception. The first-player `Precocious Evolution` belongs to **Exeggcute SSP 1**, a different physical printing of the same Pokémon name. Matching by name would report a false archetype hit. The independent source identity and Stage census already resolves promo and print aliases; the new lexical join likewise resolves source print numbers and set IDs. This original-field exact-print join and the same-name Exeggcute counterexample **passed compiled source-scanner tests in manual CI 41137286085**. The original 29 decklists remain the only authenticated input denominator.

These 29 discovered families are **not** asserted all to have been paper-legal by 10 May 2026: printing release dates, banned-card changes, Japanese print equivalents, errata, and availability of the particular printing must be checked before nominating a playable candidate. The source archives are a search pool, not a prefiltered paper Expanded legality list.

## Substantive first-turn lines worth *testing* rather than copying a metagame list

| Exact source printing | Turn orientation / printed cost | Candidate ALS or opponent interaction |
| --- | --- | --- |
| **Sableye LOT 96**, Quick Hunt | Go first turn 1 allowed, [C] | Search deck for **one card** on the first player's first turn; strong link to exact missing ACE SPEC / pivotal turn-two line, but the attack itself ends the turn |
| **Bombirdier ex PAR 156**, Fast Carrier | Go first turn 1 allowed, [C] | Put up to **three Basic Pokémon** directly on Bench; compare Bench liability, Prize value of ex and early opponent gust |
| **Volbeat TWM 9**, Quick Sign | Go first turn 1 allowed, [C] | Put up to **two Basic Pokémon** directly on Bench; single-Prize counterpart to ex-based Bench access |
| **Whismur CES 116**, Bawl | Only second player's turn 1, [C] | Deny opponent **all Trainer cards from hand on its next turn**, combining Item, Supporter, Tool and Stadium denial; requires exposed low-HP Active and one viable Energy |
| **Illumise TWM 10**, Slowing Perfume | Only second player's turn 1, [C] | Shuffle a **Benched opposing Pokémon and its attached cards** into the owner's deck, potentially reverse early setup; little AMR if opponent has only an Active Pokémon |
| **Shaymin ASR 14**, Encouraging Gift | Only second player's turn 1, [C] | Search any **up to three cards**, potentially a multi-axis ALS, with the cost of using the attack instead of damage |
| **Hisuian Voltorb ASR 2**, Cheerful Charge | Only second player's turn 1, **zero Energy** | Attach one Basic Energy from deck to each of **up to two Benched Pokémon**; requires both real Bench recipients and actual unprized matching cards |
| **Cresselia CRE 64**, Crescent Glow | Second player's turn 1, [P] | Attach **up to three Psychic Energy** from live deck to one Pokémon, possibly a Benched Shadow Rider Calyrex V; normal later-turn mode attaches only one |
| **Talonflame V VIV 29**, Fast Flight | Go first turn 1 allowed, [C] | Discard hand and draw six with a turn-ending attack; UDP/critical singleton cost may undermine apparent consistency |

The actual source card text defines these possibilities. This table is candidate discovery and **does not establish native implementation support or real opponent control**. Prior Agent37 first-player native Store tests already certify narrow Sableye Quick Hunt, Exeggcute SSP, Talonflame V and Latios-EX cases on staged both-seat states; do not duplicate those fixtures. The current field-matched natural first-turn tactical consequences and original-ranked opponent replies are still absent.

## Exact direct-start chance, after conditioning on a valid starting seven

These are **illustrative newly constructed 60-card compositions**, not proposed finished decks. Sampling includes a legal seven-card starting hand with a Basic, a normal eighth card drawn by the player going second, six uniformly chosen face-down Prizes, and no searches, Supporters, switching, retreat, effects from opponent, or favorable mulligan bonus draws.

| Direct line in a toy 60 | Exact probability given valid opening |
| --- | ---: |
| Four 1-[C] attacker Basics, eight other Basics, eight compatible Energy; actual lead in opening seven + Energy among first eight | **33.020288%** |
| Four *zero-Energy* attacker Basics, eight other Basics; actual lead in opening seven | **49.360350%** |
| Four Hisuian Voltorb, eight other Basics, eight Basic Energy; zero-energy attack reaches ≥1 real Benched recipient and ≥1 unprized Energy | **33.020276%** |
| Same Voltorb hypothetical, but both Bench recipients and two Energy cards are available after Prize selection | **12.151297%** |
| One Cresselia, three Shadow Rider V target Basics, ten other Basics, eleven Basic Psychic Energy; Cresselia leads, Psychic Energy pays [P], desired Benched V appears in first eight, ≥3 Psychic remain in the live deck | **3.215019%** |
| Two Cresselia, three V, nine other Basics, eleven Basic Psychic; same direct line | **6.164371%** |
| Four Cresselia, three V, seven other Basics, eleven Basic Psychic; same direct line | **11.335145%** |

The Cresselia examples preserve **14 total Basics** and **11 Basic Psychic Energy** while trading one or more non-target Basic identities for Cresselia. They measure a specific desired receiving Pokémon on Bench, a stricter event than attaching to Cresselia itself. Numerical counts are computed by [the exact combinatorial enumerator](../../scripts/agent2-firstturn-opening-frontier.cjs) with [deterministic tests](../../tests/agent2-firstturn-opening-frontier.test.cjs); independent fixed-seed Monte Carlo samples agreed within ordinary sampling error. Because the six Prizes are drawn between the opening seven and the turn draw, the model uses the exact exchangeable physical joint distribution and checks remaining deck Energy after all eight exposed cards and Prizes.

There is a hard strategic tradeoff: maximizing an attacker's opening lead frequency requires dedicating several Basic slots to a one-turn effect, while success still depends on Energy, Bench recipients, live deck resources, and the opponent's own setup. A single 1-[C] attacker among twelve Basics with eight compatible Energy has only **9.522883%** direct opening opportunity under the same conditions, even though a naive model might count every legal opening as a potential Bawl. This calculation intentionally excludes all search paths and switch lines; a real optimizer must compare the cost and AMR of reaching the attacker via Items or Supporters rather than treating its printed access as guaranteed.

The existing [printed-stage original field opening census](../../scripts/aichi-opening-basics.cjs) confirms the original rank6/24/29 Iron Thorns 60s each have just four Basics, which gives a **39.9500%** valid initial seven-card chance and about **1.5031** failed initial hands per valid start under the independent uniform-deal model. Those repeat mulligans can give opponents extra publicly observed cards and optional bonus draws. This contributes a separate cost to an attempt to increase lock opener density, and cannot be evaluated by average printed denial strength alone.

## Priority and release gates

The most informative next tests are **native original Store verification and genuine opponent response** for Whismur's Trainer lock and Cresselia's three-Energy line, followed by the correct successor board, rather than counting root declarations. For Whismur test real source legal Trainer availability under the player-wide lock, distinguish from Item-only Budew and from an opponent who naturally has no playable Trainer. For Cresselia test the exact three Psychic from unprized live deck, visible Benched target, and whether a strong successor attacker can exploit the Energy under plausible opposing lock / gust. For Sableye, existing native first-player search mechanic is a verified foundation, but source-specific access-versus-alternative utility and evolving follow-through remain open.

**No first-turn attack family is recommended as an automatic deck swap.** None has shown a win-rate improvement against the fixed authenticated Aichi field. Any such proposed line needs exact print legality, playable 60, genuine own and opponent action-policies, native effects and terminal/timed win evidence before informing the single-deck decision.


## Actual pinned Twinleaf registry coverage for those exact attack families

A new read-only [pinned CardManager registration census](../../simulation/twinleaf/agent2-native-firstturn-catalog.cjs), [compiled native registry tests](../../tests/agent2-native-firstturn-catalog.test.cjs), and [original CI 41137286085](https://github.com/FlareZ123/experiment-01/actions/runs/41137286085) established **20 of 29 distinct first-turn families with at least one matching registered native attack**. The original [machine-readable artifact 13016114152](https://github.com/FlareZ123/experiment-01/actions/runs/41137286085/artifacts/13016114152) was downloaded and independently inspected: ZIP SHA256 `5520f81d26dc707386da2b8c4154cb48a9552f9a48baba58a12bc144c16dfcf5`, JSON SHA256 `2792ede01c734c4aafce24c085d3a0da9c0ee652038128b711938c4a743f07f1`. The audit uses the **actual pinned `initializeCards()` CardManager**, matches exact source code/print name and attack, and records the implementation's `canUseOnFirstTurn` property without treating mere method presence as an executed effect.

- **Registered both as exact native card and attack:** Whismur CES **Bawl**, Cresselia CRE **Crescent Glow**, Sableye LOT **Quick Hunt**, Bombirdier ex PAR **Fast Carrier**, Exeggcute SSP **Precocious Evolution**, Talonflame V VIV **Fast Flight**, Scream Tail ex TWM **Scream**, Sneasel UPR **Sneaky Smash**, Volcanion UNB **Flare Starter**, and ten other families.
- **Absent from the pinned native card registry at those exact printings:** Delibird **Quick Gift**, Indeedee **Smart Service**, Tapu Koko **Fast Flight**, Volbeat **Quick Sign**, Cryogonal **First Freeze**, Hisuian Basculin **Submerge Silently**, Hisuian Voltorb ASR **Cheerful Charge**, Illumise TWM **Slowing Perfume**, and Shaymin ASR **Encouraging Gift**. Some exact duplicates or promotional alternate printings inside a family are also missing even when another printing of that family exists; the raw artifact preserves those distinctions.
- **Registration is only infrastructure reachability.** Neither the Bawl player-wide Trainer lock nor Cresselia's three-card Energy attachment has yet been shown to resolve correctly at a live native root by this catalog alone. These two received priority over the nine absent families for new staged native tests. An actual source-matched full legal game would still be needed for tactical credibility.

A no-default-policy-change, **manual opt-in** two-seat Bawl-versus-rank2 source-printed Tag Call Store test was separately implemented under [`tests/agent2-whismur-trainer-lock.native.test.cjs`](../../tests/agent2-whismur-trainer-lock.native.test.cjs). It compares the source printed Tag Call's native deck-search prompt against the same genuine printed Item immediately after second-player-firstturn Bawl. The staged board is explicitly not an original complete source 60, so a positive test would establish the *lock interaction* only. It runs solely under `agent2_whismur_bawl_native_lock_probe` in the already-existing manual workflow; retain the observed outcome and fail reasons rather than silently assuming it works.

