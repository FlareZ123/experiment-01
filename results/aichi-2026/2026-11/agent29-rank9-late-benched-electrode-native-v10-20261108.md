# Original Aichi rank 9: paid late-turn Benched Electrode Bomb v10

## Decision

**Promote the default-off late-turn Bench Ability continuation for developmental policy work.** It closes the concrete v9 source-owner setup-to-Ability gap on the same two positive original physical seed groups. Retain frozen v4 and v9 independently. This does not nominate a deck, certify wins, or change source legality.

## Why the old line failed

Printed original Electrode-GX CES 48 has **Extra Energy Bomb** without an Active Spot requirement (source supplied `cards/en/sm7.json`, `sm7-48`). The advanced rulebook permits Abilities from Bench by default. Previous `simulation/twinleaf/agent29-rank9-post-compressor-bomb.cjs` v4 limited use to Active Electrode **and** a Battle Compressor search shuffled **on the same turn**. The v9 native results [run 42340668341](https://github.com/FlareZ123/experiment-01/actions/runs/42340668341) had two real Ultra Ball searches, both paid two dead Battle VIP Pass, two real Electrode-GX evolutions on turn 16, and two source Battle Compressor searches (turns 14 and 44), but zero Bombs. In both games original Electrode was Benched.

## Opt-in change

`allowLaterBenchedElectrode:true` in the source-only Bomb adapter:
- requires prior **native-settled original source** Battle Compressor shuffle receipt; keeps it usable on future turns;
- permits exact physical original Electrode-GX CES on Bench or Active, retaining actual slot/index on native UseAbilityAction;
- requires **at least three original-source Energy cards physically in discard**, a Benched original Mega Absol ex, and the opponent having more than two Prizes remaining;
- uses the actual owner's native Energy attachment prompt; the pinned Store chooses whether the Ability is accepted;
- leaves the old v4 path unchanged if disabled, remains strictly default-off and source-specific.

Source code: [v10 adapter](https://github.com/FlareZ123/experiment-01/blob/main/simulation/twinleaf/agent29-rank9-post-compressor-bomb.cjs), [canonical adapter](https://github.com/FlareZ123/experiment-01/blob/main/simulation/evaluation/agent7-canonical-actor-composition.cjs), [bilateral runner](https://github.com/FlareZ123/experiment-01/blob/main/simulation/evaluation/agent41-bilateral-v2-development.cjs), [v10 frozen-deal registration](../registrations/agent29-rank9-v10-late-benched-bomb-20261108.json).

## Real native v10 result

Manual-only GitHub Actions [run **42528415819**](https://github.com/FlareZ123/experiment-01/actions/runs/42528415819), **success** at pinned `vendor/twinleaf` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Exact artifact **13635564229**, `agent29-rank9-late-bench-bomb-v10`, contains all original 32 attempts (16 matched control/treatment pairs) and failure/cap rows. All physical source deals matched and the pure plus native regression jobs passed.

| Original rank9 source vs | Source seat | Paid original Compressor | Real Ultra Ball evolution | Native Bomb | Physically attached Energy | Electrode self-KO / opponent Prizes |
|---|---:|---:|---:|---:|---:|---|
| Champion reference | 0 | Turn 44, three Energy | Turn 16, 2 expired VIP discarded | Turn 44 from Bench | 3 to Mega | yes, 6 to 4 |
| New Moon lockbreaker | 0 | Turn 14, three Energy | Turn 16, 2 expired VIP discarded | Turn 16 from Bench | 3 to Mega | yes, 6 to 4 |

Totals across 32 attempts: **2 native accepted Bomb actions, 6 physically attached Energy, 2 source Electrode self-Knock Outs**, 2 native Ultra Balls, 2 source Compressor searches, 16/16 identical full physical starting deals. Exact source Bench index and Mega recipient index recorded in every event. All other rows have no Bomb action.

**Important:** both affected games were **capped**, and source recorded **no accepted Claw of Darkness follow-up** in the tested window. Whole-game actor competence, paper clock fidelity, prompt realism, opponent optimality, exact wider-field results, and qualified competitive game wins remain **unproven**. Zero qualified games; 99.5% aspiration remains unverified.

## Next decision

The remaining demonstrated gap is **mobility into the funded attacker**. In source-native post-Pass snapshots, Active Gengar & Mimikyu-GX remains ahead of 3-Energy Benched Mega Absol ex. Printed rank9 source has Escape Rope, Float Stone, and Guzma. Source itself held Escape Rope by global turn 18 (New Moon) / 40 (Champion), and Float Stone by global turn 24 / 46. Test an actual legal owner-paid switch or free retreat, followed by accepted Claw, on an identical v10 setup before extrapolating matchup strength. Reuse existing canonical Float Stone or retreat helper rather than introducing a duplicate printed-card selector.
