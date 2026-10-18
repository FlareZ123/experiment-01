# Pre-registered rank8 Star Alchemy owner-search answer contrast

**Agent 31, 18 October 2026. Status: prospectively registered, no results at registration time.**

## Motivation and fixed state

The existing Tool-granted Ability research [found an actual root action](rank8-stone-acerola-unused-search.md) where Hood Shield v1 on physical seat B, actual second, used Arven then Forest Seal Stone and fetched Acerola BUS. Its single-source game seed is `1260748957`, A is the exact published rank8 Absol/Garbodor 60, and B is the unchanged printed Hood Shield v1 60. The previous control and Tool-Power arms both finished as candidate B engine wins, and **neither is qualified competitive evidence**.

The next experiment holds the source 60s, fixed seed, first player, pinned Twinleaf, headless fixes, and Tool Power tactic equal. Its *one intended action difference* is B's genuine Star Alchemy owned-deck search answer: generic-bot selected **Acerola BUS** against an opt-in target of **Psychic Energy**. Code is `simulation/twinleaf/owner-star-search-answer.cjs` and the third, separately reported arm of `simulation/twinleaf/hood-rank8-stone-policy-contrast.cjs`. The original two arms are not changed.

## Information and outcome protocol

The temporary adapter watches only B's selected real `UseAbilityAction: Star Alchemy`, then requires a pending `ChooseCardsPrompt` owned by B, whose source is B's actually visible deck and message is `CHOOSE_CARD_TO_HAND`. It selects an actual Psychic Energy from that prompt *only if it is present and prompt-validated*. It never reads the opponent's hidden zones or predicts game outcomes to choose the target. If Psychic is absent or illegal, it records that fact and falls back to the original bot. Its original bot method is restored after the arm.

The two Tool-Power arms should share all meaningful root decisions before the Star activation. The archived owner selection, decision chronology, and actual attack declarations will be compared. We will record any additional Underworld Door action/energy attachment, its prompted draw, attacker/target effects, opponent response, and resulting unfinished or finished engine state. **Do not infer** that searching Psychic enables a second normal hand attachment: this source already used the ordinary Psychic attachment on root171 before Star on root172. Any additional Energy development requires a separately verifiable legal effect and available Ability.

The important negative outcomes include: Psychic not present in the owner deck, no changed prompt, differing pre-Star decision prefix, no subsequent legal ability/attack conversion, a failed branch, or a worsened actual game. Terminal results from a single reused seed are descriptive and **not a win-rate comparison**. The pinned engine and policy require independent qualification before treating any game as competitive evidence.

## Execution control

The prior manually dispatched workflow `.github/workflows/aichi-hood-interaction.yml`, with `hood_rank8_stone_policy=true`, remains the intended compiled runner. It emits a new `ownerPromptTargetContrast` section in the existing `rank8-hood-stone-policy-contrast.json` artifact; do not run a separate push-triggered CI job. The source experiment code is at commit `fc0bbed23fbb560ed719b7ef7c0b492348a0e4d5`, owner-answer adapter at `a1006ee05f8ff50d2e1ec287d17d9e561734011a`.

**At registration:** 29/32 exact source opponents known, zero qualified competitive games, 99.5% fixed-deck target unproven.
