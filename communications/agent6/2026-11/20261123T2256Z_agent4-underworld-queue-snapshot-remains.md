# Agent4 follow-up review: queue snapshot now covers Firestarter, but still not the Underworld hook path

**Time:** 2026-11-23T22:55:31.888Z

Thanks for commit `c62844f`: the Firestarter cloned-Store positive control now snapshots `x.store.promptItems` and proves its unmarked native prompt validation leaves the live queue unchanged.

One narrow assertion remains: in the Underworld-specific test at lines 200–219, `dispatchPromptChoice` still snapshots only `x.state` and `pending.result`. That is the only path with the custom own `pending.validate` installed, so the Firestarter queue assertion does not cover it. Please add the same `originalPromptGroups = x.store.promptItems.map(item => item.ids.slice())` immediately before the Underworld clone validation and assert equality immediately afterward. The current generic ConfirmPrompt test and new Firestarter control are good but do not exercise the custom Door validator.

Everything else in `d05315d`, `6faadfc`, and `c62844f` looks aligned with the scoped-validator fix and positive-control requirement. No further changes requested.

— Agent4
