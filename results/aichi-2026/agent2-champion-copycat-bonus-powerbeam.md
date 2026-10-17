# Champion co-builder Copycat sequence: two consecutive source Store attacks

**Agent 2, 17 October 2026 UTC.** Constructed real-Twinleaf-Store board with printed cards, actual typed AttackActions, copy prompts, Knock Outs, Prize choices and turn transitions. **Qualified competitive games: 0**.

## Research question

The champion's [co-builder's first-person strategic account](champion-builder-strategic-prior.md) identifies the intended sequence:

`Mimikyu Copycat -> opponent's preceding Apex Dragon -> own discarded Dialga-GX Timeless-GX -> extra turn -> Mimikyu Copycat -> opponent's preceding Apex Dragon -> own discarded Radiant Eternatus Power Beam`.

Previously separate Store fixtures tested the first 300-damage Fairy Zone KO, two-Prize pickup, a surviving target's Timeless bonus turn, and a spent-GX Shred follow-up. Their composition had not been verified as **a single paid sequence across consecutive turns and two printed Regidrago VSTAR Knock Outs**. This paper interaction has discontinuous value that requires the long sequence.

## Exact constructed state

The new [champion-copycat-power-beam-contract.cjs](../../simulation/twinleaf/champion-copycat-power-beam-contract.cjs) prepares a pinned genuine Store:

- Attacker: Active **Mimikyu GRI**, two attached Psychic Energy; Benched **Lillie's Clefairy ex JTG** with Fairy Zone; own discard includes **Dialga-GX UPR** and **Radiant Eternatus CRZ**.
- Defending player: Active first **Regidrago VSTAR SIT**, Benched second Regidrago VSTAR, and Benched spare Dratini OBF. All Pokémon retain printed HP and card instances.
- Six occupied Prize cards and nonempty deck for each player prevent artificial sudden-death reset; game turn initially 4, with the opponent's last declared **Apex Dragon** supplied in the State.
- Enable the existing reversible research-side compatibility and declared-history hooks, including Mimikyu's nested copying of non-GX Apex. No vendor mutation.

**Important scope boundary:** evolution, attached Energy, discard payloads and preceding opponent attack are staged. This is **not** a source-dealt 60-card match, turn-by-turn setup policy, or representative opponent response.

## Actual source Store observations

[GitHub Actions run 39039163329](https://github.com/FlareZ123/experiment-01/actions/runs/39039163329) at head `0d367fec2be4aeb0284f8528562229b194ad13d7` **completed successfully**, including this new step and all preceding Copycat regressions. Its logged output confirms:

1. The first real `AttackAction('Copycat')` offered the own-discard Dialga-GX and Radiant Eternatus attack choices, and `ResolvePromptAction` selected **Timeless-GX**. Fairy Zone made printed Regidrago VSTAR take **300 damage** from Mimikyu's Psychic copied attack, above its printed 280 HP. Mimikyu spent GX and armed the bonus turn.
2. Real `WaitPrompt -> ChoosePrizePrompt -> ChoosePokemonPrompt -> WaitPrompt -> WaitPrompt` resolved. The first Regidrago entered its owner's discard, Mimikyu took **two** Prizes, and the second Regidrago VSTAR was promoted. The next playable state was **global turn 5 with Mimikyu player active again**. The stored opponent's printed last attack remained `Apex Dragon`.
3. The second real `AttackAction('Copycat')` selected **Power Beam** from the *attacker's own discarded* Radiant Eternatus. Fairy Zone made the printed **200-damage Power Beam deal 400** to the second Dragon VSTAR. The previously spent GX allowance remained spent, and this non-GX attack was valid.
4. A second real `WaitPrompt -> ChoosePrizePrompt -> ChoosePokemonPrompt -> WaitPrompt -> WaitPrompt` resolved. The second Regidrago was discarded and two more Prizes were taken, leaving **two Prizes**; spare Dratini became Active. The attack-history record retained the declaration `Copycat`.

The same manually dispatched CI passed all workflow steps. The output's `firstKo` and `secondKo` were both true, `prizesTaken:4`, `usedGX:true`, `declaredLastAttack:'Copycat'`. This closes a **staged entire advertised co-builder two-attack sequence** where previous regressions each tested only a subset.

## Remaining competitive qualification blockers

No source-60 legal progression establishes the two exact attacker setups and discard contents; the opponent's Apex was preinstalled rather than observed. The stage has two Regidrago VSTAR targets to test Prize arithmetic, a deliberately favorable setup, and no actual attacking opponent reply before the extra turn. The result cannot measure whether a competent Regidrago player ever exposes this counterline, the impact of lock and prize variability, or the probability of executing it across Aichi's full field. The current fixed-candidate bot lacks evidence of choosing the full line under realistic information and resource costs.

The source-60 rank10 champion-B historical v3 replay's Copycat opportunity is a **different frozen game**, and current DDE v4 diverges on turn 2. Never combine the staged two-KO chain with that source trajectory to claim a played result. Maintain `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false` until the separate full-game gates pass.

**Useful next test:** discover a true source deal where the champion has Mimikyu, Clefairy, both Dragon discard payloads, two Psychic Energy and the opponent's preceding Apex. Verify both actual starting orders, bot selection, and source exact decision effects while preserving opponent real continuation and confidential Prize information.
