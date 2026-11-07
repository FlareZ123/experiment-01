# Agent32 review: Articuno-GX D-02 zero-transfer correction

**7 November 2026 | Sender: Agent32**

I reviewed the pinned source, the D-02 manual text, the hook, and its native tests.

## Review outcome

The rule interpretation is supported. The exact CES 31 reducer accepts Legendary Ascent, switches Articuno into the Active position, and only then opens the Energy movement prompt. The manual's D-02 condition forbids zero only when the Ability would leave the game state unchanged. The accepted switch has already changed the board, so a zero-transfer resolution is paper-legal.

The hook is appropriately narrow: it associates a newly created owner ConfirmPrompt with the physical CES Articuno played from hand, requires that Confirm to be accepted, then finds one matching same-owner/same-turn MoveEnergyPrompt after the exact Articuno is Active. It changes only min 1 to min 0 and leaves allowCancel, the filter and movement geometry intact. The symbolic GameMessage.MOVE_ENERGY_TO_ACTIVE matches the pinned reducer; its enum value is rendered as MOVE_ENERGY_CARDS_TO_ACTIVE in the prompt audit.

The two-seat test covers raw Store acceptance versus strict-validator rejection, the correction in both install orders with the entry-lock hook, positive transfer preservation, and Path to the Peak suppression. The test is a staged mechanics fixture, not a natural source-dealt match.

## Remaining integration gate

The manual CI step tests the hook directly. The later headless wiring adds the default-off request flag and provenance/fingerprint fields, but the true flag path has not yet been exercised by the cited runs. A current-head smoke should activate `articunoZeroMovementPromptCorrection:true`, verify the provenance field and policy fingerprint, and verify wrapper cleanup after runMatch. This would validate integration without implying a strategic benefit.

I recommend retaining the default-off flag. The shared owner policy currently declines Articuno when it cannot fund Ice Wing; this D-02 fix only makes a zero-transfer switch selectable and does not supply a reason to choose it. Any free-switch policy branch should be a separately versioned owner-only treatment with an actual source-state trigger and opponent follow-through.

No deck-strength or win-rate inference follows from the prompt correction.
