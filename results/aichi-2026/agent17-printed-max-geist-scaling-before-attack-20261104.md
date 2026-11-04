# Rank-1 Max Geist: public Energy marginal value beyond attack-cost payment

**Agent 17 | 4 November 2026 | direct archived card source and pinned simulator source + pure local tests. No native game was executed here.**

## Why the action choice matters

The original rank-1 Yasunori Kato Shadow Rider Calyrex [authenticated 60](full-decklists.json) contains **four Shadow Rider Calyrex VMAX CRE 75** and **eleven Psychic Energy MEE 13**. The [printed CRE 75](../../resources/cards/en/swsh6.json) uses **Max Geist**, costing three Colorless Energy and dealing **10 plus 30 for each Psychic Energy attached to all your Pokémon**. The exact pinned Twinleaf revision **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05** independently implements the same formula in its vendor card reducer at **ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts**.

A *constructed owner-visible state* has the original CRE 75 VMAX legally evolved and Active, with three physical Basic Psychic Energy on that attacker, a legal-looking Benched Psychic recipient, another Basic Psychic Energy in hand, and the ordinary Energy attachment unused. The opponent has an Active with 130 HP remaining, neutral printed Weakness and Resistance, and no modeled defensive modifiers. Other competing actions are assumed absent from this example.

Under the **energyRecipientFrontier** opt-in, [the existing Basic recipient selector](../../simulation/twinleaf/agent44-actor-energy-recipient.cjs) only proposes Basic Energy when it reduces a printed attack-cost deficit. Max Geist already has its three required units, so the baseline actor selects Max Geist for **100 nominal damage** (10 + 3×30). One additional Psychic Energy attached from the owner's hand to their Bench would make Max Geist deal **130 nominal damage** (10 + 4×30), a possible Knock Out before any unmodeled modifiers. This source-grounded conditional opportunity distinguishes paying an attack cost from improving its variable-damage payoff.

No complete game state or opponent response has been observed; this is an explicit synthetic counterexample, not a win-rate or qualified Knock Out.

## New general, default-off decision option

- [Scaling selector](../../simulation/twinleaf/agent17-printed-scaling-basic-ko.cjs): recognizes the exact printed additive formula **for each TYPE Energy attached to all of your Pokémon**. It counts recognized Basic Energy across the owner's public board and offers a matching held Basic Energy only when the printed damage crosses the opposing Active's remaining printed HP.
- [Shared actor integration](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs): optional **printedScalingBasicKoBeforeAttack** check after a currently payable attack has been selected. Opt-in through the wrapper's dependencies. Default behavior is unchanged. It uses the existing typed Basic Energy native action constructor and adds version provenance.
- [Regression tests](../../tests/agent17-printed-scaling-basic-ko.test.cjs): six basic decision/guard cases, plus exact original-rank1 source-card and shared actor opt-in integration assertions. The manual-only [benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml) now includes the suite. No automatic per-commit CI trigger was added.

The selector reads the acting player's hand, their own public Pokémon and the opponent's public Active. It declines an exhausted attachment quota, a held wrong-type Energy, known printed Weakness/Resistance, unsupported attached Special Energy, insufficient damage increase, and already reached damage threshold. It does not infer unknown Prize, deck or opposing hand contents. The native Store must settle the action and all actual effects.

### Important pinned-source compatibility correction

The exact pinned Twinleaf card defines Max Geist's public attack text as **[P] Energy**, while the card archive spells the same reference **Psychic Energy**. The public actor observation passes through the pinned card's text. The first parser spelling would have silently failed on every real pinned Max Geist attack. **Commit 14c7bf8** corrected the scorer to recognize both representations; an adversarial regression now checks bracketed native text and spelled-out archive text.

A scan of the bundled complete English card archive found **21 printed cards** matching the narrowly recognized formula, including reprints of Max Geist, Bolt Storm, Dark Pulse, Photon Kinesis, Syrup Storm and Smog Burst. The exact original 29-deck field contains four relevant **Shadow Rider Calyrex VMAX CRE 75** copies at rank 1. This is static coverage of card text, not proof that every matching card works in pinned Twinleaf.

## Tests and qualification boundary

The six original pure module tests passed on local Node 22 before the bracket correction and added source/integration tests. The complete current committed suite **has not yet run** against a full GitHub checkout or compiled pinned Store. This report does not claim compiled CI success, native Store attachment acceptance, actual damage settlement, completed games, or better source win probabilities.

Next, run the committed test suite, execute a constructed lawful evolution-stack **native Store** test with a physically attached fourth Psychic Energy and actual Max Geist damage/Prize resolution, and only then register new unchanged-rank1 physical starting deals in both seats for a controlled comparison. An Underworld Door attachment plus draw may dominate the ordinary attachment; compare the alternative explicitly. Record all attempts, caps and errors.

**Benchmark status: 29/32 authenticated original 60s, missing ranks 23/25/28, zero competitively qualified games, no selected proven fixed 60, and no demonstrated 99.5% win rate.**
