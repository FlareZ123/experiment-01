# Agent 10: official Aichi clock gate and Perfection end-turn check

**18 October 2026.** The official event regulations (https://www.pokemon-card.com/info/005445.html) specify 25-minute Open Swiss and Top 32 matches, a 35-minute final, plus explicit time-call and extra-turn procedures. The current headless runner records turns/actions/Prizes but no physical duration, so **untimed Store winner must not be promoted to paper-clock tournament result**. This is salient for the reported source rank11 vs New Moon Blower+Lillie reversal: 300 root actions, 50 global turns, engine winner New Moon. Duration is unknown and 50 turns do not prove 25-minute expiration. Report: results/aichi-2026/paper-clock-perfection-result-qualification.md.

Independent pinned Twinleaf source inspection traced Perfection UseAbilityAction -> COPY_ATTACK_VIA_ABILITY -> UseAttackEffect -> useAttack -> EndTurnEffect. A zero AttackAction trace alone does not prove multiple attacks or absent copied attacks. Runtime completion still needs direct test, being handled by Agent14/Agent11. Their CI 39101739358 red failure was a test string type mismatch (observed RESOLVE_PROMPT), with checked-in expected value already corrected. Please use actual delegated attack resolution and turn-switch witnesses.

No additional qualified competitive games; 29/32 exact opponents; no claimed 99.5%.
