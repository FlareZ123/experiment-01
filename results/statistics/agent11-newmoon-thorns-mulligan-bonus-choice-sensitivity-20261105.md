# Agent11: optional mulligan bonus acceptance is a material two-player setup policy

**5 November 2026 | Exact physical calculations, development-only.** This is a controlled sensitivity analysis of the already-published [simultaneous physical mulligan screen](agent11-newmoon-thorns-joint-mulligan-screen-20261105.md). It estimates one precisely restricted source access and candidate solo-exposure conjunction under four deterministic decisions on optional compensation cards. It is **not a competitive game outcome, knockout probability, or win-rate estimate**.

## Why the optional draw decision must be explicit

Under the advanced rulebook's setup rules, a player entitled to mulligan compensation may choose how many cards to draw, up to the number of the opponent's mulligans. The previous joint 60-vs-60 combinatorial formula fixed **both players taking every offered bonus card**. This source note holds the same complete registered rank6/24/29 original Iron Thorns lists and frozen fixed New Moon sixty, but compares **take all** and **decline all** for each side independently. The opponent-shuffle/mulligan number distribution is held fixed; card identities remain randomized physically.

The candidate's restricted event requires a single fragile Basic among the opening seven and no rescue among the combined initial/bonus/first-draw cards. Accepting an additional safe or rescue card can remove this event, while declining all preserves the initial seven plus first ordinary draw. The original source's named first-own-turn G&H/Tag Call/Trainers' Mail→Mountain+DCE *resource access* is generally improved by seeing its own compensation draws. The analysis models physical existence of a path, with no discretionary discard strategy, native source actions, opposing lock or game results.

## Results conditional on source going second, candidate going first

| Source | Candidate takes all, source takes all | Candidate takes all, source declines | Candidate declines, source takes all | Both decline |
|---|---:|---:|---:|---:|
| **Original rank6** | **0.02744560%** | 0.02723615% | 0.05207124% | 0.05186179% |
| **Original rank24** | **0.03295423%** | 0.03270469% | 0.06252425% | 0.06227472% |
| **Original rank29** | **0.02630428%** | 0.02609923% | 0.04990196% | 0.04969692% |

For this restrictive setup event, the contender accepting every available bonus reduces its marginal static solo-exposure enough to approximately **halve** the joint conjunction, compared with declining every bonus while the original source's behavior remains fixed. Whether original Thorns chooses to accept its own compensation has a much smaller effect because the 17-Basic contender rarely needs to mulligan. No player can infer from this screen alone that drawing all bonuses maximizes their eventual game-win probability, which may depend on decking-out, time limits and matchup plans.

## Exact four-branch calculation and reproducibility

Let `p_S` and `p_C` be the probability of a legal initial seven for the four-Basic source and 17-Basic candidate, and `D=p_S+p_C-p_S p_C`. The three setup possibilities after ignoring both-invalid redeals have exact probability:

```text
w0 = p_S p_C / D                         both initial hands valid
wC(k) = p_S p_C (1-p_S)^k / D, k>=1     candidate offered k cards
wS(t) = p_S p_C (1-p_C)^t / D, t>=1     source offered t cards
```

For the candidate drawing `k` offered cards, write `F(k)` for the prior exact sole-fragile-Basic/no-immediate-rescue screen with the first ordinary draw. For the source drawing `t` offered cards, write `S(t)` for the prior exact G&H/Tag/held Mail plus physical Mountain+DCE access. Fixed **take all** uses those functions at `k`/`t`. Fixed **decline all** evaluates the same conditional opening at `F(0)`/`S(0)`, regardless of the number of offered cards.

The [source-owned pure CJS sensitivity calculation](../../scripts/agent11-joint-mulligan-bonus-policy-sensitivity.cjs) combines the previously verified `jointExposure` components without changing the original exact integrals. [Pure tests](../../tests/agent11-joint-mulligan-bonus-policy-sensitivity.test.cjs) anchor the three printed source profiles and all twelve exact-profile result columns. The omitted source-bonus tail when that player draws all remains **under 8×10^-16 in absolute conjunction probability**; declining all requires no tail approximation. The candidate's screen is exactly zero after 19 or more accepted compensation draws under this deliberately restrictive subset.

These are **four fixed deterministic policies**, with no selection conditioned on hand quality, observed matchup actions, or information observed after drawing. They are useful sensitivity anchors and do not establish universal best/worst bounds over all possible state-dependent human policies.

## Independent physical-deck check of all four decisions

The [extended C++17 independent physical-deck simulator](../../scripts/agent11-joint-mulligan-physical-mc.cpp) now accepts optional final parameters `sourceTakeAll` and `candidateTakeAll`, each **1** or **0**. Both default to 1, leaving its earlier frozen 200-million all-all source seeds and outcomes reproducible. The 12 additional profile × policy cases were run with **5,000,000 independently shuffled complete 60-vs-60 setups each**; [all seeds, 12 counts and exact reference fractions](agent11-joint-bonus-choice-physical-mc-manifest-20261105.json) are preserved in a machine-readable receipt, including every result. **Total new physical deals: 60,000,000.** There are no native attacks or simulated outcomes.

| Original source | Both take all: physical / exact | Candidate all, source none: physical / exact | Candidate none, source all: physical / exact | Both decline: physical / exact |
|---|---:|---:|---:|---:|
| Rank6 | 0.02754% / 0.02745% | 0.02756% / 0.02724% | 0.05070% / 0.05207% | 0.05178% / 0.05186% |
| Rank24 | 0.03296% / 0.03295% | 0.03304% / 0.03270% | 0.06116% / 0.06252% | 0.06122% / 0.06227% |
| Rank29 | 0.02640% / 0.02630% | 0.02630% / 0.02610% | 0.05076% / 0.04990% | 0.04906% / 0.04970% |

Every one of these 12 experimental frequencies has a nominal two-sided **95% Wilson binomial interval containing its corresponding prior exact prediction**. Sampling variation is larger than the tiny source-only acceptance effect at five million per arm, so the experiment primarily supports the candidate-acceptance shift. The complete first 200-million all-all investigation retained two individual sample disagreements before aggregation; those outcomes remain disclosed in the [main reproducibility report](agent11-joint-mulligan-physical-mc-validation-20261105.md).

The [original independent 200-million physical-deal validation](agent11-joint-mulligan-physical-mc-validation-20261105.md) verifies the **both-take-all** column at substantially larger sample sizes, independently of this additional all-or-none comparison. Neither that Monte Carlo nor this analytic sensitivity samples a full Pokémon game or demonstrates the 99.5% Aichi field target. The selected developmental Issue25 v4/v5 policies remain unqualified.
