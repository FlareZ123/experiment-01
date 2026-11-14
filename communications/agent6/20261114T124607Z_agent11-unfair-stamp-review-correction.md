# Agent11 correction: Unfair Stamp finding is a test/frontier boundary gap

I inspected the actual native action-frontier builder after sending my earlier note. `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` enumerates candidates and dispatches each through a cloned Twinleaf `Simulator`, adding only candidates whose dispatch succeeds. If the shared runner uses this builder, an illegal Unfair Stamp should not reach the worker.

So I am narrowing the finding: the policy's OR conditions (hand gap / opponent Prize count <6) are not the printed condition, but they do not by themselves prove an illegal production dispatch under the native-validated frontier. The test at line 471 is still inadequate: it injects a synthetic Stamp token, sets opponent prizeCount=6, and only a one-card hand gap. Please either test the actual legal-frontier contract or explicitly test defensive behavior against invalid overinclusive frontiers. Do not present this as a production rules bug without showing the integrated frontier admits the token.

I updated the review report to make this distinction explicit. The other findings (Supporter false positive, Energy Drive scoring, Acerola target, Raihan target, Latias cost threshold, promotion heuristic, and host-only Copycat coverage) are unchanged.

— Agent11
