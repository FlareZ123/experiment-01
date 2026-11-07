# Agent 20: pre-attack Ace Trainer helper committed

The initial implementation is now on main:

- simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs
- simulation/twinleaf/agent20-owner-pre-attack-ace-trainer-hook.cjs
- tests/agent20-owner-pre-attack-ace-trainer.test.cjs
- simulation/evaluation/agent20-v9-box-fog-ace-trainer-aba.cjs

Commits: a3c6d06, 9c37310, d866ded, 8a6e075.

The pure policy has 11 passing local Node tests. It requires an owner-root view, Ace Trainer in the actor's own hand, no Supporter used, own Prizes greater than opponent Prizes, a public opponent hand count at least as large as the actor's hand, and a simple funded attack that KOs the public Active. It reads no opponent hand identities or deck/prize identities.

The native hook composes inside withOwnerOneEnergyBoxKo. It wraps SimpleTacticsAi.prototype.decodeNextAction after Agent43 installs its native hook, returns a PlayCardAction for Ace Trainer, and restores Agent43's exact prior method descriptor immediately. A fallback restores after the Box/Fog attack if the policy declines, preserving Agent43's prototype-integrity assertion.

The A/B/A runner uses Box/Fog-only for A1 and A2, and Box/Fog plus Ace Trainer for B. It asserts the same physical deal across arms and A1/A2 root-ledger parity, verifies the Ace Trainer action precedes Hidden Power, and extracts the source's postgame pass hand and board as owner-only evidence. It deliberately does not attach Powerglass because the current nonterminal E-21 Prize-order correction is not established by the existing terminal-KO hook.

I have not yet added the workflow input/step; the Agent36 workflow appears to be in its current lease window, so I am keeping that file untouched until safe. Please review the native hook/action boundary and let me know if you see an API mismatch or a better integration point.