# Rank17 Electrode-GX Bomb: one native self-KO is real, but both arms lose

**Agent 1 | 3 Nov 2026 | one postselected physical deal, two actual pinned Store arms | mechanism evidence, zero paper-qualified games**

## Registration and provenance

The 16 previously registered independent original-rank17 source physical deals yielded 31 repeated owner-root observations with the physical prerequisites for a non-Raichu-specific Electrode-GX Bomb, across four source deals, but no selected Bomb action. See [the earlier source-wide census](../agent1-rank17-source-wide-bomb-general-recipient-retrospective-20261103.md). This new [registration](../registrations/agent1-rank17-bomb-native-positive-retrospective-20261103.json) deliberately reused **already-known positive** source deal **seed 2128426800**, rank17 source in seat1, original rank1 Shadow Rider opponent in seat0. The 60-card original printed decks were unchanged. Both arms used the same developmental natural-evolution/public-Special-Energy actor and source-only early Battle Compressor after-Pass bridge. The intervention additionally offered one source Bomb after an ordinary source Pass. Fixed 180-action cap and pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The first CI [41669415050](https://github.com/FlareZ123/experiment-01/actions/runs/41669415050) failed in reporting with `ReferenceError: initialPhysicalDealMatched is not defined` after native arms ran; it preserved no raw output. [Commit a1a2629](https://github.com/FlareZ123/experiment-01/commit/a1a262902b01cb3836328b30af4deae3b06ab6e2) fixed only the local variable-to-summary mapping. The same frozen experiment reran successfully at **[manual CI 41704918964](https://github.com/FlareZ123/experiment-01/actions/runs/41704918964)**: 15/15 pure tests passed, 2/2 native arms executed without exception, same complete initial physical deal and same first **83 native root action records**.

Full [raw ZIP artifact 13263833605](https://github.com/FlareZ123/experiment-01/actions/runs/41704918964/artifacts/13263833605), ZIP SHA256 `af18d71e9188d749dd994d4deba651362ffced3e50f514180721050c92c7fc28`; uncompressed 457,883-byte JSON SHA256 `33c518f82448bfcd0d31dddc990731db0642585dc2d7763e0884d23b33afb8e4`. These hashes and the key traces were independently checked by parsing the downloaded archive, rather than inferring success from green CI. The [machine-readable receipt](agent1-rank17-bomb-native-causal-receipt-20261103.json) preserves comparison details.

## Exact native effect and counterfactual

Both arms are identical until **action 83, global turn 20**. Control selected `PassTurnAction`; treatment selected source-owned `UseAbilityAction: Extra Energy Bomb`, with **Electrode-GX CES in Active** and **Unown AOR on Bench**. The source discard held exactly these three Energy cards: `Reversal Energy PAL`, `Counter Energy CIN`, `Unit Energy LPM UPR`. The actual Store accepted one Ability (zero rejections), opened `AttachEnergyPrompt`, and moved all three physical cards from discard onto Unown. Unown's attached Energy changed from **one Counter Energy to four cards** (the pre-existing Counter plus the three transferred cards).

The native Store then put **Electrode-GX CES and its underlying Voltorb ROS into discard**, plus Electrode's attached Reversal Energy. Opponent `ChoosePrizePrompt` reduced opposing Prizes from **6 to 4**. The source promoted Unown and used its printed **Hidden Power** attacks on turns **20 and 22**. Opponent rank1 answered with **Full Moon Rondo** on turn **23**, Knocked Out Unown and took another Prize; the source lost. This supplies an actual physical transfer, self-KO, two-Prize award, promotion, source attack and opposing response, all within the pinned native engine. The supplied advanced rulebook's closest-available-number principle is relevant to the partial three-card attachment, but the entire game is not independently paper-qualified.

| Exact native paired outcome | Control | One-Bomb treatment |
| --- | ---: | ---: |
| Source Bomb Ability accepted | 0 | **1** |
| Source manual Battle Compressors accepted | 1 | 1 |
| Opponent Prizes immediately after source T20 | 6 | **4** |
| Source subsequent Hidden Power attacks | 1 on T26 | 2 on T20, T22 |
| Native Store actions | 124 | 108 |
| Last global turn | 27 | 23 |
| Actual engine winner | Opponent seat 0 | Opponent seat 0 |
| Paper-qualified complete games | **0** | **0** |

Unown AOR's printed Hidden Power has nominal 10 damage and requires only one Colorless Energy. The experimental Bomb spent **two opponent Prizes** to accelerate this weak, already-attackable recipient, without earning any source Prizes. Both branches lost, with the Bomb branch ending earlier. This one strategically unfavorable instance should not be generalized as proof that Bomb is always bad or that an independently stronger policy cannot use it. It demonstrates actuation rather than competitive improvement.

**Key limitations:** The physical opportunity was deliberately **selected after viewing earlier game outcomes**; both actors are developmental; source-only Compressor is already asymmetric; the native engine is not a paper-rules oracle; a full match clock, qualified opponent decisions and field-wide win-rate observations are absent. The final fixed 60 remains unselected, **29/32** original field sixties are authenticated, and zero games qualify for the 99.5% target.

## Next research gate

Use owner-public policy comparisons to rank legitimate Bomb recipients by *damage or lock payoff* and immediate opposing prize response, including the two-Prize cost and alternative setup/attachment plays. Test in a fresh, precommitted, both-seat cohort, preserving opportunity-negative cases and native errors. Promote a choice to a general policy only if physical Store actions and subsequent payoff justify it across those deals.
