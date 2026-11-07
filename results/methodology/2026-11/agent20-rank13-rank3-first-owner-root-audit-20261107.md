# First owner-root card-text audit: original rank 13 vs rank 3

**Author:** Agent20  
**Date:** 7 November 2026  
**Evidence class:** source inspection plus card-text/rule derivation; proposed lines are hypotheses awaiting native validation.

## Question

After the two-seat original-deck canary reaches the first unsupported owner root, which owner-visible actions are available, and what is a defensible first action to test?

## Reproduction context

- Native canary run: [42419626524](https://github.com/FlareZ123/experiment-01/actions/runs/42419626524)
- Source code commit: `7b802f60ad997f95784b7953921b93efa32d442f`
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Original 60-card sources: `results/aichi-2026/full-decklists.json`, rank 13 candidate and rank 3 source.
- Registration: `results/methodology/registrations/agent2-first-owner-fallback-original-rank13-rank3-20261107.md`

The canary captures both physical orientations. Both rows pass the setup prompts, record one owner-matched GO_FIRST choice with `chooseFirst:false`, and capture the first unsupported owner root at turn 1 / phase 2. Both rows have zero qualified games. The first root intent is a pass with reason `no-supported-owner-visible-root`; it is a policy gap, not evidence that passing is strategically correct.

## Turn-order constraints

The coin winner chooses the starting player. In the canary, seat 0 chooses `false`, so seat 1 starts. The official Pokémon rulebook states:
- the starting player cannot play a Supporter on their first turn (p. 12);
- the starting player skips the attack step on their first turn (p. 13);
- neither player can evolve on their first turn (p. 11).

Source: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf

The supplied advanced-player manual's setup section describes the coin-flip choice, but does not contain these three first-turn restrictions. Use the official rulebook for this rule boundary.

## Candidate seat 1: rank 13 Regidrago

At the first unsupported root, the actor is first player. The owner-visible hand is:
- Crispin;
- Muscle Band;
- VS Seeker;
- Battle Compressor;
- Mysterious Treasure.

The board has Dedenne-GX Active with Grass Energy and Regidrago V on the Bench. The original 60 contains 3 Regidrago VSTAR, 4 Regidrago V, 2 Battle Compressor, 2 Mysterious Treasure, 3 VS Seeker, and 1 Crispin.

### Relevant card text

| Card | Printing / ID | Relevant printed text |
|---|---|---|
| Dedenne-GX | UNB 57 / `sm10-57` | Dedechange triggers when this Pokémon is played from hand onto the Bench during the turn. |
| Crispin | SCR 133 / `sv7-133` | Supporter; searches up to two Basic Energy cards of different types, puts one in hand and attaches the other. |
| Mysterious Treasure | FLI 113 / `sm6-113` | Discard a card from hand, then search for a Psychic or Dragon Pokémon. |
| VS Seeker | PHF 109 / `xy4-109` | Put a Supporter card from the discard pile into hand. |
| Battle Compressor Team Flare Gear | PHF 92 / `xy4-92` | Search the deck for up to three cards and discard them. |
| Regidrago VSTAR | SIT 136 / `swsh12-136` | Apex Dragon uses an attack from a Dragon Pokémon in the discard pile. |

### Important legality guard

Dedenne-GX's Dedechange text is conditional on playing it from hand onto the Bench during the turn. The canary's Dedenne-GX was already in play from setup as the Active Pokémon. The presence of the ability on the card does not make Dedechange available at this root.

Crispin cannot be played on the starting player's first turn. Regidrago V cannot evolve to Regidrago VSTAR on that turn.

### Candidate line to test

A plausible, legal sequence is:

1. Play Mysterious Treasure, discarding Crispin, and search Regidrago VSTAR.
2. Play VS Seeker to recover Crispin from the discard pile, preserving it for a later turn.
3. Play Battle Compressor to place up to three Dragon attack options into the discard pile for Apex Dragon.

This is a card-text derivation, not a validated optimal line. The exact order, discard targets, and whether the engine resolves each prompt as expected require a pinned Twinleaf test. The existing `agent49-mysterious-treasure-frontier` helper currently accepts Dragon-donor or dead Battle VIP Pass discards; it does not recognize the Crispin-plus-VS-Seeker recovery line.

Potential matchup-aware Battle Compressor targets to test against rank-3 Snorlax Stall include:
- Noivern ex: Dominating Echo prevents the opponent from playing Special Energy or Stadium cards from hand during their next turn. The source hand contains Tropical Beach.
- Dragapult ex: Phantom Dive places six damage counters on the opponent's Bench.
- Dialga-GX: Timeless-GX takes another turn.

These are candidate attack options. The best set depends on the energy plan and the opponent's available responses.

## Candidate seat 0: rank 3 Snorlax Stall

The first actor's owner-visible hand contains:
- Plumeria;
- Team Rocket's Handiwork;
- Night Stretcher;
- Enhanced Hammer;
- Trainers' Mail;
- Penny;
- Tropical Beach.

Snorlax PGO is Active. The opponent's public Pokémon have no attached Energy.

- Plumeria, Team Rocket's Handiwork, and Penny are Supporters, so they cannot be played on this first turn.
- Night Stretcher (SV6pt5 61 / `sv6pt5-61`) requires a Pokémon or Basic Energy in the discard pile; the captured discard is empty.
- Enhanced Hammer (BW5 94 / `bw5-94`) requires an opposing Special Energy; none is attached in the captured public view.
- Tropical Beach (BW-P BW28 / `bwp-BW28`) lets each player draw until they have seven cards and ends that player's turn. The owner already has seven cards. The opponent's hand is hidden, so its immediate benefit to the opponent cannot be determined from this owner view.
- Trainers' Mail (XY6 92 / `xy6-92`) is a legal Item that looks at the top four cards and can take a Trainer other than Trainers' Mail. Its value depends on the actual revealed top-four prompt.

Trainers' Mail is the clearest first-turn search action in this hand. The policy should select only among cards actually revealed by the prompt. A deliberate pass could still be a strategic choice if the revealed options are poor, but the canary's current pass is caused by missing policy support.

## Related existing Mysterious Treasure validation

This report does not reopen the generic Mysterious Treasure implementation question. Agent46 has already validated the mandatory FLI payment contract in the shared Agent41 paper-prompt portfolio and exercised genuine pinned native payment plus own-deck search in both physical seats:
- [Agent46 common paper cost result](agent46-mysterious-treasure-common-paper-cost-10-of-29-source-20261105.md)
- [Agent46 completed native prompt-chain cleanup result](agent46-mysterious-treasure-postsearch-cleanup-native-20261107.md)
- Shared contract: `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`

Those native tests used a Psychic Energy payment and searched Regidrago V. They did not test the rank-13 opening's Crispin payment followed by VS Seeker recovery. The proposed sequence therefore reuses an already tested Trainer cost/search path; its novel question is whether the exact Crispin-to-discard and VS Seeker-to-hand sequence is accepted and strategically useful. Do not duplicate the generic Treasure cleanup observer.

## Reproducibility note

The run artifact's `setupAdapterVersions.goFirst` field is absent because the canary imports `VERSION` from `agent6-go-first-choice.cjs`, while that module exports only `withGoFirstChoice`. The `selectedSetupAdapters` list also omits `agent6-go-first-choice`. The source commit pins the exact helper, so this does not invalidate the root capture, but the manifest should include the GO_FIRST adapter version.

The artifact's `firstBlockedPromptContract` has null prompt fields because the captured event is an owner-root, not a blocked prompt. `firstRootProvenance` is the relevant root receipt.

## Next tests

1. Add a pinned native regression for Mysterious Treasure discarding Crispin, followed by VS Seeker recovering Crispin.
2. Test Battle Compressor's discard prompt and confirm that Regidrago VSTAR Apex Dragon sees the chosen Dragon attack options in discard.
3. Test the Trainers' Mail prompt on the rank-3 source side, using only the actual top-four choices.
4. Run the same fixed seed in both physical orientations and preserve the exact first root, prompt choices, engine pin, policy revision, and failure boundary.
5. Do not count any of these tests as a completed game or competitive matchup result until the match reaches a terminal state under a documented policy.

No shared policy was changed in this investigation.
