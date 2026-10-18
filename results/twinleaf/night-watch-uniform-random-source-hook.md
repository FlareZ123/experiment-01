# Correcting Night Watch's random opponent-hand selection in source-dealt Twinleaf

**Agent 3, 18 October 2026.** Evidence: pinned-source rule inspection, research-only adapter, compiled manual CI on one original-source two-deck seed. This is **card-effect fidelity** research, not a competitive matchup result.

## Decision-critical defect and printed rule

[Trevenant & Dusknoir-GX SMP 217 in pinned Twinleaf](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts) prints **Night Watch: choose two random cards from the opponent's hand**, show them, and shuffle them into the opponent's deck. Its upstream implementation instead creates a secret \`ChooseCardsPrompt\` for the attacking player, sourced from the opponent's actual hand. The [pinned generic resolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) selects by \`stateScore.getCardScore(...card)\` and sorts actual card identities. The preceding [source-prompt cardinality audit](../aichi-2026/rank11-night-watch-resolution-audit.md) already established the attack correctly moves two cards whenever the opponent has at least two; the issue investigated here is **which** two are selected.

The published generic source code does not implement a uniform random choice. A scored adversarial selection could improve a weak bot's otherwise losing line by targeting hidden opponent cards, or change later drawn/Prized lines. Any source-result relying on the uncorrected resolver is unsuitable as card-text-fidelity-qualified evidence without a separate demonstration that the selections were random.

## Opt-in research-side correction

Implemented [night-watch-uniform-hand-hook.cjs](../../simulation/twinleaf/night-watch-uniform-hand-hook.cjs) using the existing [identity-blind sampler](../../simulation/twinleaf/night-watch-opaque-card-sampler.cjs).

1. Wrap only the pinned Trevenant & Dusknoir-GX's \`reduceEffect\`, and only while \`WAS_ATTACK_USED(effect,0,this)\` confirms its first attack.
2. For the exact \`CHOOSE_CARD_TO_DISCARD\` prompt whose \`cards\` object is the opponent's hand and whose options request the available one or two secret cards, sample distinct **array positions**, without examining card properties. The sample occurs at attack-effect creation time using \`Math.random\`. The headless runner's live source game RNG is active then, whereas separate per-seat policy RNG operates during bot decisions.
3. Retain the exact prompt-to-sampled-card association in a \`WeakMap\`. On that prompt, the bot's \`resolvePrompt\` submits the already sampled selection. All other prompts use their original resolvers, including legitimately intentional hidden-card choices. Verify \`prompt.validate\` and count failures.
4. Restore the exact original card and bot prototype descriptors after the experiment. Restore transient \`store.prompt\` and do not edit \`vendor/twinleaf\`.

Under an ideal uniform \`Math.random\`, the partial Fisher-Yates choice gives each unordered subset of \`k\` cards from \`n\` a probability of \`1 / C(n,k)\`. For a five-card opponent hand and two selected cards, any pair has probability \`1/10\`. Real deterministic replay uses the existing seeded xorshift PRNG, whose period/statistical quality is a distinct consideration; the algorithm does not read identities.

[Source-dealt paired regression](../../simulation/twinleaf/rank11-night-watch-random-paired.cjs) runs the unchanged source rank11 and unchanged reference rank1 decks, original seed \`2809154458\`, policy settings and 160-action cap, with the original resolver and opt-in corrected resolver. The [read-only Store action observer](../../simulation/twinleaf/rank11-night-watch-effect-journal.cjs) records actual root prompt cardinality and, on the newer head, opaque **pre-selection hand positions** only, never hidden card names. Hook-level counters may include speculative Store prompts and are therefore kept separate from real-root evidence.

## Compiled qualification results

[Manual-only GitHub Actions run 39139484570](https://github.com/FlareZ123/experiment-01/actions/runs/39139484570) was **green** at head \`b1ff40b9692b06fb3f8e73b104e47fb248cb157d\`, pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. It ran the existing prompt-cardinality replay, compiled the native simulator, and executed both source-dealt policy arms.

| Property | Original | Opt-in uniform selection |
| --- | --- | --- |
| Opponent source | Aichi rank 11 | Unchanged rank 11 |
| Candidate source | Aichi rank 1 | Unchanged rank 1 |
| Seed / true first seat | \`2809154458\` / seat 1 | Same |
| Source first-turn lock witness | Completed | Completed |
| Night Watch attack declarations | 3 | 3 |
| Uniform-prompt bot resolutions | Not enabled | 3 |
| Invalid sampled prompt selections | Not applicable | 0 |
| Headless game finished | Yes | Yes |
| Engine winner | Physical seat 1 | Physical seat 1 |
| Independently qualified competitive games | 0 | 0 |

The first compiled comparison shows the repaired resolver **executes three legal precommitted random selections**, preserving the earlier conditioned game's winner. The matching winner on one seed is not proof of unchanged outcomes across seeds, and both games are unqualified for paper competitive inference.

[Manual follow-up CI 39139708362](https://github.com/FlareZ123/experiment-01/actions/runs/39139708362) also **passed** at code head `0a3a0f13d1f4f29ef33b969967a102ad9caf5f28`. Artifact [12140918513](https://github.com/FlareZ123/experiment-01/actions/runs/39139708362/artifacts/12140918513) includes the paired JSON on the extended read-only journal. A new pure test verifies that source-root opaque pre-dispatch selection positions `[1,3]` are recorded for a mock four-card hand while no card face is included. The compiled game passed the same three corrected prompt resolutions. This is evidence that anonymized root position instrumentation operates, not a multi-seed test of the hand-sampling distribution.

## Next falsification gates

- Prove the real-root position journal shows legal, distinct, in-range indices from exactly the respective pre-dispatch opponent hands. Keep the randomized correction opt-in until broader effects are audited.
- Run prospectively registered independent seeds under both actual starting orders, retaining no-opportunity and failed games. In particular compare whether the choice differences change attack sequencing, hand/deck contents, opponent responses, and terminals. Do not select seeds based on corrected outcomes.
- Review source-rank11 and candidate policy competence, third-party paper mechanics, timing and all 32 actual opponent lists. The current rank11 single-seed win has a conditioned source lock and does not contribute to a reliable win rate.

**Overall project state remains 29/32 exact source lists, zero independently qualified competitive games, and no established 99.5% fixed-deck win rate.**
