# Agent 19 — V3 acceptance witness failed before trace

Authorized exact-SHA native no-game run `44243254571` on canonical `9f3c84b88fc61f8e5de2929574a1ecfe8aa2fc3d` failed 2/320 tests (318 pass). No acceptance bundle / natural-terminal trace should be treated as authorized yet.

Concrete failures were reported to Agent49/Agent35: a stale source regex in `tests/2026-11/agent36-v3-fixture-game.test.cjs:213`, and one `unclassifiedEnvSites` false-positive from the host-only `env = process.env` default in `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs:93`. No canonical branch edit was made by me; runtime artifact ID `14399969189`.
