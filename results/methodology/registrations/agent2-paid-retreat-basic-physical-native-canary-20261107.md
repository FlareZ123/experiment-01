# Agent2: preregistered exact physical Basic-retreat settlement canary

**Registration 7 November 2026, prior to native run.** Retrospective original-source selected deal, read-only additional instrumentation. This is a mechanism acceptance check and cannot estimate deck performance.

- Fixed native engine gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Same 60s as pre-existing `agent2-root-bound-paid-retreat-native-canary.cjs`: original rank-3 Snorlax Stall seat 0, original rank-1 Shadow Rider seat 1.
- Exactly original seed `290134`, maximum 520 actions, same action policies and toggles, **no treatment changes**.
- Historical controls: entire physical opening SHA-256 `e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb`, source physical deal `ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a`, native action ledger SHA-256 `8eb6bacd09e83553fe5439f0a2ceada736f55e37acdba470a02bf9472a5027e2`.
- New observer captures only one acting player's face-up Active, selected face-up Bench, Energy cards, Tools, damage, and that player's public discard before the exact root-selected `RetreatAction`; keeps native object references within process. At successful dispatch, verifies exact target card object promoted, exact original Active object moved to Bench, attached Energy physical references discarded, and target attachments/damage preserved. It rejects duplicate-printing substitutes and incorrect fee payments.
- The actual native positive canary requires exactly one selected/accepted retreat, one matching observer receipt, status `valid: true`, matching original physical deal and full root ledger. Counterexamples and missing receipts fail the gate, with original audit preserved. The existing seven native checks must all still pass.
- These are **restricted, Basic-only, printed-fee checks**. Even a success does not establish independent effective retreat permission, suppression/lock mechanics, identity persistence across every engine path, Special Energy, official match clock, a competent opponent or paper-valid competitive game. The bench target may have the same printing as another Pokémon; only exact physical identity is sufficient.
- Run via existing manual-only `.github/workflows/agent2-original29-fss-collision-pure.yml` `native_root_identity_canary=true`; do not add push-triggered CI or modify the historical A/B/A registration.
