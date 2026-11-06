# Agent35: exact forced-unfundable Active and Prized-Guzma exposure against Snorlax Block

**6 November 2026 | physical-deal combinatorics plus printed-card dependency analysis | developmental, no gameplay-win inference.** This is a matchup-relevant K0 failure-mode certificate for the unmodified published Aichi rank-1 Shadow Rider 60. The original rank-3 Snorlax opponent is the *conditional* board scenario; its probability of presenting Block is not measured.

## Why examine this event

In the freshly archived v8+Telepath+Confirm-false real native attempt `3:213:A:champion-reference` (run **42287771647**, artifact **13538082892**, vendor pin **a9905a76...**), the source's original rank-3 Active was **Snorlax PGO 55** with the printed **Block** Ability; the candidate's Active **Radiant Eternatus CRZ 105** carried five Basic Psychic Energy while its printed **Power Beam** requires Fire + Darkness + Colorless. Candidate's Benched Latias ex SSP had no Energy. Both seats declared **zero attacks**, neither took Prizes and the game reached the 128-native-action cap. Source-root audit: [Agent35 rank-3 Active trap report](../../methodology/agent35-v8-rank3-active-trap-20261106.md). This archived cap suggests a specific matchup structural risk but is not a match outcome or proof of a strong opponent policy.

The exact published rank-1 60 contains **14 starting-eligible Basic Pokémon**, including singleton **Radiant Eternatus** and singleton **Dialga-GX UPR 100**; its Energy is **11 Basic Psychic Energy** only. Radiant Eternatus's printed Power Beam needs Fire and Darkness, while Dialga-GX's printed Overclock, Shred, and Timeless-GX each need Metal. No attack on either of these two Basics is directly funded by any number of the registered Basic Psychic Energy. These are *printed-cost* exclusions; global/foreign card effects, special switching or attack copying are outside this certificate. Source: [exact champion 60](../benchmark-shadow-rider.md), [official Japanese-print 60](../official-champion-japanese-print-60.json), provided `cards/en/swsh12pt5.json` / `cards/en/sm5.json`.

Against an opposing Active Snorlax PGO's ongoing Block, ordinary Retreat is prohibited even with Float Stone's zero retreat cost. The rank-1 printed 60 contains **one Guzma**, its single direct Supporter-mediated self-switch from an undamaged trapped Active when an opposing Bench target exists. **Acerola** requires a damaged friendly Pokémon; the trapped Basic under examination starts undamaged. If Guzma is initially Prized, ordinary draw, Trainer searches and VS Seeker cannot access that copy before it leaves Prizes. A competent opponent may preserve Block rather than take a KO that frees the Active. This is an explicit *conditional trap scenario*. Opponent's own effects, Active changes, later damage, alternate Prize paths or format-specific effects may break it, and have not been modeled.

## Uniform physical opening and six-Prize experiment

Deal seven physical cards uniformly from the rank-1 60. Keep only initial hands with at least one Basic, as required by setup (mulligan details excluded); after setting the Active from that legal hand, select six face-down Prize cards uniformly from the remaining 53. Define:

- **F**: every Basic in the retained seven is one of the two typed-Psychic-unfundable Basics above, with at least one of them present. The player has no other Basic starter to choose, so the Active must be Radiant Eternatus or Dialga-GX.
- **G**: the unique Guzma is in the six Prizes.

Partitions: 60 cards = 2 designated Basics + 12 other Basics + 1 Guzma + 45 other nonbasic cards. Let `C(n,k)` denote binomial coefficients. Number of Basic-valid opening subsets is `C(60,7) - C(46,7) = 332,682,240`. The exact forced-starter fraction is

`P(F | valid 7) = [2 C(46,6) + C(46,5)] / [C(60,7) - C(46,7)] = 6923/114560`.

For G, the opening seven must exclude Guzma, leaving 45 other nonbasic cards. As Guzma is then one of the 53 remaining cards, it occupies six of the Prize positions with conditional probability `6/53`. Thus

`P(F and G | valid 7) = [2 C(45,6) + C(45,5)] (6/53) / [C(60,7) - C(46,7)] = 1591989/267153920`.

| Static initial event | Exact conditional probability |
| --- | ---: |
| Forced Radiant Eternatus or Dialga-GX Active (F) | **6.0431215084%** |
| Forced Active **and** singleton Guzma in six Prizes (F and G) | **0.5959070337%** |
| Guzma in Prizes given F | **9.8609143113%** |

The final two numbers reflect a *correlated event*: do not multiply forced-starter probability by the unconditional `6/60`, because the forced legal hand is biased toward non-Basic cards and may itself contain Guzma. The 0.5959% is **not** a conditional loss rate against rank3; it includes no probability of the opponent getting Snorlax Active, sustaining Block, or exploiting the trap over a full game. It is one exact initial resource/position constraint whose match relevance requires a real reply policy.

## Reproducibility

The [BigInt exact counter](../../../scripts/agent35-snorlax-forced-active-guzma-prize.cjs) is self-contained and validates the 60-card source counts. The [three-case standalone Node test](../../../tests/agent35-snorlax-forced-active-guzma-prize.test.cjs) compares the closed form against **independent physical-slot enumeration of all legal hands and following Prize subsets in a 12-card miniature**, asserts the reduced full-60 fractions, and tests contradictory pool sizes. Local Node 22 run: **3/3 PASS**. Miniature observed legal hand/Prize combinations: `11,900` total, `3,920` forced, `637` forced with Guzma Prized, matching the formulas exactly. This is a mathematical model, not a Twinleaf game.

Related earlier Agent1 [critical Mimikyu/Dialga starter/Prize analysis](../champion-critical-starter-prize-joint.md) independently verifies the same 6.04312% forced-two-Basic formula for a *different* selected two-card subset, and treats its own Prize-rescue capacity event differently. This investigation does not replace it.

## Decision implications and limitations

The physical event is a strategically important **K0 compound failure opportunity** under opponent Active Block: a rare forced Active has an impossible printed-colored attack, and the sole direct self-switch card may be locked in Prizes. A source-player pilot, if it sees Block and knows the rest of the board, needs different contingency planning than a generic policy that spends five Psychic Energy on Radiant Eternatus. Future tests should use *original unmodified* rank1 and rank3 lists, real physical deals, actual Store paid attacks and switches, owner-only knowledge, and a source policy that deliberately maintains or sacrifices Block. The paper-legal ways to escape should be certified against the full rules and card text before converting this geometric event into a loss predicate.

**Evidence classification:** forced opening/Prizes = exact combinatorics; Energy costs/Block/Guzma/Acerola = printed rules; consequences under maintained Block = conditional tactical inference. **Qualified games: zero. No demonstrated 99.5% win rate or selected final deck.**
