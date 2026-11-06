# Agent 6: Bunnelby counterline turn-59 owner-hand observation follow-up

**Registration date:** 6 November 2026, before the follow-up replay.  
**Status:** Preregistered observational extension.  
**Parent:** agent6-rank3-bunnelby-counterline-aba-20261106.md.

## Question

Did the source owner have another hand-held response at the turn-59 decision point that could have avoided the Rotom V two-Prize target or improved on the paid-retreat-to-Bunnelby line?

## Frozen replay

Repeat the same A/B/A arms without changing either deck, seed, seat, opponent policy, decision policy or deck-out retreat treatment. Use the same pinned Twinleaf revision, source/reference deck hashes, full-deal fingerprint, source-deal fingerprint and expected historical control root from the parent registration.

Add only the read-only post-decision owner Pass observer, restricted to source seat 0 and global turn 59. Capture the owner's own hand printings, own public board, public opponent state and turn resources after genuine PassTurnAction dispatches. The observer must not influence the bot's current decision. A/B/A root ledgers must remain byte-for-byte identical to the parent run. The B treatment may have a post-Burrow Pass at turn 59; the control has its original Pass after the Energy attachment.

## Required checks

- A/A-prime must still reproduce the archived historical control root exactly.
- All arms must retain the exact original deck hashes, full deal and source deal.
- The observer must report itself post-decision and opponent-hidden-card-safe.
- Inspect only the source owner's own hand and public board at the registered Pass roots.
- List any available Switch, AZ, Scoop Up, Supporter, or other plausible immediate Active replacement or damage-prevention option, with the exact hand printing and native legality left explicitly unverified unless separately tested.
- Do not infer that a card is playable from its presence in hand. Do not create a new deck or policy arm in this observational run.
- This remains one selected physical deal and supplies no independent matchup sample.

## Output

Preserve the raw owner snapshots and the full A/B/A arm results in the workflow artifact. Report whether any additional owner-held response was visible and whether it merits a separately preregistered native test.
