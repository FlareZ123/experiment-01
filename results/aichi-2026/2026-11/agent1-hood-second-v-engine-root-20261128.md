# Hood fixed-60 execution blocker: second Shadow Rider V was never played (28 Nov 2026)

**Evidence type:** exact source-60 + card-text mechanistic fault, evaluated with executable candidate-worker and pinned strict policy-audit protocol. **Not** a native Store game, a completed turn, simulation strength estimate, or owner approval.

## Why this is material to a fixed strong 60

The nominated immutable [Hood Shadow Rider source 60](../candidate-hood-shadow-rider.json) plays **four Shadow Rider Calyrex V CRE74, four VMAX CRE75, and eleven Basic Psychic Energy**. CRE75's printed **Underworld Door** is a once-per-Pokémon-per-turn Ability that attaches a Psychic from hand to a Benched Psychic Pokémon and draws 2; multiple VMAX engines can thus contribute separate acceleration/draw once established. The unchanged original source opponent rank1 is also Shadow Rider, and rank1 isn't the only opponent needing sustained attack pressure.

Current [Agent32 draft PR #95](https://github.com/FlareZ123/experiment-01/pull/95), head `321302d26d417257d947fb0a942c26e647c32b67`, repaired choosing and completing Underworld Door *once it exists*, but its frozen `agent46-candidate-policy.cjs` had this condition in `scoreBasicPlay`:

```js
if (hasName(printing, 'Shadow Rider Calyrex V') &&
    !hasName(printing, 'VMAX') &&
    !boardHas(view, 'Shadow Rider Calyrex V')) return 1000;
```

Since `hasName` is substring matching, the first existing **Basic V or evolved VMAX** satisfies `boardHas(view, 'Shadow Rider Calyrex V')`. Every **subsequent** legal Basic V root returns negative infinity for every basic-play scoring branch. In a constructed no-other-play state with a first V **or VMAX** on board, a second source-printed V in hand, and a native-offered `play-card` Bench action, the worker incorrectly **passes** even though it must establish a second V to evolve into a second Underworld Door.

This is distinct from Agent32's existing Underworld Door root/prompt/cost corrections: the missing second V prevents a second ability source from existing at all. It is also separate from [our Guzma forced-self-switch fix](agent1-hood-guzma-forced-self-switch-decision-20261128.md).

## Executable bounded patch

[Agent1 isolated review branch](https://github.com/FlareZ123/experiment-01/tree/agent1/candidate-second-v-engine-20261128), based exactly on PR #95 head. Two changed files only; no changes to main sealed worker, fixed candidate 60, native engine, source-print bridge, worker registration, CI, or V3.

- [Worker patch](https://github.com/FlareZ123/experiment-01/commit/873b3f8591198fb44d0026ca05181911e16c12ff) / [priority adjustment](https://github.com/FlareZ123/experiment-01/commit/72930bdff3ebd5f80db65d942ed33b3ddffec8e8): count board-established V **including their VMAX evolutions** as engine slots. Continue to prioritize first V, allow a second Basic V when one engine slot exists and a Bench reservation remains, then stop automatic V expansion at two. Explicitly retain matchup Mimikyu priority if Regidrago is detected, and preserve the last ordinary Bench slot.
- [14 two-seat policy/protocol cases](https://github.com/FlareZ123/experiment-01/blob/agent1/candidate-second-v-engine-20261128/tests/2026-11/agent1-candidate-second-v-early-engine.test.cjs) with actual `createPolicy(...).decideWithAudit`, `validateDecision`, `validatePolicyAudit`. Controls include no-V first engine, one V Active, VMAX Active, VMAX + a separate Bench filler, already two engine slots, four existing Bench fillers, and Regidrago-matchup Mimikyu contention.
- Exact committed V8/CommonJS source+test execution: **First bounded root patch: PR #95 baseline 8/14 versus patch 14/14; extended connector+prompt suite below: baseline 12/26 versus complete patch 26/26**, six repaired decisions (three missing-second-V states × two seats) and eight unchanged controls. No compiled Store, legal action enumeration, native draw/progression, full game or 99.5% evaluation occurred.

## Integration prioritization

The owner has a **different and more developed** implementation: `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` on branch `agent46/two-profile-policy-successor-20261127-v2` already has a `scoreBasicPlay` second-V branch for fewer than two engine slots plus richer Radiant Eternatus Climactic Gate and matchup protections. **If Agent46 elects to integrate that successor**, do not transplant this simplified heuristic; use the test to ensure equivalent intended behavior in the final worker. If the smaller PR #95 path is retained, cherry-pick only the bounded V-root delta after owner review.

A complete engine planner must also handle Radiant Eternatus **CRZ105 Climactic Gate**, whose printed effect can put up to two VMAX from deck onto the Bench but ends the turn when used. PR #95 simple worker still doesn't score this Basic play, while the two-profile successor has gated logic. We intentionally did not install a blind Eternatus play without native triggered-Ability continuation, Bench budget, Supporter opportunity, turn-end cost, and viable prompt choice; that would trade one false pass for an uncontrolled false positive.

**Goal status:** 29/32 exact original opposing lists, ranks 23/25/28 unresolved, 0/32 qualified Aichi matchups, no demonstrated 99.5% game-win rate. The 14/14 are policy-decision tests only.

## Follow-on correction: searching the second Basic V, not just benching it

After the initial root patch, the **search-connectivity path was still cut**: all three fixed-deck search Items (`Fog Crystal CRE140` ×4, `Mysterious Treasure FLI113` ×4 and `Quick Ball FST237` ×1) refused or undervalued reaching a second Shadow Rider V once the first V/VMAX was in play. Their `searchNeedScore` also returned -5 for every second Basic V, so even when Fog Crystal was forced, a Basic Psychic **Energy** scored ahead of the second V. This independently blocked an acceleration path in a substantial portion of the source 60. A VMAX in hand was also incorrectly treated as a Basic V by substring matching; a source-qualified Basic matcher must exclude VMAX.

[Connector solution commit `4fc485c`](https://github.com/FlareZ123/experiment-01/commit/4fc485c3acde854a4bc7a4f8f30e3c28f1178c3e) and [exact regex boundary correction `dc08211`](https://github.com/FlareZ123/experiment-01/commit/dc0821162db9a6136fe9946212af3635baf76c8a) added a single, source-constrained `needsSecondShadowRiderBasic(view)` predicate: exactly one V/VMAX engine already on board; at least one spare ordinary Bench slot reserved; no actual Basic V already in hand. `scoreTrainerPlay` admits source-native Fog, Treasure and Quick roots for that need; `searchNeedScore` ranks Basic V (score 82) above Psychic Energy (45), but below a needed Regidrago-matchup Mimikyu (96); `scoreBasicPlay` consumes the newly searched Basic V as an ordinary Bench play. This is a **three-channel connector fix**, not a blanket reward for arbitrary Pokémon search.

[Added source exact tests `8ba62b3`](https://github.com/FlareZ123/experiment-01/commit/8ba62b37194e5932c9aee13f88ec788cdf5403f1) execute, on both seats, the complete constructed **Fog Crystal root → source-printed ChooseCardsPrompt (Basic V vs Psychic Energy) → basic V Bench root** chain, plus Treasure/Quick root availability and controls for V already held, two engines already established, and scarce Bench capacity. The test uses the exact fetched worker, supplied source printed names, strict protocol prompt/decision/audit validators and recorded synthetic actor-view state transitions. No Store side effect or card inventory mutation is claimed to have physically executed.

**Final tested patch total: 26/26 expected decisions; unmodified PR #95 baseline 12/26.** Fourteen source-to-policy outcomes change; twelve controls remain. This is more consequential than a naive second-V root tweak because it restores the ability to **reach** a second V through the deck's actual physical search Items. The two-profile successor already attempts a more developed second-engine search policy and should be the preferred reference if integrated instead; do not stack two unreviewed scoring systems. Still **0 qualified native matchups**.

## Full second Underworld Door prerequisite: retrieve and evolve another VMAX

A further connected obstruction existed after finding/benching a second Basic V: with **one VMAX already on board**, the same `searchNeedScore` returned **-5** for every additional VMAX even when an ordinary Basic V was ready for evolution. The fixed Hood 60 includes four VMAX and four `Mysterious Treasure FLI113`, which can search a Psychic evolution; failing to retrieve the second VMAX leaves the promised second Underworld Door behind natural top-decks.

[VMAX-search patch `08df30a`](https://github.com/FlareZ123/experiment-01/commit/08df30a0f729207900e17769d4025894b159137f) now allows a source-exact second VMAX search only if **one established VMAX and a separate actual Basic V on the board** and no VMAX already held in hand. The search score (88) is below the required first VMAX (94) and needed Regidrago-counter Mimikyu (96), and its Item root still requires a discard-capable hand. It does not invent evolution legality; the native `play-card` evolution frontier must independently offer the move.

[Added VMAX evolution-chain regression `5125db4`](https://github.com/FlareZ123/experiment-01/commit/5125db4f0df4181f360da87b5d9e2ab45b595871) (with protocol-correct optional search empty choice [`3a6d492`](https://github.com/FlareZ123/experiment-01/commit/3a6d492a3f2c4dccac778e5d2407edce7b55f03f)) tests, in both physical seats, a **Treasure root → post-discard source-printed ChooseCardsPrompt → source VMAX selection → next legal evolution root**, assuming an already evolution-eligible second V. Search discarded-card payment and turn progression are **constructed actor views**, not native Store settlements.

**Expanded total: 28/28 strict-protocol candidate-policy decisions on the bounded patch branch, versus 12/28 on unmodified PR #95.** This now addresses three independent physical requirements for the *second* repeatable Underworld Door: a second Basic V action, actual card-access connectors, and its second VMAX search/evolution. The existing mature two-profile successor may provide a better general planner and should be preferred if owner-integrated. No change to 0/32 qualified matchups.
