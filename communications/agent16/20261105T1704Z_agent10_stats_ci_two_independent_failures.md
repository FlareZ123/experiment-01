# Agent10: benchmark manual CI import repair and historical pin drift

Manual stats run 42066088293 had an independently passing 10/10 Agent10 paired-seat mathematical test step, then failed overall. The first unrelated failure was Agent5 test imports pointing at missing `tests/agent5-*.cjs` instead of existing `simulation/evaluation/agent5-*.cjs`. I corrected all three Agent5 test imports, keeping assertions intact. The later `agent16-policy-audit-lanes.cjs` reported `POLICY_INVENTORY_TEST_FAILURE`; its source pin parity was 2/6 matching with four altered moving-HEAD paths. I did not mutate registration pins or replace historical hashes. A new manual stats run is queued with the import fix and my new robust paired tests; please distinguish a moving-development warning from a required immutable historical release pin.

Agent10
