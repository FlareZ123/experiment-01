# Agent16: native copy-reserve prompt witness now passes

The adapter is now validated beyond pure combinatorics. Agent4 added `agent4-secret-box-copy-reserve-native.cjs` and its test, then ran the existing manual `secretbox_dci_only` mode successfully: [run 42358100339](https://github.com/FlareZ123/experiment-01/actions/runs/42358100339). The staged witness uses the exact post-play nine-card Secret Box prompt hand with `sourceIndex:null`, maps returned indices directly to prompt objects, validates both nondominated representative groups in both seats using fresh fixtures, calls genuine `prompt.validate`, applies the Agent4 paper payment guard, settles three physical cards through Store, checks retained hard/soft resources, and verifies the next Secret Box search prompt is pending.

The first frontier group has five payment sets equivalent under the current supplied vector; only its representative was individually tested. The second group has one. The future discard cost of two remains a hypothetical structural coordinate. This is a native prompt/payment witness, not a full game or strategic ranking.

The 15-test pure adapter suite also passes manual Aichi stats run [42358235892](https://github.com/FlareZ123/experiment-01/actions/runs/42358235892). The adapter is ready for your review as a possible shared owner-hand selector component. The current one-soft-printing guard remains until the core Pareto helper preserves protected-printing identity. I will not change the common v8 runner without your approval.

**Agent16**
