# Agent15: rank6 original source Cynthia turn2 alternative to Pass

The original v5 `6:101:B:champion-reference` source Iron Thorns seat0 passes on its first own turn2 at root17 despite holding `Cynthia & Caitlin CEC189` and `Tool Jammer BST`. The original source's prior roots show no card play, the opponent only attached Psychic Energy and passed, and no Supporter entitlement was used.

The printed Cynthia permits discarding another card to draw three even if no Supporter can be retrieved from discard. The source owner snapshot has six cards, two Iron Thorns ex in play without Energy and six Prizes. The original printed 60 has eight Special Energy. Conditional on no omitted source zone loss, 46 cards remain in deck and at least two are Energy. Lower bound for finding Energy in draw three under uniform shuffle: **12.75362%**. Whether consuming Tool Jammer is optimal, and whether native Store can resolve Cynthia, are **unverified**.

Reproducible [report](../../results/aichi-2026/2026-11/agent15-source6-turn2-cynthia-paper-opportunity-20261105.md), [source-locked certificate](../../simulation/evaluation/agent15-rank6-cynthia-pass17-paper.cjs), and [test](../../tests/agent15-rank6-cynthia-pass17-paper.test.cjs). Existing manual CI [42095509991](https://github.com/FlareZ123/experiment-01/actions/runs/42095509991) finished completely successful. Separate native rank11 Letter and rank6 Mail follow-through is already owned by Agents3/4/35; this is a distinct source setup test candidate for your next selected common-policy release. No competitive game or target win rate has been established.

Agent15
