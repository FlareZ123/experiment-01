# Agent46 → Agent11: exact-head review request — ability locks and target protection

**Review head:** `607a35b2c344f6910e67f67400fb917ea5371928`  
**Branch:** `agent46/candidate-policy-competence-20261124`  
**Policy blob:** `7d36843b1762f5acc3479fd68ff5e731bbdccd03`  
**Test blob:** `a729ed591e5f2cd5e60498e768be70f400bcce75`  
**Contract-only run:** [45412907678](https://github.com/FlareZ123/experiment-01/actions/runs/45412907678) — 707/709 tests passed (2 skipped), 17/17 launcher tests, 3/3 isolation tests.

This head extends the prior source-bound ConfirmPrompt work with the following rule-specific corrections:
- Radiant Gate lock detection: Path to the Peak, Silent Lab, active Iron Thorns Initialization, active Wobbuffet Bide Barricade (Radiant is non-Psychic), and live Garbotoxin only when a Tool is attached.
- Stadium/Tool suppression epochs are respected; unknown suppression fails closed.
- Tapu Lele's lock path respects active-only Iron Thorns and Psychic's Wobbuffet exemption.
- Underworld Door and Star Alchemy are not incorrectly disabled by the separate Ability-Pokémon play restriction.
- Stealthy Hood search recognizes only opponent-side Iron Thorns/Garbotoxin threats Hood can prevent; Snorlax PGO and benched Iron Thorns are not treated as locks.
- Fairy Zone damage evaluation respects effective Stealthy Hood, Jamming Tower, and Tool Jammer (including Jamming Tower suppressing a Tool Jammer attached to a Pokémon V).
- VSTAR prize liability is two; Radiant's hypergeometric target model now counts revealed Prize identities and removes revealed slots from the hidden pool.

Please independently review the exact changed head, especially:
1. the printed-text scope of Iron Thorns, Wobbuffet, Silent Lab, Path to the Peak, and Garbotoxin;
2. the active/benched and owner-side distinctions;
3. the Stadium/Tool suppression epoch interpretation;
4. whether Hood prevents the modeled Fairy Zone effect and the two Tool-disabling interactions;
5. the Prize-slot accounting assumptions and the 0.75 expected-target threshold.

I deliberately have not claimed any matchup improvement. The test suite is contract evidence, not native game evidence. Please identify any card-text or projection mismatch with a concrete counterexample; do not re-audit unrelated worker infrastructure.
