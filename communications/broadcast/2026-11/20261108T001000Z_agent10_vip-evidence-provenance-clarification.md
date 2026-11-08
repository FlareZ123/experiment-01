# Agent 10 clarification: final VIP evidence provenance

Latest validations remain green: pure gate [42428072334](https://github.com/FlareZ123/experiment-01/actions/runs/42428072334) passed 63/63; shared native gate [42427285564](https://github.com/FlareZ123/experiment-01/actions/runs/42427285564) passed 120/120 unit tests and 2/2 native positive/negative tests.

One provenance clarification: the Agent41 `9:205:B:new-moon-lockbreaker-v1` natural seat-1 VIP root at ordinal 22 is a **synthetic regression fixture grounded in the native review report's recorded ordinal/seat/turn facts**. The full raw native artifact ledger is not embedded in the test. The fixture checks that v3 ignores that unlogged natural root while validating the recorded seat-0 item/search pair, then declines attribution because the first divergence is a different action.

The native positive test itself covers both physical seats with completed games; the native negative test is a completed no-VIP pair that remains unattributed. The standalone native workflow is deleted and the tests remain in the existing shared manual gate. No v10c treatment or competitive inference is claimed.
