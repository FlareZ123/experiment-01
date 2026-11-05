# Owner-visible Confirm and Prize prompt rescue on identical original 8 Store cases

**Agent3 | 5 November 2026, ~03:12 UTC | native real-Store A/B/A mechanism experiment.** The selected shared experimental policy previously failed to decode `ConfirmPrompt` after placing the exact original rank-11 `Tapu Lele-GX`. The purpose here is narrower than game strength: test whether *already independently tested, owner-information-limited* handlers can resolve those prompts and preserve native action continuity without introducing a paper-qualification claim.

## Registered design and native execution

Use the original pre-registered v11 eight trial IDs unchanged (original ranks **6 and 11**, physical both-seats and two candidate IDs, original printed 60-card inventories). For each trial, execute three **protected-opening** Store campaigns:

1. A: Original selected symmetric three-attack, protected opening, original prompt gap.
2. B: Identical setup, resources, printed attacks and Night Watch randomness plus existing `withOwnerModalAcknowledgements` and `withOwnerFirstPrizeReveal` on both physical seats. The former acknowledges already visible `ShowCardsPrompt`, declines optional `ConfirmPrompt`. The latter chooses the first occupied visible ordinary own Knock Out Prize slot, if native validation permits it.
3. A repeated: the original unmodified protected-opening policy.

A/B/A was built from the same v8 owner-prechoice native witness and the same per-Store derived private Night Watch entropy root, with no deck modifications. This was an **outcome-aware retrospective replay of eight known cases**. It does not estimate frequency in unseen game states.

Three successful native opt-in manual CI runs corroborate the outcome. The **final strict comparator** is [GitHub Actions 41959558815](https://github.com/FlareZ123/experiment-01/actions/runs/41959558815), running repository commit `a72afc9a51c78e32be18407de1cabdb9368a65fc`, pinned native Twinleaf. The runner compiled, passed **seven pure custody/negative regression tests** and completed its three real Store campaigns. Native artifact [13384646912](https://github.com/FlareZ123/experiment-01/actions/runs/41959558815/artifacts/13384646912), independently downloaded/rehash-verified:

- ZIP **2,851 bytes**, SHA256 `f49b3f62caaf1483b8f1810a075b5abe8be3123aa22016b235e9c20843671602`.
- Inner JSON `issue25-v13-protected-modal-prize-aba.json` **21,580 bytes**, SHA256 `3b0d0fdcdf3378cae781d5d52b77ce9bad8b6d2683d04c906e82ffd9859d46c0`, matching writer sidecar.
- Frozen original registration SHA256 `b457a0825d687acfcd22c923250a906ccc11c6d72e4f0903a33797154b3c2759`; executing v13 source SHA256 `0fc4105bb8e2be19455eadad0803e636620ebe1c015d58e0bc80edda19e3f138`, test SHA256 `7c1d60aaca80e77077d454179e73564c86a5c92948744dfe0031411a7710342f`.

## Actual A/B/A custody and native results

The strict independent comparator observed:

- **32/32** owner pre-choice HMAC matches (two comparisons per 16 owner contexts), **32/32** full native run request HMAC matches and **32/32** native first-player matches.
- All three campaigns shared one authentic private-fingerprint session, actual native research and pinned engine commit, and the same hidden Night Watch seed commitment. The 24 returned registered Store attempts have the exact eight registered trial IDs per campaign.
- **8/8** repeated unmodified A campaigns had equal complete public action-ledger hashes and status; **8/8** original source physical-deal digests agreed across **all three** cohorts. Missing source digests or ledger hashes, wrong physical 60 counts, and mismatched first-player seats now fail or quarantine in pure regression tests.
- The B adapter submitted and **natively accepted/settled all 7** owner-modal responses, exactly **2 `ConfirmPrompt` false** and **5 informational `ShowCardsPrompt` true**. Physical seats 0/1: 5/2 responses. It submitted **1 ordinary own Prize choice**, validated by the actual native Prize prompt and selected one slot without reading any Prize face. These are real Store actions, not hypothetical paths.

| Original registered trial | Original protected A | With owner modal + Prize B | First newly accepted Store action |
| --- | --- | --- | --- |
| `11:103:B:champion-reference` | `engine-error` (`bot-decoder`, `ConfirmPrompt`, ordinal 11) | **returned-unqualified**, 48-root cap rather than decoder error | `ResolvePromptAction ConfirmPrompt`, root ordinal **11** |
| `11:103:B:new-moon-lockbreaker-v1` | `engine-error` (`bot-decoder`, `ConfirmPrompt`, ordinal 17) | **returned-unqualified**, 48-root cap | `ResolvePromptAction ConfirmPrompt`, root ordinal **17** |
| `11:102:A:champion-reference` | `engine-error` (`bot-decoder`, `ChoosePrizePrompt`, ordinal 25) | **engine-error** (`bot-decoder`, **`ChoosePokemonPrompt`**, ordinal **26**) | `ResolvePromptAction ChoosePrizePrompt`, root ordinal **25** |

The five other trial IDs remained `returned-unqualified` with identical public root ledgers in A and B. **No wins, losses or stronger deck decisions can be inferred** from the change to capped status.

The natural public action context for the Prize failure was `AttackAction Eon Blade` ordinal23 and subsequent `WaitPrompt` ordinal24. The owner-first-Prize adapter legitimately consumes the next prompt; a further mandatory/optional Pokémon choice then fails at ordinal26. This is **policy execution coverage progress** and a concrete next action, not proof that the next action's selected Pokémon would be strategically good.

## Card text, strategy and safety limitations

The supplied card database's `sm2-60` Tapu Lele-GX Wonder Tag specifies an **optional** search for one Supporter after playing the Basic from hand onto the Bench. The existing modal baseline responds `false`. That is within the optionality of the printed Ability, but forfeits the Supporter search; no opponent-response tactical or setup benefit is established. Any better policy choosing `true` must implement the ensuing owner-legal search and Supporter contention and should test native ability-lock states.

The Prize adapter's first-occupied selection uses slot **occupancy** and genuine native validator, and deliberately leaves hidden Prize faces unread. It has no K1 inferred-Prize-value optimization. It covers only one ordinary own KO Prize prompt; other forced Prize situations remain unhandled.

No input evidence here proves complete owner-information noninterference, exact paper effect/payment parity for the full field, competent Supporter use, winner determination under tournament clock, or reliable game win rates. All **24** native Store attempts are **development only**, with **0 competitively qualified games**. The complete Aichi field remains **29/32** authenticated original 60s, no nominated fixed deck or demonstrated 99.5%.

## Reproducibility and next tests

The entire code and negative tests are in `simulation/evaluation/agent3-issue25-v13-protected-prompt-aba.cjs`, `tests/agent3-issue25-v13-protected-prompt-aba.test.cjs` and `tests/agent3-issue25-v13-protected-prompt-aba.native.test.cjs`, selected through manual-only opt-in `issue25_v13_only` of existing `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`. No frozen v11/v12 source or registration changed. This builds on [v12 native first-card error isolation](agent3-issue25-v12-tapulele-confirm-and-prize-botdecoder-native-20261105.md).

The immediate next controlled experiment is another **A/B/A** with the v13 Modal+Prize stack fixed in all arms and only the existing owner-visible, native-validated `ChoosePokemonPrompt` selector added in B. That selector's first-eligible menu choice must be reported with the owner physical seat, offered options and actual native acceptance, and must not be relabeled strategically competent promotion. Follow the resulting prompt/turn chain before changing any decklist or certifying a game.
