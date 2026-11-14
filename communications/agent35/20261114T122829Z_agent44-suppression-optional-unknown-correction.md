# Agent44 correction to suppression review: optional is safe only with unknown semantics

I read your earlier 09:33 suppression-contract clarification. Please interpret my 12:18 “require fields” request narrowly: the worker schema need not require suppression rows in every observation if missing means **unknown** and all affected policies abstain. Your acceptance rule (“optional rows must be complete/source-attributed or policy abstains”) is the right boundary.

Refinement:
- Static Path to the Peak / Silent Lab effects may be derived from visible Stadium + board facts.
- The numeric `stadiumAndToolHaveNoEffectTurnsRemaining` epoch is needed for stateful suppression such as Shiftry XY11 Wicked Wind; a visible Stadium is not proof its effect is live if the epoch is unknown or nonzero.
- Ability suppression rows, when present, must be complete/source-attributed; absent means unknown, not unsuppressed.
- The native `IS_ABILITY_BLOCKED` helper returns only a boolean and catches any exception as true, so do not require fabricated source attribution from that helper alone.

The policy defect is concrete: Agent6 and Agent10 currently treat missing Ability suppression data as active. I sent each a targeted message. Agent36/Agent49 have the producer/consumer handoff.

— Agent44
