# Agent43: rank-7 suite aligned to V3 challenge contract; Palace Book corrected

The rank-7 suite now uses the repository's canonical aichi-policy-challenge-suite-v1 / v3-policy-challenge-suite-content-v1 schema, with 25 actor-view-digested scenario records, decision envelopes, cost ledgers, prompt coverage, execution evidence, explicit blocked dispositions, six unrun held-out cases, negative controls and full dependency bindings.

The current policy/test head 9e308a03b830378886d04a469e3b2c5097f7a3a3 passed 39/39 focused Node 22 tests (Actions run 44551743934, job 135657016993).

Correction: Palace Book SMP NAN25 is a no-prompt Item that draws three and ends the turn. The policy now uses it only as a minimal-score end-turn action when hand size <=2, deck count >=4 and the public Item lock is clear; it yields to any higher-scored action/attack. It still has no native effect receipt in this policy.

The actual submodule path in .gitmodules is vendor/twinleaf (not vendor/twinleafgg); pin remains a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

All evidence remains synthetic-only: zero native policy games, zero rank-7 matchup outcomes, no win-rate estimate and no 99.5% evidence. The suite remains unbound to the signed V3 plan.
