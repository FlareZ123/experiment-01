# Agent 17: bounded exact-print deck-search target screen on the frozen 32 original Store games

**1 November 2026 | native-receipt audit against the supplied full card-list ZIP | zero qualified competitive games.** This is a narrower follow-up to [the complete 4,331-prompt census](agent17-frozen-v2-prompt-denominator-20261101.md), using **actual selected card names** only inside a private local verifier and emitting category counts without selected-card identities per trial. The source archive has ranks 6/11 and unchanged candidate sixties, with 32 attempts, 19 engine terminals and 13 action caps.

## Exact archive promotional-print correction (supersedes initial 64/34 and 124/5 counts)

**Re-screened directly against both unchanged original ZIP archives after a fail-closed exact name/collector bridge:** 98 genuine deck-search selected cards comprise **66 ZIP-exact target-category matches, zero detected category mismatches and 32 unresolved Psychic Energy MEE printing instances**. The updated table below reports the post-alias results; the two `Tropical Beach BWP 50` selections there resolve to the source ZIP's unique `bwp-BW50` Stadium. The 129 actual setup selected cards comprise **127 ZIP-exact Basic Pokémon, zero detected known non-Basics and two still unresolved `Mega Absol ex M1L` instances**. The three formerly unresolved `Trevenant & Dusknoir-GX SMP` instances resolve to the archive's unique `smp-SM217` Basic. Exact aliases require complete display name and collector number; generic missing BWP, SMP or MEE printings stay unknown. No native action or outcome changed, and every complete paper-game verdict remains unverified. Original 32-arm ZIP and full-card ZIP SHA fingerprints in the next section are unchanged.

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
| Guzma & Hala CEC | 4 | 10 | 10 | 0 | 0 |
| **Total** | **95** | **98** | **66** | **0** | **32** |

The **32 remaining unresolved printing matches** are Psychic Energy MEE selections under Fog Crystal. The supplied source ZIP has no exact MEE printing IDs. Two Tropical Beach BWP 50 selections now resolve to the unique source ZIP bwp-BW50 Stadium with an exact name and collector-number bridge. The two selected-card-zero Fog/Capture populations remain in the search-prompt denominator; no card-category predicate applies to an empty selection.

**All 66 known exact target printings satisfy their parent's selected-card category predicate.** This is a partial positive screen, with zero witnessed category mismatches in the selected known subset. It is **not** 66 paper-legal prompt resolutions: a selected category can be correct while costs, number of cards, native state/zone, source search eligibility, Bench space, distinctness, effects and conditional text remain unchecked. The optional two-card \`Guzma & Hala\` discard and its Tool/Special contingent access are outside this category screen. The unrecovered prints are neither confirmed legal nor confirmed illegal.

**Distinct target checks are not independent match samples:** 98 selections are correlated within 32 real developmental games. Prompt counts and category checks cannot certify competitive player action quality or a game's winner. The 24 no-payload Get Lost events from the broader inventory are empty-discard cancellation-compatible and are not included in these nonempty deck-search target checks.

### Original source Guzma & Hala: connected modal hand-cost and search receipts

The four observed original-source \`Guzma & Hala CEC\` \`PlayCardAction\` roots in this frozen archive each have the **same parent-root identity through the entire native sequence**:

1. The exact printed Supporter was played from the source hand.
2. Its \`SelectOptionPrompt\` selected native option **1**, explicitly labelled as the optional **discard two hand cards and search for Tool + Special Energy** mode.
3. A same-parent \`ChooseCardsPrompt\` on the source hand selected **exactly two** cards, with native \`min=max=2\`.
4. A same-parent deck search selected **two cards** in two games or **three cards** in two games, with native \`min=0,max=3\`; the selected known categories include Stadium, Special Energy and Pokémon Tool, plus the ZIP-unresolved \`Tropical Beach BWP 50\` in two of the four roots.
5. A native \`ShuffleDeckPrompt\` followed, under that same initiating played-card root.

This is **4/4 explicit Store-accepted modal cost-selection and continued search/shuffle chains**, but they are drawn from only **two distinct original-source physical-deal fingerprints** paired across the two different fixed candidate 60s. The four prompts establish selection of eight hand-card instances (two per play); this archived observer does **not separately prove two distinct physical cards actually reached discard**, nor does it independently certify every deck-selected printing or the full Supporter effect. Label this \`OWNER_OPTIONAL_TWO_HAND_SELECTION_RECEIPT\`, not full \`PAPER_PROMPT_VERIFIED\`.

## Separate pregame Basic-Pokémon category screen

The same physical archive contains **71 startup \`ChooseCardsPrompt\` roots** with no initiating played-card/attack root, selecting **129 Pokémon card instances** from player opening hands before normal turns. After joining the recorded acting seat to the source seat in each trial:

| Recorded startup selection seat | Startup hand prompts | Selected-card instances | Exact-print Basic Pokémon | Known non-Basic selections | Print unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original source | 32 | 40 | 38 | 0 | 2 |
| Fixed candidate | 39 | 89 | 89 | 0 | 0 |
| **Both seats** | **71** | **129** | **127** | **0** | **2** |

The **two remaining unresolved exact printings** are both \`Mega Absol ex M1L\`. Three \`Trevenant & Dusknoir-GX SMP\` selections now resolve uniquely to source ZIP \`smp-SM217\`, with Basic subtype. The 127 known exact prints all encode **Basic** subtype; **no known non-Basic setup selections were observed**. This is category agreement for the selected initial Pokémon, not a proof of exact hand ownership, proper Active vs Bench placement, mulligan handling or five-Bench cardinality. The counts are **card instances** and can repeatedly contain the same underlying physical deck card across paired games.

**Supplementary external lookup, strictly separate from bundled ZIP:** The two unresolved Pokémon names also have independently attributable card-print evidence. [Limitless's SM Promo #217 printing](https://limitlesstcg.com/cards/en/SMP/217) identifies \`Trevenant & Dusknoir-GX SMP\` as **Basic** Pokémon. The [Japanese M1L Mega Brave set attribution](https://bulbapedia.bulbagarden.net/wiki/M1L) together with the [Mega Absol ex printing-stage record](https://bulbapedia.bulbagarden.net/wiki/Mega_Absol_ex_%28Mega_Evolution_180%29) identifies the \`Mega Absol ex M1L\` as **Basic**. Accordingly, the five ZIP-unresolved setup printings are **externally supported as Basic (three plus two)**. This does **not** transform the source-ZIP \`124 exact-print Basic / 5 missing-print\` result into a 129/129 internally verifiable result, nor confirm physical uniqueness, legal placement, or broader gameplay. It shows that no selected *name* has yet yielded a credible non-Basic counterexample.

**Critical lookup correction before publishing these counts:** the card archive has **nine duplicated PTCGO set codes**, including \`ASR\` and \`CRZ\` for main-set/illustration-gallery pairs. A naive \`{code: id}\` mapping silently overwrote one of the two sets and falsely marked genuine \`Oranguru V ASR\` and \`Radiant Eternatus CRZ\` selections as unknown. The reusable parser now indexes **all** set IDs per PTCGO code and verifies matching card-name type signatures across candidates; the synthetic tests reproduce a duplicate-code case. This correction changes the auxiliary startup known count to 124, while leaving the independent **98 search selections, 64 exact-category matches and 34 unresolvable prints unchanged**.

## Integration request and bounded next test

Route this exact-print evidence into Agent 41's single versioned pre-dispatch paper-prompt portfolio, retaining three verdicts: \`PAPER_PROMPT_VERIFIED\` only when **full** independently checked text/zone/cost/effect contract is covered, \`PAPER_PROMPT_INVALID\` for actually demonstrated forbidden replies, and \`PAPER_PROMPT_UNVERIFIED\` elsewhere. The 66 matching target categories may carry a narrower annotation \`PRINTED_TARGET_CATEGORY_MATCH\` with no release promotion. Prioritize an actual source-dealt prompt where these predicates combine with owner-payment and post-Store effects. Avoid re-running the same baseline as a newly qualified performance sample.

**Benchmark state:** 29/32 exact opponent sixties authenticated, 0 competitively qualified games, no established strongest fixed deck and no demonstrated 99.5% field performance.
