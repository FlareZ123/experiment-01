# Original Hood Shield fixed 60: first chosen setup card is Active — quantified and repaired

**Research:** Agent7, 2026-11-28. **Status:** actionable candidate-policy code and source tests; native Store witness staged but **not yet executed**. Not a game win-rate result, replacement candidate decklist or Aichi matchup qualification.

## Decisive native behavioral fact

In pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/reducers/setup-reducer.ts`, `putStartingPokemonsAndPrizes`, the reducer moves **`cards[0]` to Active** and `cards[1..]` to Bench. `ChooseCardsPrompt.decode` preserves the exact source-index sequence submitted, and `agent36-prompt-projection.cjs` `dispatchPromptChoice` resolves each selected opaque token in the worker's order. A hand index or sorted order is **not** an appropriate Active policy.

The original candidate `results/aichi-2026/candidate-hood-shadow-rider.json` contains 14 Basic Pokémon (including four Shadow Rider Calyrex V CRE74) and two particularly important Bench-from-hand trigger Basics: **Radiant Eternatus CRZ105** (Climactic Gate, direct two VMAX on Bench, ends turn after use) and **Tapu Lele-GX GRI60** (Wonder Tag Supporter search). Playing either during setup, whether Active or Bench, *does not trigger* the during-turn from-hand-to-Bench effect. Prior candidate worker `chooseStartingPokemonSetup` selected the first six eligible starting Basics in random shuffled hand order, potentially starting Radiant or Lele even when a real attacker was available, and filling slots that Gate needs later.

## Exact probability of *avoidable* wrong Active under old hand-index policy

Let `B=14` Basics, `T=2` strategically protected setup trigger Basics, `O=B-T=12` alternative Basics, `N=60`, and initial hand `h=7`. Assume uniformly shuffled 60, with any starting hand containing at least one Basic accepted (mulligans otherwise). Conditional on a valid hand, the first Basic encountered by random hand order is a trigger Basic with probability `T/B = 2/14`. This is due to symmetry of sampled Basic positions, independent of hand size.

Some cases are unavoidable because the valid hand has only trigger Basics and no ordinary Basic. By inclusion/exclusion, the probability of that condition is

```text
P(valid hand) = 1 - C(46,7)/C(60,7) = 0.8614093191
P(no ordinary Basic and >=1 trigger | valid)
  = [C(48,7) - C(46,7)]/[C(60,7)-C(46,7)]
  = 0.0604312151
```

Thus the probability of **avoidable hand-order mis-selection** given a valid hand is

```text
2/14 - 0.0604312151 = 0.0824259278 = 8.2426%
```

Equivalently 7.1002% of all single seven-card shuffles before accounting for mulligan redraws. This is a probability of a *decision error*, not the probability of a game loss, nor a measured relative win-rate gain. Other valuable hand-trigger Pokémon and Bench contention could make the true strategic cost higher or lower; the arithmetic here deliberately counts only Radiant and Tapu.

**Exact recomputation:**

```js
function choose(n,k){let r=1;for(let i=1;i<=k;i++)r*=((n-i+1)/i);return r}
const valid=choose(60,7)-choose(46,7);
const forced=(choose(48,7)-choose(46,7))/valid;
console.log({forced,avoidable:2/14-forced});
```

## Actual candidate code change

On Agent7 review branch `agent7/candidate-opponent-beach-terminal-fallback-20261128`, implementation commit `08b3768b7c6172794c9ab409b62559e3442fab3e`, the unchanged existing `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` now:

- chooses an original CRE74 Shadow Rider V ahead of hand-trigger Pokémon as Active whenever available, selects a minimal Bench backup with selected-token order preserved, and can force a protected Basic Active when no other Basic exists;
- leaves Radiant Eternatus and Tapu Lele in hand rather than putting them down during setup, so they retain from-hand-to-Bench Abilities on a future turn;
- reserves at least three open Bench slots when Radiant is retained, sufficient for Radiant plus two VMAX from Gate;
- treats optional extra Bench placement after an opposing mulligan separately, preserving both hand-trigger Pokémon and selecting ordinary Basics only when useful.

The two-seat `tests/2026-11/agent7-candidate-starting-active-priority.test.cjs` covers shuffled first Radiant/Lele, only protected Basics, post-mulligan optional placement, multiple competing attackers, and non-monotonic selected token order `['card3','card0']` (Shadow Rider V Active, Mimikyu Bench). **16/16 source-pure decision groups passed locally using the actual GitHub worker source with a V8 CommonJS/node:test-shaped shim.**

## Native bridge: do not conflate scheduled witness with demonstrated test

Added `tests/2026-11/agent7-candidate-opening-native-dispatch.test.cjs` to the same review branch, syntactically checked CommonJS but **not run in this invocation**. It constructs pinned compiled Store `ChooseCardsPrompt`, projects and chooses strict worker tokens, dispatches `ResolvePromptAction`, then asserts the actual physical source card is Active and Radiant/Lele remain in hand in both seats. This narrow witness uses a four-card, **test-only** source-printing lookup for exact pinned physical IDs. It neither certifies the complete original 60 nor substitutes for **Agent32 PR #94**, which must provide the owner-approved original source-print map at production host boundary. The important next gate is one reviewed and executed pinned-native two-seat witness on those original four card identities with the real source bridge, then full candidate 60 admission and headless played games.

## Scope and limitations

The policy and setup tests do not prove the full original candidate is an optimal deck. All Aichi qualified matchup evidence is still **0/32**, three original source opponent ranks 23/25/28 missing, no selected single best 60 and no credible demonstrated 99.5%. This contribution removes a quantitatively frequent *known decision defect* in an existing fixed candidate and preserves a testable route to legitimate native play.
