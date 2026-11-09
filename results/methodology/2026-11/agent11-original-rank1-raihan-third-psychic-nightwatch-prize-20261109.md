# Source rank1 Raihan search reserves third Psychic for next-turn Night Watch

**Agent 11 | 9 November 2026 | native source-dealt counterfactual, no competitively qualified paper game.**

## Decision and tactical finding

The authentic original Aichi rank1 Shadow Rider source has a concrete two-turn resource chain which is absent from the previously sampled first-card Raihan deck search. On its detached original source turn18, Raihan EVS can search **Basic Psychic Energy MEE** from the physically remaining owner deck instead of Lillie's Clefairy ex JTG. Its first Basic Psychic is physically recovered from the source discard by Raihan; a second comes from the owner's hand attachment. These two real energies fund corrected Pale Moon-GX while Dimension Valley PHF is active. The native opponent can legally escape the queued delayed KO by free-retreating Latias ex SSP into publicly Benched Girafarig LOT and passing. On the returned source turn20, the **Raihan-searched, physically held third Psychic** can be attached to Trevenant & Dusknoir-GX SMP; Night Watch is then genuinely payable and accepted.

**Important printed-cost constraint:** Night Watch requires **three Psychic**. Dimension Valley reduces Colorless attack requirements on Psychic Pokémon by one, but Night Watch contains no Colorless symbol, so two Psychic are insufficient. Raihan's unrestricted search for the third Psychic creates the next-turn attack route. On this source-dealt branch, Night Watch's printed 150 damage Knocked Out the original opponent's 90-HP Girafarig, and one ordinary original source Prize card moved face down from its real Prize zone into its hand: **source remaining Prizes 6 → 5**.

## Reproducible native branch and strict ownership

- Original true root remains **110 accepted actions** and SHA-256 `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`; the detached alternative does not mutate that game.
- The inherited authentic source line is Dimension Valley + Energy Drive (80) from source Tapu Lele-GX; opponent Latias ex Eon Blade; real two-card opponent Prize transfer (5 → 3); source Trevenant & Dusknoir-GX promotion; genuine Raihan plus both paid Psychic attachments; Pale Moon-GX; actual opposing free Retreat and Pass.
- The experimental Raihan selection reads **only its owner's actual searched deck**; the third Psychic must physically exist. It introduces no card. The source's next hand includes that card and receives a real normal attachment after the intervening opposing turn.
- Corrected paper interpretation of Pale Moon-GX physically discards **three** Basic Psychic from opposing Active Latias ex. The uncorrected pinned handler discards **zero** under the identical two-Energy Dimension Valley condition. The source turn20 fork is intentionally run only from the corrected condition; no claim is made that Night Watch would fail after the uncorrected GX.
- The owner-dealt opposing hand remains concealed to the source decision. The printed Night Watch random two-card selection is resolved with the repository's existing unbiased physical-position sampler, here recording positions **[5,10]** and neither card identity. The subsequent ShowCardsPrompt and actual opponent-deck numeric ShuffleDeckPrompt are settled, the source chooses one occupied face-down Prize slot without reading its face, and the original opponent is responsible for forced Active promotion.
- One opponent reply was deliberately selected: Latias free Retreat to Girafarig, then Pass. The previous Agent34 alternative proves there was no Basic Energy already held for an immediate Girafarig Get Lost after retreat, but this does not establish that no other useful Trainer, evolution, or control action existed.

## Executed CI and boundaries

1. [CI 42583131833](https://github.com/FlareZ123/experiment-01/actions/runs/42583131833): **success**, physical Raihan third-Psychic + real turn20 Night Watch accepted; native ChooseCardsPrompt remained pending, so no Prize credited.
2. [CI 42583804997](https://github.com/FlareZ123/experiment-01/actions/runs/42583804997): **success**, existing paper-random index resolver integrated; random hand pair, reveal, shuffle, and opaque source Prize selection native settled, real Girafarig KO and 6 → 5 source Prize change. Opponent forced Active promotion was still pending.
3. [CI 42584241627](https://github.com/FlareZ123/experiment-01/actions/runs/42584241627): **SUCCESS**, native source 6 → 5 Prize transfer followed by opponent-owned public Active promotion of its surviving Latias ex SSP, all prompts settled, no errors, and turn handed to opponent actor ID202. The original 110-action SHA remained unchanged. This is a completed *detached tactical fork*, not a complete competitive game.

Pinned original Twinleaf submodule: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-dealt owner replay uses `simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs` and `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs`. New optional owner-return continuation is `simulation/twinleaf/2026-11/agent11-rank1-returned-night-watch.cjs` and its exact native regression is `tests/2026-11/agent11-rank1-raihan-third-psychic-nightwatch.native.test.cjs`. They run via the **existing manually dispatched** `.github/workflows/agent34-underworld-owner-prompt-native.yml`.

## New 16-shuffle paired search policy experiment (native CI 42585579633)

The one historical default shuffled source had sufficient next-turn Psychic even with Raihan searching Clefairy. We therefore ran a **predeclared sixteen-seed, same-original-state paired experiment** in the existing native workflow, keeping the t18 source state, all physical card memberships, every original source dealt Prize, both real owner-controlled Raihan choices, corrected Pale Moon effect, opposing Latias Skyliner Retreat-to-Girafarig and Pass, t20 own-hand normal attachment and printed Night Watch resolution identical. Each pair independently applies a genuine validated owner-deck shuffle permutation after Raihan. The predeclared seed series is `agent11-raihan-t18-registered-shuffle-v1-00` through `-15`. No opponent concealed hand card identity is used for either search selection or Night Watch random position sampling.

**[Native CI 42585579633](https://github.com/FlareZ123/experiment-01/actions/runs/42585579633) SUCCESS**, all 16 physically matched search pairs and the original 110-root source invariant checked, zero engine errors in the 16 corrected treatment branches or paired control branches:

| Outcome in 16 paired post-Raihan deck shuffles | Raihan searches Clefairy | Raihan searches Psychic |
| --- | ---: | ---: |
| Existing physical Psychic held immediately after Raihan + t18 manual funding | 0/16 | 16/16 |
| Held a Psychic by the start of own t20 after actual intervening draw | 3/16 | 16/16 |
| Printed Night Watch on 3 Psychic, KO original Girafarig, take one ordinary Prize 6→5 | **3/16** | **16/16** |
| Correction discarded all three opposing Latias Psychic on t18 | 16/16 | 16/16 |
| Genuine opposing Latias Skyliner Retreat to Girafarig and Pass | 16/16 | 16/16 |
| Unresolved native prompts or branch engine errors | 0 | 0 |

The genuine source deck at Raihan's search had **37 cards, six Basic Psychic Energy**. After selecting the first non-Energy card Clefairy, the control had **six Psychic among 36 shuffled deck cards**, so the exact uniform one-draw Psychic chance is **6/36 = 1/6 = 16.66667%**, with a **5/6 = 83.33333%** chance of missing that specific third Psychic from a lone future draw. Three of sixteen registered shuffles actually drew Psychic in the control (18.75%), consistent with this finite-deck probability. Searching Psychic instead leaves at least one in hand through the intervening opponent turn and funds the printed attack in **16/16** of these legal-shuffle clones. The measured **13/16** favorable native Prize conversions are conditional on the chosen opposing Pass, no other own card access, and the selected source line. They are dependent re-shuffles of one actual original physical state; **do not interpret as 32 independently sampled match wins or a claim about full-game matchup strength.**

The exact native branch and auditor are at `simulation/twinleaf/2026-11/agent11-rank1-raihan-search-paired.cjs` and `tests/2026-11/agent11-rank1-raihan-shuffle-panel.native.test.cjs`. They are default-off and run under existing manually dispatched CI, with the original source simulation and installed pinned vendor code unchanged.

## Strategic interpretation

This is an actual opponent-source tactical response that a shallow battle policy misses, and an example of why a search effect must be evaluated for its multi-turn opportunity cost. **The subsequently completed paired A/B test found the same Night Watch Prize in both search arms.** Original Raihan first-card search selected Lillie's Clefairy ex, and the treatment searched Basic Psychic, but both physically ended with a third Psychic in the acting owner's hand on returned turn20 and took Girafarig's Prize. Consequently this exact native deal establishes the *availability* of the attack line, while it supplies **no evidence that selecting Psychic with Raihan is necessary or superior in the sampled shuffle**. Different valid Raihan shuffle outcomes and other opponent responses remain open research questions. [Successful paired CI 42584782264](https://github.com/FlareZ123/experiment-01/actions/runs/42584782264) compares two independent clones of the same source state with identical corrected GX and the same conditional opponent Retreat+Pass. Whether a more valuable current-turn search target exists, whether the opponent can prevent or improve on the Pass line, or whether this changes the final fixed-60 comparison remains untested.

**Do not convert this result into an all-field win, a paper-qualified match, a claimed superior 60, or a 99.5% performance estimate.** The benchmark still lacks original ranks 23, 25 and 28, with 29/32 authenticated original source inventories.
