# Agent 30: native Telepath M3 unit test and source-dealt policy divergence

**21 October 2026, pinned engine. Development-only. Zero competitively qualified games.**

## Mechanism

The supplied paper database `me3-88` Telepathic Psychic Energy gives one Psychic Energy when attached. The actual frozen English-proxy simulation card is **`Telepath [P] Energy M3`** (`results/als/new-moon-perfection-english-map.json`). The first implementation used a database-style fullName that never occurs in Twinleaf's native `CardManager`; corrected source commit `2042681`, unit-tests commit `1479825`, native Store test commits `1cfcfd6`, `c101343`, `8eea1fc`. Pure and native regressions are registered in the existing manually dispatched actor workflow at `a8e8095` and `af7e526`.

**[Manual workflow run 39568824778](https://github.com/FlareZ123/experiment-01/actions/runs/39568824778)** passed, source checkout head `af7e526a134b76eeb5c796dbfc9df721c1010df6`, vendor Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow's new pure Telepath test and its **genuine pinned Store** three-test step passed. The staged native test verifies that CardManager contains `Telepath [P] Energy M3`; the special cost returns Psychic (or Colorless under Temple); a real Dusclops SFA with native M3 attached and one held Basic Psychic SVE selects and legally attaches that Basic, then **native Will-o-Wisp pays its two-Psychic cost and deals 50 damage**, after resolving WaitPrompt. A separate live owner-observation check verifies Temple makes the printed attack two colored units short before an additional Basic, one short afterward. The staged state is not a dealt game or proof of deck setup consistency.

## Native four historical actor-policy cells

[Archived full native output, artifact 12331316024](https://github.com/FlareZ123/experiment-01/actions/runs/39568824778/artifacts/12331316024), ZIP SHA-256 `a70f1ead77055fd51e9031f17d3a1d8ff768c6b0bf9655f65ab954ebbe325fa3`. Opt-ins: `actor_energy_recipient=true`, `special_energy_root=true`, **`paper_terminal_attack_ko=true`**, with default canonical Supporter quota, mandatory prompt option, source pressure. The paper attack-KO hook is a separately developed and still opt-in bug correction: this run cannot be pooled with an OFF run as a sole Telepath factor.

| Historical registered row | Authentic native Store observations | Result/qualification |
| --- | --- | --- |
| Rank6 / champion reference, seed 407516727 | 35 actions, source wins after t4 two-attacker Pale Moon-GX/Volt Cyclone chronology; no reset, 5 accepted actor roots | Engine terminal; unqualified |
| Rank6 / **New Moon Lockbreaker**, same seed | **83** roots; new `Telepath [P] Energy M3` candidate-seated root physically accepted on **global turn3**, resolves original `ChooseCardsPrompt` then Shuffle; **15** accepted actor roots, no rejects | Engine terminal in source's favor; candidate **zero** attack declarations; unqualified |
| Rank11 / champion reference, seed per registered four-arm | 260 roots, 68 accepted actor roots; unchanged original native trace | Action cap; unqualified |
| Rank11 / New Moon Lockbreaker | 260 roots, 63 accepted actor roots; unchanged original native trace | Action cap; unqualified |

Every row now has an audit (**4/4**), all source-deal original fingerprints match historical registered defaults. There were **zero actor root dispatch rejections**. The two rank11 action-limit cells retain unresolved play. The final statement `competitiveQualifiedGames=0` remains correct.

## Action-level pairing to original attempt

Earlier [workflow 39567395642](https://github.com/FlareZ123/experiment-01/actions/runs/39567395642) [artifact 12329679921](https://github.com/FlareZ123/experiment-01/actions/runs/39567395642/artifacts/12329679921) used the initial synthetic-name implementation, and had the paper terminal KO patch OFF. Those runs are **different executable versions and two separate opt-in settings**; they do not isolate one semantic factor.

Nevertheless, in rank6/New Moon the original full **two-player physical opening deal** is identical, original source-deal SHA `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1`. The first **34 actual Store-root ledger objects (ordinals 0 through 33 inclusive)** are bytewise equivalent after canonical serialization, SHA-256 `0ac26d047d95df6e213a4c025b121d038c742fb72571eb17f79caa85c9e232e0` on both outputs. The exact first differing root is **ordinal34, candidate physical seat0, global turn3**:

- Initial synthetic-name variant: `PassTurnAction`; no Telepath attachment; ended in 75 roots.
- Corrected native-alias variant: `PlayCardAction` for `Telepathic Psychic Energy` (`Telepath [P] Energy M3` in typed decision audit), followed by genuine owner `ChooseCardsPrompt`, Shuffle and Wait; ended in 83 roots.

This is an **actual native actor-decision improvement in action reachability**, with precisely located observable divergence and no evidence of competitive win-rate improvement. In particular, the revised candidate still made **zero attack declarations**, and the source finished taking all six prizes. The prompt resolver remains partly generic, the benchmark field incomplete, and we must not call a policy-coverage pass competitive validation.

The earlier rank6/champion baseline's strict chronology error is now avoided by a separate public-paper KO ordering hook, already tested and reported by Agent3 in `results/twinleaf/agent3-paper-terminal-attack-ko-priority-native-paired-20261021.md`. Historical seed selection and later policy quality remain open concerns.

## Next falsifiable question

A fixed same-revision A/B with paper terminal KO held constant, flipping only `Telepath M3` numerical inclusion, would isolate the causal degree of earlier attack/enabling effects. A larger payoff requires improving genuine actor-visible **copy-attack and attached-Energy planning** for Mewtwo & Mew-GX and a credible source policy: now that the telepath attachment occurs, the candidate still makes no attack under rank6. Preserve all censored attempts and source-deal identity.

No cardlist change, 99.5% claim, or field-wide estimate is supported.
