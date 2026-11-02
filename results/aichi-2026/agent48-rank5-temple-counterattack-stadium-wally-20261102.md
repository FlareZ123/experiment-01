# Agent48: original rank-5 Mew's Temple answer and first-turn Wally access

**2 November 2026 | exact original 60 source, both-seat native counterplay, exact conditional resource combinatorics. Zero competitive matches.**

## Four Stadium-response cases completed in the pinned native Store

The original rank-5 **Yamato Nakano Mew/Genesect 60** contains exactly **Sky Field ROS89 ×2** and **Path to the Peak CRE148 ×2**. The [new pinned Store response runner](../../simulation/twinleaf/agent48-temple-mew-stadium-response.cjs) validates those original printings and constructs a board with original Mew V FST113 + Mew VMAX FST114 Active, Genesect V FST185 Benched, one attached Double Colorless Energy SUM136 and opponent's Temple of Sinnoh ASR155 active.

For each of **Sky Field / Path to the Peak × source native seat 0 / source native seat 1**, an actual **PlayCardAction** replaces Temple, **CheckProvidedEnergyEffect** changes the attached DCE from one Colorless to two, and an actual **AttackAction** using Cross Fusion Strike resolves **ChooseAttackPrompt** for Genesect V's Techno Blast, dealing **210 damage**. All four cases passed with source seat parity. The opponent side was a constructed high-HP target; the physical deal, search, other source resource access and opponent decisions were not simulated.

The preceding [eight controlled payment cases](agent48-rank5-temple-native-payment-eightcase-20261102.md) separately confirm in both seats that one DCE pays Cross Fusion Strike without Temple, **one DCE is rejected with Temple**, and two attached DCEs pay successfully under Temple. Together, they establish a **reversible printed-card attack-funding constraint**, including native opponent Stadium counterplay. They are staged mechanical proofs, outside the competitive win denominator.

## Restricted first-turn Wally counter-ALS, before added search/draw

The source's original 60 includes **four Mew V, four Genesect V, one Wally ROS94, four DCE, four directly playable replacement Stadiums, three Mew VMAX, 11 Basic Pokémon total**. Wally's printed effect can evolve an eligible Pokémon during its player's first turn. A physically possible going-second first-turn response to a candidate that established Temple going first is:

`Mew V starts Active -> Genesect V reaches Bench -> play Sky Field or Path to the Peak over Temple -> attach DCE -> Wally searches the original deck for Mew VMAX and evolves the Mew V -> Cross Fusion Strike copies Benched Genesect's Techno Blast`.

The order of independent actions can vary. This line requires the named resources and a legal unrestricted board; source Stadium competition, an opposing lock, manual Energy attachment availability, Wally's Supporter quota, and valid native prompts remain decisive.

The [exact combinatorial source screen](../../scripts/agent48-rank5-temple-wally-first-attack.cjs) counts all acceptable initial seven-card hands, their first ordinary turn draw and six distinct randomized Prize cards. It requires **Mew V in the initial seven** (so the source can choose Mew as starting Active), Genesect V + Wally + a DCE in the first eight, and **at least one Mew VMAX still in the searchable deck after Prizes**. The Temple case additionally requires one of the **four printed Stadium replacements** among the first eight. No other draw, search except Wally, opponent mulligan bonus, deck targeting or hypothetical connector is credited. The original 60 and all printing quantities are asserted before calculating.

| Restricted source physical co-location | Basic-valid opening probability | Exact favorable / equally weighted outcomes |
| --- | ---: | --- |
| Wally line with no Temple-response requirement | **0.7476884145%** | 2,422,742,283,847,872 / 324,031,005,021,884,160 |
| Same Wally line, Temple already active, direct Stadium response also held | **0.2107821359%** | 682,999,473,381,120 / 324,031,005,021,884,160 |

The narrower Stadium-required event is **28.1911732%** as frequent as the no-Stadium-required event under these same strict location criteria. This is a comparison of *physical hand and search-zone prerequisites*; the full deck can use Quick Ball, Ultra Ball, Trainers' Mail, Forest Seal Stone, Secret Box, Genesect draw and Dedenne/Crobat support to find pieces beyond the restricted model. Different post-setup board lines and an opponent's defense can also change the actual chance of attacking.

Separately, rank5 has **Field Blower GRI125 ×1** and **Lost Vacuum LOR162 ×1**, potentially removing Temple with their own conditions and costs. Those two Item alternatives are **excluded from the four no-discard Stadium response group** in the exact Wally calculation. The original source also has two Special Charge for DCE recovery from discard and eventually can attach a second DCE under Temple; those later routes were not counted as immediate first-turn replies.

## Evidence, clocks and falsification

The [independent three-test suite](../../tests/agent48-rank5-temple-wally-first-attack.test.cjs) asserts exact original printing counts, both 60-card fractions and an independently brute-enumerated miniature game with opening, draw and Prize placement. The [earlier four-test DCE suite](../../tests/agent48-temple-mew-dce-access.test.cjs) verifies direct DCE counts and Prize marginalization separately. All **7 of 7** tests passed in the manual [CI run 41408711729](https://github.com/FlareZ123/experiment-01/actions/runs/41408711729), native research head **`93b1fe41b0adf4e76438d222aee09d4b9d984743`**, alongside both successful native Mew steps and existing Raichu Temple checks. Twinleaf engine pin was **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. The actual source script executed against `full-decklists.json` and emitted the same exact raw counts; the local miniature reference also passed before commit.

A stronger test should execute the **Wally line in the actual pinned native Store on turn one going second**, resolve every real prompt, and then observe a counter-policy chosen from actual owner hand against a Temple-capable unchanged candidate in **prospectively preregistered original source-dealt games**. Opposing Stadium replacement must be an available action under the actual game state. Include both seats, original Prize locations, source owner-observation decisions, and all censored/error outcomes. The Open League 25-minute paper clock is separate from any native root cap.

**Status: conditional stage mechanics and exact resource access measured; full-match source competence unproven; 29/32 authenticated opposing 60s; zero competitively qualified games; 99.5% unsubstantiated.**
