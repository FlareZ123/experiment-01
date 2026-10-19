# Rank 9: printed Electrode-GX can accelerate five source Energy to Mega Absol ex in the pinned Store

**Agent 7, 19 October 2026. Evidence class: deliberately staged, pinned engine action/prompt regression and immutable source-print assertion.** Manual-only [Twinleaf Electrode-GX Ability audit CI **39314846696**](https://github.com/FlareZ123/experiment-01/actions/runs/39314846696) succeeded at research revision `80855c6df8cb1d50dc015134865ec07a2d33c0c0` with upstream Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both dedicated tests passed, as did the workflow's preexisting Electrode regression suite. **There is no natural source-dealt Electrode line, damage outcome, full game, competitive qualification or win-rate finding.**

## Printed source and narrow question

Shun Ito's [exact rank-9 Absol Electrode 60](full-decklists.json) contains **two Electrode-GX CES 48, one Basic Mega Absol ex MEG 86, four Prism Energy ASC 216, two Darkness Energy MEE 15**. Electrode-GX's Extra Energy Bomb allows Energy from discard onto Pokémon **except Pokémon-GX or Pokémon-EX**, then Knocks itself Out; modern lowercase `ex` is a different Rule-Box category. The printed Mega Absol ex is Basic and a three-Prize Mega Evolution ex. It can attack with Terminal Period for Darkness plus Colorless, or Claw of Darkness for Darkness, Darkness, Colorless.

A fragile rules-modeling shortcut could accidentally ban any Pokémon with *any* Rule Box as a Bomb destination, wrongly excluding this list's principal modern Mega ex. This test directly checks that source-specific distinction in the pinned card reducer and staged prompt.

## Executed fixture, assertions and result

Reproducible source: [actual pinned Store probe](../../simulation/twinleaf/rank9-electrode-mega-recipient.cjs), [single-file regression](../../tests/rank9-electrode-mega-recipient.test.cjs), incorporated only into the already **manual** workflow `.github/workflows/twinleaf-electrode-ability-audit.yml`. Source-rank/card-quantity assertions use the immutable full-60 registry. Fixture prepares an Active Mega Absol ex, a Benched Electrode-GX, and exactly **four rank-9 Prism Energy plus one rank-9 Darkness Energy in discard**. Those public resources are directly injected for a conditional card-effect test; their ordinary acquisition, source's sole Voltorb evolution sequence, relative deck access and Prize configuration are not tested. Each player receives six fixture Prizes to track the Electrode self-KO.

The opt-in existing `installElectrodeGXEnergyHook()` corrects the pinned engine's otherwise optional 0-to-5 attachment behavior to the printed mandatory number (here five), and is uninstalled after the case. A genuine `UseAbilityAction('Extra Energy Bomb')` on Electrode's Bench slot opened the expected `AttachEnergyPrompt`. The scripted five assignments to the **Active Mega Absol ex** passed the pinned `prompt.validate` and all associated real Store dispatches. The resulting public State had:

- All **five original Energy cards** attached to Mega Absol ex, and none remaining in the discard;
- Electrode-GX in the discard pile after its self-KO;
- Exactly **two Prizes taken by the opponent** for that self-KO;
- A five-entry Energy-provision map: four Prism entries as `CardType.ANY` wildcard on the **Basic** Mega Absol ex, and one Darkness unit;
- Every pending post-Ability prompt settled.

The internal pinned engine card is named **`Mega Absol ex M1L`** even though its printed set is **MEG 86**. The first CI run at head `02bb4db` failed on this name mismatch; source inspection established the correct identifier. The second CI run at head `0485d3f` reached the effect and Prize checks but failed our overly literal energy-map assertion that required a specific `DARK` value for Prism. The upstream Prism reducer accurately represents flexible type as `ANY`; the corrected assertion was validated in the **successful third CI**. The earlier failures were diagnostic development executions, and none should be used as a negative game sample.

## Limits and next discriminating question

This establishes a **legal-in-the-pinned-Staged-Store recipient and complete attachment/Prize transition under the existing correction hook**. It does not certify the Japanese-paper reprint/ruling, the nontrivial opportunity to discard five of this 60's seven total Energy, the source's ability to evolve its single Voltorb into Electrode, the three-Prize exposure of Mega Absol ex, the choice of paying Terminal Period versus Claw of Darkness, or any tactical advantage. The test verifies the Energy map but **does not dispatch Mega Absol's attack**.

A prospective source-policy study should count authentic owner-observable deals in which Mega Absol, Electrode, enough discarded Energy, evolving turns and a favorable Prize race coincide. In particular, a source policy that prefers an immediate Horror House lock over giving the opponent two free Prizes might be superior in many States. The first source-policy opponent root must be selected without scripting hidden-zone discoveries. Prior rank-9 [Horror House source exposure](rank9-horror-house-root-source-exposure.md) tested a different strategy on 16 historical original deals; this staged board contributes **zero additional actual games**.

**Shared gate: 29/32 exact Aichi published Top-32 lists; zero independently competitive-qualified games; no proven fixed 99.5% deck.**
