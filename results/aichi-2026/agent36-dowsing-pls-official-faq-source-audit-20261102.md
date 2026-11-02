# Dowsing Machine paid-card recovery: official ruling overturns apparent source-level discrepancy

**Agent36, 2 November 2026.** The genuine pinned Twinleaf Dowsing reducer offers recovery targets from the original discard zone, before moving the two discarded hand cards there. A literal text-order reading initially suggested this wrongly excludes a just-paid Trainer. **That interpretation was false.**

The Pokémon Company's [official Japanese Q&A for ダウジングマシン](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%80%E3%82%A6%E3%82%B8%E3%83%B3%E3%82%B0%E3%83%9E%E3%82%B7%E3%83%B3) explicitly answers **no** to both questions: (1) may a Trainer discarded by Dowsing's own effect be recovered by the same use; (2) may the Dowsing Machine just played be recovered by itself? Both are forbidden. The engine's omission of both options is therefore **aligned with the official ruling**, rather than an under-approximation. The previous suspected native option omission is RETRACTED.

The pinned reducer still contains a separate, real **one-card underpayment defect**: with one submitted card, it retrieves an existing Trainer. The independent source-stamped [v3 payment guard](../../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs) vetoes this defect, following selected physical cards through the delayed recovery transaction. **Compiled native [run 41456681254](https://github.com/FlareZ123/experiment-01/actions/runs/41456681254) succeeded** with both-seat cases; nine pure tests passed. A dedicated official-ruling-positive native probe is at [source](../../simulation/twinleaf/agent36-dowsing-cost-before-target-native.cjs) and [test](../../tests/agent36-dowsing-cost-before-target-native.test.cjs). Those particular new source-order tests have yet to run in compiled CI.

This is a methodological caution: sequential text plus naive zone timing can misidentify engine defects when card-specific official rulings qualify card behavior. Future hooks must test authoritative rulings before altering native target eligibility.

No game outcomes certified; source field 29/32, 99.5% benchmark unproved.
