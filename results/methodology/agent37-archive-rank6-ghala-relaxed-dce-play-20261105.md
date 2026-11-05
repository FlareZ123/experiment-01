# Original rank6 G&H optional payment opens a new real Double Colorless Energy root

**Agent37 | 5 November 2026 | Independent read-only audit of Agent45's already-compiled native v8/v9 artifact. Zero newly executed games; zero competitively qualified games.**

## Evidence and purpose

Agent45's [v9 two-card payment report](agent45-issue25-ghala-relaxed-payment-v9-20261105.md) establishes two authentic printed rank6 original owner turns where Tag Call obtained Guzma & Hala, G&H was played, two strategically protected singleton cards were physically discarded, and three owner-deck cards were physically retrieved. The report correctly leaves the exact three retrieved cards and subsequent attacks unresolved.

This independent **read-only archive inspection** identifies a more advanced but still limited downstream event in the same v9 cohort: the original rank6 owner subsequently made a genuine accepted **Double Colorless Energy PlayCardAction**, in both of those treated first-owner turns. The strict-payment comparator made no DCE PlayCardAction that turn. The v9 source then **passed rather than attacking**. Thus physical search access developed into a resource-play decision, while the Stadium and attacking continuation remained missing. An accepted public root does **not** identify whether that DCE was among the three G&H search results, which Pokémon received it, or its physical post-Store destination.

## Immutable input audit

I independently retrieved [GitHub Actions run 42080317659 artifact 13440970417](https://github.com/FlareZ123/experiment-01/actions/runs/42080317659/artifacts/13440970417). The downloaded ZIP SHA-256 is `2f15f6eb6427607018c2758f0b4e7eb33281c2e84d6b3d50e194debb1eee695a`, matching the artifact's published digest.

Both extracted JSON bytes match their own bundled SHA256 sidecars:

- `strict/issue25-steward-v5.json`: `31737e3cebed34999661a2380fc7d740c7559a51f0b197e04f483f97a2562692`
- `relaxed/issue25-steward-v5.json`: `cc1d6d90df6fb4e12e30bd95e7e17c1cafddfd32709968fbbb2f8386bfd5d7aa`

The eight original registered ID pairs match exactly. For every ID, the original-source physical-deal SHA and full two-player physical-deal SHA are identical between strict and relaxed arms. Each public root history attests self-consistency against its reported ledger digest and complete nontruncated root count. **Six nontarget arms have identical complete public root tapes**; each targeted arm first differs at the expected G&H mode1 prompt, rather than changing the original Tag Call or G&H root.

The two affected original sources occupy physical seat 0, global native turn 2 (their first turn going second). They have different initial source physical deals across the two contender 60s, even though their numeric seed and original rank match. Do not count them as a common source physical game.

## Exact original-source accepted voluntary root contrast

| Source trial | Strict v8 owner turn 2 | Relaxed v9 owner turn 2 | Earliest prompt difference |
| --- | --- | --- | --- |
| `6:101:B:champion-reference` | `Tag Call #17 → G&H #22 → Pass #28` | `Tag Call #17 → G&H #22 → DCE #29 → Pass #30` | Root **25**, strict ShuffleDeckPrompt vs relaxed ChooseCardsPrompt, initiated by G&H root22 |
| `6:101:B:new-moon-lockbreaker-v1` | `Tag Call #24 → G&H #29 → Pass #35` | `Tag Call #24 → G&H #29 → DCE #36 → Pass #37` | Root **32**, strict ShuffleDeckPrompt vs relaxed ChooseCardsPrompt, initiated by G&H root29 |

The additional real Store `PlayCardAction` printings in both treatment root tapes are exactly **Double Colorless Energy**. Neither treatment has an accepted owner Stadium PlayCardAction between the paid G&H and turn-ending Pass. No source AttackAction is recorded in either target treatment within its 48-root cap. The source turn-2 paid line therefore stops at a concrete card-play opportunity instead of an independently confirmed Volt Cyclone.

For reproducibility, the original source and full physical-deal SHA256 receipts are:

- Champion reference: source `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae`, full `73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861`.
- New Moon: source `509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee`, full `86e4d2d417f403c864c0279bb6ed9955e7f133cc39f932cd7832d7dffc420c6c`.

Their respective public accepted treatment root SHA-256 receipts are `509bccaedea3eae08e8b92e5f2303ced414007c54daccbe7c9657cb3f99cae85` and `0eb5df39afbc77de74e4d732cc29d38a91367e555ef222b3ac09ea828b428560`. All other six original-root tapes remained unchanged.

## Cross-archive owner-hand provenance sharpens the Champion case

An additional independent control was downloaded: the original [v5 source-root archive, artifact 13432225055](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496/artifacts/13432225055). Its `6:101:B:champion-reference` original source-deal SHA is **exactly** `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae` and full physical-deal SHA is **exactly** `73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861`, both identical to Agent45 v9 strict and relaxed actual starts.

The separate [Agent20 pre-choice native owner snapshot](agent20-issue25-v5-original-source-pass-tools-20261105.md), audited in [artifact 13438739276](https://github.com/FlareZ123/experiment-01/actions/runs/42078785352/artifacts/13438739276), observes that exact v5 source at original first voluntary root17 with the full hand: **Tag Call; Tool Jammer; Team Rocket's Handiwork; Cynthia & Caitlin; Sidney; Captivating Poké Puff**. In particular, **no Double Colorless Energy** is held. The original printed source 60 has only one DCE.

Comparing the original full same-deal start, the native v9 action sequence and the [Agent45 owner-only search implementation](../../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs) gives a stronger, **conditional inference for the Champion trial**: no other voluntary source draw or search root intervenes between its first-source Tag Call, G&H's authenticated paid own-deck search and the newly accepted DCE PlayCardAction. Tag Call can fetch TAG TEAM cards and G&H's paid search can fetch Special Energy. Under the printed card effects and the native state preserving that previously observed owner hand until the intervention, **G&H must have supplied that DCE**. This is an explicit *deduction from matched archives and the known initial hand*, rather than direct post-search physical card-identity logging. It remains vulnerable to any undiscovered implicit card-generation effect or policy-side hand mutation, so a native prompt settlement/custody receipt is the appropriate independent confirmation.

The New Moon source's actual opening physical deal differs, and no comparably complete pre-choice hand is established by this Agent20 archival snapshot. For that trial the correct claim remains the observed DCE PlayCardAction without asserting its source.

## Strategic interpretation and pending falsification

Agent45 v9's only deliberate treatment is changing the **owner-visible two-card G&H discard penalty ceiling** from conservative 40 to infinity. In both genuine native original rank6 trials, this caused a real optional payment of **Tool Jammer BST plus Team Rocket's Handiwork FCO**, both singletons, and continued G&H owner search. Subsequent DCE action is temporally downstream in the same matched physical game and absent in its strict counterpart. This establishes a narrow native **conditional policy difference** and a resource acquisition/use bridge. It gives no causal identification of which G&H result was DCE; the changed native prompt decisions may affect the subsequent hand and actor priorities in several ways.

The next decisive check is **native owner K1 prompt settlement and physical-energy custody** on the two frozen matched root prefixes: record exactly which three owner-deck card objects entered the hand at G&H resolution, whether the printed DCE attached to Active or Bench, whether Thunder Mountain Prism Star entered the owner's hand, and why the next owner root was Pass instead of a legal Stadium plus Volt Cyclone. Compare owner-observable action alternatives, all payment/lock and Supporter-quota constraints, and their opportunity costs. An independent longer-horizon common-policy test can then ask whether the resulting active attacker gains a paid attack and meaningful opponent counterplay. Explicitly preserve the current 48-root negative/censored observations.

This report relies only on already archived public root events and independently verified ZIP/JSON hashes. It does **not** alter the selected shared developmental v4, prove that a Stadium or attack was playable, certify paper legality beyond the previously scoped paid prompt receipt, determine whether discarding either singleton was wise, or produce any full paper-game outcome.

**Status:** Original Aichi source inventories **29/32**, ranks 23, 25 and 28 missing. Exactly **zero competitively qualified games**, no selected final 60, no demonstrated 99.5% field win rate.
