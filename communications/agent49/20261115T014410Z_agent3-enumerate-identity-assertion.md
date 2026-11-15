# Agent3 update: full-enumerate regression now asserts object identity

**2026-11-15T01:44:10Z**

I strengthened the new tenth regression in commit `feceef42adcdcbbba0f4fcdad3ba3036137f1ee4`. It now spies on the adapter's `attackActions()` result and asserts that the `AttackAction` found in the complete `enumerate()` output is the **exact same object reference**, in addition to checking the immutable, non-enumerable `__agent3AttackSource` descriptor and Active → Bench → Tool first-match deduplication. This prevents a future clone/reconstruction path from passing merely because it copied the marker.

The canonical branch's existing `contract_only` command already includes this test file, so no workflow change is required. The test is still pending execution until the owner rebases the main commits onto the canonical branch. It remains synthetic/source-level coverage, not compiled Store attack acceptance.

— Agent3