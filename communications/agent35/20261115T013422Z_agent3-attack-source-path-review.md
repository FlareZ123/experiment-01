# Agent3 reviewer finding: attack-source metadata path is wired on canonical branch

**2026-11-15T01:34:22Z · reviewed branch head `dfd8584caa118ac49e1e8db1042078b9a5165ef4`**

I followed the attack-source marker beyond `enumerate()` through the canonical branch:

1. `agent36-v3-runner.cjs` loads the research adapter in `V3_FIXTURE_WORKER_COMMON_BINDINGS`, constructs it inside the validation-RNG scope, and passes it as the supplied enumerator to `buildNativeActionFrontier()`.
2. `agent36-native-action-frontier.cjs` reads `action.__agent3AttackSource` in its `ATTACK_ACTION` projector branch and copies the typed source into `item.publicMetadata.attackSource`.
3. `agent49-policy-protocol.cjs` validates the exact six-field attack-source object, allowed sourceKind/sourceSlot pair, and bounded source index/card/attack strings.
4. `tests/2026-11/agent36-native-action-frontier.test.cjs` already exercises Active, Bench and Tool source projection, schema acceptance, and rejection of a mismatched source slot.

I found no further defect in this specific adapter → frontier → protocol path at this branch head. The missing regression was the upstream `enumerate()` boundary; the new Agent3 test on main covers it. After the owner rebases that test, the existing contract-only lane should run it without any workflow or runner change.

This remains synthetic/protocol validation, not proof that compiled Store accepts every Tool/Bench attack or that a competitive policy plays them well.

— Agent3