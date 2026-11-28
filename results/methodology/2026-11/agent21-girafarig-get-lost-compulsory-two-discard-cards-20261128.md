# Girafarig LOT94 Get Lost: compulsory two distinct opposing discard cards

**Agent21 · 28 November 2026 · source-specific reversible paper Expanded compatibility proposal**

## The decision-changing bug

The provisional fixed Hood Shadow Rider 60 at
`results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json` includes **Girafarig LOT94 ×1**, whose **Get Lost** attack reads: **"Put 2 cards from your opponent's discard pile in the Lost Zone."** Against Regidrago VSTAR, removing Dragon attack payloads from the discard pile is an important counter line; some opposing variants have a single Dialga-GX or Kyurem, so which two are removed can change subsequent Apex Dragon legal attack options.

The supplied *Advanced Player's Rulebook* D-04 **Choose** requires exactly the printed number of cards when possible; with fewer available, choose as many as exist. Get Lost has no "you may", "up to", or conditional permission to pick less. Therefore:

| Opponent discard cards available when Get Lost resolves | Required distinct cards to send to Lost Zone |
|---:|---:|
| 0 | 0 |
| 1 | 1 |
| 2 or more | 2 |

Twinleaf pinned revision **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, source `ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/girafarig.ts`, constructs `ChooseCardsPrompt(owner, CHOOSE_CARD_TO_DISCARD, opponent.discard, {}, {min:2,max:2})` but leaves the native `ChooseCardsPrompt` default **`allowCancel:true`**. This can accept cancellation even when two target cards exist, and requires an impossible two selections with a discard pile of zero or one cards. The generic pinned `ChooseCardsPrompt.validate` also lacks a physical-card distinctness check: selecting the same underlying card reference twice can meet a count of two, although it cannot send two separate cards to Lost Zone. Front-end controls may mask some invalid actions, but the engine validator remains too permissive.

## Implemented opt-in paper-compatibility hook

- [Scoped native reducer hook](../../../simulation/twinleaf/agent21-girafarig-get-lost-compulsory-selection-paper-hook.cjs)
- [Isolated test suite](../../../tests/2026-11/agent21-girafarig-get-lost-compulsory-selection-paper-hook.test.cjs)
- [Optional pinned compiled Store prompt smoke](../../../tests/2026-11/agent21-girafarig-get-lost-native-prompt-smoke.test.cjs) (**not run**)

`withPaperGirafarigGetLost(work)` temporarily replaces only **Girafarig.reduceEffect** for **Get Lost attack index 0**; other Girafarig attacks and all other Pokémon keep their pinned original reducers. During that one synchronous source effect, it wraps the native Store's `prompt` method, recognizes only the expected prompt addressed to the attacking player and owned by the actual opponent's discard pile, and corrects **`min=max=min(2, opponent discard size)`**, **`allowCancel=false`**. The chosen prompt instance's `validate` retains all native checks and additionally requires exactly that count of **distinct physical cards from the actual opponent's discard**. The one prompt instance and its validation persist for normal later prompt resolution, while the Store method and Girafarig prototype are both restored in `finally`. A changed pinned signature fails closed rather than relaxing an unknown card effect. No upstream/vendor source or other reducer is modified.

## Test receipt

**10/10 isolated synchronous JavaScript tests PASS**, using the committed exact branch source and injected Store/prompt doubles. Coverage: seats 0/1, discard counts 0/1/2/3/4, compulsory no-cancel, partial/duplicate/forged-selection rejection, ability to resolve the legitimate two selected cards from discard to Lost Zone after the wrapper scope ends, unrelated Mind Shock attack retained, incompatible native prompt schema failure, exception-safe restoration, and no async-scope leakage.

**No actual pinned compiled Store, end-to-end physical attack cost, natural legal game, native prompt resolution, or competitive match was executed.** The optional compiled native Store prompt test is committed but **unrun**, and constructs a direct synthetic AttackEffect that bypasses attack-cost checks. The proof of correctness is currently at isolated source interface level only. An owner-authorized native test must check the prompt and actual MOVE_CARDS callback against a real discard 0/1/2 and confirm normal source attack legality, particularly through the Regidrago opponent policy.

## Why this matters to a fixed 60

The source candidate has only one Girafarig, which may itself be Prized or hard to deploy. The rules-correct ability to send two *selected, distinct* Regidrago Dragon payloads into Lost Zone matters disproportionately in some game states, but the event's frequency, policy competence and resulting match win rate remain unknown. The work does **not** prescribe a Girafarig count change; it ensures a selected counter line cannot be evaluated with illegal partial selection or impossible targets.

**Acceptance status:** opt-in unmerged research branch only; no owner-frozen V3/Stage-A changes, no CI/game dispatch, no qualified competitive outcome, no 99.5% claim. Independent compiled native Store review and an owner-authorized full actor-visible prompt/action sequence are prerequisites for field use.
