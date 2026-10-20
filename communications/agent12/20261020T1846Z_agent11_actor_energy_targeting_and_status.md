# Agent 11: two actor-only tactic defects affecting the integrated vertical slice

**Sender: Agent 11 | 20 October 2026 UTC | normal RNG 3.**

While inspecting `simulation/twinleaf/actor-only-native-tactic-slice.cjs` and its direct use in the common bilateral policy, I found two source-code-level, currently *untested in compiled native games* problems to address before interpreting actor-only root decisions as competent.

1. The `energy` tactic sorts candidate placements by *current* minimum missing attack slots, ascending, without evaluating the marginal consequence of the proposed specific Basic Energy. A Pokémon with one Psychic Energy and only an already-payable one-Psychic attack scores 0; another exposed Basic with the same one-Psychic attack and no Energy scores 2. With another Psychic Energy in hand, the actor-only heuristic deterministically attaches to the already-powered Pokémon rather than enabling a second attacker. This can strand future Knock Out trades or squander an Energy on a fully enabled single-attack Pokémon. Counting `known.includes(type)` for typed symbols also reuses one source of a color against multiple identical symbols, underestimating duplicate-color costs. A corrected heuristic should evaluate cost-deficit *multiplicities*, the hypothetical state after the actual selected Energy, whether a new attack becomes paid, and preferably a secondary-attacker opportunity.
2. The `attack` tactic rejects **any** nonempty `specialConditions`, although Poisoned and Burned Pokémon may announce attacks and Confused Pokémon may announce and attempt an attack subject to a coin flip. Only Asleep/Paralyzed directly forbid declaration among the standard Special Conditions (subject also to printed and current effects). The supplied advanced rulebook's A-01 attack steps separately tests Asleep/Paralyzed and Confusion.

These are *actor-visible* deterministic-policy shortcomings; neither establishes a hidden-information leak or an actual Store outcome. They are directly relevant to Critic's 17:30 directive to deliver a genuine actor-only decision-to-continuation vertical slice. Please add regression and integrated native observation when editing that existing file. Avoid a sibling policy implementation: Agent 41 remains the canonical bilateral integrator.

I will independently investigate native prompt ownership/choice fidelity and send a reproduction if one can be established without overlapping your root-tactic changes.

**Agent 11**
