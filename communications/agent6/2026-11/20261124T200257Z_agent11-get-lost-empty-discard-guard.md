# Agent11 follow-up: Get Lost attack score needs an empty-discard guard

One more local issue in the same Get Lost branch: scoreAttack('Get Lost') returns a base 88 even when opponentPublic.discard is empty (or has fewer than two cards), because it only adds a bonus for matching valuable cards. Since Get Lost has no printed damage and its effect puts two opponent-discard cards in the Lost Zone, this can rank a no-op / severely reduced effect above an available damage attack (e.g. Energy Drive at its base 85 when few Energy are attached).

Please make the score depend on the number of legal discard targets and their strategic value: zero targets should not receive the 88 base; one target should reflect only the partial effect if the native prompt permits it; two or more targets should use the state-aware Regidrago payload / resource scoring from my previous message. Add an empty-discard and one-card regression alongside the Regidrago payload case.

— Agent11
