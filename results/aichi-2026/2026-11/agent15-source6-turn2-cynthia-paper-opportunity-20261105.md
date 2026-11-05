# Agent15: rank6 original-source turn2 Cynthia & Caitlin alternative to Pass17

**5 November 2026. Developmental paper-opportunity certificate, zero qualified games.**

## Reproduced source context

In the selected developmental v5 archive, attempt `6:101:B:champion-reference` has original rank6 Kazuma Kashi Iron Thorns in physical seat0, opponent in seat1, opponent going first. The source's first real turn is global turn2. At **native accepted root17**, source chose `PassTurnAction`.

The archived source owner hand at that root is `Tag Call CEC; Tool Jammer BST; Team Rocket's Handiwork FCO; Cynthia & Caitlin CEC; Sidney FST 241; Captivating Poké Puff STS`. Original source Active and sole Bench are both Iron Thorns ex, each with **no Energy**. The opponent has Latias ex Active with one Psychic Energy and Dialga-GX on Bench. Neither Stadium zone has a card.

Source evidence:
- [Agent36 v5 root archive](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496), artifact 13432225055, member `issue25-steward-v5.json` SHA256 `22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17`.
- [Agent35 owner Pass observer archive](https://github.com/FlareZ123/experiment-01/actions/runs/42079458048), artifact 13440370610, JSON SHA256 `23631b6c2cb8c5a38957167579b1fdcbb6035543ced1665d0e8373ef56bfe73f`.
- Source physical deal SHA256 `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae`; full deal SHA256 `73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861`; root ledger SHA256 `d8921fcb1ab313e09c8523488f328769fc971e106b7cfd3aae8d7c0ba3dab222`; root17 hand SHA256 `318da907caf72a808cddeb3b10638e73279cd6e2f795597f1561b9e5d1bec155`, board SHA256 `08398682b420b2c4e0376007c4862ae3f994710c66d3859816a763235b3a8bd3`.

The accepted prefix before root17 has only setup prompts and the **opponent's** turn1 Psychic Energy attachment (root13) and Pass (root14), with no source-owned non-prompt actions. No ordinary Supporter has been spent by the source. The opponent did not attack.

## Printed action and conservative physical floor

The authenticated original rank6 60 includes one **Cynthia & Caitlin CEC 189**, four Iron Thorns ex and eight Special Energy. The [official printed card text](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/sm-series/sm12/189) and repository `resources/cards/en/sm12.json` permit an optional discard of another card from hand to draw three. Under the supplied Advanced Rulebook's partial-effect resolution rule, this independent draw effect is usable even with no eligible Supporter to recover from discard. If eligible Supporters are in discard, the mandatory recovery instruction applies as well.

At source's turn2, it can **conditionally** play held Cynthia & Caitlin, discard held Tool Jammer and draw three, subject to confirmation of no omitted lock or effect. This competes for the Supporter entitlement and sacrifices a strategically useful Tool; tactical superiority over Pass has **not** been demonstrated.

Assuming the authentic prefix includes no source discard/Lost Zone effects, six cards are in the source hand, two source Pokémon are in play, six are Prized, and **46 remain in deck**. The source's eight Energy are absent from hand and play, so at most six can be Prized and **at least two Energy remain in deck**. Conditional on a uniformly shuffled 46-card deck, a three-card draw reaches at least one Special Energy with probability at least `1 - C(44,3)/C(46,3) = 0.12753623188405794` (**12.75362%**). This is a draw-hit lower bound; it does not certify a payable Lightning attack or a successful game.

## Verification and next release gate

The source-locked [CommonJS certificate](../../simulation/evaluation/agent15-rank6-cynthia-pass17-paper.cjs) and [six synthetic/source-print tests](../../tests/agent15-rank6-cynthia-pass17-paper.test.cjs) check printing, owner hand hash, relevant quota/zone facts, total 60, exact eight Energy and the draw probability. Added to existing manual-only `aichi-benchmark-stats.yml`, not a new workflow.

For a real follow-up, the shared bilateral policy steward should prospectively register this source Pass alternative and independently verify native Store acceptance, source-owned discard-one payment, actual drawing of three physical cards, Energy placement, a resulting attack or control action and meaningful opponent reply. Keep every failed/capped treatment. The existing developmental v5 source Pass stays an immutable baseline. Do not infer a candidate win from playing one Supporter.

**Status: paper-payable candidate action conditional on independently audited context; no selected native Cynthia action, no settled source payoff, zero competitively qualified games, no final 60.**
