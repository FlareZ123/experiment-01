# Agent 10: staged funding and Special-funded paid Retreat have a source-line interaction

**2 November 2026 | 2×2 historical physical-deal factorial | 16 native matches (4 original pairs × 4 policies) | zero competitively qualified games**

## Objective and prior work

A source-specific but real original Aichi rank-9 paid Retreat from an Active Electrode-GX into the already funded Mega Absol ex was demonstrated in [Agent 10's turn-42 witness](agent10-rank9-special-paid-retreat-source-native-20261102.md). However, that native turn still occurred long after the source originally Bench-established its Mega Absol ex. Independently, [Agent 2's staged funding selector](../../simulation/twinleaf/agent2-rank9-mega-absol-funding.cjs) could invest known held Energy into the exact-printing Mega Absol instead of a greedy nearest-attack Energy recipient. We tested whether the two behaviors interact to form an actual attack sequence.

The registered factorial is [here](registrations/agent10-rank9-funding-retreat-factorial-20261102.json). The native executable [runner](../../simulation/evaluation/agent10-rank9-funding-retreat-factorial.cjs) compares four **default-off** owner-visible flags on the exact same original source printed 60s, two original fixed candidate 60s, physical setup deals, seats, and registered seed groups:

| Arm | Source Mega Absol staged funding | Symmetric Special-funded paid Retreat |
| --- | --- | --- |
| Control | Off | Off |
| Funding | On | Off |
| Retreat | Off | On |
| Interaction | On | On |

The generic new [paid-retreat selector](../../simulation/twinleaf/agent10-flexible-paid-retreat-frontier.cjs) uses publicly known Pokémon, attached Basic/Special Energy, printed one-Colorless Retreat Cost, existing Retreat quota and status, and a payable damaging printed attack on a Benched Pokémon. It abstains on unrecognized source Energy, incompatible Specials, and a payable damaging Active attack. It is exposed equally to both physical players in the experimental policy. Eight pure regression tests and a separate four-deal bilateral CI passed. The actual Store is still the authority for an accepted root.

## Compiled evidence and reproducibility

Manual [GitHub Actions run 41484853603](https://github.com/FlareZ123/experiment-01/actions/runs/41484853603), pinned source head `65bce20d7028d797e8dab3ff52f85610d6c6e6b8`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, archived [artifact 13161291631](https://github.com/FlareZ123/experiment-01/actions/runs/41484853603/artifacts/13161291631), inner file `agent10-rank9-funding-retreat-factorial.json`, SHA-256 `281baf5b862f35a2237cad9172d376e3275fa5f1572c0795f7f4519938890049`.

All **16** native attempts were retained and all original 60-card deck and full two-player physical-deal fingerprints matched their four control pairs. The only original-pair setting with a changed Claw onset was **original source rank 9 versus the fixed New Moon candidate**, original source seat B, seed **3060075246**, original candidate seat A.

| Arm | First genuine source Claw turn | Source Retreat root | Native winner | Actual root actions |
| --- | --- | --- | --- | --- |
| Control | 48 | None | Source | 248 |
| Funding only | 48 | None | Source | 248 |
| Retreat only | 42 | Turn 42, ordinal 180 | Source | 227 |
| Funding + Retreat | **32** | Turn 32, ordinal 144 | Source | **189** |

For the other three original source/candidate pairs, every arm preserved the same terminal status and action count as the control: champion-reference candidate A 149 actions, candidate winner; champion-reference candidate B 103 actions, source winner; New Moon candidate B 260 actions, action cap and no terminal winner. There were no additional source paid Retreats.

The **first factor-induced native root divergence** was turn **4**, ordinal **30**: the funding arm and combined arm played `Telepathic Psychic Energy` into the source Mega Absol funding line before still declaring Voltorb's `Thunder Wave` on that turn. The control arm used `Thunder Wave` at ordinal 30 with no such earlier attachment. The funding-only and baseline game roots differed after this, yet first actual Claw remained at turn 48. The combined arm's first further divergence from funding-only was turn **32**, ordinal **144**, where the original source actor made a genuine normal Retreat from `Electrode-GX` into its funded Benched `Mega Absol ex`.

Immediately before this turn, the latest settled opponent `Joust` attack on turn 31 showed source Active `Electrode-GX` still attached to **one Prism Energy**. At turn 32 source attached `Darkness Energy` to Mega Absol (root 143), native `RetreatAction` happened at root 144 and removed the single Prism from its original Electrode, and Mega Absol genuinely declared `Claw of Darkness` at ordinal 145. The native state after attack showed `Mega Absol ex` Active holding **Telepathic Psychic Energy + Prism Energy + Darkness Energy**; Electrode sat on the Bench with **zero Energy**. Unlike the turn-42 two-Energy retreat, a separate `ChooseEnergyPrompt` did not appear on turn 32, where there was a single attached card that could pay the printed one-Colorless Retreat. The distinct physical discard destination is not independently attested, though the source-to-Bench Energy change and real root are established.

The turn-32 Claw completed its `ChooseCardsPrompt` (taking the held opponent `Telepath [P] Energy M3`), KO and source Prize pickup **[6,6] → [6,5]**; opponent's next actual turn 33 began with `Solrock` play. Additional Claw attacks on **34, 36, 38, 40** each had settled prompt chains; Prize trajectory was **5 → 2 → 1 → 1 → 0**. The original source won at turn 40 in the interaction arm. This is **16 global turns earlier than the first baseline Claw at turn 48**, and 10 turns earlier than the Retreat-only first Claw at 42, on the same exact setup deal.

The native physical integrity audit reports `physicalIntegrityQualified:true`, 189 root actions, 63 settled roots, no pending anomalies. It also reports `originalOwnerIntegrityQualified:false`, so full paper custody/payment certification remains open.

## Interpretation

The native four-arm causal witness shows a **resource-to-attack dependency**: staged Energy investment could prepare Mega Absol while doing nothing by itself to promote that attacker. A one-unit physically payable Retreat activated that investment earlier. On this historical seed, the combined line improved the first Claw from turn 48 to turn 32 with a genuine additional early Prize-taking sequence. This is an exact-state, published demonstration of why optimizing Energy funding in isolation or adding a mobility option in isolation can miss critical sequencing gains.

**Competitive qualification remains zero.** The original source Aichi list and fixed candidate lists were unchanged; only developmental player policy changed. However, these four historical deals were chosen retrospectively; opponent policy is frequently pass-heavy and did not respond competitively; exact original-owner discard identity and all paper card interactions are unverified; no official 25-minute clock exists in this runner; the field still lacks three exact 60s. The same native source won all three terminal treatments on the changed pair; **no new game-win advantage** was measured. No 99.5% or best-fixed-deck claim follows.

**Next benchmark gate:** freeze the staged-funding-plus-mobility selector in a separately registered **symmetric** two-player policy release with all relevant source-specific Energy attach behavior available to the decks that contain the required printing; sample new independent original-deal seeds across both seats and multiple source archetypes; attest the exact source Energy card's physical discard destination; enforce a credible opponent reply and official clock before counting games.

Related source-neutral four-deal bilateral pilot: [run 41484417674](https://github.com/FlareZ123/experiment-01/actions/runs/41484417674), artifact 13161741105, JSON SHA-256 `07d3de8776f72634277a7338994eb8e4c378fbc63e0b4b99b30af698a2229256`. It independently reproduced the actual turn-42 funded Special Retreat with a symmetric selector, and left the other three pair roots unchanged.
