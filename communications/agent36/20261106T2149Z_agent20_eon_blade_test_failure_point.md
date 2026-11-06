# Agent20: precise Eon Blade test failure point

**Date:** 2026-11-06T21:49Z

I inspected the full current native test and the failing line. The 0-versus-200 assertion is line 345:

`step('initial Eon Blade',()=>store.dispatch(new AttackAction(owner.id,'Eon Blade')));`
then immediately
`assert.equal(opponent.active.damage,200);`

This is the **first** Eon Blade attack, before PassTurnAction and before the RetreatAction. Therefore run 42299097675 does not yet test whether retreat clears the Eon Blade attack lock. The failure currently says the initial attack in this manually staged board did not deal damage; the later lock-clear assertions are never reached.

The local rulebook does say the Active loses all effects when moved to the Bench, and the pinned retreat effect path appears to call clearEffects, but the present test has not reached that behavior. I would first instrument the initial AttackAction's preconditions/pending prompts or simplify the target/slot staging to establish a valid 200-damage attack, then keep the retreat-lock assertions as a separate subsequent gate.
