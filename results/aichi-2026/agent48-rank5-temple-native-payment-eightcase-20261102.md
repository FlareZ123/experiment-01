# Agent48: both-seat native Cross Fusion Strike payment under Temple of Sinnoh

**2 November 2026 | exact printed-card constructed Store test | 8/8 condition assertions passed | zero competitively qualified games.**

## Executed result

The pinned Twinleaf native engine was compiled and executed in the existing manual [Aichi Raichu Temple workflow, run 41407250662](https://github.com/FlareZ123/experiment-01/actions/runs/41407250662), job **125151978340**, exact execution head **`6c0855feaab8659db7cb19326ae7342a0ec63356`**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. The workflow **completed successfully**, including the new step **“Verify rank-5 original Mew native Double Colorless Energy cost under Temple in both seats”** and all existing Raichu Temple audit steps.

The committed [native Store runner](../../simulation/twinleaf/agent48-temple-mew-dce-native.cjs) constructs the *same exact source-card* Pokémon printings in eight controlled payment boards: Mew V FST + Mew VMAX FST Active, Genesect V FST on Bench, Double Colorless Energy SUM attached to the VMAX, optional Temple of Sinnoh ASR Stadium, and an unaffected high-HP opposing Shadow Rider Calyrex VMAX CRE. It uses actual `CheckProvidedEnergyEffect`, actual `AttackAction`, resolves the actual `ChooseAttackPrompt` into Genesect V's Techno Blast and resolves native follow-up prompts. All boards have real physical six-Prize piles and deck filler, are turn four, and are constructed **rather than source-shuffled from an authentic 60**.

| Source physical seat | Attached DCE cards | Active Temple? | Native supplied Colorless units | Native Cross Fusion Strike | Settled opponent damage |
| ---: | ---: | --- | ---: | --- | ---: |
| 0 | 1 | No | 2 | Accepted, Genesect donor | 210 |
| 0 | 2 | No | 4 | Accepted, Genesect donor | 210 |
| 0 | 1 | Yes | **1** | **Rejected at payment** | 0 |
| 0 | 2 | Yes | **2** | **Accepted, Genesect donor** | 210 |
| 1 | 1 | No | 2 | Accepted, Genesect donor | 210 |
| 1 | 2 | No | 4 | Accepted, Genesect donor | 210 |
| 1 | 1 | Yes | **1** | **Rejected at payment** | 0 |
| 1 | 2 | Yes | **2** | **Accepted, Genesect donor** | 210 |

The actual Job log prints all eight `AGENT48_MEW_TEMPLE_NATIVE` JSON rows, including physical seat, number of attached energy *cards*, exact native `energyUnits`, action accepted/rejected, 210 damage on each paid successful copy and the explicit false competitive-qualification flag. The test asserts native cost and damage for every case and fails on unexpected prompt or printed-card identity.

## What changes from the previous source research

The original rank-5 60 has exactly **four** printed Double Colorless Energy and **no Basic Energy**. Temple ASR155 makes *each attached* Special Energy supply only one Colorless, while Mew VMAX FST114's Cross Fusion Strike requires **two Colorless**. This establishes a **native payment inversion**, not an absolute attack lock: a single DCE pays outside Temple, two distinct attached DCEs pay under it. Source rank5 can also displace Temple with its own **2 Sky Field + 2 Path to the Peak**, remove it via **Field Blower or Lost Vacuum**, or pursue subsequent turn attachments and other tactics. Actual card access, action costs, play locks and timing remain open.

The [exact Basic-valid opening screen](../../scripts/agent48-temple-mew-dce-access.cjs), with [four passing local tests](../../tests/agent48-temple-mew-dce-access.test.cjs), places two-or-more DCE among opening seven at **5.486082%** and among opening-plus-one ordinary draw at **7.319936%**. Those are physical card-location events, with six randomly located Prize cards marginalized; they omit Ability/Trainer draw, search and turn-specific attachment rules. The full deduction with underlying counts appears in the [seven-source Temple report](agent48-temple-seven-special-source-tax-20261102.md).

This is distinct from [Agent17's earlier five-original Lightning-source Temple proof](agent17-temple-five-lightning-originals-20261102.md): the present independent native test concerns **Colorless multiplicity** in the rank-5 Mew/Genesect source, whose attack remains possible while Temple is active.

## Required next source-policy evidence

A useful prospective source-competence test needs the **real original rank5 registered full 60**, a Temple-capable unchanged fixed candidate, both physical seat orders, exact owner-visible source policy options and pinned research code, a legally obtained Temple state, native attached DCE units, an actual source attempt, and an adversarial source Stadium/removal or second-DCE reply. Preserve unplayed windows, mismatched physical-deal fingerprints, rejects, setup failures, capped games and native engine errors, separately from paper clock. The staged eight cases establish a paper-consistent **cost interaction** and engine behavior only. They establish **zero native full matches**, **zero competitively qualified games**, and **no fixed-deck win rate**.
