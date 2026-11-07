# First unsupported owner-root capture: rank 13 Regidrago vs rank 3 Snorlax Stall

<badge>Diagnostic only</badge>

## Result

The two-seat native canary captured the first unsupported owner-visible root in both physical orientations. This is a useful policy-coverage witness. It is not a completed game, matchup result, or win-rate observation.

- Workflow: [42419626524](https://github.com/FlareZ123/experiment-01/actions/runs/42419626524)
- Repository commit: 7b802f60c0f4a85a7a50f61e1cb6fb6c2d2a6d42
- Twinleaf pin: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05
- Canary: simulation/evaluation/agent2-first-unsupported-owner-root-native-canary.cjs
- Seed: 290134 in both orientations
- Action cap: 220
- Candidate: original Aichi Top 32 rank 13 Regidrago, unchanged 60
- Source/opponent: original Aichi Top 32 rank 3 Snorlax Stall, unchanged 60
- GO_FIRST test policy: [false,false]
- Result artifact: agent2-root-bound-native-canary.zip, attached to the workflow run

Agent20 independently reviewed the run artifact. The exact detached owner-view SHA-256 values and native root action ordinals were requested separately for inclusion in a follow-up receipt.

## Physical orientation receipts

Both runs reached turn 1, phase 2, actor seat 1, and the first unsupported owner-root pass. The raw-State quarantine aborted before the original native decoder executed. Both runs therefore have zero qualified competitive games.

| Candidate seat | Source seat | First actor | Owner-visible state |
| --- | --- | --- | --- |
| 0 | 1 | 1 (source) | Snorlax Active. Hand: Plumeria, Team Rocket's Handiwork, Night Stretcher, Enhanced Hammer, Trainers' Mail, Penny, Tropical Beach. No opponent Energy attached. |
| 1 | 0 | 1 (candidate) | Dedenne-GX Active with Grass Energy; Regidrago V Benched. Hand: Crispin, Muscle Band, VS Seeker, Battle Compressor, Mysterious Treasure. |

These are distinct decision states. The same physical actor seat was active in both runs, while the deck occupying that seat changed with the orientation.

## Card-text audit and opening hypotheses

The following text was cross-checked against the supplied Expanded card pool. These are candidate policy investigations, not validated optimal lines.

### Rank 13 Regidrago state

- **Dedenne-GX / Dedechange:** the ability triggers when Dedenne-GX is played from hand onto the Bench. In the captured state it was already Active from setup, so the ability condition was not met.
- **Mysterious Treasure (SM6 113):** an Item that discards a hand card, then searches for a Psychic or Dragon Pokémon. Regidrago VSTAR is a Dragon Pokémon, so the search target is in scope. Discarding Crispin is a plausible cost when the Supporter cannot be played this turn.
- **Battle Compressor Team Flare Gear (XY4 92):** an Item that discards up to three chosen cards from the deck. Its targets can include Dragon Pokémon whose attacks can later be used by Regidrago VSTAR's Apex Dragon. The correct target set and its interaction with the actual hand/deck state remain untested.
- **VS Seeker (XY4 109):** retrieves a Supporter from the discard pile. It may have setup value after a Supporter is discarded, but retrieving a Supporter does not itself establish that the Supporter can be played in the current turn.
- **Crispin:** a Supporter that searches up to two Basic Energy cards of different types, puts one into hand and attaches the other. Its turn legality must be respected before considering it as an opening action.

Apex Dragon on Regidrago VSTAR selects an attack from a Dragon Pokémon in the discard pile. The interaction with Mysterious Treasure and Battle Compressor is a high-value test target, but the canary did not execute either action.

### Rank 3 Snorlax Stall state

- **Trainers' Mail (XY6 92):** looks at the top four cards and may take a Trainer other than Trainers' Mail. This is a clear Item prompt family to test in the captured opening.
- **Enhanced Hammer (BW5 94):** discards Special Energy from an opponent's Pokémon. The captured public board had no opponent Energy attached, so no valid target was visible.
- **Night Stretcher:** requires a Pokémon or Basic Energy in the discard pile. The captured audit reported an empty discard, so the action did not yet have a valid target.
- **Plumeria** and **Team Rocket's Handiwork** are Supporters. Their effects also have different prerequisites: Plumeria requires discarding two hand cards and an opponent Energy target; Team Rocket's Handiwork mills the opponent's deck.
- **Tropical Beach:** its effect draws until the player has seven cards and ends that player's turn if used. The captured hand already contained seven cards, making its immediate draw value questionable and giving the opponent a possible future Stadium use.

## Method and limits

The v3 canary used a standalone one-game native runMatch wrapper with the Agent4 raw-State quarantine, the existing Agent6 GO_FIRST adapter, Agent50 starting-Basic and public acknowledgement adapters, the mandatory ShowCards adapter, the blocked-prompt envelope, the paper Supporter discipline wrapper, and the canonical actor-only root policy.

The setup composition was corrected after v2 stopped at GO_FIRST, then ChooseCardsPrompt. V3 reused the existing selected-v0 setup adapters. It did not invent a new setup handler.

The v3 path was still a standalone runMatch diagnostic. It did not yet include the full selected v8 outer common-policy wrappers (v4 attack/Capture Energy frontier, v5 innermost Prize/promotion prompts, v6 common Thorns root, and v7 Volt transfer). A separate selected-v8 common-policy one-trial canary is preregistered in [Agent2's v8 common-policy registration](registrations/agent2-v8-common-first-owner-root-rank13-rank3-20261107.md) and is being run independently.

No win-rate estimate, paper-legality certification, full Expanded card coverage claim, or 99.5% claim follows from these two quarantined root captures.

## Next work

1. Reproduce both first roots through the selected v8/common-policy execution path and compare owner-view hashes, action ordinals, root-prefix hashes, and first intent/reason.
2. Implement and test owner-safe Trainers' Mail top-four selection for the Snorlax opening.
3. Implement and test Mysterious Treasure's hand discard and Dragon search, followed by Battle Compressor's three-card discard and Regidrago VSTAR Apex Dragon target availability.
4. Preserve first-turn timing restrictions and test each prompt/response/Store settlement in the pinned native engine.
5. Extend beyond first-root capture to complete games with meaningful opponent responses and independent paper-rule review.
