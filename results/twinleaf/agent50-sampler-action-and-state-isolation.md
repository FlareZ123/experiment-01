# Agent 50: detached sampler State/action alias closure

**18 October 2026. Research diagnostic and preventive correctness guard.** This change tests a narrower technical precondition for hypothetical policy evaluation. It establishes no card-strategy result, competitive game, or new Aichi matchup win.

## Falsification question

The detached hidden-deck sampler previously rejected clones retaining an original **Card** object, but allowed other mutable objects reachable from the original **State** to be shared. It also passed the same mutable hypothetical **Action** instance through every sampled world. A clone that shares non-Card state metadata or a speculative evaluator that mutates action fields can therefore couple independent hypothetical evaluations or change the caller's real state/action despite making detached Card instances.

These are source-code-level hazards for a claimed detached diagnostic, rather than demonstrations that pinned Twinleaf's currently configured source-dealt policy exercises them.

## Change

In [the existing sampler](../../simulation/twinleaf/detached-deck-sampling.cjs), enumerate reachable mutable object identities from the live State using descriptor-based traversal (including array, Map and Set members), and reject original objects reached through inherited prototype chains as well. Refuse any duplicate original object identity found in a hypothetically cloned State. Independently inspect the proposed Action and reject direct references to mutable objects of the original State, consistent with the hook's documented **index-based action** prerequisite. Give every hypothetical evaluation a separately cloned Action, and reject any shared Action/State objects in that action clone.

This preserves the existing K0 and K1 sampling distributions, canonical deck/prize ordering, fixed-seed random streams, complete-sample handling and default no-hook gameplay behavior. It adds clone work and stricter validation to **opt-in** diagnostic scoring; callers whose action representation cannot be cloned faithfully should fail closed rather than silently reuse its mutable identity.

The existing `isCard` option stays accepted for caller compatibility; graph-isolation checks now cover all mutable State objects rather than only Card instances. This is a reference-identity guard, **not** a guarantee that a clone faithfully implements all proprietary class semantics, that inherited accessors or functions are safe, or that a policy sees only legitimately observed information.

## Regressions

[Six additional Node tests](../../tests/twinleaf-detached-deck-sampling.test.cjs) intentionally supply:

1. a shared non-Card `metadata` reference and assert rejection **before** speculative evaluation or original-state mutation;
2. an action with mutable nested `target` fields and an evaluator that mutates them, verifying a fresh action every world and no mutation of the caller's action;
3. an action holding an actual live State deck reference, checking rejection as inconsistent with index-based action semantics;
4. an action clone that retains its original nested target, checking rejection before any speculative evaluation;
5. a State clone with a live original metadata object in its prototype chain;
6. an Action clone with the live original target object in its prototype chain.

**Evidence status:** GitHub commits `6fb6cbc1`, `e5561c8c` implemented the base checks and four regressions; [manual pinned-engine run 39142464266](https://github.com/FlareZ123/experiment-01/actions/runs/39142464266) at head `c530a0e5` **passed all 38 steps**, including the synthetic isolation step and the pinned source-ranked detached sampler. Commits `0ed1a329`, `6dac1f35` added inherited-prototype alias detection and the final two tests. A new [manual pinned-engine run 39142857200](https://github.com/FlareZ123/experiment-01/actions/runs/39142857200) includes that later version and remains **pending** until the immutable run conclusion is verified. The pinned upstream submodule is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Scope and follow-up

A successful run would establish these four artificial alias cases and the existing regression suite under the run's pinned build. It would not establish that a natural Aichi source root contains such an alias, nor certify policy quality, Prize epistemics, or a 99.5% win rate. The next higher-value check is an actual source root with nonzero hypothetical tactic evaluations, authenticated real action and a before/after **whole-State object-graph** mutation witness, keeping proposals, dispatched action and resolved game effects separate.

**Field-status preservation:** 29/32 exact opponent lists and zero independently qualified competitive games.
