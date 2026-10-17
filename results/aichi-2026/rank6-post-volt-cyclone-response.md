# Rank-6 source-dealt Volt Cyclone: actual next-turn Shadow Rider response

**Agent 30, 17 October 2026.** Evidence class: genuine compiled Twinleaf Store action and publicly visible board-transition observations from **one fixed physical deal**, with two alternative Iron Thorns discard choices. The observed opponent uses the repository's generic research bot. **No qualified competitive games.**

## Fixed source and execution

- Source pair: full published Aichi rank-1 Shadow Rider champion, physical seat A, versus published rank-6 Iron Thorns, physical seat B; identical 60-card printing inventories and six initial face-down Prizes across three arms.
- Original shared physical seed: `20367160`. Rank-1 champion actually starts, rank-6's first legal attack opportunity is global turn two. Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in `vendor/twinleaf`.
- Pinned Store uses the published source inventories through `planAichi(1)` with declared `allowEquivalentBasicEnergies:true` and `allowJapanesePromoHooks:true`. Other options and hook selection are recorded in `simulation/twinleaf/rank6-immediate-opponent-response.cjs`; these representability permissions do not establish independent paper-format legality.
- Compiled/manual CI [39010339726](https://github.com/FlareZ123/experiment-01/actions/runs/39010339726) **passed** the existing source tests, the added public projection unit test, source observer unit test, and a three-arm genuine Store replay. Follow-up [CI 39010672503](https://github.com/FlareZ123/experiment-01/actions/runs/39010672503) **passed** the strengthened paired full-game deterministic-signature check for the read-only Acerola observer across all three arms, plus an added mock Store restoration test. Earlier [39009816395](https://github.com/FlareZ123/experiment-01/actions/runs/39009816395) passed the first three-arm replay but revealed a reporting flaw: valid `PassTurnAction` was incorrectly marked unfinished because the global turn counter had not advanced at that dispatch. The corrected schema records `turnEndingActionAccepted` separately from `observedTurnNumberAdvanced`.
- Reproducer: [rank6-immediate-opponent-response.cjs](../../simulation/twinleaf/rank6-immediate-opponent-response.cjs); [public projection](../../simulation/twinleaf/rank6-response-projection.cjs); [Acerola board observer](../../simulation/twinleaf/rank6-acerola-public-observer.cjs); existing [rank6 discard source fork](../../simulation/twinleaf/rank6-seed-guzma-hala-fork.cjs).

## Next global turn, as actually selected by the champion bot

The source-dealt Iron Thorns hand and six Prizes were checked identical across arms. Both scripted alternatives spent `Guzma & Hala` on global turn two, searched the same Double Colorless Energy and Wondrous Labyrinth Prism Star, played the already-held Thunder Mountain, attached the DCE, and completed **Volt Cyclone for 140** to opposing Shadow Rider Calyrex V. They differ only in the two visible hand cards discarded for the search.

| Rank-6 global-turn-two policy | Payment to Guzma & Hala | Opposing champion's public actions on global turn three |
| --- | --- | --- |
| Original generic bot | No forced Guzma & Hala line | Play Shadow Rider Calyrex VMAX, attach Psychic Energy, Pass |
| Source forced, Guzma spent | Guzma + Tropical Beach | Play Shadow Rider Calyrex VMAX, attach Psychic Energy, Acerola, play Shadow Rider Calyrex V, Pass |
| Source forced, Guzma preserved | Trainers' Mail + Tropical Beach | Play Shadow Rider Calyrex VMAX, attach Psychic Energy, Acerola, play Shadow Rider Calyrex V, Pass |

A true `PassTurnAction` was dispatched in all three observed opposing turns. The champion announced **no attack on global turn three** in any of these arms.

The read-only public Acerola witness verifies the same concrete Store board transition for both forced arms:

- Immediately before Acerola: champion Active **Shadow Rider Calyrex VMAX**, **140 damage**, **two Energy cards attached**. Bench has **Dialga-GX**.
- Immediately after the Acerola effect and its resolution: champion Active **Dialga-GX**, zero damage and zero attached Energy cards; **no Benched Pokémon**. The affected Shadow Rider VMAX stack is no longer in play.
- Later that same turn, a new Shadow Rider Calyrex V is played to the Bench, then the champion Passes.
- Original generic-bot baseline has **no observed Acerola play** on that turn.

This is consistent with the attached card source's Acerola text, which returns a damaged Pokémon and its attached cards to the owner's hand (`resources` card pool, Acerola BUS/SM3), together with the provided manual's return-to-hand rule. A late recovery path and forced Active promotion can change the Prize race even when the initial 140 damage is healed. This sample does **not** establish whether the healing line is best play.

## Scope and limits

The report is an observational continuation of a **single fixed seed** with changed policy actions. Physical opening equality and accepted attack transitions are verified. The two forced payment arms produce identical recorded champion turn-three public action sequences, but have different remaining Iron Thorns hand resources. The immediate public response therefore does not resolve the relative future value of keeping Guzma rather than Trainers' Mail.

Every sampled game stopped at the **125-headless-action limit** and had `gameFinished:false`; none records a usable finished-game winner. In this capped window, champion had zero attack announcements in each arm and Iron Thorns recorded one attack in the original-bot arm versus four in each forced branch. Both players' decision policies have serious known tactical and information-set shortcomings. Shuffle and later policy RNG consumption can diverge after the prescribed source fork. Neither an attack-count difference nor the observed Acerola action is evidence of competitive match dominance or a win-rate gain.

The observer's reported full-game deterministic signatures were checked against a separate source run without that observer for **each** of the three arms. This is bounded observer noninterference evidence for the signature's recorded game fields, distinct from proving the broader Store closure graph or speculative bot information integrity. The projection intentionally excludes private-hand and Prize identities from the public response ledger. Source physical Prize inspection is a privileged audit outside the acting bot. It does not establish full live Store closure or reducer equivalence; tests of paper rules and independently competent opponent choices remain open.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**Qualified competitive games contributed: 0. Target 99.5% win rate remains unverified.**

## Follow-up

Replay the same source branch with an explicitly reviewed champion response policy and information-safe decision process; then separately test both candidate seats with fresh seeds. Identify what alternatives the opponent actually had to Acerola and their legal immediate consequences before claiming any strategic preference. A full-game result also requires separately verified source reducer/prompt fidelity and relevant paper rules.
