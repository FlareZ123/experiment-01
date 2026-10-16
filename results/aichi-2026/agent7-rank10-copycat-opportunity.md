# Agent 7: source-ranked rank-10 Mimikyu/Apex opportunity diagnosis

**16 October 2026, invocation 100.** Evidence: pinned-engine, source-ranked **two-seed paired diagnostic**, not a competitive win-rate experiment. `qualified_for_competitive_inference: false`.

## Reproducible setup

The immutable source decks are Aichi 2026 rank 1 Yasunori Kato Shadow Rider and rank 10 Haruku Yoshioka Regidrago, resolved through `simulation/twinleaf/resolve-field.cjs` with the repository's existing stated basic-Energy and Japanese-promo allowances. Resolved 60-card hashes (SHA-256 of engine print ID arrays):

- Rank 1: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Rank 10: `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`.

The twinleaf pin is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The fixed rank-10 `decorrelated-slots-v3` campaign uses plan digest `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`, with one trial per physical candidate seat. Code: [two-arm source experiment](../../simulation/twinleaf/mimikyu-rank10-policy-pair.cjs), [test](../../tests/mimikyu-rank10-policy-pair.test.cjs), [manual-only workflow](../../.github/workflows/mimikyu-rank10-pair.yml).

[**Successful CI run 38899297574**](https://github.com/FlareZ123/experiment-01/actions/runs/38899297574), research head `205aa919ac89b554db8cf612ce1ab9ca028c0d4b`, [complete recorded JSON artifact 12045393047](https://github.com/FlareZ123/experiment-01/actions/runs/38899297574/artifacts/12045393047). The one pure helper test passed, and two paired headless trials finished. First attempted run `38899191448` failed because its pure test imported an engine-dependent module before compilation; the workflow ordering was fixed before the successful run.

Both arms held all deck IDs, starting seed, full policy corrections and Simulator profile constant: experimental post-constructor alias reconciliation, Forest Seal Stone search correction, Supporter decision guard, Double Dragon recovery, isolated policy randomness, strict prompt validation, Mimikyu non-GX Apex compatibility, printed attack history corrections for Mimikyu and Regidrago, and stale attack-on-Pass clearing. **Only the champion seat's opt-in `mimikyuApexTimelessPolicy` changed** in the experimental arm. The original control run repeated *after* the opt-in experiment produced a byte-identical `runMatch` return, checking reversible hook cleanup for these trials.

## Observed paired outcomes

| Trial | Candidate's true turn order | Printed opponent Apex attacks | Champion Copycat attacks | First captured meaningful-action difference | Engine remaining Prize cards (physical slots 0/1) |
| --- | --- | ---: | ---: | --- | --- |
| Champion physical A | Second | 0 | 0 | None | `[0,6]` |
| Champion physical B | First | 2 (global turns 26, 28) | 0 | None | `[1,2]` |

The original and experimental records had the same entire **captured meaningful-action array** in each paired trial. Candidate A's opponent never used Apex, so that pair does not challenge the policy counterline. In candidate B, Apex occurred, yet the optional tactic changed none of the recorded actions. The champion later lost the B engine game through exhausting its draw deck. Engine winners, turn totals and the identical partial traces are **bot diagnostics, not game-win-rate estimates**.

### Candidate B: precise setup and resource contention

The archived `CHOOSE_STARTING_POKEMONS` event includes **Mimikyu GRI** among four selected opening Pokémon, and a global-turn-1 public board confirms it **on the champion's Bench**, disproving an absence-from-opening-hand explanation. At global turn 2 it appears as the champion's Active Pokémon. Later it returns to the Bench.

At turns **19, 21, 22 and 24**, the recorded public board shows Mimikyu Benched with **one Psychic Energy**. This is one Energy short of its printed Psychic-plus-Colorless **Copycat** requirement (Mimikyu GRI 58 from the supplied card database). The benchmark Champion only has one Mimikyu and one Dialga-GX.

On global turn **26**, the opposing Regidrago VSTAR announces **Apex Dragon**. On the champion's immediately following turn **27**, the meaningful action record begins with champion **Dialga-GX UPR in hand**, then shows the bot playing that Dialga-GX onto its Bench. A discarded Dialga-GX is a necessary payload for copying its **Timeless-GX** through Regidrago's **Apex Dragon**. Having the card in hand at the start of turn 27 and putting it in play fails to create that payload. Turn 27 instead includes Forest Seal Stone, Night Stretcher, a Psychic Energy attachment, Raihan, Unfair Stamp, and Latias ex's **Eon Blade** attack. The opponent announces another Apex Dragon on turn 28.

The available next full champion-board snapshot is turn **29**: Mimikyu is absent, the champion has only three Benched Pokémon and **Dialga-GX is Active**. The opponent played Parallel City on turn 28, which is a **plausible** explanation for some Bench reduction, but the partial trace does not prove Mimikyu's exact removal cause or timestamp. The trace lacks complete attack effects, decisions during opponent turns, entire prompts and state snapshots immediately after every action.

### Exact post-Apex turn-27 predecision capture

[Manual CI 38901206562](https://github.com/FlareZ123/experiment-01/actions/runs/38901206562) passed on source revision `2076189f8e15b61c28ee7fdddff4ab32a12267d9`. [Complete artifact 12045947529](https://github.com/FlareZ123/experiment-01/actions/runs/38901206562/artifacts/12045947529) holds the new read-only `copycatTurnStartEvidence`. The helper captures the real first candidate decision state each turn, including only its own hand and public opposing information, without feeding telemetry into the policy. The original/attack-priority arms were identical again.

**On source global turn 27:** previous Regidrago VSTAR attack was Apex Dragon (non-GX); it was Active with **60 damage** and Grass/Fire/Grass attached. Champion had unused GX, Active Latias ex with **two Psychic**, a **Benched undamaged Mimikyu with one Psychic**, and no Stadium. Champion's own Dialga-GX was in hand, absent from discard and play. Its hand contained Night Stretcher, **two Mysterious Treasure**, Quick Ball and Forest Seal Stone. Its discard contained **three Psychic Energy** and Trevenant & Dusknoir-GX. Turn29 recorded Mimikyu in the discard after the opposing turn28 Parallel City plus Apex sequence, without resolving the exact removal action.

The printed card pool supports a **candidate one-turn line** to be tested: discard Dialga via Mysterious Treasure, recover and attach Psychic via Night Stretcher, retreat Active Latias ex into now-powered Mimikyu using Latias's Skyliner zero-retreat Ability, then Copycat the prior Apex Dragon and choose own discarded Dialga Timeless-GX. This is a *resource hypothesis*, not a verified legal branch; full Store/prompt replay and source noninterference are required. No visible Stadium or enemy Active Ability lock blocked Skyliner in this snapshot.

### Meaning and opportunity hypothesis

Adding an attack-priority tactic to the existing SimpleTacticsAi does not solve the *multi-resource line construction*: on a response turn, the champion needs (a) the correct opponent previous attack, (b) Mimikyu Active, (c) enough Energy to use Copycat, (d) its own Dialga-GX discarded so Apex can access Timeless-GX, and (e) the GX allowance still available. At the observed decision window, the prior public Mimikyu board and directly observed Dialga hand position expose at least two relevant constraints. Potential tools to discard, attach and switch must be evaluated jointly against Supporter/connector contention and actual legal availability; this experiment does not prove a viable winning counterfactual.

A next experiment should capture a **true live Store snapshot immediately after the first Apex and before the champion makes its turn-27 decision**. Log both parties' AttackAction prompt choices, relevant discard/hand/bench/active states, attached Energy and GX markers. Build an alternative whole-turn action line with complete opponent response and a source-State noninterference check. The existing public-board-at-Pass logger and action-only `decisionTrace` are insufficient to conclude that the policy opportunity was impossible, forced, or strategically optimal.

## Important validity boundaries

The post-super reconciled clone passed previous structural tests but has **not** been certified across arbitrary gameplay or made the generic bot competitive. These two same-seed variants are paired (dependent) deterministic trials. Opponent Koraidon decision quality remains questionable in independent rank-10 source studies. Neither trial provides independent matchup win-rate evidence. The shared [rank-10 working qualification packet](qualification-packets/rank-10/README.md) and [Critic's critical path](critic-qualification-critical-path.md) still report `qualified_for_competitive_inference: false`.
