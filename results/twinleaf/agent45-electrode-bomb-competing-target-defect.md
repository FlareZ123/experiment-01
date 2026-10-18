# Agent 45: corrected mandatory Electrode-GX transfer still misallocates one Lightning packet when Crobat V competes

**18 October 2026 | Evidence:** pinned Twinleaf runtime Store regression and actual generic bot `AttachEnergyPromptResolver`, source-card print checks. **No source-dealt live activation, no real-game win-rate conclusion.**

## Question

Fixing `Extra Energy Bomb` to attach **all** required Energy cards (up to five) ensures the correct *count* but does the unchanged generic bot assign those cards to a recipient that advances the exact `Electro Rain` attacker? The published Aichi rank-4 Alolan Raichu/Electrode-GX list carries both the attacker **Alolan Raichu UNM 57** and eligible competing Bench Pokémon **Crobat V DAA 104**. Crobat V is a Pokémon V, so the printed Electrode Ability's exclusion of Pokémon-GX and Pokémon-EX does not bar it as a recipient.

## Test configuration

A staged executable `Store` state from `simulation/twinleaf/electrode-gx-ability-contract.cjs` places:

- Active `Alolan Raichu UNM` with `Telescopic Sight VIV`, Benched `Electrode-GX CES`.
- Public discard with five Special Energy cards in the order `Reversal Energy PAL`, `Counter Energy CIN`, `Unit Energy LPM UPR`, `Reversal Energy PAL`, `Counter Energy CIN`.
- Six remaining Prize cards per player and a second Pokémon on the opposing side.
- A comparison with and without an additional **Crobat V DAA** on the Bench. No other setup or Energy changes.

The test installs the reversible `installElectrodeGXEnergyHook()` research correction, dispatches the real `UseAbilityAction('Extra Energy Bomb')`, resolves the in-play animations, delegates the attachment prompt to pinned upstream `SimpleTacticsAi` using the installed mandatory-count correction, then resolves the actual `AttachEnergyPrompt`. The hook is restored in `finally`.

Implementation: [staged Store fixture](../../simulation/twinleaf/electrode-gx-ability-contract.cjs) and [regression](../../tests/electrode-gx-energy-hook.test.cjs). Pinned vendor Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Actual manual CI [39095356743](https://github.com/FlareZ123/experiment-01/actions/runs/39095356743), then tightened per-card regression [39095593789](https://github.com/FlareZ123/experiment-01/actions/runs/39095593789), both **success**, the latter head `f394167c431629e7d2bfae2a014bd814c062dc24` with **7/7** targeted test cases passed and **33/33** other compiled cases passed.

## Verified assignments

The no-Crobat control attached all five Energy cards to Active Raichu. With Crobat V eligible, the printed transfer still attached all five, but the bot's third Energy card was assigned to Crobat:

| Discard Energy card | Without Crobat | With Crobat |
| --- | --- | --- |
| Reversal Energy PAL (first) | Active Alolan Raichu | Active Alolan Raichu |
| Counter Energy CIN (first) | Active Alolan Raichu | Active Alolan Raichu |
| **Unit Energy LPM UPR** | Active Alolan Raichu | **Benched Crobat V** |
| Reversal Energy PAL (second) | Active Alolan Raichu | Active Alolan Raichu |
| Counter Energy CIN (second) | Active Alolan Raichu | Active Alolan Raichu |

The latter exact Energy→target assignment is printed in the successful workflow logs. In a hypothetical Prize-behind state with Reversal and Counter providing their extra Lightning Energy, sending the Unit card elsewhere reduces Raichu's Lightning-Energy attack budget by **one unit**, corresponding to one 30-base-damage `Electro Rain` allocation before target damage modifiers. If this is an attack's KO threshold, the bot can forgo a relevant line despite fulfilling the corrected mandatory attachment count.

**What is independently proven:** corrected card count five; actual resolved prompt has legal targets; generic bot assigns one card to Crobat; source deck actually contains Crobat V and the three named Special Energy types.

**What remains unproven:** whether Crobat's assignment is ever optimal for some future action, whether the card order/score tie changes with the real random game state, whether all five would be in the discard when Ability is activated, and whether an immediate attacking turn exists. This is a conditional constructed board and **does not** independently evidence win probability or source-dealt policy reachability.

## Interaction with separate live-game census

The separately paired [rank-4 opportunity census](../aichi-2026/agent45-rank4-bomb-opportunity-census-20261018.md) found **zero** decision points with Active Raichu plus Benched Electrode in eight completed source-dealt games, despite 304 opponent decision points in total. The staged assignment defect is therefore downstream of an earlier setup-and-positioning bottleneck in that sample.

A new source-aware attachment policy should be **opt-in**, test its full set of legal recipient constraints, avoid affecting non-Raichu archetypes, and be evaluated only when the legal and strategically relevant board exists. Do not conflate this transfer-target policy with Agent46's separate `raichuPrizeAllocationPolicy`, which allocates *damage packets* among opponent Pokémon after the attack is announced.
