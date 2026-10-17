# Aichi rank-10 Wobbuffet versus rank-2 dual-lock: conditional escape matrix

**Agent 2, 17 October 2026. Status: source-grounded hypothesis with a committed staged Store regression; compiled test-stage verification passed in manual CI 39029511804.** Competitive games qualified: **0**.

## Exact Aichi source provenance

The published paper Expanded Aichi rank-10 Regidrago 60 includes precisely one `Wobbuffet PHF 36`, one `Latias ex SSP 76`, one `Faba LOT 173`, and one `Prime Catcher TEF 157`. The published rank-2 Vileplume Control 60 includes two `Vileplume AOR 3`, one `Stoutland BCR 122`, and three `Stealthy Hood UNB 186`. The original printing-and-count manifest is `results/aichi-2026/full-decklists.json`; tournament list provenance is documented in `results/aichi-2026/` and the [event publication](https://www.limitlesstcg.com/tournaments/566/decklists).

## Paper-card tactical mechanism to test

- Active Wobbuffet's **Bide Barricade** removes Abilities from Pokémon in play other than Psychic Pokémon. Neither Grass-type Vileplume's **Irritating Pollen** nor Colorless Stoutland's **Sentinel** is Psychic. Their usual Item and Supporter locks could therefore cease functioning while Wobbuffet remains Active.
- Benched Psychic-type Latias ex's **Skyliner** should remain available under Bide Barricade, potentially granting Wobbuffet zero Retreat Cost and enabling the controller to leave the Wobbuffet position when an attack is needed.
- **Stealthy Hood** on the opposing Vileplume or Stoutland may protect that specific Pokémon's Ability against the Wobbuffet suppression, requiring a separate response. Rank-2's three Hoods make their allocation and Tool access central to this line.
- If the opposing Stoutland is Active, its Supporter lock may interfere with a proposed `Faba` answer when protected by Hood; if Vileplume's Item lock persists, `Prime Catcher` may be blocked. This interaction creates a real ordering and channel-contention problem.

These are conditional interactions based on printed text. They say nothing yet about the rank-10 pilot actually obtaining and promoting Wobbuffet, retaining Latias, removing a protected Tool, or surviving the opponent's development.

## Four-configuration mechanical acceptance

A source-print-aware, **deliberately staged** board places Active Wobbuffet and Benched Latias against Active Stoutland and Benched Vileplume. One or both locks may have an attached Stealthy Hood. `simulation/twinleaf/wobbuffet-vileplume-stoutland-matrix.cjs` builds the four boards, calls the actual pinned `CheckPokemonPowersEffect` reducer and attempts real `PlayCardAction` Item and Supporter plays.

| Hood on Vileplume | Hood on Stoutland | Expected Item allowed? | Expected Supporter allowed? |
| --- | --- | --- | --- |
| No | No | Yes | Yes |
| Yes | No | No | Yes |
| No | Yes | Yes | No |
| Yes | Yes | No | No |

The generic **Palace Book SMP** is used only as an easy-to-observe Item-play probe; it is not in the published rank-10 60. **Professor's Research JTG** is a genuine rank-10 Supporter. Both attempts use fresh Stores to prevent the first action's turn end from confounding the other.

The dedicated `tests/wobbuffet-vileplume-stoutland-matrix.test.cjs` makes the above exact expectations executable, including both Wobbuffet and Latias Ability visibility. It is included in existing manual-only `.github/workflows/aichi-attack-pass-score.yml`. The compiled test step passed in [manual CI 39029511804](https://github.com/FlareZ123/experiment-01/actions/runs/39029511804) at source revision `e7c79d8f37b961831ceab8b1026b35539236e8ae`. This is a four-configuration staged effects result; a source-dealt match and competent opponent-response validation remain unresolved.

## Qualification boundaries

The board is injected after both Stage 2 evolutions have been assembled; it has no source-dealt setup, attach history, search sequence, actual initiative, or competent policies. The test checks Card/Store effects and allowed Trainer dispatches, and does not yet perform a physical Wobbuffet retreat or a sustained attacker counterline. The rank-2 opponent's ability to switch, attach Hood, use Jet Energy, and recover lock is unmodeled. A true rank-10 versus rank-2 evaluation must demonstrate the conditional line under both policies with hidden-information-safe decisions, verified retreat/effect behavior, and the full opponent response.

Do not promote any deck, winner, or matchup probability from this source census or staged matrix.
