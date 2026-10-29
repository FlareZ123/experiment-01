# Owner-only VS Seeker → Lillie's Determination: actual prompt handling and Store-action adapter

**Agent 48 | 29 October 2026 | optional development decision family, zero qualified games**

## Motivation and documented printed inputs

VS Seeker's [official English text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/xy6/110) retrieves one Supporter from its owner's discard pile into its hand. Its **Phantom Forces PHF 109** print is legal in paper Expanded. In the [29 currently authenticated original Aichi 2026 opponent sixties](../aichi-2026/full-decklists.json), **23 contain VS Seeker, with 59 total physical copies**. This is a large missing opportunity channel for the frozen actor-only root, whose default policy returned `pass` even on a controlled owner-held VS Seeker with Lillie in the owner's public discard. Source-selected genuine VS Seeker retrieval previously worked in [Agent 40's original-source Store controls](agent40-sentinel-vs-seeker-source-root-gate.md), but that validates card mechanics in selected states rather than a generalized policy.

## New narrow owner-visible choice family

[Decision and prompt module](../../simulation/twinleaf/agent48-owner-vs-seeker-lillie.cjs):

1. On the actual owner's root, require `globalTurn>1`, unused Supporter quota, no detected Item/Supporter lock, own Active present, at most **three held hand cards**, at least **8 deck cards** if six Prizes remain (otherwise at least six), a physically held exact `VS Seeker PHF`, and one exact `Lillie's Determination M1L` in the **owner's public discard pile**. Prefer a directly held Lillie over consuming a VS Seeker as an extra Item.
2. Form `play-seeker-get-lillie` and pass it to a genuine native `PlayCardAction` on the owner's board root. The adapter tracks the chosen original actor and then **requires** a real `ChooseCardsPrompt` referring specifically to the *same actor's own discard*.
3. At that pending owner prompt, select the **physical Lillie card object** exclusively from the authenticated native discard list and validate it against the genuine pending prompt. Pass a typed native `ResolvePromptAction`; assert that the selected exact printing disappears from the owner's discard and appears in hand.
4. The subsequent detached actor observation sees Lillie held and an unused Supporter. If the low-hand/deck-availability conditions still hold, choose `play-seeker-recovered-lillie` through native `PlayCardAction`; the existing public physical witness requires visible Supporter movement and the Supporter quota increment.

This path is **opt-in only**, through `deps.seekerLillieRoot=true` or `AGENT48_VS_SEEKER_LILLIE_DEV=true` in [the common actor root](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). It does not alter default benchmark policy or require any vendor source patch.

The decision reads its own hand, publicly visible discard pile, current turn/lock counters and Prize/deck counts. It never reads private opponent hand, unknown owner deck order or hidden Prize identities. A prompt linked to a deck, a rival discard, or a different owner is rejected before selection.

## Reproducible tests and evidence tier

- [Pure opportunity and live prompt tests](../../tests/agent48-owner-vs-seeker-lillie.test.cjs) check the printed original-source-specific VS Seeker/Lillie root and follow-up, first-turn/Supporter/item-lock restrictions, protected large hand, correct paper printing, live owner discard identity and pending native prompt `validate`. They also check independent public physical Store witnesses for the Seeker Item root and the resulting Lillie Supporter root, plus first-turn Carmine. Tests fail closed on unauthorized prompt-zone access.
- [Full native-*shaped* Store adapter fixture](../../tests/agent48-owner-vs-seeker-adapter.test.cjs) uses an independent owner/rival zone model, a physical Item departing the hand, a pending `ChooseCardsPrompt` bound to the owner discard, a native-class-named `ResolvePromptAction` that moves exactly that card, and a following Lillie Supporter action with eight synthetic cards drawn. The actual `withActorOnlyRootPolicy` wrapper is invoked for all four transitions; it records one Item root, one owner prompt accepted and one Supporter root. Synthetic unauthorized deck-target prompts throw. Prototype hooks are restored. This tests orchestration deterministically but **does not replace actual compiled Twinleaf source-game execution**.
- Both test steps **passed** in [manual GitHub Actions run 40960274867](https://github.com/FlareZ123/experiment-01/actions/runs/40960274867) on 29 October 2026. Full job result may be assessed separately; the specific tests are independently green.

## Unresolved empirical gates

This is the first concrete **generic VS Seeker → Lillie actor-root plus typed prompt** path in the shared root selector. It is deliberately narrow: it neither searches for an optimally useful Supporter such as a gust, energy acceleration or targeted disruption card, nor establishes a match-winning payoff. The exact Supporter and deck draw availability matter. A low hand has no guarantee that immediately shuffling/drawing is the best use of the Supporter quota; opponent matchups, resource contention and turn intentions still need study.

Actual native end-to-end Store acceptance of this **new shared opt-in policy** must be tested on original source-dealt owner opportunities, recording positive and negative holds, and observing the opponent's action afterward. Previous Agent40 selected source Store controls and these adapter fixtures do not by themselves provide that broader verification.

The existing benchmark's qualification is unchanged: **29/32 exact opposing printed 60s, zero competitively qualified full-field games, no verified fixed deck with 99.5% wins**.
