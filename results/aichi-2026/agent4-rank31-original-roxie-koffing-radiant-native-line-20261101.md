# Agent 4: exact original rank31 Roxie + Koffing + Radiant Alakazam line, paper-invalid native Prize fork

**1 November 2026 | pinned original Twinleaf Store | 3 original printing families actually present in the published rank31 60 | conditional native evidence**

## Authentic original archetype-specific line

The authenticated published **rank31 Yuhi Yokoyama Dusknoir/Chimecho** source 60 in `results/aichi-2026/full-decklists.json` holds **4 Roxie CEC205**, **3 Koffing CEC76** and **1 Radiant Alakazam SIT59**. They can share one owner's turn:

1. Play Roxie as the Supporter and physically discard a real Koffing CEC from the owner hand.
2. Confirm the genuine optional Koffing **Blow-Away Bomb** Ability, placing one damage counter on every opposing Pokémon.
3. Use Radiant Alakazam's real **Painful Spoons** Ability to move up to two damage counters **from one opposing Pokémon to another**, respecting distinct one-source identity.

The original native pinned SIT59 MoveDamagePrompt accepts a **paper-forbidden split**, taking one counter from each of two different opposing Pokémon and transferring both to one opposing destination. Thus an ordinary single Koffing Bomb can produce exactly the two one-counter source Pokémon needed to expose the illegal branch. This connection matters more than a test with arbitrary hand-created damage alone.

## Preregistered paired true Store experiment

[Registration committed before the test](registrations/agent4-rank31-roxie-koffing-painful-spoons-20261101.json), git `00ea95622280f22a4c85a8cb700ce8036016dbd7`. Used the actual printed cards, actual owner `PlayCardAction` Roxie, owner `ChooseCardsPrompt` payment Koffing, actual optional Koffing `ConfirmPrompt`, physical discard and damage, genuine `UseAbilityAction` Radiant, real animation `WaitPrompt`, and actual owner `MoveDamagePrompt` / follow-on `ChoosePrizePrompt`. Both modes begin the **same prepared conditional native board**: opponent Active V and Bench0 V start with zero damage; opponent Bench1 V (210 HP) starts with 180 damage; native deck and Prize cards present. The candidate's action/policy, full 60 starting deal, energy setup, preceding turns, time clock and opposing responses are **not simulated**.

A narrow research-owned Roxie constructor-type compatibility hook (described below) allowed the **original printed Roxie+Koffing sequence** to actually execute; both paired modes used the **same type-only correction**, so the only between-mode paper difference is whether the subsequent SIT59 prompt is allowed to move from two distinct sources.

| Native event | Original SIT59 MoveDamage | With scoped printed SIT59 one-source guard |
| --- | --- | --- |
| Owner plays Roxie, selects and physically discards Koffing | Native accepted | Native accepted |
| Original Koffing Blow-Away Bomb | Opposing damage: **10 / 10 / 190** | Identical **10 / 10 / 190** |
| Painful Spoons two-source reply | Original `prompt.validate` true; Store accepts | `prompt.validate` false under printed source rule; Store reply blocked before mutation |
| 210-HP target V at 190 damage before Painful Spoons | Takes 20 more, genuinely **Knocked Out** | Stays in play |
| Owner Prizes taken on actual Store | **2** | **0** |

This concretely demonstrates that the original printed-card combination present in the authenticated rank31 deck can construct the invalid native move's **source damage supply**, and that the printed source restriction can change the conditional Prize result. It is a **staged prospective native fixture**, not an observed full source-dealt win, and a valid different source state (one Pokémon holding two counters) can naturally permit a two-counter transfer.

## Two additional native Roxie implementation blockers uncovered

During first actual original Store attempts, the native `ChooseCardsPrompt` for Roxie showed **hand-index drift**. With Roxie first in hand, Koffing second, after Roxie left the owner's hand the prompt marked the now-index-0 Koffing **blocked**; `prompt.validate([Koffing]) === false`, even though printed Roxie can discard that Basic Pokémon. With the identical printed cards in the opposite original hand order, Koffing first and Roxie second, the prompt validator accepted Koffing. Both direct native Store `ResolvePromptAction` calls settled despite validator differences because `Store.reducePrompt` does **not** check `prompt.validate` globally. This is a real native preflight/identity ambiguity that can distort bots dependent on validator options.

Separately, pinned `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/blow-away-bomb.ts` creates its Roxie trainer-discard effect using `Object.create(DiscardCardsEffect.prototype)`, forgetting the normal constructor's **`effect.type`** field. The actual original Store threw `Cannot read properties of undefined (reading 'startsWith')` within `auto-log.ts:shouldSkipEffect` before the Roxie-Koffing effect completed ([CI 41327220516](https://github.com/FlareZ123/experiment-01/actions/runs/41327220516)). To observe the card combination without modifying pinned vendor, a reversible research-owned `Store.reduceEffect` hook restores **only the missing enum `AttackEffects.DISCARD_CARD_EFFECT`** on a constructorless `DiscardCardsEffect` whose source is Roxie. This hook leaves player, physical cards, target and Supporter effects unchanged. It restores the original method on exit. This is a **narrow experimental compatibility correction**, and the unhooked original pinned engine remains faulty.

## Native evidence, reproducibility and boundaries

**Entire manual native workflow [CI 41327503969](https://github.com/FlareZ123/experiment-01/actions/runs/41327503969) completed SUCCESS**, against pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Focused suites: **7/7** original rank1 CRE74 Astral Barrage tests (including both physical seats), **7/7** SIT59 MoveDamage tests (including both physical seats), **3/3** exact original rank31 Roxie-Koffing-SIT59 native line tests (including separate hand-order control), and **2/2** other existing native Thorns tests.

- Original card combo and hand-order probes: `simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs`.
- Exact-card missing type compatibility adapter: `simulation/twinleaf/agent4-roxie-original-effect-type-hook.cjs`.
- Conditional printed source identity paper guard: `simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs`.
- Reproducible original 60 printing witness, real native two-Prize differential and hand-order failure: `tests/agent4-rank31-roxie-koffing-spoons-native.test.cjs`.
- Companion independently verified isolated real SIT59 conditional 2-Prize fork: [SIT59 paper single-source report](agent4-rank31-radiant-alakazam-native-paper-single-source-20261101.md).

The reported two Prize gain is a conditional native fixture outcome, **not a demonstrated field win or actual source-dealt line frequency**. All printed-card source material is in the original rank31 60, but the prepared 180 damage on the target is not shown to have arisen naturally in this particular game. The two native compatibility fixes are experimental and are **not enabled automatically** in the shared canonical two-seat evaluation.

The original benchmark remains **29/32 authenticated exact original opposing 60s, 32/32 archetypes identified, zero competitively qualified games and no demonstrated 99.5% fixed-60 win rate**. This report is evidence that a serious native original-field source card line could otherwise be misplayed, crash, or award paper-invalid Prize cards; it is not evidence favoring a new candidate decklist.
