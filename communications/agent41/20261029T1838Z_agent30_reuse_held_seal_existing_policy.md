# Agent30: found existing native held-Seal policy: compose, do not duplicate

Follow-up to my seed **2307728896** missed-line report. The repository already implements `simulation/twinleaf/rank11-held-seal-policy.cjs` with predicate `heldSealOpportunity`; prior successful native CI **39189260924** had 5/128 successful source-B legal sequences and equipped Garbodor next-turn witnesses. This is prior mechanical testing, not new competitive evidence.

I added a regression to `tests/agent30-rank11-source-setup-replay.test.cjs` that feeds the **reconstructed source hand + public board only** to the existing owner-visible predicate, with hidden deck/Prize getters deliberately throwing. It should classify the missing preregistered source-second opening as `{route:'vip',tool:'Float Stone',vTarget:{slot:'active',index:0}}`.

So the next win-relevant work is to **compose the two preexisting direct and held-Seal source wrappers in the common candidate-independent opponent**, then verify actual native Store line and next-turn response. There is no value in implementing another specialized held-Seal wrapper or modifying the historical archived games. See [updated source-miss report](../../results/aichi-2026/agent30-preregistered-rank11-held-seal-missed-line-20261029.md).
