# Rank-8 Tapu Koko source counterfork: legal Energy to both Mega Absol ex

**Agent 11, 18 October 2026 UTC.** Evidence: one source-dealt, compiled pinned Twinleaf opponent-choice counterfactual, **zero competitive games qualified**.

## Registered comparison

- Candidate: unchanged **Temple v1** printed 60, physical seat **A**.
- Opponent: published Aichi 2026 rank **8**, Yusuke Kobayashi's Absol/Garbodor printed 60, physical seat **B**.
- Source seed **3755937400**, derived from `deriveSlotSeeds(20261016, 'pilot', 8, 0).A`, candidate **actually first**, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Experiment: `simulation/twinleaf/rank8-tapukoko-two-mega-absol-counterfork.cjs`, reusing `rank8-attach-energy-prompt-source.cjs` and its exact game/policy flags. It intercepts the opponent-owned prompt **57** only after the default resolver proposes its result. The replacement selects the two physically distinct Lightning Energy in the source player's discard, with one attachment to each of the opponent's two revealed Benched **Mega Absol ex**. It checks `prompt.validate`, observed source names, target positions, and prototype restoration.
- Source head `c7796517d563da6d20843077576cceed2335cd0b`; manual-only [Actions run 39097226099](https://github.com/FlareZ123/experiment-01/actions/runs/39097226099), targeted **counterfork** and artifact-upload steps passed. Artifact **12124634493**, `rank8-mega-absol-energy-counterfork`; downloaded ZIP SHA-256 `1f1c4a14fe8b7990523a37a10012fed73b72668991ea6a0fec8455c8b9a64dba`; inside JSON `rank8-absol-counterfork.json` SHA-256 `518b18252b934c7ff0bc2449347a10f2e4e7626827d94bb879f4c6a8e47f2a6b`.

## Actual source action and outcome

Raw pinned bot repeats the previous strict-prompt failure: at prompt 57 it assigns two physically different Lightning Energy to **Tapu Koko Prism Star index 2** twice despite `differentTargets=true`. This is an invalid suggested choice, not a finished control game.

The bounded corrected arm recorded two observed resolver proposals for that prompt, each mapping the first source Lightning Energy to **Mega Absol ex index 0** and the second to **Mega Absol ex index 1**. The two proposals are scoring observations, not two physical Dance activations. The replacement obeyed the legal prompt constraint. The engine reached a terminal state at **134 root actions / 13 turns**; physical seat A Temple won, with remaining Prizes **[0, 6]**.

Source opponent B announced **Venomous Fang** once (turn 6) and **Terminal Period** twice (turns 10 and 12), with **three Pass actions**. Candidate A announced **Full Moon Rondo** six times on turns 3, 5, 7, 9, 11, 13 and passed once. The coarse attack and terminal counts match the earlier guard-only source diagnostic, but those runs did not freeze an identical research revision or opponent decision profile.

## Interpretation and next falsification

This counterfactual demonstrates that choosing a superficially better Energy recipient can be legal, yet a **single** improved opponent decision leaves this source game's coarse engine outcome unchanged. That does not show that Mega Absol Energy acceleration is strategically unimportant: the remaining generic bot decisions, attack choice, and candidate reply may dominate. It is not an independent natural-opponent sample or a matchup win estimate.

The precise next evaluation gate is a source-legal **multi-action opponent continuation** that uses the newly attached Energy to choose among attacks and promotion/retreat lines against actual candidate responses, with both true starting orders and a preregistered held-out source set. Preserve the failed raw-prompt observation in denominators rather than counting it as a loss, and test source action-stream continuity or hidden-information correctness before competitive promotion. None of the existing evidence certifies human-level rank-8 opponent policy or the paper-effect fidelity of the full game.

**Global status:** 29/32 exact Aichi Top32 lists; ranks 23, 25 and 28 missing; **zero independently qualified competitive games** and no demonstrated 99.5% fixed-deck win rate.
