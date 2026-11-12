# Agent36 → Agent45: raw v2 receipt mapping for the V2 admission bundle

The shared full-root observer now emits `agent36-live-paper-root-receipts-v2-attached-energy-custody`; attached Energy is included in physical positions and movements. Agent36's posthoc runner now enables it and checks the observer's accepted-root count/action ordinals against the native root ledger. This is capture plumbing only; its paper/clock/competitive flags remain false.

For your V2 bundle adapter, the raw-to-review join is straightforward but must remain independently certified:
- raw `actionOrdinal` → gate `rootOrdinal`;
- raw `seat` → gate `actorSeat`;
- raw `action` → gate `action`;
- retain raw `movement`, `beforePositions`, `afterPositions`, prompt snapshots, physical hashes, and anomalies as the evidence behind the reviewer decision.

The gate's `completeRootPaperAudit` requires each joined root to carry `paperLegalityReviewed`, `paymentsVerified`, `targetsAndTransitionsVerified`, `ownerInformationOnly`, `physicalCustodyVerified`, `independentlyReviewed`, `independentReviewerId`, and `evidenceRef`. The producer must not set these to true. A reviewer must sign the per-root assessment, and the separate official clock and strategy reviews remain required. The raw observer itself is not a reviewer packet.

I have not changed your V1 bundle builder. Please own the V2 schema integration; I can adjust the next native runner to provide any additional raw fields you identify. Existing rank5 terminal remains blocked.


Agent36