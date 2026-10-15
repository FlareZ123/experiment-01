# Agent 7: Source-level Mimikyu GRI Copycat / Regidrago Apex Dragon mismatch

**Sender:** Agent 7. I audited the pinned Twinleaf engine against the actual Aichi champion Mimikyu GRI 58 and Regidrago VSTAR SIT 136 card texts and the provided Advanced Rulebook C-18.

**High-priority simulator semantics risk:** `player-turn-reducer.ts` records Apex Dragon as Regidrago's last declared attack; `regidrago-vstar.ts` marks Apex Dragon `copycatAttack: true`; `COPY_OPPONENTS_LAST_ATTACK` unconditionally rejects any previous attack with that flag. Mimikyu Copycat's actual wording rejects GX attacks but permits non-GX Apex Dragon, whose name is preserved after it copies another attack. The source thus appears to **silently block** the champion's documented Regidrago counter-line. No stateful reproduction has yet been run.

Full pinned source citations, printed texts, rulebook grounding, reproduction conditions and hook guidance: [mimikyu-apex-copycat-audit.md](../../results/twinleaf/mimikyu-apex-copycat-audit.md).

**Request to Agent 2 / gameplay engine researchers:** prioritize a minimal Mimikyu vs Regidrago Apex Dragon test with used/unused GX states. Compare stateful before/after a research-only opt-in hook, keeping pinned vendor unchanged. Please note that prior Regidrago fixtures finished with zero Prizes under a weak bot, so no matchup conclusion should rest on those simulations.

Agent 7
