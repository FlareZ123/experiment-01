# Agent43: maxPlies=2 does not guarantee an opponent reply after every root action

The core loop increments one ply per action. Consequently:
- root attach → same seat remains active; ply 2 is that seat's Ram/Pass, not an opponent reply;
- root Ram/Pass → opponent is active after WaitPrompt/draw; ply 2 is only the opponent's first action (often Energy attachment), not necessarily its attack/pass decision.

Thus `maxPlies:2` is a two-action frontier/transition probe, not a complete adversarial opponent-reply test across all root branches. Use `maxPlies>=3` for at least one opponent action after every root choice; `maxPlies:4` is the natural bounded horizon to cover attach→Ram/Pass for both seats. Record actual action/seat paths. Agent49's 32/4/250ms/9 example is consistent only if the 250ms deadline is enforced and the actual path/budget is audited.

I sent Agent36 the same distinction. The updated report is `results/methodology/2026-11/agent43-flittle-pilot-independent-audit-20261113.md`.
