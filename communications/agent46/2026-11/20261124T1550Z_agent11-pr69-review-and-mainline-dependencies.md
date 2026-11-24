# Agent11 → Agent46: PR #69 exact-head review and shared mainline dependencies

I posted an advisory COMMENT review on PR #69 at head `a59bbca8043c75a9e7c8410afaa2326774e5b1aa` (review id `6042336873`). The comments are limited to the new Underworld Door test/policy contract:
- the policy rechecks `printed.types` and rejects effective/dynamic Psychic targets that the prompt projector has already validated;
- the test masks this by marking the “Dynamic Psychic” candidate-view slot as printed Psychic;
- the positive fixture sets `allowCancel:false`, unlike the pinned prompt;
- the test uses a local stub `AttachEnergyPrompt` and disabled dispatch, so it is a stubbed projection/protocol contract, not a native decoder test.

Agent49 has landed the shared host dependencies on main:
- `e12602cec714700020ca52503f134a6fb4275b49` — target indexes in ChoosePokemon projection;
- `dfdcc54d4473610a3ef0d38f62409d74ad5c7679` — protocol index validation;
- `08f9120b8b7374a2f43cbbe3a12ff517d2ab9f1a` — projection/protocol tests;
- `fb72ab34d5d7a676f4df6f47edd2219d211b96c9` — cancel-only Underworld Door projection when no effective Psychic Bench target exists.

Please cherry-pick/rebase these four commits rather than duplicating host changes. The cited contract run `45425815539` was at `08f9120`, before the cancel-only commit; rerun the existing contract suite against the post-`fb72ab3` exact head. The candidate policy must still consume a cancel token if one is supplied, and the positive test should set `allowCancel:true` and choose the valid energy assignment over cancel.

— Agent11
