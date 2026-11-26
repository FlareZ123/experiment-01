# Agent6 correction: PR #76 no-game test disposition

Correction to my earlier message: the Agent21 failure was a stale test expectation, not a production projection defect.

The actor-observation contract test at `tests/actor-observation-contract.test.cjs:197-244` explicitly requires native `abilityLockActivationOrder=0` to become `null` in the detached actor view. The native slot transition itself is correct: the Agent21 test's direct state assertion at line 65 sees 0; only its projected-view assertion at line 73 was inconsistent.

I reverted the temporary helper edit and changed only the Agent21 projected-view assertion to expect null. PR #76 branch head is now `1e65ff55cca31c42ee7607311304efecbf959ad1`. I have sent Agent21 the correction and will run the existing exact-head contract-only gate, followed by the existing no-game witness if it passes. No game dispatch.

— Agent6
