# Exact original Iron Thorns first-Volt Trainers' Mail bridge

**Agent 11, 3 November 2026 | exact physical first-turn opening study; zero games or wins inferred.**

## Defined question and authenticated 60s

All three original Aichi Iron Thorns decks have four Iron Thorns ex TWM77, two Tag Call CEC206, two Guzma & Hala CEC193, and one Thunder Mountain Prism Star LOT191. Rank 6 contains **one DCE SUM136 plus three Trainers' Mail ROS92**; rank 24 has **three DCE plus four Trainers' Mail**; rank 29 has **one DCE plus two Trainers' Mail**. The [source roster](../aichi-2026/full-decklists.json) and supplied card pool confirm the printed counts and card effects.

The [prior exact no-Mail event](agent11-original-thorns-first-volt-source-line-20261103.md) asked whether, conditional on a Basic-valid starting seven, six random Prizes, and the going-second first-turn normal draw, a held or Tag Call-reachable Guzma & Hala could supply Thunder Mountain and DCE for a legal Lightning/Colorless/Colorless Volt Cyclone attack. This extension allows **at most one held Trainers' Mail**, examining the next four deck cards before any other draw or shuffle. Mail can rescue a missing G&H, find Tag Call if G&H survives in deck, or directly find a missing Thunder Mountain if DCE is already held. No other card search, opponent mulligan bonus or previous-turn opponent action is modeled.

## Exact results

| Original rank | Mail / DCE count | No-Mail opportunity | First held-Mail top-four rescue | Total one-Mail opportunity |
| --- | ---: | ---: | ---: | ---: |
| 6 | 3 / 1 | 33.78150571% | +4.63419095 pp | **38.41569666%** |
| 24 | 4 / 3 | 39.10785063% | +6.64230260 pp | **45.75015323%** |
| 29 | 2 / 1 | 33.78150571% | +3.27315652 pp | **37.05466223%** |

The probabilities are conditional on the source's first seven containing an eligible Basic. They are exact *physical access* events under a restricted action model; they do not assert actual attack frequency, a strategically acceptable two-card G&H discard, Item-lock freedom in a particular real match, or victory.

## Exhausting naturally held Mail copies: diminishing incremental reach

The original physical eight may contain several Trainers' Mail. A separate exact extension considers **all naturally held copies**, played sequentially on missed searches. On each miss the owner declines to take an irrelevant Trainer, shuffles the same 46-card deck, and may use another held Mail. With `h` held Mail and `g` eligible deck targets, the repeated failure probability is `[C(46-g,4)/C(46,4)]^h`. No new Mail is fetched, no favorable fixed deck order is assumed, and physical Prize and hand allocations remain fully enumerated.

| Original rank | At most one held Mail | All naturally held Mail | Additional reach from second and later Mail |
| --- | ---: | ---: | ---: |
| 6 | 38.41569666% | **38.81298815%** | +0.39729149 pp |
| 24 | 45.75015323% | **46.60594998%** | +0.85579675 pp |
| 29 | 37.05466223% | **37.19281709%** | +0.13815486 pp |

Exact all-Mail weighted success numerators / denominators: rank6 `280786541516936143210972545004800 / 723434486475301475249684509200000`; rank24 `55020028179047314754322617632568694400 / 118053656675472071238619766633802000000`; rank29 `1648838222304359712638968560 / 4433216818183665626434320000`. [The same source-locked tests](../../tests/agent11-thorns-single-trainers-mail.test.cjs) now assert all three additional exact totals. The calculation was independently replicated by a second Python combinatorial enumerator and local Node.js execution. The practical benefit of even four Mail remains conditional on having the copies in hand, unblocked Item use and acceptable enhanced G&H discard costs.

## Proof and reproducibility

[BigInt exact code](../../scripts/agent11-thorns-single-trainers-mail.cjs) enumerates all relevant eight-card hand and six-Prize compositions, preserving the initial-seven valid-Basic weight. It classifies a failed no-Mail line as rescued when one of `g` acceptable Trainer cards occurs in the next four of the remaining **46** deck cards. The exact hit fraction is `1−C(46−g,4)/C(46,4)`. If G&H is deck-resident, `g` counts available G&H and Tag Call; when DCE is held and Thunder Mountain missing, a deck-resident Mountain also counts. Other top-four cards cannot complete the specified route. This case disjunction avoids double counting.

The shared top-four weighted denominator is `27166815688841901072000`. Additional Mail rescue numerators for ranks 6, 24, 29 are `1258962115066913136000`, `1804502105745057789840` and `889212398430828122640`, respectively. The [source-locked tests](../../tests/agent11-thorns-single-trainers-mail.test.cjs) check the original 60s, exact totals, disjoint rescue, and equality to the earlier baseline after scaling. Executed local Node.js and independent Python enumerations agreed. A separate 110,000-deal-per-source random-permutation check was consistent with all three exact probabilities.

**Next decision gate:** At each real original-source first turn, measure whether this owner-visible line is available and distinguish a missed Trainers' Mail peek, a wrong choice among top-four Trainers, an unselected or unpaid G&H, an unavailable DCE/Mountain, a live opponent block, and genuine settled Volt Cyclone damage. Even success on this gate is a localized source policy witness, not a qualified whole paper game. Current objective status remains **29/32 authenticated original sixties and zero competitively qualified match wins**.
