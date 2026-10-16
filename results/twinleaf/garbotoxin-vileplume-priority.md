# Garbotoxin and Irritating Pollen: two-seat Store action matrix

**Agent 6, 16 October 2026.** Staged **paper Expanded rules interaction** implemented in the pinned Twinleaf engine, not a simulation of complete decks or a competitive matchup result.

## Printed rules and source exposure

- Vileplume **AOR 3**, *Irritating Pollen*: neither player can play Item cards from hand while its Ability operates.
- Garbodor **BKP 57**, *Garbotoxin*: with a Tool attached, Pokémon in play, hand and discard lose Abilities except Garbotoxin.
- Stealthy Hood **UNB 186**, a Pokémon Tool: prevents effects of the **opponent's** Abilities on the attached Pokémon. Thus a Hood on the opposing Vileplume protects it from Garbotoxin but does not protect other Pokémon.
- The supplied Advanced Player's Rulebook, B-01/B-02, distinguishes Items from Pokémon Tools; even pre-2023 printed Tools are treated as Tools rather than Items. Stealthy Hood's Tool play should therefore be a legal action during an Item-only lock. These source rules also distinguish attack-based player locks from continuous Ability locks.

Published [Aichi full source lists](../aichi-2026/full-decklists.json): Vileplume AOR appears at **ranks 2 and 15** (2 copies each), with **3 and 2** Stealthy Hood respectively. Garbotoxin appears in the Absol Garbodor source lists at **ranks 8, 11, 16 and 22**; this fixture tests the **BKP 57** implementation. Printed LTR 68 has the same stated Garbotoxin text but was not separately dispatched in this test.

## Actual Store action evidence

The [reproducible action script](../../simulation/twinleaf/garbotoxin-vileplume-action.cjs) uses a staged midgame board with a legitimate Oddish / Gloom / Vileplume evolution stack on one player's Bench and, when present, a Trubbish / Garbodor evolutionary stack on the opponent's Bench. The test issues **actual `PlayCardAction` actions for Switch SVI** and compares rejected actions against an accepted `ChoosePokemonPrompt`, checking that rejected Items remain in hand.

| Garbodor | Tool on Garbodor | Hood on Vileplume | Switch from either player's hand |
| --- | --- | --- | --- |
| Absent | No | No | **Rejected** |
| Present | No | No | **Rejected** |
| Present | Yes | No | **Accepted**, switch target prompt |
| Present | Yes | Yes | **Rejected again** |

All **eight** player-seat permutations passed: [first CI 38871512640](https://github.com/FlareZ123/experiment-01/actions/runs/38871512640). The follow-up run added executable assertions and **two actual Tool-attachment actions**:

1. With Vileplume locking Items and no Garbodor, the owner successfully played Stealthy Hood from hand onto Vileplume. Switch remained prohibited.
2. With opposing Tool-enabled Garbodor suppressing bare Vileplume, the owner successfully played Stealthy Hood from hand onto Vileplume. Immediately afterward Switch became prohibited again.

Both Tool plays removed the Hood from hand and attached it to the staged Vileplume. The final **10-case assertion matrix** passed [CI 38871851631](https://github.com/FlareZ123/experiment-01/actions/runs/38871851631), at research file commit `9d2acfc9fa9a8639eeebf2021252f974087d8d08`; pinned upstream Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow is **manual-only**, with no per-commit trigger.

## Interpretation and next gate

This confirms selective counter-lock behavior and the **Item versus Tool** classification in the pinned engine for the stated, injected board states. It directly illustrates why an ability-locking opponent does not automatically remove Vileplume's Item lock if the Vileplume player attaches Stealthy Hood. It also demonstrates that Garbotoxin remains conditional on possessing a Tool.

The fixture deliberately bypasses evolving from actual previous turns, searching, paying for setup, maintaining Bench capacity, drawing the Tool, timing of opposing disruption, and policy choices. It does **not** evaluate either source deck's turn-one readiness, survival, any response to Tool removal or gust, full legal game sequences, or a win rate. A further useful regression would compare own-side versus opposing Garbotoxin (Hood prevents only **opposing** Abilities), and verify LTR 68 alongside BKP 57.

Related validation: [Underworld Door against the same Garbotoxin printings](../aichi-2026/hood-vs-garbotoxin.md) is a different counter-axis; this report concerns **protecting Vileplume's Item lock**.
