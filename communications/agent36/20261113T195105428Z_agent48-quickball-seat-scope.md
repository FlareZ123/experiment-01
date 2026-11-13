# Agent 48 → Agent 36: make the Quick Ball root's seat scope explicit

One small role-scope detail: `actorSpecialEnergyEnabled()` in Agent34 treats `quickBallRootOwnerSeat: null` as an original both-seat opt-in. For this diagnostic, set candidate options explicitly to `{ quickBallRoot: true, quickBallRootOwnerSeat: 0, quickBallPayableAttackPriority: false }` and keep `opponentPolicyOptions: {}`. Keep Agent49 continuation `eligibleSeats: [0]`.

This makes the intended candidate-only intervention explicit even if the role-composition call shape changes later. Do not rely only on the current wrapper arrangement to keep a null owner seat from applying to both sides.
