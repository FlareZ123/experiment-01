# v8 Special Energy profile: narrow direct coverage is 38/118 original copies

**Agent33 | 6 November 2026 | Static field audit with existing native evidence.** This report compares the narrow Special Energy unit helper selected by the current v8 wrapper with the existing general owner-public flexible Energy model. It does not change the frozen v8/v9 experiments, nominate a final deck, or establish competitive win rate.

## Decision summary

The authenticated original field contains **118 Special Energy copies across 14 exact name/set printings**. The current v8 runner selects `bilateralSpecialEnergyRoot:true`. That option routes through the narrow `agent3-special-energy-frontier.specialEnergyUnits` helper. Exact original source name/set strings give it unit coverage for **38/118 copies (32.2%)**. If the known Telepathic Psychic Energy POR to Telepath [P] Energy M3 engine alias is explicitly applied, the count becomes **44/118 (37.3%)**.

The existing `actor-energy-payability.energyUnits` model represents **118/118 copies under per-printing compatible hypothetical public contexts**. The favorable pass uses a Dragon recipient for Double Dragon, a Basic Pokémon for Prism, a behind-on-Prizes non-GX/EX recipient for Counter, and a behind-on-Prizes Evolution without a Rule Box for Reversal. It does not combine mutually incompatible Basic and Evolution states into one fictional Pokémon. Under a conservative context with recipient and Prize facts unresolved, the model returns units for 72/118 copies and fails closed for 46 copies: 8 Counter Energy and 38 Double Dragon Energy.

The seven authenticated original lists with zero Basic Energy contain **56 Special Energy copies**. The narrow exact-name helper recognizes 30/56; the general model represents 56/56 under favorable context. This is a material source-policy coverage gap for ranks 4, 5, 6, 7, 17, 24 and 29.

**Interpretation:** this is a model-recognition audit. It does not show that a legal recipient exists in a particular game, that an attachment is strategically correct, that every card-specific effect is implemented, or that a native Store action is paper-legal.

## Reproducible inventory

Source: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The file authenticates 29 complete 60-card lists. Ranks 23, 25 and 28 remain absent. The 29 lists contain 238 Energy copies across 21 name/set printings, including 118 Special Energy copies across 14 printings.

| Original Special Energy printing | Copies | Source ranks | Narrow exact | Narrow with Telepath alias | General favorable |
| --- | ---: | --- | ---: | ---: | ---: |
| Capture Energy RCL | 13 | 2, 3, 6, 7, 15, 24, 29 | 13 | 13 | 13 |
| Counter Energy CIN | 8 | 4, 17 | 0 | 0 | 8 |
| Double Colorless Energy SUM | 11 | 5, 6, 15, 24, 26, 29 | 11 | 11 | 11 |
| Double Dragon Energy ROS | 38 | 10, 12, 13, 14, 18, 19, 20, 21, 27, 32 | 0 | 0 | 38 |
| Jet Energy PAL | 5 | 2, 7, 15 | 0 | 0 | 5 |
| Memory Energy LOT | 1 | 2 | 0 | 0 | 1 |
| Powerful Colorless Energy DAA | 1 | 15 | 0 | 0 | 1 |
| Prism Energy ASC | 4 | 9 | 0 | 0 | 4 |
| Recycle Energy UNM | 1 | 7 | 0 | 0 | 1 |
| Reversal Energy PAL | 8 | 4, 17 | 0 | 0 | 8 |
| Speed Lightning Energy RCL | 12 | 6, 24, 29 | 12 | 12 | 12 |
| Spiky Energy JTG | 2 | 6, 29 | 2 | 2 | 2 |
| Telepathic Psychic Energy POR | 6 | 9, 30, 31 | 0 | 6 | 6 |
| Unit Energy LPM UPR | 8 | 4, 17 | 0 | 0 | 8 |
| **Total** | **118** |  | **38** | **44** | **118** |

The narrow helper's supported native strings are Double Colorless Energy SUM, Speed Lightning Energy RCL, Capture Energy RCL, Spiky Energy JTG, and Telepath [P] Energy M3. The last is the engine alias for the original Telepathic Psychic Energy POR printing. The audit reports direct source-name coverage and the explicit alias scenario separately.

### Zero-Basic source coverage

| Rank | Archetype | Special copies | Narrow exact | General favorable |
| ---: | --- | ---: | ---: | ---: |
| 4 | Raichu Electrode Combo | 12 | 0 | 12 |
| 5 | Mew Genesect | 4 | 4 | 4 |
| 6 | Iron Thorns | 8 | 8 | 8 |
| 7 | Snorlax Stall | 4 | 2 | 4 |
| 17 | Raichu Electrode Combo | 12 | 0 | 12 |
| 24 | Iron Thorns | 8 | 8 | 8 |
| 29 | Iron Thorns | 8 | 8 | 8 |
| **Total** |  | **56** | **30** | **56** |

Ranks 4 and 17 use four each of Reversal Energy, Counter Energy and Unit Energy LPM. Rank 7 uses Capture, Recycle and Jet Energy. These are direct examples of source lists whose Special Energy composition extends beyond the narrow v8 helper.

## Policy provenance

The v8 wrapper in `simulation/evaluation/agent36-issue25-common-v8.cjs` sets `bilateralSpecialEnergyRoot:true` and does not set `bilateralPublicContextSpecialEnergy`. Blob: `da97c9338e0bde104d2568028279b6715a1bcbf6`.

The shared adapter in `simulation/evaluation/agent41-bilateral-v2-development.cjs` defines the narrow and general profiles as separate opt-ins. Both default false in the adapter signature. Its option validation explicitly prohibits enabling `bilateralPublicContextSpecialEnergy` together with `bilateralSpecialEnergyRoot`. Blob: `d5ceee6e33212bba809bcce0febe390f97d817d3`.

A successor therefore must **replace** the narrow profile with `bilateralPublicContextSpecialEnergy:true` and keep `bilateralSpecialEnergyRoot:false`. The separate `bilateralEnergyContest` option should remain independently controlled. It addresses Basic-versus-Special attachment choice competition and is not needed to make the general model available to zero-Basic lists.

The earlier [Agent23 selected-v2 manifest](../../simulation/evaluation/agent23-selected-joint-v2-manifest.json) already demonstrates the valid general profile: `bilateralSpecialEnergyRoot:false`, `bilateralPublicContextSpecialEnergy:true`, `bilateralEnergyContest:false`. Blob: `8cd0c4b0734d3223d5c8c1f705f3af651f815c02`.

Relevant implementations:

- [Narrow Special Energy unit helper](../../simulation/twinleaf/agent3-special-energy-frontier.cjs), blob `e9d6c938649c19a8dab3b4cc83131e6c1ac76c1c`.
- [General printed Energy unit model](../../simulation/twinleaf/actor-energy-payability.cjs), blob `69df43e6107352ed0c47780cc713a009ecb27215`.
- [Public-context Special Energy selector](../../simulation/twinleaf/agent17-public-context-special-energy.cjs), blob `e8dea9f341148b9dd88bb87fc50ac4761a9c1566`.
- [Agent40's default-off Jet Bench switch frontier](../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs), blob `e1dcf03dec594333214966b5a2ec8fe33b0ad265`, already reuses the general payability helper. The generic public-context selector deliberately declines a Bench Jet attachment because the mandatory switch needs a separate decision.

## Existing native evidence

Agent1's [prospective rank17 A/B study](agent1-rank17-generic-special-energy-prospective-16native-20261103.md) prospectively registered 16 real pinned Twinleaf Store arms over 8 fresh matched physical source-deal pairs. Its only policy treatment was `publicContextSpecialEnergy:true` on both seats. The treatment produced 27 accepted native Energy attachment roots: 10 Counter Energy, 9 Unit Energy LPM and 8 Reversal Energy. It also produced 48 source attacks, while every matched baseline arm produced zero Energy roots and zero attacks. All 8 physical pairs matched and all 16 arms completed without error.

The native attack distribution included 20 Motivate, 16 Hidden Power, 8 Nuzzle, 2 Red Knuckles, 1 Joust and 1 Electro Rain. Seven contexts reached native game end with the reference winning. One context hit the 180-action cap in both modes. No matched winner changed and **zero games qualified competitively**. The study establishes an action-repertoire activation effect for rank17. It does not establish optimal attachments, strong source play, deck strength, or win probability.

Agent49's [original-source Special Energy admission audit](agent49-original-source-special-energy-admission-20261103.md) independently reports that all 21 source Energy name/set printings produce modeled units under a favorable hypothetical recipient context. It also reports that Counter Energy and Double Dragon Energy remain unresolved when their recipient/Prize facts are unknown.

## Validation added

The reproducible implementation is:

- `scripts/agent33-aichi-special-energy-model-coverage.cjs`
- `tests/agent33-aichi-special-energy-model-coverage.test.cjs`
- `tests/agent33-bilateral-jet-bench-runner-contract.test.cjs` verifies the new shared Jet option defaults off, selects the scoped root, passes the existing Agent40 root flag, and records provenance.

The test asserts the exact 29/32 source denominator, 238 total Energy copies, 118 Special Energy copies, 14 Special Energy printings, direct and alias-adjusted narrow coverage, general favorable and conservative coverage, the seven zero-Basic source ranks, and the exact unit shape for each of the 14 field Special Energy families. Favorable contexts are selected per printing. The general model returns null for Counter Energy and Double Dragon Energy under the conservative unknown context.

The tests run in the existing manually dispatched `aichi-energy-census.yml` workflow. No new workflow or push-triggered CI was added. The first run exposed a test-filter bug that had included Basic Energy in the unsupported list. The filter was corrected to exclude Basic printings, then [workflow run 48 completed successfully](https://github.com/FlareZ123/experiment-01/actions/runs/42290663419). The uploaded `aichi-energy-census` artifact includes `agent33-aichi-special-energy-model-coverage.json` (artifact ID `13539916405`, ZIP SHA256 `04cb8291e4e8f573ded1ccfcd3273ad14b59fdfa6a573e72955ef64c3e8ce9cb)).

## Recommended next experiment

Create a separately registered successor to the current v8 profile. Preserve v8 and v9 registrations unchanged. Replace the narrow bilateral Special Energy root with the general bilateral public-context model, then test both seats on:

1. Rank 4 and rank 17 for Reversal, Counter and Unit Energy LPM with exact printed recipient, Stage/Rule Box and Prize-state evidence.
2. Rank 7 for Capture and Recycle Energy. The shared runner now exposes the existing Agent40 Jet root through `bilateralJetBenchSwitchRoot`, but that attack-funding root cannot propose Wobbuffet because its Psychic attack is unfunded by rank7's Colorless-only Energy. A separate Ability-lock utility root or extension must evaluate Wobbuffet's Active-only Bide Barricade payoff.
3. Ranks 5, 6, 24 and 29 as controls for DCE, Speed Lightning, Capture and Spiky coverage.
4. A Double Dragon-heavy source among ranks 10, 12, 13, 14, 18, 19, 20, 21, 27 or 32, with a verified Dragon recipient.
5. A Telepathic Psychic Energy source among ranks 9, 30 or 31, including the printed Psychic-Pokémon search effect and explicit engine-alias mapping.
6. A rank7 reciprocal Artazon/Jet/Wobbuffet acceptance line with both Hood states, source resources, forced switch, post-switch Ability/Item consequence, opponent reply and source continuation. Resolve the printing discrepancy first: the Agent40 hypothesis labels Wobbuffet PHF36, while the authenticated rank7 list names Wobbuffet XY4-36. The existing [Agent2 Muk/Wobbuffet native ruling test](../../tests/agent2-muk-wobbuffet-official.native.test.cjs) also establishes Alolan Muk as a counter to Bide Barricade. The current [Agent40 hypothesis](../als/agent40-rank7-reciprocal-artazon-jet-wobbuffet-exact-20261106.md) remains unexecuted in native play.
7. At least one mixed Basic/Special source to evaluate `bilateralEnergyContest` separately.

The general unit model does not implement several printed card effects: Capture Energy's Basic Pokémon search, Speed Lightning Energy's draw, Telepathic Psychic Energy's Psychic-Pokémon search, Jet Energy's mandatory switch, Spiky Energy's damage-counter effect, Powerful Colorless Energy's damage bonus, Memory Energy's previous-Evolution attack access, and Recycle Energy's return-to-hand effect. The current public-context selector chooses for immediate attack-cost progress and deliberately skips a Bench Jet attachment unless Temple suppresses the switch. Agent40 already has a separate bounded Jet Bench switch root in `agent34`, default-off, with a native two-seat physical-action witness. The shared `agent41-bilateral-v2-development.cjs` runner currently exposes no Jet Bench option and never passes `jetBenchSwitchRoot`; it cannot activate that existing work through the common runner. These effects need separate source-action and payoff tests.

The release gate should capture owner-visible recipient facts, the exact physical Energy card attached, paper-valid payment, a settled characteristic attack or control effect, the opponent's meaningful response, and source continuation. Native Store acceptance alone is insufficient. Preserve all registered attempts, caps and errors. Do not promote action counts into game win rates.

## Benchmark status

The collective target remains one unchanged legal paper Expanded 60-card deck against all 32 original opponents. At this checkpoint there are 29 authenticated original name/count lists, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% field win rate. This report changes the source-policy coverage map only.
