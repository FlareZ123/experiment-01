# Rank-11 Professor's Letter K0 search-target conservation

Agent 10, 3 November 2026. Pure source-resource certificate. No game, native payoff, or competitive win certified.

## Source and mathematical statement

The authenticated original rank-11 Wataru Yano printed 60 in `results/aichi-2026/full-decklists.json` has eight `Darkness Energy MEE` and four `Professor's Letter BKT`. BKT Professor's Letter searches for up to two basic Energy and has no extra hand-discard cost.

For any exact source owner state with six remaining Prize cards, zero Darkness Energy visible outside the owner's deck, and the full registered eight Darkness Energy, at least two Darkness Energy remain in the deck, assuming all owner-card locations are accounted for: 8 - 0 - 6 = 2. The bound subtracts all matching cards in the owner's hand, play, discard, Lost Zone, resolving Supporter and Stadium, then pessimistically assigns every unknown Prize to the target printing.

`simulation/twinleaf/agent10-rank11-letter-k0-source-target.cjs` implements this generic exact-printing lower bound and a rank-11-specific two-Darkness certificate. It requires the physical Letter in the owner's hand, an open generic Item channel, and at least two cards in deck. It checks visible target multiplicity conservation. It never reads the actual deck, Prize identities, or opponent concealed information.

## Tests and evidence

`tests/agent10-rank11-letter-k0-source-target.test.cjs` contains nine regressions for both seats, public zone losses, locks, insufficient deck, contradictory source copy counts, hidden opponent invariance, and original rank-11 inventory read from the canonical JSON. Seven initial local Node tests passed. The final published suite passed in existing manual GitHub Actions run [41652288201](https://github.com/FlareZ123/experiment-01/actions/runs/41652288201), HEAD `8adc61093ae75869bed0337f421301911d618e8a`. No new workflow was created.

The related Agent 6 exact seven-plus-one legal-opening calculation found a 15.15396183554709% theoretical first-turn Letter/no-Darkness event; that is a probability model, not actual native witnessed opportunity. This new code generalizes target conservation beyond global turn one, with exact target printing and public-zone accounting.

## Important limits

A two-target certificate does not prove the printed Trainer is globally paper playable under every possible effect, that the native Store accepts and settles it, that playing it beats Carmine/Boost Shake/attachments/other competing roots, or that the opponent makes a consequential reply. A one-target remainder makes this two-target certificate inconclusive, rather than proving Letter useless. Caller must independently authenticate the physical owner seat and original source 60. Existing archived generic Trainer frontiers omit some Energy-public-zone information necessary for retrospective use of this certificate.

Next: integrate as a default-off owner-only paper denominator component into one preregistered, symmetric source-policy evaluation, archive exact owner physical states and matched alternatives, and require settled search, subsequent attack or lock, and opponent continuation. Status remains 29/32 exact originals, zero competitive games, no selected fixed 60, no demonstrated 99.5% win rate.
