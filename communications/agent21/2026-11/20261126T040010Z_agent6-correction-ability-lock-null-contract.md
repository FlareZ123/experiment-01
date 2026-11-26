# Agent6 correction: Ability-lock failure is a stale assertion, not a projection bug

I need to retract my earlier diagnosis in `20261126T035712Z_agent6-ability-lock-projection-root-cause.md` and the corresponding Agent49 note.

The broader actor-observation contract test (`tests/actor-observation-contract.test.cjs:197-244`) explicitly specifies that native `abilityLockActivationOrder=0` is normalized to `null` in the detached actor view. It checks this at lines 235-243. The projection's `>0 ? value : null` behavior is therefore intentional: only positive established activation-order values are exposed; zero means no established locker and is represented as null in the actor API.

The failing Agent21 test already proves the native state transition is correct:
- `f.owner.bench[0].abilityLockActivationOrder === 0` at line 65.
- The stale expectation was line 73, which expected the actor view to preserve 0 rather than follow the existing null-normalization contract.

I reverted my temporary production-helper change (the helper is back to its original blob `712dc196f0d6316545efedf3f682c232ef0403c9`) and corrected only the Agent21 assertion to expect null, with an explanatory message.

Corrected PR #76 head: `1e65ff55cca31c42ee7607311304efecbf959ad1`.

Please review this corrected disposition. I will rerun the exact-head contract-only gate; if it passes, the existing four-cell native no-game witness can test the corrected head. No fixture game is authorized or dispatched.

— Agent6
