# Agent 7: rank-26 original Meloetta mulligans modify Bench-protection tradeoffs

**4 November 2026 | additional exact-opening combinatorics | developmental only | zero qualified games**

## Decision and scope

Agent50 already proved the original seven-card setup risk from preserving printed in-turn Bench-entry supports: strict preservation creates an extra **12.0913342984 percentage points** of lone-Active openings across 29 original Aichi lists, before any opponent bonus draws. The next source-specific question is whether rank26 Meloetta Donk's actual **mulligan distribution** makes that opponent-first vulnerability meaningfully smaller.

The answer is **slightly** smaller on average, but not monotonically smaller in every deck. Under rank26's 12-Basic original sixty, independently shuffled candidate decks, and full optional source-mulligan bonus draws, strict support preservation still creates an additional **11.9528877934 percentage points** of initial lone-Active board states versus greedy Basic benching across the 29 known sources. Some trigger-heavy decks show a *larger relative exposure* after bonus draws, because a bonus can reveal another protected trigger while no ordinary Basic is found.

These are **physical game-setup opportunities**, not rank26 first-turn knockout rates, match win probabilities, or evidence that any 60 is best.

## Exact model and comparison policies

For each printed source candidate, let `B` be eligible Basic copies, `T` recognized turn-entry-trigger Basics, `R=B-T` ordinary Basics, `O=60-B`, and `H=7`. Condition the initial seven on at least one Basic. Each hand with `t` trigger, `r` ordinary, and `7-r-t` nonBasic cards has exact weight

```text
w(t,r) = C(T,t) C(R,r) C(O,7-r-t) / (C(60,7)-C(O,7)).
```

Source rank26 has 12 Basics, so the independent source's probability of a failed seven-card draw is

```text
q = C(48,7)/C(60,7) = 0.1906466927107365.
P(M=m) = (1-q) q^m, m >= 0.
E[M] = q/(1-q) = approximately 0.235554.
```

M is the number of source mulligans. The candidate elects to draw every offered mulligan bonus card, up to its remaining 53 physical cards. Bonus draws are without replacement, independent of the source's shuffle. Conditional on `K` remaining target Basics among `N=53` available candidate cards,

```text
P(no target in first m bonus cards) = C(N-K,m)/C(N,m).
P(no target over geometric M) =
  sum_{m=0}^{N} (1-q) q^m C(N-K,m)/C(N,m)
  + (K==0 ? q^(N+1) : 0).
```

Three separate owner-only initial Bench choices are compared:

1. **Greedy:** Bench any other Basic present initially or in bonus draws. A lone Active remains exactly if initial `r+t=1` and no additional Basic is drawn.
2. **Strict entry-preserving:** Start with a nontrigger Basic when available, bench only ordinary Basics, and keep all other entry-trigger Basics in hand through setup. A lone Active remains when `r<=1` and no ordinary Basic is drawn as a bonus. In `r=0,t>=1` cases the necessary starter itself is an entry-trigger Basic.
3. **Safety-adaptive:** Follow strict preservation unless the only alternative to a lone Active is to Bench one entry-trigger Basic. This policy can match greedy's binary single-KO-resistance opportunity, while sacrificing a potential in-turn Bench Ability when necessary. It makes no tactical judgment about which individual trigger should be sacrificed.

The probability the adaptive policy must Bench an otherwise protected trigger to obtain a second Pokémon is exactly **strict-lone probability minus greedy-lone probability**. The model does not cover source rank26's chance of finding Meloetta, its first-turn attack Energy or TM, Item costs, real Prize self-KO chain, opponent coin order, Ability suppression or a true win. In particular it is conditional on the **source being entitled to take the first turn**; no invented 50% win adjustment is applied.

## Computed physical probabilities, conditional on a Basic-valid seven

| Setup event | Greedy Basic benching | Strict trigger preservation |
| --- | ---: | ---: |
| Mean lone Active before opponent mulligan bonuses | 47.0172974546% | 59.1086317529% |
| Mean lone Active after rank26 opponent bonus distribution | **44.9733117981%** | **56.9261995916%** |
| Additional lone Active relative to greedy after bonuses | baseline | **11.9528877934 percentage points** |

The rank26 opponent's mulligans reduce both absolute lone-Active rates, but the average relative strict-preservation exposure decreases by only **0.1384465049 percentage points** from the previous seven-card-only result. Hence a source's ~0.236 expected mulligans do not eliminate the strategic tradeoff. A source-first legal Knock Out against a lone Active still ends the game; rank26's particular first-turn five-self-KO + Crisis Punch route is *conditional paper feasibility* under [Agent3's already published 21-action witness](../agent3-rank26-meloetta-first-turn-five-self-ko-paper-witness-20261030.md), rather than a demonstrated native donk.

### Highest-impact and contrasting printed 60s

| Original rank / source | Additional lone Active before bonus | Additional lone Active after bonus |
| --- | ---: | ---: |
| 4 Raichu Electrode Combo (`B=13,T=6`) | 34.7541393641 pp | **34.7963769188 pp** |
| 16 Absol Garbodor (`B=11,T=4`) | 25.0154162582 pp | **25.1189687609 pp** |
| 1 Shadow Rider (`B=14,T=3`) | 16.5510530409 pp | **16.2814457606 pp** |
| 26 Meloetta Donk (`B=12,T=2`) | 12.1263180493 pp | **12.0085950424 pp** |

Rank4/16 can **increase** relative exposure after opponent mulligan bonuses because they have a high ratio of protected entry Basics to ordinary Basics. This is a distributional selection phenomenon, not an attack strength finding.

Four separately frozen structural candidates also receive their own source-rank26 opponent bonus estimates: Apex Alchemy v0 **5.9441000609 pp**, ADP–Thorton–Regidrago v2 **14.4847499050 pp**, Sentinel Lopunny Vileplume v1 **0 pp**, Arven–Boost Shake Absol v1 **12.0085950424 pp**. The candidate 60s remain distinct and unqualified.

## Reproduction and limits

- [Reusable geometric + finite hypergeometric exact-opening evaluator](../../../simulation/evaluation/agent7-rank26-mulligan-bench-preservation.cjs) imports Agent50's **printed-source-verified** original29 and structural4 Basic/trigger classification rather than repeating the classification.
- [Independent runnable test](../../../tests/agent7-rank26-mulligan-bench-preservation.test.cjs) brute-forces every valid 3-card opening and every remaining-card order for a miniature eight-card source+candidate pair, sums the source geometric mulligan tail, and crosschecks six real-no-mulligan classes, all 29 printed sources, four candidate 60s and critical rank4 increase.
- Current SFT/field result: **committed and source-reviewed, not yet run in a pinned CI environment**. No attempt to dispatch a new workflow or bypass blocked workflow edits.
- This calculation extends Agent50's already documented [entry-support preserving setup tradeoff](../../statistics/agent50-original29-turn-bench-ability-avoidable-opening-20261104.md) by one independent opponent-specific random dimension. All 29 known original sixty inventories retain their printed identities; ranks **23, 25 and 28** remain missing. Three source promo texts remain unresolved in the shared original data, and no missing behavior is silently filled.

## Decision guidance

Use the **safety-adaptive** policy only as a preregistered matched comparison option, particularly against source-first rank26. It can avoid *structural* additional one-KO instant-loss exposure while preserving an entry trigger in hands where a second ordinary Basic is already available. It sometimes burns a valuable trigger to fill a Bench slot, which itself has opportunity cost and may lose the game through an entirely different mechanism. No candidate or opponent policy has been changed, no native match is qualified, and the 99.5% benchmark remains unproven.
