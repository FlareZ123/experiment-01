# Native owner-visible Pokémon-choice continuation after modal and Prize rescue

**Agent3 | 5 November 2026 ~03:15 UTC | strict same-original-Store A/B/A follow-up.** This is the next isolated **one decision-class** experiment after [the v13 Confirm/Prize native result](agent3-v13-protected-owner-modal-prize-aba-native-20261105.md). The exact full-60 source and candidate list, opened physical cards, first-player sequence, shared private Night Watch seed, protected opening, two-seat resource policy, printed ATTACK handlers, modal acknowledgements and own Prize selector are held fixed. Treatment adds one existing owner-observation-based native-validated single-`ChoosePokemonPrompt` adapter, which chooses the first offered eligible Pokémon. It does not assert that first eligible is strategically best.

## Evidence and reproducibility

The manually dispatched opt-in native [CI run 41959942788](https://github.com/FlareZ123/experiment-01/actions/runs/41959942788) completed **SUCCESS** at exact GitHub commit `948daca997284a12c7076a8a2b8e3c9f9e7ca46a`. The pinned Twinleaf compiled; all three new pure deterministic provenance/wrapper tests passed; then **24** real Store trials completed (A/B/A, eight registered original IDs each). All other CI jobs were skipped.

[Artifact 13384512904](https://github.com/FlareZ123/experiment-01/actions/runs/41959942788/artifacts/13384512904) independently downloaded and SHA256-verified:

- ZIP **2,986 bytes**, SHA256 `32c09401f191e180daf90d4f300024a2de3c317c6f5fcb30e8689c33648dffd2`.
- `issue25-v14-owner-pokemon-aba.json` **21,083 bytes**, SHA256 `96f4cda1c6748ffb3bfa24c9b3af5f30e943f5c8c4d02d1dc9543dcb3735949a`, equal to writer SHA sidecar.
- Original v11 registered IDs SHA256 `b457a0825d687acfcd22c923250a906ccc11c6d72e4f0903a33797154b3c2759`, actual executing module SHA256 `01eb016d1c8c08deda59c741e0d9022de9629169c1958938180a46ea7cbf7ca0`, native test SHA256 `99115f74e64c34354c917a33afa4ce3ea7ec9628e6f31b533a44fc97276a7b7f`.

The independently negative-tested v13 A/B/A comparator was reused without rewriting its custody checks; the v14 source explicitly converts the old internal B-label `promptBaseline` to `withOwnerPokemon`. All 8 original IDs have full public-root custody. **32/32 prechoice owner HMAC**, **32/32 exact native request HMAC**, **32/32 first-player comparisons**, **8/8 repeated A public-root and native status equality**, and **8/8 all-three physical source-deal digest parity**. `baselineReplayVerdict=PASS-bounded-protected-opening-A-A-control`.

## Isolated result and exact legal menu

With the v13 Modal + own Prize policy held constant, the sole differing original rank11 native context was:

| Original original trial | A control: modal+Prize | B: same plus actor-only Pokémon choice | First newly accepted public action |
| --- | --- | --- | --- |
| `11:102:A:champion-reference` | `engine-error` at `bot-decoder ChoosePokemonPrompt` native ordinal **26** | **returned-unqualified**, no native decoder failure under the 48-root experimental limit | `ResolvePromptAction ChoosePokemonPrompt`, native ordinal **26**, **physical seat 1**, global turn **5** |

The B policy's actual live Store offered **two** legally eligible Pokémon, and the existing `withActorOnlyChoosePokemon` owner-observation adapter selected **option index 0**, printing **`Mega Absol ex M1L`**. The prompt perspective was verified to equal the answering owner. Exactly **one** owner Pokémon choice was selected, **one accepted** by the native Store, and **one native postcondition verified**. The selection was made from the already visible Pokémon/board menu and native `validate`; the owner-only policy received no opponent concealed hand/deck/Prize faces.

The v13 modal/Prize handlers continued to provide **7/7 accepted and settled** owner modal actions (2 optional Confirm false, 5 ShowCards true) and **1** accepted owner KO Prize selection. Six prior unaffected trials and two previously repaired Tapu Lele-GX trials had identical A and B public root histories and statuses. All **eight** B rows now return `returned-unqualified`; the one previously failing A row moved forward rather than silently disappearing.

**Tactical uncertainty is material:** First offered `Mega Absol ex` may or may not be the strongest promotion with two legal options. Selection changes the subsequent attack and Prize trajectory. This experiment established only a legal executed native prompt response, and no test of a rational opponent strategy, alternative chosen target, paid effects, paper matchup, full-game clock or qualified win exists. Do not label this a game won.

## Integration significance

The three consecutive witnessed native decision gates in the same previously erroring original line are now independently shown:

`Eon Blade` accepted Attack root 23 → public Wait root 24 → **own Prize** root 25 (v13) → **owner Bench Pokémon selection** root 26 (v14).

In two other original rank11 contexts the separate chain `Tapu Lele-GX` accepted PlayCard → **optional Wonder Tag confirm** now resolves via an intentionally conservative `false` choice.

These are opt-in **development** wrappers in `simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs`, using unchanged `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs`, with regression and real native tests `tests/agent3-issue25-v14-owner-pokemon-aba.{test,native.test}.cjs`. Manual workflow flag `issue25_v14_only`; no production-selected shared policy modification and no push-triggered CI added.

Full-field caveat unchanged: **29/32 original 60-card inventories authenticated**, missing ranks 23/25/28, **zero competitively qualified paper matches**, **no selected final fixed 60**, no credible 99.5% claim. The immediate research priority is handling beneficial optional Ability search and tactical promotion choice instead of using these simple native fallback baselines as opponents in strength estimates.
