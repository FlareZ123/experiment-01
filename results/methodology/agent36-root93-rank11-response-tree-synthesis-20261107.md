# Root93 rank11 vs New Moon: candidate line and source-response synthesis

**Agent36 | 7 November 2026 | Retrospective, exposed-deal synthesis**  
**Scope:** Aichi rank11 original 60 vs the unchanged New Moon lockbreaker candidate, same physical deal, candidate seat1, source seat0.  
**Qualification:** no competitive game; no matchup win-rate claim; no change to the selected shared v8 baseline or either fixed 60.

## Executive finding

At the exposed candidate root93 (global turn14), the original New Moon policy passed with a ten-card hand and an unfunded Active Unown AOR. Multiple paper-plausible routes could have produced an immediate one-Prize Hidden Power Knock Out against the source's Active Trubbish FST, which already had 60 damage on 70 HP. One route, Secret Box → Fog Crystal → Basic Psychic → Hidden Power, has been executed in the pinned native Store and settled the KO and Prize. A separate Lillie branch also reached the same KO in four deterministic native replays. A separate Powerglass branch reached a one-Prize KO under an earlier, paper-order-incorrect prompt sequence.

The exposed source policy is weak at the decisive continuation. The source did not use an available Garbodor/Float Stone Ability lock after the immediate KO, and the candidate's hand at the next decision was not captured. Rank11 has a legal source-side Garbotoxin response, while the candidate has two Field Blower in its fixed 60. The response exchange remains untested. The root93 result is therefore a useful tactical and policy-competence witness, not a demonstrated game win.

## Frozen state and evidence anchors

- Original trial: `11:1000:B:new-moon-lockbreaker-v1`; source rank11 seat0, New Moon candidate seat1.
- The archived owner hand at root93 contains Battle VIP Pass ×2, Rescue Carrier ×2, Secret Box, Powerglass, Lillie's Determination ×2, Forest Seal Stone, and Mysterious Treasure. The public candidate Active is Unown AOR; Mewtwo & Mew-GX is Benched. Two Basic Psychic Energy from the earlier Unown Knock Out are in the candidate's discard.
- Source Active: Trubbish FST, 60/70 HP, with three Darkness Energy. Source Bench includes Trubbish, Crobat V, Latias ex SSP and Mega Absol ex. The same-deal source hand at the post-KO root111 receipt includes Garbodor BKP and two Float Stone; the Bench Trubbish was eligible to evolve by then.
- The fixed New Moon 60 contains two Field Blower, two Powerglass, one Forest Seal Stone, one Galarian Articuno V, two Ace Trainer, two Sky Field, four Fog Crystal, two Mysterious Treasure, and one Secret Box.

Primary detailed sources:

- [Agent43: root93 Lillie/energy screen and native Box/Fog KO continuation](agent43-v9-root93-lillie-eight-card-energy-screen-20261107.md)
- [Agent44: same-root Secret Box vs eight-card Lillie randomized comparison](agent44-root93-lillie-versus-secretbox-randomized-20261107.md)
- [Agent44: native paid Secret Box fork](agent44-root93-secretbox-native-paid-fork-20261107.md)
- [Agent7: root93 physical opportunity and Powerglass alternatives](agent7-v9-root93-secretbox-powerglass-physical-opportunity-20261107.md)
- [Agent35: natural-deal Powerglass KO/Prize root trace](agent35-v9-powerglass-actual-prize-root-cap-20261107.md)
- [Agent41: source Garbotoxin response review](agent41-root93-garbotoxin-source-reply-review-20261107.md)
- [Agent37: paper KO-before-end-turn native settlement](agent37-paper-ko-before-endturn-native-two-seat-20261107.md)

## Candidate branches

| Branch | What is demonstrated | Main unresolved constraint |
|---|---|---|
| **Secret Box → Fog Crystal → Basic Psychic → Hidden Power** | Native Store paid three physical cards, searched Fog Crystal, attached Basic Psychic to Active Unown, KO'd the 60-damage Trubbish and took a physical Prize. Source promotion was also settled in the corrected continuation. | The current Agent43 chooser selected only Fog Crystal from Secret Box's one Item / one Tool / one Supporter / one Stadium prompt. It under-selected three legal categories. The full four-category selection and stronger source reply are still needed. |
| **Lillie's Determination** | Four distinct deterministic ShuffleDeck permutations were executed in the native Store. Each found Energy or Fog Crystal, attached Energy, KO'd Trubbish and took a physical Prize. The 44-card ShuffleDeck prompt population has three Energy plus three Fog Crystal; (1-\binom{38}{8}/\binom{44}{8}=72.40717\%\) is the exact conditional probability of drawing at least one of those six access cards in eight draws. | Four deterministic replays are not a frequency estimate. The source's ChoosePokemon promotion prompt remained unresolved in these branches. Only one of the four unique seeds drew Field Blower. The 72.40717% is immediate resource access, not a win probability. |
| **Powerglass on Active Unown** | Agent35's separate native branch attached Powerglass to Unown, later used Hidden Power to KO Trubbish, and obtained a Prize. | Its recorded order was Powerglass Energy at root109 before Prize/promotion at roots110–111. That is pre-correction evidence. Rank11 Latias ex Skyliner can let the source retreat the damaged Basic Trubbish for free before a delayed attack. The same-deal branch needs a paper-order rerun and source retreat policy. |
| **Mysterious Treasure → Galarian Articuno V → Forest Seal Stone** | Card text and root93 owner hand make this a plausible alternative: Mysterious Treasure can search a Psychic Pokémon; Articuno V can hold Forest Seal Stone; Star Alchemy can search Basic Psychic. | Not Store-executed. Requires Articuno V to be present in the real owner-deck prompt, one open Bench slot, and unused VSTAR Power. It exposes another two-Prize Pokémon. Articuno's Reconstitute cannot be used from the captured hand because two Psychic Energy are not held. |
| **Box + Lillie hybrid** | The root93 hand has two Lillie's Determination copies; after a paid Box/Fog Energy line, one could be played to draw eight. | Not executed on the same branch. Box payment/search changes the shuffled pool, so the Lillie-only 44-card probability cannot be reused. The new Lillie draw must be observed from the real prompt. |

### Secret Box category correction

Secret Box TWM searches one Item, one Pokémon Tool, one Supporter and one Stadium. The pinned native prompt is a single owner-deck `ChooseCardsPrompt` with maxima `maxItems:1`, `maxTools:1`, `maxSupporters:1`, and `maxStadiums:1`. The current Agent43 adapter returns one card, which explains the single Fog Crystal search in the artifact. This is adapter under-selection, not an established Twinleaf engine gap.

The root93 candidate inventory suggests a useful four-card selection to validate through the genuine prompt:

1. Item: Fog Crystal CRE.
2. Pokémon Tool: the remaining Powerglass SFA copy.
3. Supporter: Ace Trainer XY7 (both Lillie's Determination copies are in the captured hand).
4. Stadium: Sky Field ROS.

This is a prompt hypothesis, not proof that all four physical cards remain in the deck. The real owner-deck prompt must offer and validate the selected objects. Field Blower is also an Item, so it cannot be fetched together with Fog Crystal in the same Secret Box effect. Agent4 already has a validated [one-per-category search guard](../../simulation/twinleaf/agent4-secret-box-paper-search-hook.cjs) and [native tests](../../tests/agent4-secret-box-paper-search-native.test.cjs), including both-seat positive four-category and negative duplicate-Item cases (CI 41568605248).

## Source response and counterplay

### Garbodor / Float Stone after the immediate KO

Agent41's source-owned root111 receipt records Garbodor BKP and two Float Stone in the source hand, plus an eligible untooled Bench Trubbish. Evolving that Trubbish and attaching Float Stone would establish Garbotoxin and suppress the candidate's Benched Mewtwo & Mew-GX Perfection. This is a legal source response to test after the Box/Fog or Lillie KO. It does not reverse the Prize already taken.

The candidate's root111 hand is absent from the source-pass receipt. Two Field Blower copies in the fixed 60 do not prove that one is held. A separate Lillie seed101 artifact has Field Blower in its post-draw hand, but that is a different deterministic shuffle and stops before the source response.

The existing [New Moon Garbotoxin/Field Blower adapter](../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs) defaults to an Active-Mewtwo gate. The relevant state has Active Unown and Benched Mewtwo & Mew-GX. A reusable response needs a public-board-aware gate for Perfection on either Active or Bench, plus Field Blower in the candidate's own hand and a Tool-bearing public Garbodor. A held Field Blower is not automatically profitable: the Benched Mewtwo is unpowered, the source has a second Float Stone, and the candidate may prefer to hold the Item. Test use-now versus hold and the source's retool before changing policy defaults.

Agent41 also identifies a conditional source sequence: if its VSTAR Power is unused, the source may attach Forest Seal Stone to Benched Crobat V and use Star Alchemy before evolving Trubbish into Garbodor and attaching Float Stone. The actual VSTAR-used state and Dark Patch/Energy search prompts must be verified; this is not yet an executed response.

### Skyliner and delayed Powerglass

Latias ex SSP 76's Skyliner gives Basic Pokémon in play no Retreat Cost. Rank11 has Latias ex on Bench while Trubbish is Active at root93. A source policy can therefore retreat the damaged Basic Trubbish for free before a delayed Powerglass attack, preserve it on Bench, then evolve it into Garbodor and attach Float Stone. This is a counter to the delayed Powerglass line. It does not prevent an immediate Box/Fog or Lillie KO during the candidate's own turn, before the source receives a retreat window.

### Paper KO / Powerglass order

The earlier native Powerglass fixture ran end-of-turn effects before Prize/promotion. Agent37's instance-scoped hook now checks KO/prize state before the original end-turn effect and has a green native isolation audit in [CI 42348723201](https://github.com/FlareZ123/experiment-01/actions/runs/42348723201), including six scenario types in both seats, unchanged neighboring Store behavior and restoration. This is a controlled hook regression, not a natural-game rerun. Agent35's root107/109/110/111 sequence remains pre-correction and should be rerun under the instance-scoped hook before being called paper-order correct. The later workflow's Technical Machine extension failed independently; the scoped Powerglass audit itself passed.

## Field relevance and limits

An independent parse of the 29 authenticated source 60s confirms:

- Garbodor package in **4/29** (ranks8,11,16,22), with 3–4 Float Stone each.
- Field Blower in **9/29** source lists.
- Latias ex in **14/29** source lists.

These are decklist-presence counts, not game-state or matchup rates. The rank11 source has Garbodor/Float Stone and Latias ex, but no Field Blower. New Moon has two Field Blower. The tactical interaction is therefore worth testing beyond one root93 deal, with correct information-set boundaries.

## Recommended next experiment

Use the same fixed source/candidate 60s and exact root93 physical prefix, but keep distinct branches and record every physical card movement:

1. **Correct the Box chooser:** resolve one Item, one Tool, one Supporter and one Stadium from the real Secret Box owner-deck prompt. Reuse Agent4's category guard and record `sourceCard`, owner deck identity, maxima, selected physical cards and postconditions.
2. **Candidate payoff branch:** compare the four-category Box/Fog line with Powerglass attached to Active Unown, and with the separate Lillie and FSS/Articuno routes. Use Agent37's instance-scoped KO-before-end-turn hook. Record physical Prize before Powerglass attachment.
3. **Source reply:** on the immediate-KO branches, let the source consider FSS before Garbotoxin if its VSTAR Power is unused, then evolve eligible Trubbish to Garbodor and attach Float Stone. On the delayed Powerglass branch, allow Skyliner free retreat before the candidate's next attack.
4. **Candidate answer:** capture the candidate's own hand after its draw. Test Field Blower only if physically held, and compare using it now against holding it. Let the source reattach its second Float Stone and measure the second response.
5. Continue both sides beyond the first KO. Preserve source/candidate actor information sets, all accepted/rejected prompts, Prize mapping, turn order and stop reason. Then move to new unseen physical deals before estimating any matchup performance.

## Benchmark status

The fixed New Moon candidate and shared v8 baseline are unchanged. Aichi source inventory remains **29/32** exact originals (ranks23,25,28 missing). No full-game result in this response tree is competitively qualified. **Qualified games: 0. Demonstrated 99.5% field win rate: none.**


## Powerglass prompt-continuation correction

A later code review verified that `simulation/twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs` already provides a generic owner-only `AttachEnergyPrompt` continuation for **any Active Pokémon** with Powerglass physically attached. No Unown-specific prompt hook is missing. The limitation is the root selector `choosePowerglassAfterSupporter`: it currently requires a Supporter played that turn, zero Energy on the Active, and a one-Colorless attack at a lethal breakpoint. Root93 after Fog Crystal has Active Unown with one Psychic Energy, so this selector declines to attach Powerglass.

A diagnostic Unown branch can directly propose Powerglass before the Energy attachment and reuse Agent35's generic prompt continuation. A reusable policy needs to justify the second Energy's retreat/future-attack value and compare the Tool-slot opportunity cost. The earlier request to extend a Mewtwo-specific prompt hook is withdrawn.


### Mega Absol attack constraint on the source FSS branch

A card-pool check of `Mega Absol ex MEG 86` in `resources/cards/en/me1.json` sharpens the source setup analysis. `Terminal Period` costs Darkness + Colorless and only Knocks Out the opponent's Active if it has exactly six damage counters; `Claw of Darkness` costs Darkness + Darkness + Colorless and does 200 damage. At source root111, candidate Active Unown has zero damage. A Dark Patch plus one manual Darkness attachment can put two Energy on Mega Absol, but that does not establish an immediate Terminal Period KO against the captured Unown; three Energy are needed for Claw of Darkness. Treat FSS → Dark Patch as a setup/resource-development branch unless the real prompts show a legal immediate attack and target.

The rank11 manifest has exactly two Forest Seal Stone, both are in the source's root111 hand, and none is attached on the public board. This strongly supports an unused Star Alchemy opportunity, although the artifact does not expose the VSTAR-used flag. Verify that flag in the native Store state before claiming the Ability is available.


## Four-category selector implementation status (7 November follow-up)

Agent36 added a reusable owner-only selector and tests:

- [Four-category selector](../../simulation/twinleaf/agent36-secret-box-four-category-selector.cjs)
- [Six pure selector tests](../../tests/agent36-secret-box-four-category-selector.test.cjs)
- [Two-seat native Store probe](../../simulation/twinleaf/agent36-secret-box-four-category-native.cjs)
- [Two-seat native test](../../tests/agent36-secret-box-four-category-native.test.cjs)

The selector binds to `Secret Box TWM`, the exact owner id and owner-deck collection, the search message, physical `TrainerCard` objects, one card per category, Agent4's paper guard, and the native prompt validator. Its root93 preference list is Fog Crystal / Powerglass / Ace Trainer / Sky Field. The six pure tests pass locally under Node v22.16.0 against Agent4's actual current guard module. The native runner now constructs its Store inside Agent4's reversible dispatch-guard lifetime and passes local syntax checking.

The native two-seat Store test has **not** yet run. It is included with Agent4's native positive/negative category regression in `.github/workflows/agent36-bilateral-competence-v9.yml` for the next manual run. The current Agent43 v4 full-deal adapter still needs to integrate the selector and add explicit source-card guards for the Box payment and Fog Crystal search stages. The new helper covers the Secret Box search stage only. No full-deal result or matchup qualification changes until that integration and source-response replay complete.


### v5 full-deal adapter and extended native probe

The shared `agent43-owner-secretbox-fog-ko.cjs` adapter is now v5 (`agent43-owner-visible-secretbox-one-energy-knockout-v5-four-category-source-bound`). It integrates the four-category selector, preserves the one-Fog fallback/empty-search whiff, and binds Box payment, Box search, and Fog Crystal search to their exact source card, owner, message, and relevant physical zone. Its postconditions record all selected physical Box-search cards and distinguish full four-category from partial selections.

The two-seat native probe now exercises the full Secret Box payment → four-category search → Fog Crystal → Basic Psychic Energy search chain. It verifies the exact Secret Box and Fog Crystal prompt sources, owner-deck identity for both search prompts, payment-card custody, physical zone changes, and Agent4's Secret Box dispatch guard. Local syntax checking and the six pure selector tests pass. **The native Store probe and v5 full-deal adapter have not yet been run in Twinleaf**; both are included in the manual Agent36 v9 workflow. No matchup evidence or qualified game count changes.


### Root111 source-zone evidence boundary

I downloaded and inspected Agent43 artifact `13562043261` (`agent43-v9-root93-secretbox-oneprize/attempt.json`). Its root111 `nativeAllOwnerPassFrontier` receipt preserves the source hand and public board, but not source deck/discard/prize card identities. A recursive scan found no Dark Patch card-name occurrence or source deck/discard zone list. The rank11 manifest establishes three Dark Patch in the 60, but their root111 zone distribution is unknown. The artifact also does not expose the VSTAR-used flag. Therefore FSS → Dark Patch → Mega Absol remains a hypothesis requiring genuine owner-deck and discard prompts in a native Store replay.
