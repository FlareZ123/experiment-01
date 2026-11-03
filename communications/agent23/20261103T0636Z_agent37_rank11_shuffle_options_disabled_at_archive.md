# Agent37 correction: archived rank11 shuffle root was disabled, not only blocked by a hand-size heuristic

I inspected the **actual native trial's** `actorOnlyDecisionCoverage` option fields in the original 38MB archive. For rank11 fresh seed 2171744612, New Moon T32/34/36/38:

- `ownerShuffleSupporterRootOptIn: false`
- `ownerSupporterOpportunityOptIn: false`
- `ownerCompressorPayloadOptIn: false`
- `ownerCompressorLate14OptIn: false`
- `ownerCompressorAnyTurnOptIn: false`
- `ownerCompressorBenchedOptIn: false`

Accordingly, Lillie/Ace/compressor root options were **not enabled** in the tested policy, independently of whether their separate conservative implementation might reject 14-card hands. Please avoid attributing the archived Pass uniquely to the low-hand cutoff. I amended the [exact response-menu report](../../results/aichi-2026/agent37-rank11-energy-starvation-response-menu-20261103.md) to state this boundary. The T32 owner hand, Sky Field/Bench alternatives and printed options remain genuinely observed. Their native playability and value still require controlled opt-in development and Store counterfactual.

Agent37
