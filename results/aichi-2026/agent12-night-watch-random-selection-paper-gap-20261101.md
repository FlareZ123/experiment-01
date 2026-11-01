# Agent 12: Night Watch printed randomness versus native attacker-controlled opponent-hand selection

**1 November 2026 | exact printed source card and pinned vendor-code contradiction plus archived original-Store reachability.** This identifies another independent **paper-fidelity and potential hidden-information** blocker in the common native evaluation environment. It is not a claim that the observed player deliberately cheated, nor a win-rate or official-clock result.

## Printed contract versus pinned engine

The supplied card database's exact **Trevenant & Dusknoir-GX SMP SM217** printed attack **Night Watch** (three Psychic Energy, 150 damage) instructs selecting **two random cards from the opponent's hand**, revealing them, and shuffling those selected cards into the opponent's deck. This wording requires random selection of cards from the opponent's hand, not a policy choice based on which specific concealed cards are good.

At pinned Twinleaf vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. [Printed source implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts) calls `new ChooseCardsPrompt(player, ..., opponent.hand, {}, {allowCancel:false,min:cardsToShuffle,max:cardsToShuffle,isSecret:true})`, where `player` is the **attacker** and `cardsToShuffle=Math.min(2,opponent.hand.cards.length)`. Thus the native prompt explicitly lets the attacking actor choose the identities of opposing hidden hand cards. The source itself does **not** perform a uniform random draw.
2. The pinned [generic simple-bot ChooseCardsPrompt resolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) filters `prompt.cards.cards`, calculates `this.stateScore.getCardScore(state,prompt.playerId,card)` for **each actual card object**, sorts descending by score, and takes the allowed top cards. It has no random permutation for this prompt family.
3. The pinned [`StateScore.getCardScore`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/state-score.ts) computes a hand-value delta by temporarily adding/removing each given card object to/from the player hand. It therefore reads identity-sensitive card data when fed opponent-hand objects. Even if a downstream policy override happened to choose uniformly in a particular game, the underlying prompt contract still allows identity-based targeting and the base bot's generic logic prefers scored cards.

A policy that sees only its own legal observation cannot safely use opponent concealed card identities for Night Watch. A correct native adapter must sample **positions uniformly without replacement**, using an independent reproducibly seeded randomness stream, then resolve the actual physical card references *inside the engine* without exposing identities to the selecting player before the effect reveals the chosen cards. Under the printed attack, at least one card must be in the opponent hand for a positive selection; with fewer than two, select as many as present.

## Observed actual source-rank11 archive exposure

The [frozen original source-rank6/rank11 v2 bilateral development](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md) has [compiled CI 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact 13072623187, ZIP SHA256 `cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b`, full JSON SHA256 `9ad66abb61bd682c1d0670b91a9bd32fe6e947043b56bb06c73cb363c606140f`. Joining each actual `ResolvePromptAction.pendingPrompt==='ChooseCardsPrompt'` to `initiatingRootActionOrdinal` recovered **9/9 named `AttackAction / Night Watch` native roots**. Separately the archive's `nativePromptChoices.events` has each exact ordinal, `sourceZone:'hand'`, `sourcePlayerSlot` equal to the opponent seat, `nativePromptMin:2`, `nativePromptMax:2`, and two explicit selected physical printing names. There are **two game attempts, not nine independent games**:

| Exact registered original rank11 matchup arm | Active attacking seat | First → last observed global turns | Native Night Watch prompt replies |
| --- | --- | --- | ---: |
| `11:2:A:new-moon-lockbreaker-v1` | 0, candidate | 46 → 54 | 5 |
| `11:0:B:new-moon-lockbreaker-v1` | 1, candidate | 21 → 27 | 4 |
| **Total** | Two original physical deals | 21 → 54 | **9** |

In the first arm the five selected pairs of the opponent's hand, as retained by a native post-effect evidence sidecar, include `Battle VIP Pass FST`+`Professors Letter BKT`, `Marnie SSH`+`Dark Patch ASR`, `Battle VIP Pass FST`+`Boost Shake EVS`, `Forest Seal Stone SIT`+`Battle VIP Pass FST`, and `VS Seeker PHF`+`Secret Box TWM`. This raw after-the-fact evidence establishes that real native prompt replies moved specific cards. **It cannot establish whether their choice was statistically random** without preserving the preselection hidden hand ordering and the independent RNG draw. The pinned code identifies a mechanism that does not enforce the printed randomness.

The nine events occur at **late global turns 21–54**, so they are especially unsuitable as evidence about real 25-minute Aichi match outcomes. Some engine-terminal labels in these original Store runs are developmental and do not imply legal tournament success. The original archived attempt denominator remains 32/32; its 19 engine terminals and 13 action caps remain unqualified.

## Research decision and required gate

- **Print-specific paper predicate:** `Night Watch` must select `min(2,physical opponent hand size)` cards by engine-controlled random sampling independent of their identities and independent of the attacker's policy. `ChooseCardsPrompt.validate` can check cardinality but cannot establish random selection.
- **Information predicate:** attacker-facing decision proposals and observation logs must not expose the hidden opponent hand merely because a prompt references it. This is separable from the algorithm that eventually moves the physical chosen cards.
- **Native counterfactual:** retain the original unmodified Store two-arm receipt, implement a research-owned reversible seeded-chooser hook, demonstrate a matched same-start both-seat native path and a negative control proving that actor preference cannot influence the sampled positions, show hook restoration, and preserve all actions/errors/caps.
- **Release veto:** until that is demonstrated and adopted under a new frozen profile revision, classify the observed Night Watch prompt lineage `PROMPT_PAPER_UNVERIFIED` for random-selection correctness even when the native `ChooseCardsPrompt` is valid and physically settled. Do not globally treat all `ChooseCardsPrompt` as random or alter unaffected cards.

The same frozen archive has **200** in-turn `ChooseCardsPrompt` with named initiating action roots and a matching native selection-sidecar event for every one. See [source and selected-card provenance census](agent12-frozen-v2-native-prompt-coverage-gap-20261101.md). This makes targeted printed-effect fidelity testing possible without inventing a source name, but cannot replace a paper-valid random chooser.

**Competitive-qualified games: zero. No demonstrated fixed-60 99.5% rate.**
