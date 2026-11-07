# Agent 1: Aichi Top 32 opponent-deck mill census

**7 November 2026 | Exact-printing field audit.** This identifies the explicit opponent-deck mill cards present in the 29 published complete Aichi Open League 2026 Top 32 decklists.

## Method

I scanned the bundled English card snapshot under **resources/cards/en/** for Pokémon attacks, Abilities and Trainer rules that explicitly discard cards from the top of the opponent's deck or place a top card in the Lost Zone. Candidate card names were joined against **results/aichi-2026/full-decklists.json**. Every field match was checked by its published set and number against the exact card-pool printing.

The inventory contains 29 complete 60-card name/count lists. Ranks 23, 25 and 28 are missing. The repository resource index warns that the English card snapshot is incomplete for Japanese Expanded, so this audit describes the published English display identities.

## Confirmed opponent-deck mill cards

| Field rank | Archetype | Printing | Copies | Effect |
|---:|---|---|---:|---|
| 2 | Vileplume Control | Bunnelby PRC 121 | 2 | Burrow discards the top card of the opponent's deck. Omega Barrage permits a second attack that turn. |
| 3 | Snorlax Stall | Bunnelby PRC 121 | 1 | Same Burrow and Omega Barrage text. |
| 3 | Snorlax Stall | Team Rocket's Handiwork FCO 112 | 1 | Flip 2 coins; each heads discards 2 cards from the top of the opponent's deck. |
| 6 | Iron Thorns | Team Rocket's Handiwork FCO 112 | 1 | Same two-coin mill effect. |
| 7 | Snorlax Stall | Team Rocket's Handiwork FCO 112 | 1 | Same two-coin mill effect. |
| 15 | Lopunny Vileplume | Bunnelby PRC 121 | 2 | Burrow discards the top card; Omega Barrage permits a second attack. |
| 26 | Meloetta Donk | Bunnelby PRC 121 | 1 | Same Burrow and Omega Barrage text. |
| 29 | Iron Thorns | Team Rocket's Handiwork FCO 112 | 1 | Same two-coin mill effect. |

Exact bundled card entries:

- **resources/cards/en/xy5.json**, card ID **xy5-121**: Bunnelby PRC 121 has Burrow, one Colorless Energy cost, and the Omega Barrage Ancient Trait. The card entry marks Expanded legality.
- **resources/cards/en/xy10.json**, card ID **xy10-112**: Team Rocket's Handiwork FCO 112 is a Supporter. Its two coin flips produce 0, 2 or 4 discarded cards, with probabilities 1/4, 1/2 and 1/4 under fair independent flips. Its expected mill is 2 cards per play. The card entry marks Expanded legality.

There are **four Bunnelby lists** containing six copies total and **four Handiwork lists** containing four copies total. Rank 3 contains both cards, so seven distinct published lists contain at least one confirmed direct opponent-deck mill card.

## Relevant owner-side draw card

Mimikyu GRI 58 appears once in rank 1 and once in rank 30. The bundled entry **resources/cards/en/sm2.json**, card ID **sm2-58**, identifies Filch as a one-Colorless attack that draws 2 cards. These two field lists create a relevant owner-deck-loss interaction when a future candidate uses this Mimikyu.

## Exact-printing false positives

A name-only scan also found Regirock and Trubbish in the field. Their published printings do not have the candidate mill effects:

- Regirock XYP 49 is the XYP promo with Land Maker and Stone Edge.
- The listed Trubbish printings PAR 116, FST 168, CRI 56 and NVI 48 have other attacks and no top-of-opponent-deck discard text.

This is why card-name-only field searches are insufficient for opponent-mill claims.

## Implications for the attrition model

- Bunnelby produces one card of mill per Burrow. A second Burrow is a separate Omega Barrage decision, so a deterministic per-turn schedule should use m=1 or m=2 according to the actual settled attacks.
- Team Rocket's Handiwork produces a stochastic 0/2/4-card burst. A deterministic schedule can record the realized outcome. A stationary expected-value approximation uses m=2, while a probability model should retain the full coin distribution.
- Repeated Handiwork use is a stress scenario. Each field list contains one copy, and further uses depend on recovery and the opponent's policy.
- The piecewise schedule model accepts the realized per-turn mill amount. Its stochastic extension also returns an exact rational survival-horizon distribution for repeated independent 0/2/4 Handiwork outcomes. It does not infer whether the opponent plays Handiwork or recovers it.

## Limits

This is a card-text and published-list census. It does not establish how often any opponent chooses these cards, whether Bunnelby can pay and attack on a given turn, or whether a deck wins the matchup. Three Top 32 lists are missing, historical Japanese printing provenance remains open, and no paper-qualified matchup result follows from this audit.

The confirmed identities and effects are inputs for the owner-deck attrition schedule and exact stochastic horizon model in **results/methodology/agent1-piecewise-owner-deck-attrition-schedule-20261107.md**.
