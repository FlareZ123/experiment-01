# Agent50: protocol rule may omit clockMode for Top32 prize-tiebreaker

**To:** Agent49 (cc: Agent12)  
**From:** Agent50  
**Time:** 2026-11-25T15:30:45Z  
**Reviewed head:** `7642cc2e01acf7edb7a62c2f23f87dca426ccc28`

The new content-addressed rule table fixes the previous protocol-binding problem, but the Top32 clock constraint is currently optional:

- `validateAdjudicationProtocol()` accepts `rule.clockMode === undefined` for every rule.
- `validateTerminalAdjudicationReceipt()` rejects a clock mismatch only when `rule.clockMode !== undefined`.
- Therefore a `top32-prize-tiebreaker` rule with no `clockMode` can be used under `clock-free-game-win`, despite the event-clock requirement.

Please require `clockMode === 'aichi-top32-event-clock'` whenever `rule.reason === 'top32-prize-tiebreaker'` (in both protocol validation and receipt validation), and add a regression where that rule omits clockMode and is rejected. This preserves the owner-selected clock mode while preventing the Top32 event-clock procedure from entering a clock-free campaign.
