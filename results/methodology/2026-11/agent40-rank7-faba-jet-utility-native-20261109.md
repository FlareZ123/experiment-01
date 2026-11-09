# Authentic original rank7: a staged Faba → Jet Energy → Wobbuffet → Nest Ball release witness

**Agent40 | 9 November 2026 | Two-source-printed-sixty native Store fixture, both physical seats | Development only, zero qualified games**

## Decision and previously missing policy

The original Aichi rank7 Snorlax Stall 60 includes `Wobbuffet PHF` ×3, `Faba LOT` ×2, `Jet Energy PAL` ×1, and `Nest Ball SVI` ×1. None of its four Energy cards provides Psychic, so a Jet Energy attached to Wobbuffet may make no printed damaging attack payable. The previous [shared default-off Jet selector](../../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs) required a newly payable positive-damage attack. That excluded the **utility** switch that can remove an opposing `Vileplume AOR` `Irritating Pollen` Item lock, rendering an already-held Nest Ball usable.

The improved selector now proposes an actual typed owner `attach-special-energy` to Benched `Wobbuffet PHF` when a public opposing `Vileplume AOR` has `Irritating Pollen` and no effective Stealthy Hood, an owner-held Nest Ball can exploit an actual empty Bench slot and nonempty deck, and Jet Energy remains legally attachable. It preserves already-payable Active attacks and Active-only passive lock positions. A second opposing Hood-protected Item-locking Vileplume vetoes the proposed unlock. The integration remains under **`jetBenchSwitchRoot:true`**, default off.

The exact selector is an **owner-information-set proposal**; it cannot itself settle the game, establish an available deck-resident Basic at K0, or evaluate the opportunity cost of Jet against all other lines. Existing printed metadata and the actual native Store remain separate legality checks.

## Real pinned two-seat Store witness

The [native test](../../../tests/2026-11/agent40-rank7-faba-jet-unlock.native.test.cjs) uses the exact original rank7 60 against the unchanged Sentinel Lopunny/Vileplume fixed 60 via the existing `stagePrepared` fixture. For each source physical seat, the manufactured but physically conserving board has the original source's Mimikyu Active, Wobbuffet on its Bench, Nest Ball in its hand, and a fully evolved, Hood-protected opposing Vileplume on the Bench. The originally deck-resident Faba and Jet are placed into the original owner hand, with real cards moved between zones; this is a deliberately conditioned board, **not** a naturally sampled opening, chronological evolution witness, or full bilateral game.

1. Source plays its original `Faba LOT` with a real `PlayCardAction`. Two authentic owner prompts select opposing Tool and Vileplume. The opponent's exact Hood moves to the opponent-owned Lost Zone, while the opponent's Item lock remains effective because original Wobbuffet is still Benched.
2. Source attaches its single authentic original `Jet Energy PAL` to that Benched Wobbuffet. The actual native card effect switches Wobbuffet Active and moves former Active Mimikyu onto the Bench. `IS_ABILITY_BLOCKED` now reports the formerly protected opposing `Irritating Pollen` blocked.
3. Source plays its original held `Nest Ball SVI`, selects real original deck-resident `Regirock XYP`, resolves `Choose cards`, `Shuffle deck` and `WaitPrompt` on the native Store, and finishes with Regirock physically on the Bench and Nest Ball discarded.

**Verified [manual CI 42572219162](https://github.com/FlareZ123/experiment-01/actions/runs/42572219162)** at research head `f8be9b2eccc8ab32b6f7c91a95cdc076a2892b18`, pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: full workflow `cursed-blast` **success**, optional `Probe original rank7 Faba Hood Tool Lost Zone and source Wobbuffet Item response on both seats` **success**. The original Faba-only both-seat control also passed. New native chain tests passed physical source seats 0 and 1, with one actual item search, exact source/card ownership, 60 unique source and 60 unique candidate cards, and all three owner search/shuffle/wait prompts settled. Both rows state `naturalSourceDeals:0`, `qualifiedCompetitiveGames:0`.

### Resolved physical counting false alarm

Initial [CI 42571049444](https://github.com/FlareZ123/experiment-01/actions/runs/42571049444) failed `61 !== 60` after correct gameplay assertions because the naïve sum double-counted the original Jet Energy in `active.cards` **and** `active.energies.cards`. The diagnostic [CI 42571657537](https://github.com/FlareZ123/experiment-01/actions/runs/42571657537) showed *the same physical card ID `420059` in both views of the same native Pokémon slot*, while Faba and Nest Ball were in discard. Source inspection of pinned `PokemonCardList.moveCardsTo` confirms that `cards` is an inclusive physical container and `energies.cards` is a secondary index of attachments. The corrected test deduplicates only inside the same Pokémon slot and **fails on any cross-zone duplicate**; the green CI confirmed 60 unique source and 60 unique candidate cards in both seats. This is an auditor correction, not a proven Twinleaf physical duplication bug.

### Live owner-public intent bridge

**Verified [subsequent compiled CI 42572747468](https://github.com/FlareZ123/experiment-01/actions/runs/42572747468)** at research head `f3160747390e50874f1b2bee43b08560ae31d6e4`, pinned same vendor, entire `cursed-blast` workflow success and the optional rank7 step success. The [native test revision](../../../tests/2026-11/agent40-rank7-faba-jet-unlock.native.test.cjs) builds an actual frozen detached `actorObservation` after Faba, invokes the default-off `choosePublicJetBenchSwitch` on the source player's visible hand and boards, requires the exact typed `jet-promote-wobbuffet-suppress-unhooded-aor-item-lock` intent in **both physical seats**, and dispatches the selected hand index and Bench index to the real Store. The resulting source-owned Nest Ball search, shuffle, wait, and true unique 60+60 physical-card count all passed. This is now a **source-owned, selected-and-accepted root plus paid effect witness**; the preceding Faba and subsequent Nest Ball actions were manually selected, so it remains a conditioned non-game.

Pure [source policy tests](../../../tests/agent40-public-jet-bench-frontier.test.cjs) include no-Hood positive, held-Item and Bench-space gates, two-Vileplume Hood negative, payable-Active preservation, and owner hidden-state invariance. Their targeted `Check default-off owner Jet Bench switch proposal and shared symbolic Energy matcher` step passed on [manual CI 42572383994](https://github.com/FlareZ123/experiment-01/actions/runs/42572383994). The *full* benchmark workflow failed subsequently in an unrelated immutable-policy pinning step; do not label the whole run green.

## Explicit remaining gaps

- The source ranks 23, 25 and 28 are still missing exact authenticated original 60s. No final deck has been selected and the 99.5% benchmark remains unproven.
- The shared actor has a default-off Jet utility chooser. It does not yet automatically propose and resolve the **preceding Faba target choice** or **subsequent Nest Ball prompt**, and the native game fixture is staged. A complete source-owner policy should cover this full action family and its competing uses, then confront a live, independent opponent continuation.
- This exact original rank7 counterline is one practical adversarial response to a Sentinel Vileplume deck, not a win-rate statistic. No natural original-source physical deals, independently qualified complete games, official timed adjudications or full field wins were added.

## Reuse

- Default-off selector: [`simulation/twinleaf/agent40-public-jet-bench-frontier.cjs`](../../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs)
- Full original-source native chain: [`tests/2026-11/agent40-rank7-faba-jet-unlock.native.test.cjs`](../../../tests/2026-11/agent40-rank7-faba-jet-unlock.native.test.cjs)
- Original-only predecessor: [`simulation/twinleaf/agent40-original-rank7-faba-hood-native.cjs`](../../../simulation/twinleaf/agent40-original-rank7-faba-hood-native.cjs)
- No new workflow: existing manual `aichi-dusclops-self-ko.yml` optional input `agent40_rank7_original_faba_hood_native:true`.
