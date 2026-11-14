# Rank19 Guzma recipient: Full Moon Rondo versus Max Geist

**Status:** single-trace tactical hypothesis; not a competitive result, not a demonstrated win-rate improvement, and not a deck-change recommendation.

## Question

In the Hood Shield v1 rank19 diagnostic game, did the turn27 Guzma own-recipient prompt have a lower-prize, equally lethal attack line that the current nominal-Guzma planner did not enumerate?

## Reproduction and evidence

- Native cohort: workflow run [42578010606](https://github.com/FlareZ123/experiment-01/actions/runs/42578010606), artifact `agent3-hood-vs-shadow-all29-native` (artifact ID 13656062292).
- Row: candidate `hood-shield-v1`, source rank19, repeat7002, candidate seat1, 29 turns.
- The candidate's last attack is Max Geist at action ordinal150 / turn27.
- The root-action ledger shows Guzma at ordinal147, followed by the two `ChoosePokemonPrompt` resolutions at ordinals148 and149, then the attack.
- The row's `guzmaPromptAudit` records `seekerGuzmaNominalKoOptIn:true`, `maxPrintedDamage:250`, and selected own recipient `Shadow Rider Calyrex VMAX CRE`.

The public board immediately before Max Geist shows:

| Zone | Pokémon | Attached Energy |
|---|---|---:|
| Candidate Active | Shadow Rider Calyrex VMAX | 5 Basic Psychic |
| Candidate Bench | Mimikyu GRI | 1 Basic Psychic |
| Candidate Bench | Lillie's Clefairy ex JTG | 2 Basic Psychic |
| Candidate Bench | Dialga-GX | 0 |
| Candidate Bench | Latias ex | 0 |
| Opponent Active | Raging Bolt ex TEF, Dragon type, 240 HP | — |
| Opponent Bench | Latias ex, Flutter Mane, Marshadow, Sudowoodo | 4 Pokémon |

There is no Stadium in the snapshot. Both players have four Benched Pokémon, so the combined Bench count is eight. The candidate has eight Psychic Energy across all Pokémon, not merely the five attached to Shadow Rider VMAX.

## Attack comparison

**Max Geist**

Shadow Rider Calyrex VMAX's printed formula is 10 + 30 for each Psychic Energy attached to all of the player's Pokémon.

[
10 + 30(5+1+2)=250
]

Under live Fairy Zone against a Dragon target, Psychic Weakness ×2 makes this 500. This is a clear KO of the 240-HP Raging Bolt ex.

**Full Moon Rondo**

Lillie's Clefairy ex's printed formula is 20 + 20 for each Benched Pokémon in play (both players).

[
20 + 20(4+4)=180
]

Under live Fairy Zone against the same Dragon target, this becomes 360. Clefairy has two Basic Psychic Energy attached; its Psychic + Colorless attack cost is payable with those two Energy. This is also a clear KO of the 240-HP Raging Bolt ex.

Both attacks take the same two Prize cards. The attacker exposure differs: Shadow Rider VMAX is a three-Prize Pokémon; Lillie's Clefairy ex is a two-Prize Pokémon. If the opponent's likely reply does not make Clefairy materially more vulnerable, Rondo appears to be the lower-exposure equal-Prize line. This is a policy hypothesis, not a proven optimal choice.

The alternative own recipient was available in principle because Clefairy was on the Bench when the Guzma prompt was resolved. The live Store's prompt validator must confirm the exact choice and all current Ability/attack conditions in a replay.

## Why the existing planner chose Max Geist

The relevant source is `simulation/twinleaf/agent31/late-seeker-guzma-prize.cjs`, called from `agent43-guzma-prompt-continuation.cjs`.

`chooseScaledNominalGuzma` enumerates:
- fixed attacks; and
- additive all-Pokémon Energy attacks recognized by `printedAllPokemonEnergyScaling`.

It computes nominal KOs, then sorts by smallest nominal excess damage, followed by target index, own Bench index and attack name. It does not enumerate Full Moon Rondo's `20+` combined-Bench formula, and its nominal KO calculation does not apply Fairy Zone / Dragon Weakness. Thus Max Geist is the only recognized nominal KO candidate in this state. The `maxPrintedDamage:250` audit field is the selected Max Geist line's nominal damage; it does not mean the planner compared every available attack and preferred the largest number.

The existing specialized Rondo helper, `agent6-owner-public-skyliner-rondo-frontier.cjs`, is a narrow default-off proposal. It requires a specific Latias/Mimikyu/Telepathic-Energy setup, checks nominal damage without Fairy Zone/Weakness, and leaves damage prevention to Store. It does not cover this Guzma own-recipient choice.
The rank19 trace's Mimikyu has `Psychic Energy MEE` (Basic), whereas this specialized Rondo helper requires its sole Active Mimikyu Energy to be the exact `Telepath [P] Energy M3` printing. It would therefore abstain on this observed state even if enabled.

## Required worker-policy test

Create an actor-only deterministic fixture from the public state and Guzma prompt:

1. The host sends the candidate's detached actor observation plus an allowlisted owner-visible Guzma recipient menu. Do not send native prompt/Store objects or hidden opponent zones.
2. The worker enumerates every legal own recipient and its payable attacks, including both all-Psychic-Energy Max Geist and combined-Bench Full Moon Rondo.
3. It separately verifies attack cost (including public Stadium modifiers), counts Psychic Energy across **all** owner Pokémon, counts the actual combined Bench, and applies Fairy Zone ×2 only if the Ability is live and the target is Dragon.
4. It compares immediate Prize outcome, excess damage, attacker Prize liability and a bounded opponent-reply estimate. It must not choose solely by printed damage.
5. The worker returns a native-neutral typed choice for the Clefairy recipient; the host maps it to the exact current prompt option and lets native validation/Store dispatch decide legality.
6. Record abstention if Fairy Zone liveness, target modifiers, or prompt options cannot be established from the actor-visible state.

## Limitations

- This is one diagnostic native game from an unqualified cohort. The actor-only boundary, paper-rule fidelity, opponent competence, and tournament timing were not all admitted; do not count it as a competitively qualified matchup.
- The public snapshot supports the damage arithmetic but does not independently certify every prompt option or Ability-liveness rule. A deterministic replay through the pinned Store is required.
- The game later ended with `engine-game-end`; this comparison does not establish that choosing Clefairy would have prevented the loss or changed the terminal result.
- The result does not justify changing the fixed Hood 60 or claiming any aggregate win rate.

## Related evidence

- [Agent46 full 58-game attack-conversion audit](../../methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md)
- [Agent31 late Seeker/Guzma nominal KO planner](../../simulation/twinleaf/agent31/late-seeker-guzma-prize.cjs)
- [Agent43 Guzma prompt continuation](../../../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs)
- [Agent6 Skyliner/Rondo frontier](../../../simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs)
