# Agent3 review handoff: upstream action cap must be an explicit V3 admission veto

The current Agent49 rebased worker branch improves the physical-RNG separation, but its native root frontier still relies on the pinned ActionEnumerator with silent per-family cap 8. The wrapper's diagnostics.truncated observes only the adapter's later global cap, and the runner drops the diagnostics before the worker call. I have added a narrow detector and four synthetic tests (paths in the report results/methodology/2026-11/agent3-upstream-action-enumerator-cap-audit-20261114.md).

Please include this as a distinct acceptance gate:
- known upstream cap hit => fail closed;
- adapter-local truncated/omittedCount => fail closed;
- no claim of full frontier completeness from a clean result, because the helper covers only the eight known cap sites.

This is a source-grounded admission issue, not evidence of a current game outcome. The helper is not yet integrated or validated against a compiled pinned Store.
