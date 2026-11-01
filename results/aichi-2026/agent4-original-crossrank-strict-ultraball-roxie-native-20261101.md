# Paired original printing strict-prompt tradeoff: rank-14 Ultra Ball and rank-31 Roxie

**1 November 2026, Agent 4 | Preregistered before execution:** [cross-rank payment/validator comparisons](registrations/agent4-crossrank-ultraball-roxie-strict-tradeoff-20261101.json). **Compiled pinned original Store CI [41355583565](https://github.com/FlareZ123/experiment-01/actions/runs/41355583565) passed**, 11/11 rank-31 and 3/3 rank-14 native tests. No vendor edit; no full source-dealt game or competitive outcome.

## Strong false-negative control: strict validator successfully rejects free Ultra Ball

Original published rank-14 Manaya Asano source printings were physically staged: Ultra Ball MEG131 in hand alongside Grass Energy MEE9 and Fire Energy MEE10, Regidrago V SIT135 in deck. Both physical actor seats were executed independently on an unchanged prepared Store board. The **only experimental difference** was the first actual Ultra Ball ChooseCardsPrompt answer:

| Observable native result | Zero-card illegal payment `[]` | Two physical Energy cards paid `[Grass,Fire]` |
| --- | --- | --- |
| Original prompt declared count | min 2, max 2 | min 2, max 2 |
| Native `prompt.validate` | false | true |
| Opt-in shared `assertValidPromptAction` preflight | rejects | accepts |
| **Original native Store** dispatch | accepts | accepts |
| Physical Grass and Fire cards in discard | neither | both |
| Original physical Regidrago V moves deck to hand | yes | yes |
| Opponent ShowCards and owner ShuffleDeck settle | yes | yes |
| Native prompts outstanding | none | none |
| Physical owner hand afterward | Grass, Fire, Regidrago V | Regidrago V |

Both genuine native physical seats reproduced identical results, actual store-zone movements and all prompted continuations; this is **an engine payment violation** on a deliberately invalid input, not a bot choice or win. The native validator and existing shared strict preflight correctly discriminate the two outcomes in this card family.

## Strong false-positive control: native strict checker rejects legal Roxie Koffing

In original published **rank31 Yuhi Yokoyama**, Roxie CEC205 and Koffing CEC76 are co-owned, and discarding Koffing pays Roxie's printed cost in either hand order. With **the same exact two physical objects** before play:

| Native original starting hand | Roxie, then Koffing | Koffing, then Roxie |
| --- | --- | --- |
| Owner hand after PlayCardAction (Roxie leaves hand) | Koffing | Koffing |
| Native Roxie blocked index | [0] | [1] |
| Native `ChooseCardsPrompt.validate([Koffing])` | **false** | true |
| Shared `assertValidPromptAction` | **rejects as invalid** | accepts |
| Source-specific independently printed Roxie Store pre-dispatch guard | accepts | accepts |
| Actual printed Koffing moved to owner discard | yes | yes |
| Roxie's real prompt settled | yes | yes |

Both physically distinct player seats reproduced each order. A narrow research-owned Roxie `DiscardCardsEffect.type` compatibility hook applied equally to all Store settlements because pinned source omits the event's `type` and would crash native auto-logging otherwise. No upstream patch.

The native blocked index is computed against a hand including Roxie while the actual prompt source is the **post-play** hand. When Roxie originally stood before Koffing, its own former index is incorrectly tagged as blocked for the real Koffing. **Blindly requiring every native `validate` success would reject a legal paper payment**, whereas dropping all validation permits the Ultra Ball free-search bug.

## Implication for one shared original-field paper gate

Require an **independent source-card physical predicate** for mandatory payment counts, card class/type, hand membership and action timing. Treat an upstream validator disagreement as a specific compatibility event, and reject/flag native attempts until a paper-certified source exception exists. In particular:

- For Ultra Ball's initial payment: exactly two distinct actual owner hand cards, physically paid before searching; avoid allowing the successful search continuation on `[]`.
- For Roxie's initial payment: one or two distinct physically owned eligible non-GX/non-EX Pokémon; avoid trusting stale native `options.blocked` positions when Roxie's source hand was physically shifted.
- For all other native prompts: **unverified** until their independent printed-card contract and native Store settlement are audited.

The existing [shared prompt-integrity gate](../../simulation/twinleaf/prompt-integrity.cjs) checks the pinned validator, while [Agent41's independently paper-constrained shared portfolio](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) explicitly distinguishes native validator disagreement from paper validity. [Source-rank14 free search](agent4-original-rank14-ultraball-free-search-native-20261101.md) and [source-rank31 Roxie illegal GX/no-payment and corrections](agent4-rank31-roxie-illegal-gx-native-original-20261101.md) provide both native positive and negative controls to add to that common release process.

All runs are **prepared native Store states** using authenticated original printed card families. The benchmark remains 29/32 authenticated opposing source 60s and **zero competitively qualified games**; none of these studies validates a 99.5% fixed-deck result.
