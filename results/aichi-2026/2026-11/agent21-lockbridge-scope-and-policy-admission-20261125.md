# Agent21: Lockbridge Wobbuffet scope and candidate-policy admission

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate ranking / policy-competence admission. This is a card-text and source-policy audit, not a matchup result.

## Correct Wobbuffet scope

The repository card pool entry `resources/cards/en/xy4.json` identifies Wobbuffet PHF 36 as a Basic Psychic Pokémon with Bide Barricade:

> If this Pokémon is your Active Pokémon, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities (except for Psychic Pokémon).

This is **not limited to Basic Pokémon**. While Wobbuffet is Active, its lock covers every non-Psychic Pokémon in play and in both players' hands and discard piles, including Stage 1/2, Pokémon V/GX/ex and VMAX. The nine authenticated Regidrago lists' Dedenne-GX copies are one concrete field target, not the full scope of the Ability.

For the Lockbridge 60, Radiant Eternatus is Basic Dragon, so Bide Barricade suppresses its Climactic Gate while Wobbuffet is Active. Gate must be used before Wobbuffet becomes Active. Latias ex SSP 76 and Marshadow UNB 81 are Psychic and are exempt; Latias ex is not a self-lock casualty.

## Aichi counter-lock and field context

The authenticated source lists at ranks 4 and 17 each contain Klefki SVI 96. Klefki is Psychic and its Active Mischievous Lock suppresses Abilities of Basic Pokémon in play on both sides, except Mischievous Lock itself. Wobbuffet is Basic, so Klefki's scope includes it; Wobbuffet's Psychic exception excludes Klefki. This is an asymmetric counter-lock: do not count Wobbuffet as unconditional coverage in a state where the opponent's Klefki is Active. This is a card-text interaction, not an observed matchup result.

The prior Aichi census also identifies Iron Thorns ex at ranks 6, 24 and 29. Wobbuffet's Psychic typing and lack of a Rule Box allow the established Wobbuffet/Thorns interaction to be relevant there: Wobbuffet can suppress non-Psychic Iron Thorns while Iron Thorns' Rule Box lock does not target Wobbuffet. The related Temple v1 Store studies below validate staged interactions only; they do not test this exact Lockbridge 60.

## Active-position and lock-window tradeoff

Bide Barricade is Active-only. Retreating or switching Wobbuffet to Bench immediately ends its Ability lock. Agent42's staged Temple v1 Store study demonstrates the same timing consequence against Iron Thorns: after Wobbuffet retreats, opposing Initialization becomes visible again and the Shadow Rider VMAX's Underworld Door becomes unavailable. This is a staged action result, not a Lockbridge-vs-Regidrago game.

For Lockbridge, the useful hypothesis is a **temporary Ability-lock window plus a longer-lived Stadium lock**. While Wobbuffet is Active, Dedenne-GX's Luminous Sign is suppressed even while Dedenne is in hand; playing Dedenne during that window does not get the on-play Ability. Once Wobbuffet leaves Active, the Ability lock ends, so an opponent who held Dedenne can wait and play it later. Temple of Sinnoh can continue suppressing attached Special Energy effects after Wobbuffet retreats, until the opponent replaces the Stadium. This creates a real sequencing decision: exploit the Wobbuffet window before promoting the main attacker, while recognizing that Temple and Wobbuffet have different persistence and counterplay. It is a candidate-line hypothesis, not measured performance.

## Current candidate-policy gate

At candidate-policy branch `agent46/candidate-policy-competence-20261124`, head `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`:

- The source collector enumerates Active Wobbuffet as an `active-non-psychic` lock source for existing on-board lock checks, including Radiant Gate / Fairy Zone holder resolution.
- The worker has no Wobbuffet play score in `scoreBasicPlay` and no Temple of Sinnoh score in `scoreTrainerPlay`; it therefore cannot choose either new card in the Lockbridge list.
- The current source projection does not implement Bide Barricade's full hand/discard scope. On-board lock accounting is not a Lockbridge-capable playing policy.

Consequently the current candidate policy cannot compare Lockbridge with Hood Shield. This is a policy-competence blocker, not evidence against the architecture.

## Reusable evidence and strict limits

The exact Lockbridge registration, `results/aichi-2026/registrations/2026-11/agent31-lockbridge-hybrid-owner-counterpolicy-ab-20261109.json`, is marked **FROZEN BEFORE FIRST NATIVE MATCH**. Its paired-summary test constructs synthetic rows to validate the summarizer; it is not a native game record. No game result can be inherited from that registration.

Related Temple v1 research is reusable as supporting mechanics evidence, but it is not evidence for the exact Lockbridge 60:

- [Agent42's Wobbuffet/Thorns T2 resource model](../agent42-wobbuffet-thorns-item-t2.md) is an exact restricted opportunity calculation, not a game-win estimate.
- [Agent42's Wobbuffet/Thorns Store matrix](../agent42-wobbuffet-thorns-t2.md) verifies staged lock and Underworld Door behavior, not a complete source-dealt match.
- [Agent42's Latias/Wobbuffet retreat and Max Geist fixture](../agent42-temple-latias-wobbuffet-store-retreat.md) verifies staged actions, not a full game or matchup.
- [Temple v3 setup observations](../agent42-temple-v3-setup-results.md) recorded 24 repeated source rows, three Wobbuffet starts, and zero ready decision windows; the independent addendum identifies the three Wobbuffet rows as one unique opening repeated across three opponents.

The current Lockbridge list also differs from Temple v1 (including four rather than three Shadow Rider VMAX), so none of those setup probabilities transfers to it.

## Disposition

Keep Lockbridge as an **unranked challenger with no qualified games**. Correct its card-text description to the full non-Psychic in-play/hand/discard scope. Before candidate ranking, require a separately reviewed policy capable of selecting Wobbuffet and Temple, representing the full Bide Barricade scope and its self-lock/counter-lock sequencing, and evaluating the exact fixed 60 under the same competent policies and conditions as Hood Shield. No new workflow, fixture, or PR69 edit is warranted by this audit.