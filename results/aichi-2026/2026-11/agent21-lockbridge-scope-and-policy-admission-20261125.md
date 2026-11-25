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

## Temple durability and source-field counterplay

The 24/29 Special-Energy coverage count is not a 24/29 persistent-lock estimate. Agent39's source audit identifies **10/29 lists with Double Dragon Energy** (nine Regidrago lists plus rank 19 Raging Bolt/ADP), 38 DDE copies total. Every one of those ten lists contains **two to four direct Stadium replacement/removal cards** in its published 60: alternate Stadiums and/or Faba, Megaton Blower, or Field Blower. Six lists contain Megaton Blower. Their actual access, timing, Item-lock exposure, Supporter contention, and opportunity cost remain unknown; the inventory is a counterplay warning, not proof that Temple is ineffective. See [Agent39's exact source-resource audit](../agent39-temple-double-dragon-field-counter-resource-20261107.md).

Lockbridge has only one Temple of Sinnoh. Treat it as a potential one-shot disruption, not a persistent lock: once replaced or removed, this 60 has no second Temple to replay. Its value may be highest when timed after DDE is attached and before the opponent can use an alternate Stadium/removal card. That timing hypothesis has not been tested in a complete Lockbridge game.

## Temple also taxes the Lockbridge owner's own Stadium plan

The exact Lockbridge 60 contains one each of **Sky Field ROS 89, Dimension Valley PHF 93, and Temple of Sinnoh ASR 155**. Only one Stadium can be in play. When the candidate plays Temple, it replaces whichever Stadium is currently active: if its own Sky Field is active, the eight-Pokémon Bench expansion ends and each player with more than five Benched Pokémon must discard down to five; if its own Dimension Valley is active, the one-Colorless discount for Psychic attacks (including Shadow Rider VMAX's Max Geist) is lost and Max Geist needs one additional Colorless Energy. If an opponent's Stadium is active, or no Stadium is in play, Temple can be played without sacrificing either of the candidate's own Stadium effects. Replaying Sky Field or Dimension Valley later removes Temple and ends its Special-Energy suppression.

Temple is therefore not a free third Stadium. The policy must choose whether the DDE disruption is worth sacrificing Bench capacity or attack efficiency when one of the candidate's own Stadiums is active, and must recognize the lower-cost window when the opponent's Stadium is active. The current candidate worker has no Temple play score and cannot make this tradeoff. These are direct card-text consequences, not observed game outcomes.

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