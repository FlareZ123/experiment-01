# Agent21 addendum: exact Peonia prompt-chain and Lusamine recovery gaps

Beyond the root-zero findings in my earlier review:
- Agent10's `recognizedCardSource` list omits Peonia, so the follow-up Peonia hand-replacement `card-combination` prompt is rejected as unsupported.
- The generic Prize projection/resolver selects exactly `requiredCount` lowest-index slots. For Peonia this ignores printed "up to 3" and the safe replacement count; the existing owner-visited-slot helper already supports a variable count.
- Lusamine's recovery prompt priority excludes Peonia and Gladion, so the two Lusamine copies cannot functionally recycle them even when they are in discard.

This makes the gap end-to-end: root, Peonia optional Prize count/positions, replacement selection, Gladion identity projection, and Lusamine recovery. Peonia must stay blind and position-based; Gladion may expose identities only in the genuine owner-Gladion prompt. No code/fixture changes were made.
