# Tropical Beach: six-card hand is a real one-card-draw fallback (28 November 2026)

**Agent:** 2. **Problem type:** offered root-action fallback; distinct from all direct-terminal Ability changes. **Evidence:** exact two-profile candidate worker source and **40 actor-visible before/after V8 decisions**, with exact card text. **Not** native/Store continuation, completed games, or a metagame result.

## Source-real missed action

Tropical Beach BWP 50's printed rule (`cards/en/bwp.json`, `bwp-BW50`) says:

> Once during each player's turn, that player may draw cards until he or she has 7 cards in his or her hand. If he or she does, that player's turn ends.

The archived full Aichi 60s contain Tropical Beach at **rank 3 ×1, rank 6 ×1, rank 29 ×2**. It can be used by either player while it is the active Stadium. With **six cards** in the player's hand, the offered action legally draws **one card and ends the turn**. If no productive play, attack, retreat or Ability is available, that is an actual additional resource versus passing (subject to the ordinary deckout opportunity cost).

On exact successor `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`, the existing late root fallback correctly requires source-printing `Tropical Beach BWP 50`, native frontier `use-stadium`, `stadiumEffectLive===true`, actual visible Stadium in either player zone, and `ownPublic.deckCount >= 9-ownHand.length` (at least two cards remain after drawing up to seven).

The **sole extra bottleneck** is:

```js
Array.isArray(view.ownHand) && view.ownHand.length<=5 &&
```

That excludes the six-card hand, so the policy chooses **pass** despite the offered profitable one-card Beach draw. It cannot be justified by the existing deckout guard: with six held cards and 3 cards left in the deck, the draw leaves **two** cards, exactly the protection the implementation already requires.

## Narrow repair (no change to source or action gate)

In the late `chooseRoot` Tropical Beach branch, change only:

```diff
- Array.isArray(view.ownHand) && view.ownHand.length<=5 &&
+ Array.isArray(view.ownHand) && view.ownHand.length<7 &&
```

Keep the existing deck reserve, actual Stadium identity, `stadiumEffectLive`, active Stadium-zone evidence, and **late priority after attacks and playable cards**. Do not treat a hand of seven as a legal draw. Do not promote Beach over direct attacking. This makes no blanket optimality claim: drawing a card can cost future deckout resilience in a stall game; the original two-card reserve remains conservative.

## 40 exact-worker paired decisions

Loaded the actual successor twice in the V8 runtime and applied the single expression substitution only in memory. Ran both exact policy configs (Hood Shield, Lockbridge), seats 0/1, and ten action/frontier states with a printed native `use-stadium` token and pass. The own Active was Shadow Rider V, facing Iron Thorns ex; a final extra case offered a payable Shadow Mist attack as a priority control.

| Public state | Original | Patched |
| --- | --- | --- |
| Six cards, 3 in deck, **opponent's** live Tropical Beach | pass | **beach** |
| Six cards, 20 in deck, **own** live Tropical Beach | pass | **beach** |
| Six cards, 4 in deck, opponent's Beach | pass | **beach** |
| Five cards, 4 in deck, live Beach | beach | beach |
| Seven cards, 30 in deck, live Beach | pass | pass |
| Six cards, only 2 in deck | pass | pass |
| Six cards, published Stadium present but effect not live | pass | pass |
| Six cards, Stadium not present in either zone | pass | pass |
| Six cards, wrong print `Tropical Beach BWP 51` in native token | pass | pass |
| Six cards, payable Shadow Mist offered | **attack** | **attack** |

Every row × both source configs × both seats: **40/40 matched expected; 12 intended pass→Beach changes; 28 controls unchanged**. No test claims a full native action continuation or expected match outcomes.

## Handoff

Recommend the implementation owner add this one-token threshold correction and the source-gated six-card and seven-card negative controls to its **already authorized local** successor root test. Do not change the frozen deck 60, dispatch CI or games, or use this policy-only test to claim win-rate evidence. The wider single-deck target remains unsupported by qualified matchups.
