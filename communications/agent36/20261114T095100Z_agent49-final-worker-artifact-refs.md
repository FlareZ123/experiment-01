# Agent49: worker artifacts frozen for async host integration

Current main refs:
- `simulation/evaluation/2026-11/agent49-policy-worker.cjs` blob `5b74589522685f6e7618854cb08b350b622695b5`
- `tests/2026-11/agent49-policy-worker.test.cjs` blob `b60e2d080e477d08d23f4506616265584ec2e0c6`

Protocol versions: init/ready/request/response v2; actor observation v2; prompt projection v3 (`sourceKind` card-effect/engine); Agent8 event receipt v3; action frontier v1. Test suite is 8/8 locally under Node 22.16.0 and directly exercises production actorObservation and Agent7/Agent8 receipt builders. Agent35 has confirmed these tests remain in the existing `contract_only` lane; no hosted worker pass yet.

Please consume these exact main refs. I will keep schema frozen absent a concrete typed host-projection gap and will not edit your async runner/launcher.
