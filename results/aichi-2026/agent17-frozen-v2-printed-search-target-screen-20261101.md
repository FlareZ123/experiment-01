# Agent 17: bounded exact-print deck-search target screen on the frozen 32 original Store games

**1 November 2026 | native-receipt audit against the supplied full card-list ZIP | zero qualified competitive games.** This is a narrower follow-up to [the complete 4,331-prompt census](agent17-frozen-v2-prompt-denominator-20261101.md), using **actual selected card names** only inside a private local verifier and emitting category counts without selected-card identities per trial. The source archive has ranks 6/11 and unchanged candidate sixties, with 32 attempts, 19 engine terminals and 13 action caps.

## Immutable inputs and independent printed-card lookup

- The original [frozen v2 CI 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), [artifact 13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187), exact downloaded ZIP SHA-256 \`cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b\`.
- Supplied independent card-list ZIP SHA-256 \`c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a\`. The archive's \`sets/en.json\` maps PTCGO set codes to \`cards/en/<id>.json\` card metadata; the lookup requires exact set code and name, or an explicit displayed \`Prism Star\` to card-name \`◇\` spelling alias.
- Code: [\`scripts/agent17_frozen_prompt_printed_target_screen.py\`](../../scripts/agent17_frozen_prompt_printed_target_screen.py), [six fail-closed synthetic test scenarios](../../tests/test_agent17_frozen_prompt_printed_target_screen.py). Existing manual-only \`aichi-benchmark-stats.yml\` was extended with the new tests; no push-trigger or new workflow.
- It joins \`nativePromptChoices\` to an actual \`rootActionLedger\` \`ResolvePromptAction\`, its recorded parent \`PlayCardAction\` root, and that root's real original \`nativeAcceptedTargetSidecar.declared.ownerHandPrinting\`. Unknown/unmatched name, type ambiguity or absent set code is **\`print-unresolved\`**, never an illegal card ruling. The original six and eleven source ranks are retained, and all attempts are included.
- Source text independently checked in the same archive: **Fog Crystal CRE** searches a Basic Psychic Pokémon or Psychic Energy; **Capture Energy RCL** searches a Basic Pokémon; **Tag Call CEC** searches TAG TEAM cards; **Guzma & Hala CEC** searches a Stadium plus conditional Tool and Special Energy when the optional two-card hand discard is paid.

## Selected card targets in the actual original-Store runs

| Native played parent printing | Deck-search prompts | Selected card instances | Exact category matches | Category mismatches | Unresolved exact prints |
| --- | ---: | ---: | ---: | ---: | ---: |
| Fog Crystal CRE | 73 | 72 | 40 | 0 | 32 |
| Capture Energy RCL | 16 | 14 | 14 | 0 | 0 |
| Tag Call CEC | 2 | 2 | 2 | 0 | 0 |
| Guzma & Hala CEC | 4 | 10 | 8 | 0 | 2 |
| **Total** | **95** | **98** | **64** | **0** | **34** |

The **34 unresolved printing matches** comprise **32 Psychic Energy MEE** selected under Fog Crystal and **two Tropical Beach BWP 50** under Guzma & Hala. The supplied card ZIP does not include exact MEE or BWP set codes. Their name-level likely types are not counted as exact print verification. The two selected-card-zero Fog/Capture populations remain in the search-prompt denominator; no card-category predicate applies to an empty selection.

**All 64 known exact target printings satisfy their parent's selected-card category predicate.** This is a partial positive screen, with zero witnessed category mismatches in the selected known subset. It is **not** 64 paper-legal prompt resolutions: a selected category can be correct while costs, number of cards, native state/zone, source search eligibility, Bench space, distinctness, effects and conditional text remain unchecked. The optional two-card \`Guzma & Hala\` discard and its Tool/Special contingent access are outside this category screen. The unrecovered prints are neither confirmed legal nor confirmed illegal.

**Distinct target checks are not independent match samples:** 98 selections are correlated within 32 real developmental games. Prompt counts and category checks cannot certify competitive player action quality or a game's winner. The 24 no-payload Get Lost events from the broader inventory are empty-discard cancellation-compatible and are not included in these nonempty deck-search target checks.

## Separate pregame Basic-Pokémon category screen

The same physical archive contains **71 startup \`ChooseCardsPrompt\` roots** with no initiating played-card/attack root, selecting **129 Pokémon card instances** from player opening hands before normal turns. After joining the recorded acting seat to the source seat in each trial:

| Recorded startup selection seat | Startup hand prompts | Selected-card instances | Exact-print Basic Pokémon | Known non-Basic selections | Print unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original source | 32 | 40 | 38 | 0 | 2 |
| Fixed candidate | 39 | 89 | 86 | 0 | 3 |
| **Both seats** | **71** | **129** | **124** | **0** | **5** |

The **five unresolvable exact printings** are three \`Trevenant & Dusknoir-GX SMP\` and two \`Mega Absol ex M1L\`; both source-set codes are absent from the supplied card archive's PTCGO mapping. The 124 known exact prints all encode **Basic** subtype; **no known non-Basic setup selections were observed**. This is category agreement for the selected initial Pokémon, not a proof of exact hand ownership, proper Active vs Bench placement, mulligan handling or five-Bench cardinality. The counts are **card instances** and can repeatedly contain the same underlying physical deck card across paired games.

**Supplementary external lookup, strictly separate from bundled ZIP:** The two unresolved Pokémon names also have independently attributable card-print evidence. [Limitless's SM Promo #217 printing](https://limitlesstcg.com/cards/en/SMP/217) identifies \`Trevenant & Dusknoir-GX SMP\` as **Basic** Pokémon. The [Japanese M1L Mega Brave set attribution](https://bulbapedia.bulbagarden.net/wiki/M1L) together with the [Mega Absol ex printing-stage record](https://bulbapedia.bulbagarden.net/wiki/Mega_Absol_ex_%28Mega_Evolution_180%29) identifies the \`Mega Absol ex M1L\` as **Basic**. Accordingly, the five ZIP-unresolved setup printings are **externally supported as Basic (three plus two)**. This does **not** transform the source-ZIP \`124 exact-print Basic / 5 missing-print\` result into a 129/129 internally verifiable result, nor confirm physical uniqueness, legal placement, or broader gameplay. It shows that no selected *name* has yet yielded a credible non-Basic counterexample.

**Critical lookup correction before publishing these counts:** the card archive has **nine duplicated PTCGO set codes**, including \`ASR\` and \`CRZ\` for main-set/illustration-gallery pairs. A naive \`{code: id}\` mapping silently overwrote one of the two sets and falsely marked genuine \`Oranguru V ASR\` and \`Radiant Eternatus CRZ\` selections as unknown. The reusable parser now indexes **all** set IDs per PTCGO code and verifies matching card-name type signatures across candidates; the synthetic tests reproduce a duplicate-code case. This correction changes the auxiliary startup known count to 124, while leaving the independent **98 search selections, 64 exact-category matches and 34 unresolvable prints unchanged**.

## Integration request and bounded next test

Route this exact-print evidence into Agent 41's single versioned pre-dispatch paper-prompt portfolio, retaining three verdicts: \`PAPER_PROMPT_VERIFIED\` only when **full** independently checked text/zone/cost/effect contract is covered, \`PAPER_PROMPT_INVALID\` for actually demonstrated forbidden replies, and \`PAPER_PROMPT_UNVERIFIED\` elsewhere. The 64 matching target categories may carry a narrower annotation \`PRINTED_TARGET_CATEGORY_MATCH\` with no release promotion. Prioritize an actual source-dealt prompt where these predicates combine with owner-payment and post-Store effects. Avoid re-running the same baseline as a newly qualified performance sample.

**Benchmark state:** 29/32 exact opponent sixties authenticated, 0 competitively qualified games, no established strongest fixed deck and no demonstrated 99.5% field performance.
