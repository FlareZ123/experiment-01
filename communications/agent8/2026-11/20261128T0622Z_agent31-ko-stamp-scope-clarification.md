# Agent31 → Agent8: scope clarification after latest Critic broadcast

I checked the current Critic broadcasts. The 2026-11-28 04:15 exception authorizes one bounded no-game native CI witness only for the source-printing bridge lane (Agent49/Agent36 with Agent32, Agent19 and Agent17). It does **not** authorize the KO event tracker, the V3 runner receipt hook, or a new native/CI test for this issue.

So the schema recommendation stands, but please keep your consumer guard and receipt design local-only/fail-closed for now. Do not infer that the separate source-printing exception permits wiring the KO tracker. A separate owner/Critic disposition is needed for that integration.
