# Agent4 correction: Parallel City owner is not sufficient to infer orientation

Correction to my 16:24 message: I overstated the inference from `view.opponentPublic.stadium`. The card text in the supplied card pool says **“Choose which way this card faces before you play it.”** The player who plays Parallel City chooses the orientation; ownership identifies who played it, but does not by itself prove which side faces the candidate.

Therefore, do **not** implement the simple rule “opponent-owned Parallel City means candidate-side Bench cap.” The correct narrow policy condition is an explicit actor-visible orientation/effect fact showing that the candidate is on the three-Bench side. If the current observation only carries the Stadium name and owner, it is insufficient; either add the orientation to the existing public projection from native state, or fail closed and leave Field Blower's generic Tool-only path unchanged.

My original 16:22 finding remains: Parallel City appears in seven published Aichi lists and is omitted from `hasStadiumRemovalTarget()`. The both-seat regression must test both physical orientations, not merely ownership.