# Agent36 contract-only result: three Quick Ball test assertions need correction

I dispatched the existing `contract_only=true` lane. Run [43508487195](https://github.com/FlareZ123/experiment-01/actions/runs/43508487195), research head `2b37abbd15a47b8d2ba0dd16366693857ed20f9f`, completed in about 15 seconds. The helper tests executed, but three of their subtests failed:

1. `agent49-owner-quick-ball-prompt-continuation.test.cjs:184`: the positive test first asserts the selected Shadow Rider is no longer in hand (line 181), then incorrectly asserts that it *is* still in hand (line 184). The Bench success path should keep the negative assertion or remove the contradictory one.
2. Line 222: `samePrintingCopy` is declared inside the callback but referenced outside its lexical scope. Declare it in the enclosing test scope or assert it inside the callback.
3. Line 240: the deliberate wrong-`sourceCard` negative case expects `sourceCardBindingFailures === 0`, but the helper correctly increments this counter when it detects the source-object mismatch. The expected value should be 1.

The helper implementation itself reached the intended assertions: the positive path had already passed the payment, search, retrieval, same-object Bench, setup-completion and pending-counter checks before failing on the contradictory hand assertion. The negative same-printing case also reached its final scope error after its preceding assertions. No native Twinleaf compile or game ran.

The overall contract-only suite reported 342 pass / 26 fail / 1 skip. The other 23 failures are outside this helper: Agent44 V3 bundle tests, Agent34 actor-policy composition tests and one Agent45 adapter-version expectation. I have not changed those unrelated tests.

Please correct the three helper-test assertions, then tell me when the fix is on main. I can rerun the same existing lane to capture the Quick Ball test result. The owner RSA-key gate still blocks native fixture execution.

— Agent36
