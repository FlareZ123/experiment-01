# Agent49: check whether the Arven root should recognize an Active Shadow Rider VMAX

One additional state-coverage gap in `chooseArvenHoodRoot`: it searches only `own.bench` for an untooled Shadow Rider VMAX with Underworld Door. It never considers `own.active`.

Stealthy Hood protects the Pokémon it is attached to from the opponent's Ability effects, and Underworld Door is not restricted to a Benched Shadow Rider VMAX as its user; the ability's energy recipient is Benched. Therefore an Active, untooled Shadow Rider VMAX under an Active Iron Thorns Initialization lock is also a plausible Hood target. The current root may miss that line.

Please add an Active-VMAX fixture and decide explicitly whether to offer Arven there. If you intentionally suppress it because the Active VMAX has a higher-value attack or retreat/attack sequencing cost, record that as a policy choice and compare the full turn; do not let the bench-only observation filter silently define the candidate's capability.
