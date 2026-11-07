# Agent21: root93 Secret Box → Fog Crystal search completeness under an explicit K0 hypothesis

**7 November 2026, 06:14 UTC | independently calculated sensitivity model; zero new native games and zero competitive-qualified games.**

## The decision that needs a source-safe information state

Agent43's real Store retrospective root93 branch is a genuine physical `Secret Box TWM` → `Fog Crystal CRE` → Basic Psychic → one-Energy `Unown AOR Hidden Power` KO of the original rank11 powered `Trubbish FST` ([CI 42343872812](https://github.com/FlareZ123/experiment-01/actions/runs/42343872812), [paired CI 42344896833](https://github.com/FlareZ123/experiment-01/actions/runs/42344896833)). That **actual known deal** did contain the required targets. Its success is a staged historical decision witness, not a prospective fixed-60 win-rate result.

The owner deck is the frozen 60 in `results/als/new-moon-lockbreak-english-proxy-60.json` (blob `d9777831271bec8c4ac400d0a2d9f49cc03c630b`): **3 Basic Psychic Energy**, **3 Telepathic Psychic Energy**, and **4 Fog Crystal**. The verified archived owner root93 had a 35-card deck, six Prizes, ten held cards, five cards/Pokémon in play, and four discard cards; two Basic Psychic were previously attached and discarded through a KO, and one Fog Crystal was played. Neither category was in the root93 owner hand. Under the stated source-zone accounting, the remaining *one* Basic Psychic and *three* Fog Crystal copies belong to the **41 owner deck/Prize positions**. The other three unaccounted Energy are Telepathic **Special Energy**. Fog Crystal [CRE 140](https://limitlesstcg.com/cards/en/cre/140) is printed with the broader wording “Psychic Energy card” rather than “Basic Psychic Energy”; this wording alone can cause confusion. The [official Telepathic Psychic Energy print](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/me03/88) provides Psychic Energy **only while attached** to a Pokémon. In the unresolved **deck/Prize** zone it is a Special Energy card whose conditional attached-state type effect is inactive; it cannot substitute for an owner-deck Psychic Energy card. This matches [the Pokémon special-Energy rules overview](https://bulbapedia.bulbagarden.net/wiki/Special_Energy) and the bundled Advanced Player's Rulebook distinction between Basic/Special Energy, and is consistent with the successful native Fog owner prompt having precisely one selectable Basic Psychic. Some low-quality web FAQs incorrectly extrapolate attached Special-Energy types into the deck: no such assertion is used here. A direct official Fog-versus-Telepathic Q&A was not found in this invocation, so the paper-specific eligibility should be kept as an explicit condition for native/ruling validation.

## Exact conditional numbers

**Explicit mathematical hypothesis:** allocate the four unresolved distinct target cards uniformly without replacement among the 35 owner deck slots and six face-down Prize slots, conditional on the stated known zones. This is a **counterfactual K0 exchangeability assumption**, not the physical deal's measured or justified posterior. Earlier owner deck searches, deliberate draw/search choices, recovery, or legitimate K1 knowledge can make this assumption false.

For `k` remaining copies of a target among 41 unresolved positions, the probability that every copy is Prized is `C(6,k)/C(41,k)`. The relevant exact results are:

| Hypothetical target event | Exact fraction | Percentage |
| --- | ---: | ---: |
| The only remaining Basic Psychic is **Prized**, so Fog cannot find it | `6/41` | **14.6341463%** |
| All three remaining Fog Crystal are Prized, so Secret Box cannot find Fog | `1/533` | **0.1876173%** |
| Both categories are entirely Prized | `3/20254` | **0.0148119%** |
| **At least one of each category is in deck** | `17255/20254` | **85.1930483%** |

The last row follows from inclusion-exclusion:
`1 - C(6,1)/C(41,1) - C(6,3)/C(41,3) + C(6,4)/C(41,4)`.

This distinguishes **the one Basic Psychic that Fog Crystal can search** from the four remaining Energy cards that may be relevant to a different Lillie's Determination draw calculation. Even a mathematically high nominal access probability cannot certify the native line's cost, absence of Item lock, attack damage, tactical opportunity cost, or opponent counterplay.

## Why it matters for the common playing policy

The current `simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs` decides to commit Secret Box using only the currently acting player's hand and public board. It has no prepayment information-state check for its necessary deck targets. After making a **real three-card payment**, the Box search handler uses `assert.ok(fog)`; after it obtains Fog, the second search handler uses `assert.ok(basic)`. In a lawful source game with no eligible deck target, such a nonempty search assertion would abort the *research game*. The Advanced Player's Rulebook H allows searching for zero cards when the search is restricted by card type. This is now a **reproduced exception from the actual hook source under a controlled owner-only Store test double**, while remaining **unverified in a genuine pinned Twinleaf search prompt**. It was not observed in the successful historical root93 deal.

A policy should distinguish:

1. **K1-certified target** from a prior authorized *owner-deck search*. The repository already has `owner-k1-prize-knowledge.cjs` and `actor-k1-search-plan-veto.cjs`. K1 is meaningful only while the snapshot is current and bound to the actual owner seat.
2. **K0 uncertain target**. A generic owner-only algorithm cannot inspect face-down Prize identities or an unprompted deck to guarantee success. It must compare the expected card-discard/payment regret against other actions.
3. **Native search whiff after commitment**. Select an actually validator-legal zero result when permitted, record the paid-but-unfunded line, and continue under the normal acting-owner policy. This must be tested against real native prompts, not silently assumed.

Agent43 received [a targeted handoff](../../communications/agent43/20261107T0609Z_agent21_box_fog_search_whiff_failclosed.md) asking for negative owner-deck search fixtures, native handler recovery and an unaffected positive control. The one available retrospective root93 branch must not be relabeled as prospective or as independent evidence of a 99.5% game win rate.

## Reproduction, tests and limitations

- Exact bounded CommonJS model: [`simulation/evaluation/agent21-root93-k0-two-target-availability.cjs`](../../simulation/evaluation/agent21-root93-k0-two-target-availability.cjs). It reads **counts only**, never actual native deck or Prize cards. Uniformity must be explicitly supplied by the research interpretation.
- Seven [regression cases](../../tests/agent21-root93-k0-two-target-availability.test.cjs) verify the frozen 60 composition, four exact root93 fractions, zero-Prize and zero-deck boundaries, a mutually exclusive target-placement counterexample, independent exhaustive ordered-position arithmetic and invalid-input vetoes. Executed **7/7 pass** in a lightweight V8 CommonJS/test shim over the exact GitHub source/test/manifest blobs; **native Node's `node:test` process and pinned Twinleaf engine were not executed** in this invocation.
- [Two isolated owner-only Store test-double fixtures](../../tests/agent21-agent43-box-search-whiff-double.test.cjs) run the **actual committed Agent43 hook source** under fake action/prompt classes and a detached acting-owner observation. In one case the owner deck contains zero Fog Crystal after authentic-looking Box payment; in the other the deck contains Fog but no Basic Psychic. Both cases reach and throw the respective current `assert.ok` **after three distinct physical fake payment objects have moved to discard**. Both passed in a lightweight V8 CommonJS shim using the exact GitHub source blobs. They are software control-flow regressions and **do not certify genuine native Store prompt rules** or game outcomes.
- This report preserves the root93 actual-match evidence separately. The true remaining owner Basic Psychic was in deck in the historical successful treatment. The 14.634% is **not** a claim about that fixed seed, a causal win percentage or a learned policy value.
- Authenticated Top32 inventories remain **29/32**; ranks 23, 25, and 28 are outstanding. **No competitively qualified games** and no fixed 60 with demonstrated 99.5% exist.

**Next falsifiable test:** native negative owner-deck search where held three-card payment is real but the Basic Psychic target is exhausted; observe whether fallback preserves game continuity and the original action/physical custody denominator. Then run new pre-registered untouched original-60 two-seat games with a source-independent payoff policy, preserving all whiffs and competent opponent replies.

## Subsequent shared-wrapper fix observed, 7 Nov 2026 06:56 UTC

The defect described above applies to the **earlier registered Agent43 wrapper version inspected and source-tested in this invocation**, not to the most recently updated shared file. A later repository refresh found `simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs` at SHA `0fe2f9badf12671d3484b85f2372a410b957957b`, with `VERSION='agent43-owner-visible-secretbox-one-energy-knockout-v4-native-zero-search-fallback'`. Its new `choosePhysicalOwnerSearchOrWhiff(prompt,owner,eligible)` explicitly returns `{cards:[],whiff:true}` when no desired physical target is found and native `prompt.validate([])===true`, records `nativeSearchZeroSelections`, and deletes the owner plan after a paid-but-unfunded search. It also preflights a fixed original owner-60 resource upper bound before playing Box without inspecting unrevealed Prize cards. These changes resolve the **specific hard-assert source-code failure mode** our earlier fixtures identified on inspection. The newly patched **wrapper has not been executed through the same end-to-end natural source game by Agent21**, so keep native staged zero-selection evidence separate from wrapper prospective reliability. Original historical failure analysis remains preserved for reproducibility and explains why the remediation was necessary.
