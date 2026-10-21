# Owner-only charged-Bench promotion: a null native policy comparison

**Agent 1 | 21 October 2026 UTC.** Evidence class: four same-deal original-Store, retrospectively selected source-first development trials, full source/candidate continuation under frozen published source 60s and the two existing fixed candidate lists. Zero competitively qualified games.

## Hypothesis and intervention

The canonical `agent8-actor-only-choose-pokemon.cjs` resolves a single-Pokémon native prompt by choosing the first legal target. That can be strategically poor when a player is switching from an uncharged Active Pokémon into a Bench with a ready attacker. The new pure `chooseChargedOwnPromotion(input)` in `simulation/twinleaf/agent1-charged-promotion-choice.cjs` reads only the acting player's detached public Bench targets offered by the actual native prompt. If **every** offered target is the owner's Bench, it selects the target with the most attached **Energy cards**, retaining the first eligible on ties. Mixed/opponent/Active menus and unsupported counts retain the first-eligible baseline. Native `ChoosePokemonPrompt` validation remains final authority.

This is intentionally an incomplete proxy for real attack readiness. It does not evaluate Energy type, multi-unit Special Energy, payable attacks, lock interactions, damage, Prize exposure, switch modality, or the opportunity cost of switching. It also does not create an available Float Stone, Guzma, Escape Rope or retreat action where the ordinary root policy lacks one.

The opt-in canonical v2 runner flag `actorChargedPromotion` requires both `actorOnlyComposition` and `actorChoosePokemon`. The paired script `scripts/agent1-charged-promotion-native-pair.cjs` ran the exact same original runner twice with `actorChargedPromotion:false/true`; both runs used `sourceFirstRetrospective:true`, `paperSupporterQuota:true`, both-seat actor-only prompt composition and the unchanged common candidate setup policy. The printed source/candidate 60s, source-first registration, root cap 260 and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` stayed fixed. No seed, matchup or hand is examined by the selector.

The verification was manually dispatched using the existing `.github/workflows/aichi-source-locked-campaign.yml` at checkout `927b4a551d767770ed3ce6e0592738113e448793`, Node 20.19.0, [run 39683418107](https://github.com/FlareZ123/experiment-01/actions/runs/39683418107). The native simulator compiled; the selector, original native ChoosePokemon and canonical runner pure tests passed; native baseline/treatment execution, summary and artifact-upload steps passed. Full paired result ZIP artifact **12384364121**, GitHub-reported digest `sha256:4cf804cb45ff6aae70aa29cd77a017bf49e3e66feeb6f7f19c9b9efb6748f16e`.

## Native results

The paired CLI independently verified **all four first-source-deal SHA-256 fingerprints equal** and **all four actual first-player seats equal** between control and treatment. In each row, the entire genuine Store root ledger was byte-for-byte equal as JSON; there were **zero changed root actions**.

| Registered source rank / candidate | Control and treatment roots | Native terminal or cap | Prizes remaining (source, candidate) |
| --- | ---: | --- | --- |
| Rank 6 Iron Thorns / champion reference | 54 / 54 | candidate native winner both | [6,4] / [6,4] |
| Rank 6 Iron Thorns / New Moon | 260 / 260 | **censored at 260 actions** both | [6,4] / [6,4] |
| Rank 11 Absol/Garbodor / champion reference | 89 / 89 | candidate native winner both | [6,1] / [6,1] |
| Rank 11 Absol/Garbodor / New Moon | 225 / 225 | source native winner both | [0,6] / [0,6] |

These are **four historical physical source deals**, each compared under two policies. There are eight native executions and no prospective random field sample. Exact root identity establishes that the selector did not alter any action in this frozen panel. It does **not** prove that own-Bench promotion opportunities are absent elsewhere, that the printed attack is payable, or that a stronger source policy would have the same result. In particular, the well-known rank-11 T6 Escape Rope branch was a different experimental policy treatment, and this native pair does not execute that Rope fork.

The **overall workflow conclusion was failure for an unrelated unconditional pilot-trial step**: it attempted to parse the new `trial_ids=agent1-charged-promotion-pair` string as a source-locked pilot ID and threw `Unknown, repeated or absent scheduled trial ID.` The dedicated paired native test/execution/archive steps all passed before that later failure. This avoids mistaking green component checks for a green entire workflow.

An earlier canonical opt-in CI run [39682764751](https://github.com/FlareZ123/experiment-01/actions/runs/39682764751) compiled successfully but failed in a stale isolated `agent41-bilateral-mandatory-option-wiring.test.cjs` module-resolution fixture, with 11 `MODULE_NOT_FOUND` tests. A focused path-resolution repair was committed separately as `11b01ca0de042932856b834044bf8afac4f7c4b1`; that edit was subsequent to the paired run and is not represented by its checkout.

## Archive-only follow-up: real prompt and owner-held card observability

Independent manual [archive-only CI 39684685027](https://github.com/FlareZ123/experiment-01/actions/runs/39684685027) at `260fd8fc29c84e69e29ca62b22ee4a850dacdaaf` downloaded the existing 39683418107 source artifact, ran 51 existing bilateral attestation tests and 2 new pure archive-audit tests, and **completed successfully without rebuilding Twinleaf or replaying a game**. The new `scripts/agent1-charged-promotion-archive-audit.cjs` counted post-choice native prompt selections and source-only held mobility on each unchanged control row.

| Source rank / candidate | Native ChoosePokemon decisions (baseline / treatment) | Source Pass roots | Source Passes holding one of Float Stone, Guzma, Escape Rope |
| --- | ---: | ---: | ---: |
| 6 / champion | 0 / 0 | 5 | 2 |
| 6 / New Moon | 1 / 1 | 32 | 29 |
| 11 / champion | 2 / 2 | 8 | 4 |
| 11 / New Moon | 2 / 2 | 8 | 4 |

Each row had the same genuine root history in both variants. Source-owned post-Pass observational hands exist for every row, but **there were zero source Passes with an untooled Active Garbodor** in these four *no-Rope* controls. Thus the held-mobility counts are useful generic source-policy deficiency indicators, while they cannot answer whether the **different**, original rank-11 Rope treatment had a legal T7 escape. The new pure tests validate the aggregation and source-trial attribution. Held printing alone does not prove legal play or best choice.

## Decision and next executable requirement

Keep the selector **opt-in**. The present authentic comparison contains no demonstrated improvement, and new paper-strength claims would be unjustified. The next meaningful policy test requires an actor-held, legally executable source recovery move at the actual same-deal T7 root after New Moon's T6 Rope, followed by native Store validation of the chosen target and a subsequent opposing candidate turn. Agent 17 owns a source-only post-Pass hand/mobility observer in the canonical runner; that observer can distinguish an unreachable printed recovery card from a held but ignored legal option. This generic Bench selection can be tested only after such a true source-owner mobility root exists.

Current global evidence status remains 29 of 32 exact Top 32 source 60s, ranks 23/25/28 unavailable, zero competitively qualified games, no validated fixed 60, and no demonstrated 99.5% win rate.
