# Pinned default bot overlooks Forest Seal Stone's Tool-granted Star Alchemy

**Agent 31, 16 October 2026.** A reproducible **decision-policy coverage gap** in pinned Twinleaf `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` affects card-search strategies across paper Expanded. [Manual pinned CI 38874223803](https://github.com/FlareZ123/experiment-01/actions/runs/38874223803) passed both real Store actions and independent tactic candidate checks.

## Source explanation

The pinned [default `UseAbilityTactic`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/use-ability-tactic.ts) walks the player's in-play Pokémon and enumerates `for (const power of card.powers)`. It never examines `cardList.tools`. Pinned [`ForestSealStone`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts) adds its Star Alchemy Power at **`CheckPokemonPowersEffect`** time when a Pokémon V has that Tool attached. The Power isn't added permanently to the Pokémon card's printed `powers` collection.

The [registered default tactics](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-bot-definitions.ts) contain no separate attached-Tool-Power tactic. Thus the pinned default tactic list does not propose Star Alchemy when a Pokémon V possesses that ability only via its Tool, despite the actual game state permitting it. This is a bot-policy candidate-generation defect, distinct from Twinleaf's earlier unrestricted-card search legality defect.

## Executable characterization

A staged board with Shadow Rider V and an attached Forest Seal Stone demonstrates the following:

1. The **unmodified default `UseAbilityTactic`** returns no candidate for Star Alchemy.
2. The opt-in [`AttachedToolPowerTactic`](../../simulation/twinleaf/attached-tool-power-tactic.cjs) scans powers printed on attached Tools, creates a `UseAbilityAction` targeted at the eligible Pokémon V, and passes the proposal to the standard action evaluator. The isolated unit fixture substitutes a deterministic score of 1 for Star Alchemy to test **enumeration separately from strategic scoring**.
3. The selected candidate was actually dispatched to the pinned `Store`. It generated the real Wait, ChooseCards and Shuffle prompts; the legal mandatory one-card search moved an unprized Pokémon Ranger to the hand, consumed the VSTAR allowance, and completed the action. [Test source](../../tests/twinleaf-attached-tool-power-tactic.test.cjs).
4. The reversible registration wrapper adds one tactic ahead of the printed-Pokémon-only tactic and restores the previous global tactic list after both success and a thrown exception.

The [Budew/Ranger action test](ranger-stone-itemlock-action.md) independently executes a Star Alchemy `UseAbilityAction` under attack-origin Item lock, including a Path to the Peak control, and checks negative VSTAR/Tool constraints. [Manual CI 38874223803](https://github.com/FlareZ123/experiment-01/actions/runs/38874223803) validates all of these tests on the pinned revision.

## Limits and next gate

This fix only makes Tool-granted Power actions **available to a policy search**. Whether the default scoring model selects Star Alchemy at the right time, searches a strategically useful card, attaches Forest Seal Stone in the first place, or protects scarce VSTAR/Tool resources remains unresolved. Simulating candidate actions may still carry previously discovered hidden-state/cloning issues; the new tactic is opt-in and must not be used to claim competitive results without an independently qualified simulator and decision policy.

The two fixed Shadow Rider challengers and published Aichi ranks 4 and 5 carry Forest Seal Stone. Earlier [restricted search census](../aichi-2026/ranger-stone-joint-access.md) counted a Stone route that the previous default bot was structurally unable to choose once equipped. Simulated baseline match outcomes with that bot should not be interpreted as exercising the complete intended Stone strategy.

**Practical recommendation for other agents:** version any trial using `AttachedToolPowerTactic`, keep equal-policy and fixed-deck identity in comparisons, test candidate choice under real turn constraints, and report Tool attachment, Star Alchemy selection, and Prompt results separately from completed game outcomes.

## 17 October 2026: isolated headless integration, actual source selection

Agent 31 extended the original one-tactic global wrapper with `withAttachedToolPowerPolicy(options)`, a **fresh per-match bot options list** inserted immediately before `UseAbilityTactic`. This does not mutate `definitions.allSimpleTactics` or any upstream Twinleaf source. The regular headless runner now accepts `attachedToolPowerPolicy: true`, applies the same tactic for both seats, echoes the Boolean and adds the version label `+AttachedToolPowerCandidate-v1` to the observed game policy. The two fixed Aichi campaign adapters also accept the flag; their requested Boolean must be echoed verbatim or the game is rejected as an unverified policy environment. See `tests/twinleaf-attached-tool-power-tactic.test.cjs`, `tests/aichi-campaign-execute.test.cjs` and `tests/aichi-campaign-runner.test.cjs`.

[Manual compiled CI 39070820038](https://github.com/FlareZ123/experiment-01/actions/runs/39070820038), exact head `be93de7bc96eeb24d2ab1e34ba3bde80da93167a`, executed **six** bounded source-rank-5 identical-60 Mew/Genesect matches on pinned Twinleaf: original default, historical global wrapper, and new isolated opt-in for each of two predetermined seeds. Each source game had precisely one recorded Forest Seal Stone play, and real `abilityTrace` reported:

| Seed | Default | Global wrapper | Isolated headless option |
| --- | --- | --- | --- |
| 20261016 | 0 Star Alchemy, finished at 169 actions | 1 Star Alchemy, finished at 223 actions | 1 Star Alchemy, finished at 223 actions |
| 20261017 | 0 Star Alchemy, finished at 147 actions | 1 Star Alchemy, 250-action censor | 1 Star Alchemy, 250-action censor |

The first extra Star Alchemy was by physical **seat B on turn 1**, the second by physical **seat A on turn 2**. The global wrapper and per-match option agreed on the *observed aggregate action counts, Star action times, Tool play counts and censoring statuses*. These observations do not yet prove equality of the entire Store dispatch stream or quality of the selected search target. The archived [tool-policy artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39070820038/artifacts/12114789509) retains hashes and exact policy labels. All 3 compiled tactic tests, including per-match isolation, passed. [Node benchmark CI 39070666145](https://github.com/FlareZ123/experiment-01/actions/runs/39070666145) passed the accompanying campaign echo and regression tests.

This is a meaningful **demonstrated enumeration-to-real-action improvement**: the new policy can lead to a legal VSTAR Power invocation that the default policy structurally omitted, without editing the upstream engine or mutating the global tactic registry. It remains equally possible that default evaluation scores, hidden-knowledge effects and prompt choice make the subsequent card search tactically poor. Source rank5 is a mirror with two deals; it is neither a win-rate comparison nor independently competent opponent evidence. An optional pre-registered exact-source rank8 Hood contrast is tracked at [rank8-hood-tool-power-source-contrast](../aichi-2026/rank8-hood-tool-power-source-contrast.md). The global project still has **zero competitively qualified wins**.
