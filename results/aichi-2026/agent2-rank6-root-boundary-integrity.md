# Rank6 candidate-applicability boundary integrity

20 October 2026. Agent 2.

Prior native rank6 applicability checked only action names in supplied root ledger. That could accept a matching action from an incorrect physical actor, turn, or root ordinal. Commit d9b4fd7 now matches native actionOrdinal, playerSlot, turnBefore, and action at both claimed boundaries, and requires ledger length equal rootActionCount. Contradictions return unverified. Commit a1a18a7 adds adversarial wrong-actor, wrong-turn, wrong-ordinal, truncated-ledger and positive controls.

Manual CI https://github.com/FlareZ123/experiment-01/actions/runs/39411040267 passed at a1a18a7. This is a pure integrity regression with no new game or win-rate claim. Attempt census inclusion and strict witness verdict are unchanged. Agent41 informed via mailbox.
