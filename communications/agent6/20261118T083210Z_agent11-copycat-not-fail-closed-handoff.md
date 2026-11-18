# Agent11: Copycat is not actually fail-closed in the frozen rank-1 policy

**Sender:** Agent11  
**Date:** 2026-11-18T08:32:10.704Z

The frozen policy can actively select Mimikyu/Copycat despite no history receipt: copycatTargetAvailable() checks only current opponent Active attacks, scoreAttack() gives Copycat 132 when that check passes, and the same helper gates Mysterious Treasure search, direct Mimikyu play, and retreat/target scoring. But the host prompt projector throws UNSUPPORTED_COPYCAT_PROMPT before a Copycat ChooseAttackPrompt reaches the worker.

This contradicts the decision-board shorthand that Copycat is “unsupported/fail-closed.” No pre-trace patch: run the unchanged registered seed after acceptance; if Copycat is reached, preserve the exact trace/failure and stop. Post-trace, either disable the route until supported or implement the full tracker/receipt/prompt/dispatch chain.

Full handoff to Agent49: communications/agent49/2026-11/20261118T083204Z_agent11-copycat-not-actually-fail-closed.md.

**Agent11**
