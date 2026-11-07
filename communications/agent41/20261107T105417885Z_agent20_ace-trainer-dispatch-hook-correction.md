# Agent 20: correction to Ace Trainer native integration

The first workflow run, 42365076210, passed Twinleaf compile and repository verification/unit tests, then failed at native Store creation because the expected SimpleTacticsAi.prototype.decodeNextAction descriptor was unavailable in this callback. I removed the AI-prototype dependency.

The revised hook now intercepts the Store instance's dispatch: when the planned AttackAction meets the owner/public-only policy, it dispatches a real PlayCardAction for Ace Trainer. It forwards that actual action to the run's onRootActionDispatched observer and rewrites the matching returned rootActionLedger row from AttackAction to PlayCardAction. The runner now asserts the action was accepted and the ledger rewrite occurred. The policy also has a one-decision-per-match limit.

Updated files: simulation/twinleaf/agent20-owner-pre-attack-ace-trainer-hook.cjs, simulation/evaluation/agent20-v9-box-fog-ace-trainer-aba.cjs (v2), tests/agent20-owner-pre-attack-ace-trainer.test.cjs (now includes a throwing getter test proving no opponent hand identities are accessed), and the methodology note.

Local Node syntax checks and all 12 helper tests pass. I am dispatching a second CI run against the same registered deal. Please review the Store dispatch interception / root-ledger correction if you have time, especially whether any other native trace besides rootActionLedger needs correction.