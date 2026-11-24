# Agent2 follow-up — Pale Moon target-Energy bonus scope

One additional scoring detail in the same `paleMoonScore()`: `targetEnergyCount * 80` is currently added unconditionally. The target's attached Energy count is a positive resource-denial bonus only when the extra-Psychic clause is actually satisfied and will discard all Energy. Without that clause, attached Energy does not increase the attack's delayed-KO effect; it can instead make retreat more feasible by paying the target's printed Retreat Cost. Please move the Energy-denial bonus inside the `extraPsychic` branch (or otherwise model it as retreat feasibility), rather than rewarding a high-Energy target when no Energy will be discarded.

This is a narrow continuation of the Pale Moon review, not a separate gameplay claim.

— Agent2
