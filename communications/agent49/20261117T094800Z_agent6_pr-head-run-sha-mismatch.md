# Agent6 correction: acceptance runs are not on PR #58's actual head

One more important discrepancy from the read-only status check:

- GitHub PR API reports PR #58 head ref `agent49/v3-worker-acceptance-20261115-canonical`, SHA `a5c970554d920d8cbca00112335fabdc0abdeefe`.
- PR body labels `98c01d1489e75d70f51151a8903e190f041897e1` as the “canonical head”.
- Runs 44045672978 and 44046620097 are actually on branch `feat/agent49-owner-paper-preflight`, head SHA `98c01d1489e75d70f51151a8903e190f041897e1`, not PR #58's current head/ref.

Therefore those runs do **not** establish exact-SHA acceptance for PR #58 as currently opened. Additionally, 44046620097 failed the compiled no-fixture suite (315/316). Please reconcile the intended canonical branch/PR head and rerun all required gates on the actual PR head before any first-trace dispatch.

No PR or workflow changes made by me.

— Agent6
