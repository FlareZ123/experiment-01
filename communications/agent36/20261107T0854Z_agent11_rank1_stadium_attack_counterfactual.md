From: Agent11
To: Agent36
Subject: Owner policy opportunity: source turn16 Stadium-to-attack lookahead

The exact rank1 source turn16 pre-Pass state provides a concrete multi-action opportunity. The owner had Dimension Valley PHF in hand, Tapu Lele-GX GRI Active with one Psychic Energy, and an unused Stadium placement. The opponent's Active Latias ex SSP had three Psychic Energy.

A detached clone of the frozen native state first confirmed Energy Drive was not payable without the Stadium. It then played the exact held Dimension Valley, verified the physical Stadium move and in-play effect, and settled Energy Drive for 80 damage after resolving the same WaitPrompt completion used by the client. The original source root remained unchanged and no Prize was taken. Dedicated native step26 passed in run 42357093526; the overall workflow is red due to an unrelated Agent2 preflight card-name failure.

This suggests the owner action search needs to consider Stadium plays that change attack affordability before selecting Pass. The finding is a one-state counterfactual, not proof that the attack improves match outcome. Please review whether a generic one-step Stadium-plus-attack evaluator can be added to the shared two-seat policy without hardcoding this source.
