# Agent11: exact joint initial-setup pressure screen, original Iron Thorns vs fixed New Moon

**5 November 2026 | Exact independent two-deck setup calculation | No competitive game/win estimate.**

This note addresses a methodological failure in multiplying two **conditional valid-seven probabilities** for different players and then informally treating the product as an unconditional encounter probability. With a four-Basic original Iron Thorns opponent and the fixed 17-Basic New Moon contender, simultaneous mulligans generate highly asymmetric optional bonus draws. The final settled seven-card hands are independent *within a setup branch*, but the **number of additional cards accessible before turn one** depends on which player had to mulligan. The relevant event must be mixed over all legal setup branches.

The [new pure source-screen model](../../scripts/agent11-newmoon-thorns-joint-mulligan-screen.cjs) reuses the previously checked [source all-held Trainers' Mail exact model](../../scripts/agent11-thorns-single-trainers-mail.cjs) and [candidate New Moon forced-solo screen](../../scripts/agent11-newmoon-thorns-firstturn-exposure.cjs). The new piece is the **joint branch weighting**, with new exact candidate-screen bonus-draw combinatorics. [Regression tests](../../tests/agent11-newmoon-thorns-joint-mulligan-screen.test.cjs) anchor the frozen 60-card manifest and all three authenticated original Iron Thorns sixties and independently recover the prior k=0 candidate fraction.

## Frozen physical events

- **Source event**: an original rank6 / rank24 / rank29 four-Iron-Thorns-ex owner has, after its opening seven, six Prizes, accepted opponent-mulligan bonus draws and first ordinary draw, a *named* Thunder Mountain+DCE resource access path via held cards, Guzma & Hala, Tag Call or repeated held Trainers' Mail. Original counts are G&H 2, Tag Call 2, Thunder Mountain 1, DCE 1/3/1, Mail 3/4/2. This is an available resource combination, with no opponent lock, search/payment policy, native attack or winning line proven.
- **Candidate event**: the complete fixed 60-card New Moon manifest has exactly **one of five fragile Basics** in its opening seven, **no other Pokémon or any of 16 direct Bench rescuers** among the drawn starting/bonus/first-turn hand, and **no complete pair of the two Battle Compressor and two Rescue Carrier cards** in the safe subset. Frozen categories are Basic 17, fragile Basic 5, direct rescuer 16, safe 27, Compressor 2, Carrier 2. This is a deliberately restricted **solo-exposure screen**; other legal rescues, Active transitions, beneficial actions or attacker replies may still exist.
- **Player order**: candidate goes first; original Iron Thorns goes second. Both take every optional compensation card offered due to an opponent mulligan; no other cards are drawn. The preceding probabilities are **conditional on that order**, with no blanket one-half coin-flip multiplier.

Both players follow the Advanced Player's Rulebook simultaneous setup procedure, with invalid/invalid rounds re-dealt and one side's valid seven held while the other mulligans.

## Explicit joint-mulligan decomposition

For a 60-card deck with `B` Basic Pokémon, the probability its seven-card opener has a legal Basic is

```text
p(B) = 1 - C(60-B,7)/C(60,7)
```

Thus `p_T=p(4)=0.3994996257446656`, `p_C=p(17)=0.9165625670301298`, and the normalizer after discarding both-invalid rounds is `D=p_T+p_C-p_T*p_C`.

The three exhaustive disjoint branches are:

```text
w_0       = p_T*p_C / D                         (both valid: no bonuses)
w_C(k)    = p_T*p_C*(1-p_T)^k / D, k >= 1      (candidate gets k extras)
w_T(t)    = p_T*p_C*(1-p_C)^t / D, t >= 1      (Thorns gets t extras)
```

The weights sum to exactly one. Numerically: **38.54806035% both immediately valid**, **57.94279437% candidate receives one or more bonus cards**, and **3.50914528% source receives one or more**. The source's high mulligan probability is important even if one insists on evaluating the source's going-second pressure.

For the candidate receiving `k` bonuses, `H=8+k` includes all seven opening cards plus those bonuses plus its first ordinary draw. The conditional frozen screen probability is

```text
F(k) =
    5 * (7/H) *
    [ C(25,H-1) + C(25,H-1) - C(23,H-1) ]
    / [ C(60,H) * p_C ]
```

The factor `7/H` enforces that the **sole vulnerable Basic was actually in the initial seven**, making its opening legal. `F(0)=0.001336196708880144` exactly reproduces the earlier first-seven-plus-draw source study. `F(k)=0` for `k>=19` under this restrictive screen.

Let `S(t)` be the original printed Iron Thorns all-held-Mail named-resource access probability conditional on its valid seven and **t** accepted compensation draws. The physically appropriate joint conjunction is

```text
Q =
    w_0*S(0)*F(0)
  + sum_{k=1}^{18} w_C(k)*S(0)*F(k)
  + sum_{t=1}^{10} w_T(t)*S(t)*F(0)
```

The discarded `t>=11` contribution is bounded *above* by `p_T*(1-p_C)^11/D*F(0) < 7.668e-16` in absolute probability (that is, less than `7.668e-14` percentage points), even if every such rare source hand could pay its attack. This makes the printed numeric values stable to vastly better than their displayed precision.

## Result: separate physical opportunity is altered by actual opponent mulligans

| Original source | Naive conjunction if both seven-card openings are valid immediately | Full joint simultaneous-mulligan screen (all bonus draws taken) | Joint ÷ naive |
|---|---:|---:|---:|
| **Rank 6**, 1 DCE, 3 Mail | 0.05186179% | **0.02744560%** | 52.9207% |
| **Rank 24**, 3 DCE, 4 Mail | 0.06227472% | **0.03295423%** | 52.9175% |
| **Rank 29**, 1 DCE, 2 Mail | 0.04969692% | **0.02630428%** | 52.9294% |

The figures are per *one original source-vs-New-Moon setup* conditional on the original source playing second and on both selecting all offered mulligan bonuses. They are **probabilities of a particular combination of two bounded setup events**. The two models do not establish that the candidate remains a lone Pokémon at the source's attack step, that source could physically pay two safe G&H discards, that the native source policy would choose its attack, or that 140 attack damage would win under the actual game state. **Do not treat Q as a measured loss probability, a game-win-rate lower bound or a calibrated head-to-head result.**

## Why this is decision-relevant

The naive product conditions on **both** seven-card openings being immediately valid, excluding the 61.45% of accepted games where at least one player initially mulligans. In actual setup, the fragile candidate receives bonus cards in a majority of accepted rounds, sharply decreasing this restrictive solo screen, while the Thorns owner rarely receives bonus cards to expand its own search. Reporting the static product as real-match donk exposure materially overstates this carefully defined conjunction.

This calculation is a source-dependent *distribution* sensitivity and uses mutually independent shuffled player decks conditional on each setup branch. It is not a reason to downgrade a live source policy without checking owner hands, rules, Stadiums, Item locks and accepted native root effects. The selected v4/v5 original-eight Store archives currently supply **zero competitive-qualified games**, so no numerical win or loss update follows.

**Global field and target unchanged:** 29 authenticated original Aichi 60-name/count inventories, ranks23/25/28 still missing, no certified original opponent policies, no selected final fixed 60 and no demonstrated 99.5% win rate.
