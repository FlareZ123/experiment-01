# Agent 2 staged native Crispin / Treasure / VS Seeker / Battle Compressor sequence (v1)

Status: preregistered native card-interaction diagnostic. No outcome is claimed until the shared manual workflow runs successfully.

## Question

Can the same physical Crispin SCR card be paid as the discard cost for Mysterious Treasure FLI, recovered from the discard pile by VS Seeker PHF, and retained in hand while Battle Compressor PHF selects the exact three Dragon attack donors from the original rank-13 Regidrago list and moves those physical cards to the discard pile?

This is a staged native Store test of card identity, prompt validation and zone transitions. It is not a complete Pokémon TCG game, deck draw simulation, or matchup result.

## Fixed staged fixture

- Run both physical owner seats, 0 and 1, using the same staged fixture.
- Starting hand: Mysterious Treasure FLI, Crispin SCR, VS Seeker PHF, Battle Compressor PHF.
- Starting deck: Regidrago VSTAR SIT, Noivern ex PAL 153, Dragapult ex TWM 130, Dialga-GX UPR 100.
- All four deck objects are instantiated through the pinned Twinleaf `CardManager`; the test tracks the same object identities across zones.
- Mysterious Treasure must select Regidrago VSTAR SIT from the native owner-deck prompt and discard the exact Crispin SCR object as its payment.
- VS Seeker must select that same Crispin object from the native discard prompt and return it to hand.
- Battle Compressor must open a native ChooseCardsPrompt whose owner-deck selection accepts exactly the three donor objects under the native validator; those objects must move to discard.
- The shared cleanup observer resolves the public ShowCards / ShuffleDeck / Wait prompt chain for both Items. Its default Mysterious Treasure behavior remains backward-compatible; the optional printed-item argument is used for Battle Compressor.
- Final zone assertions: Regidrago VSTAR and the original Crispin object are in hand; Mysterious Treasure, VS Seeker, Battle Compressor and all three exact Dragon donors are in discard; no staged deck card remains in deck.

## Provenance and execution

- Original candidate source: `results/aichi-2026/full-decklists.json`, rank 13, unchanged published 60-card name/count list.
- The full-decklist file and all research-side helper sources are included in the probe's source hash receipt.
- Native engine: Twinleaf pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The probe must run through the existing shared manual workflow `.github/workflows/agent36-bilateral-competence-v9.yml` using the explicit `agent2_crispin_vs_seeker_treasure_native` input. Do not dispatch the retired Agent2-only workflow or create another per-card workflow.
- Preserve a machine-readable JSON receipt as a workflow artifact.

## Evidence required

For each seat, record:
- exact card IDs and full printed names;
- native prompt class, source printing, owner/deck or discard CardList identity, min/max, selected physical card IDs and native validator acceptance;
- Mysterious Treasure and Battle Compressor cleanup prompt sequence and item final zone;
- Crispin's same-object transition hand -> discard -> hand;
- exact three donor same-object transitions deck -> discard;
- final hand, discard and deck zones;
- Twinleaf pin, research revision and hashes for the decklist, runner, cleanup helper, stage fixture and prompt contract.

The diagnostic passes only if both seats satisfy every identity and zone assertion. Any missing card, substituted object, unexpected prompt, invalid native answer, unresolved cleanup prompt or incomplete donor selection is a failure.

## Interpretation limits

- A staged Store fixture does not prove the line is strategically optimal, consistently drawn, or playable in a full match.
- Crispin remains in hand for a later turn; this test does not claim it can be played on the first player's first turn.
- The donors are made available to Regidrago VSTAR's Apex Dragon attack by their discard placement; this test does not execute Apex Dragon or certify attack sequencing.
- No complete game, competitive game, matchup estimate, paper legality certification or win-rate claim is authorized.
