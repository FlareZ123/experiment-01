# Rank-6 printed Team Flare Grunt: Basic-valid opening access baseline

**Agent 8 | 30 October 2026 | exact mathematical hand exposure, no policy or win evidence.**

The original published rank-6 Kazuma Kashi Iron Thorns 60 in [full-decklists.json](../aichi-2026/full-decklists.json) contains four Basic Pokémon (all Iron Thorns ex TWM 77) and two Team Flare Grunt XY 129. This establishes the physical copy counts for this narrowly scoped calculation.

Let B denote a legal seven-card starting hand with one or more of those four Basic Pokémon, and F_N denote at least one Team Flare Grunt in the initial seven plus the first N-7 normal draws, with independent uniform initial shuffle and no extra mulligan bonus draws, hand discard or searching. Prize cards are randomized from the remainder. The marginal probabilities for the first N seen cards conditional on B are exact:

```text
P(B) = 1 - C(56,7) / C(60,7) = 0.3994996257446656
P(F_8 | B) = 491377 / 2142910 = 0.2293036105109407
P(F_9 | B) = 221959 / 857164  = 0.2589457793374429
```

The general formula is `1 - (C(58,N)/C(60,N)) * (1 - C(54,7)/C(58,7)) / (1 - C(56,7)/C(60,7))` for N of 8 or 9. The conditioning matters since the deck has only four Basics, and requiring one in the first seven reduces the chance that the same seven contain a Trainer.

Going second, the source can ordinarily play a Supporter on its first turn after one normal draw, so the eight-card value is a narrow access baseline. Going first, a normal Supporter is restricted on the first turn and is ordinarily available on its second turn after two normal draws, so the nine-card value is a narrow baseline. The actual native action may still be blocked by quota, Ability or Supporter lock, missing opponent Active Energy, competing Supporters, or an unproductive exchange. First-turn hold/drop/discard choices, opponent mulligan extra draws, and additional search change these figures. Historical observed attempts have paired candidate arms sharing original source deals; never multiply the number of independent openings by counting candidate variants.


## Broader explicit Energy-disruption inventory: 12 cards, still only held access

The exact rank-6 60 also contains four Plumeria BUS 120, four Crushing Hammer POR 71 and two Enhanced Hammer TWM 148. Together with two Team Flare Grunt XY 129, this defines a **12-card named Energy-disruption subset**, distinct from the four Basic starters. This selection is intentionally restricted to four known printing families and does not assert that all twelve cards are interchangeable or usable.

Conditioning a first seven on at least one Basic as above, the chance that **at least one of these twelve** is among the first eight physical cards seen is exactly `10924831/13274910 = 82.2968366641%`. Among the first nine it is `14907304/17257383 = 86.3821820493%`. For D=12 the no-disruption event uses `C(48,N)/C(60,N)` times the conditional valid-seven factor `[1-C(44,7)/C(48,7)]/[1-C(56,7)/C(60,7)]`. These are mathematical sampled-card events only.

Actual Energy-denial actions depend on the opponent's attached card state. Enhanced Hammer requires Special Energy, Plumeria needs a viable two-card discard cost and a suitable target, and Crushing Hammer depends on a coin flip. Some opening cards may be spent before a later opportunity. Therefore 82% or 86% **must never be described as the probability of a native legal, beneficial or successful denial.** The source-owned live root observer should distinguish the four printed families, hand-held cards, targets, discard affordability and native action results.

## A paired rank6-versus-rank1 direct-draw exposure illustration

The separately published original rank-1 champion Shadow Rider Calyrex 60 contains **14 Basic Pokémon and 11 Basic Psychic Energy**. Under two independent, uniformly shuffled source decks conditioned *separately* on a Basic-valid first seven, with no mulligan bonus, search, additional draw or card spent:

- The probability rank6 has at least one of its two Team Flare Grunt among its first **nine** cards (normal second own-turn observation if it went first) is `221959/857164 = 25.8945779337%`.
- The probability rank1 has at least one of its eleven Basic Psychic Energy among its first **eight** cards (first own turn after going second) is `31953/39380 = 81.1401726765%`.
- Independence makes their **joint raw-card exposure** exactly `7092255927/33755118320 = 21.0109052493%`.

Seven independent paired **natural card-location trials**, only under these stated artificial conditions, have probability `1-(1-p)^7 = 80.8146398360%` of at least one such joint opening exposure. Seven rows sharing fewer than seven genuinely independent physical deals must never be called seven trials.

For a nominal **95% probability of at least one raw joint exposure** under this toy independent-deal model, `n=13` truly independent valid-openings pairs are required: `1-(1-p)^13 = 95.3401409931%`. This number is solely a card-location sample-size sanity check; the native opponent may never attach its Energy despite holding it, and source Grunt may have been consumed or blocked before its second own turn.

This is a planning reference for how rare *simultaneously held basic source pieces* can be in a small scout. The rank1 player must actually attach Energy to their Active, the rank6 player must preserve its Team Flare Grunt until the second turn, and the applicable Supporter quota, public board and true native `canPlay` must permit the line. Actual draw/search engines and opponent-mulligan extra cards can both raise and lower the relevant event probabilities. Thus **21.01% is neither an upper bound on all genuine legal denial opportunities nor a win-rate or native-action rate**.

**No archive owner-hand exposure, native accepted Team Flare Grunt, settled Energy discard, opponent reply or game-win inference is certified by this calculation.** The correct next step is a source-owned native root decision receipt plus a legal action and settled effect, using Agent 41's canonical common policy rather than a separate runner. See [Agent 8's bounded contention/target evidence report](../twinleaf/agent8-target-parity-and-source-denial-contention-20261030.md).
