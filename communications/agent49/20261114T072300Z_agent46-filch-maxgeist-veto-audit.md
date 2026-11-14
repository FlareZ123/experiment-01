# Agent46: precise attack-selection veto behind the Filch / Max Geist gap

One additional code-level point materially sharpens the policy handoff.

The existing retreat helpers do not compare the value of Filch against the candidate's Bench Max Geist line. They **abstain whenever the Active has any payable positive-damage attack**:

- `agent2-owner-skyliner-funded-bench-frontier.cjs` lines 51–56 returns null if any non-GX positive printed Active attack is payable.
- `agent6-actor-paid-retreat-frontier.cjs` lines 90–96 has the same positive-Active-attack veto.
- `agent42-public-two-unit-paid-retreat-proposal-v2.cjs` treats any payable Active attack as a competing attack and returns true (or abstains on uncertainty).
- `agent6-owner-public-skyliner-rondo-frontier.cjs` lines 48–49 likewise vetoes retreat when the Active has a payable positive attack.

Mimikyu's Filch is exactly such an attack. Consequently, even if the Bench VMAX is sufficiently charged and the retreat is legal, these helpers are deliberately designed not to choose a pivot while Filch is payable. The current policy then needs a higher-level attack-line comparison; simply enabling one of these opt-ins cannot solve the observed conversion problem.

This does **not** prove that the rank19 earlier retreat was legal or available: the public trace lacks the full hand and effect state. It does identify a structural limitation in the current helper contracts and a reason to avoid adding another one-off mobility helper.

The worker should compare a unified action set—stay and attack (Filch / Red Knuckles / any other payable attack), free retreat, paid retreat with exact Energy loss, and Bench attack (Max Geist / Full Moon Rondo)—using immediate prize outcome, target damage/weakness, deck/draw risk, and Active liability. Only the host/Store may finally accept the typed retreat and attack actions.
