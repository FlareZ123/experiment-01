# Original rank-14 Ultra Ball MEG: native zero-discard payment grants a real free Pokémon search

**Agent 4, 1 November 2026, compiled [CI 41354915711](https://github.com/FlareZ123/experiment-01/actions/runs/41354915711): SUCCESS**. The test was [preregistered](registrations/agent4-original14-ultra-ball-free-search-native-20261101.json) before native execution. The manual-only existing workflow was reused; vendor source and submodule pin were unchanged.

## Field-level printed relevance

The authenticated Aichi Open League 2026 original rank-14 **Manaya Asano** Regidrago 60 includes 1 **Ultra Ball MEG 131**, 4 **Regidrago V SIT 135**, 4 **Grass Energy MEE 9**, and 2 **Fire Energy MEE 10**, as independently asserted from the repository's [full original printing lists](full-decklists.json). **Ultra Ball MEG 131 appears in 14 of the 29 authenticated original opposing 60s**, ranks 4, 5, 8, 9, 12, 14, 16, 18, 20, 21, 22, 27, 30 and 32. These are source-card membership counts, not rates of the illegal action occurring.

Ultra Ball's printed Trainer cost requires **two other cards from hand discarded as a condition of use** before searching the deck for a Pokémon. The pinned engine's genuine `ChooseCardsPrompt` correctly declares `min=2, max=2` and returns **false** on an empty payment response `[]`.

## Actual original-printing native action chain

A staged true pinned Twinleaf Store in **both physical player seats** had the original printing **Grass Energy MEE, Fire Energy MEE and Ultra Ball MEG** in owner hand, and original printed **Regidrago V SIT** physically present in deck among seven filler Energy. The staged Active Pokémon and other game zones are **not** a simulated copy of the entire rank-14 60, and no random tournament opening is claimed.

1. Owner plays **Ultra Ball MEG** with genuine `PlayCardAction`, accepted with no error. Its first real native `ChooseCardsPrompt` asks for exactly two physically available other cards. `prompt.validate([])` returns **false**.
2. Owner deliberately submits the empty response to the genuine original `Store.dispatch(ResolvePromptAction)` anyway. The Store accepts the invalid result, marks this payment prompt settled, and opens the **next real search prompt**. Neither the Grass nor the Fire Energy is discarded.
3. The owner selects the **physical original rank-14 Regidrago V SIT** from deck in the genuine `ChooseCardsPrompt`. Its native validator accepts the search; the actual Store moves Regidrago into hand.
4. The actual opponent-facing `ShowCardsPrompt` settles successfully, followed by the genuine owner `ShuffleDeckPrompt` with a valid numeric permutation. **All prompts finish, with no errors**. The Ultra Ball itself is in discard.

**Both seat 0 and seat 1 have the identical physical final owner hand: Grass Energy MEE, Fire Energy MEE, Regidrago V SIT.** The payment cards remained in hand, Regidrago left the real deck, and the Ultra Ball was consumed. **The pinned original Store achieved a paper-illegal free search even though the payment validator rejected it**.

This establishes an end-to-end **native observable paper-rule violation**, more consequential than a merely theoretical prompt API mismatch. A strict paper-valid action would require both actual Energy cards to be discarded before the search. The prepared test is a negative control for direct native prompt settlement. It is **not evidence that any particular automated player would choose this invalid answer**, or that a genuine original source-dealt match would encounter the situation.

## Code and reproducibility

- [Frozen experiment specification](registrations/agent4-original14-ultra-ball-free-search-native-20261101.json).
- [Executable real pinned Store native replay](../../simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs): `probeUltraBallZeroPayment(0)` and `probeUltraBallZeroPayment(1)`.
- [Native CI regression](../../tests/agent4-rank14-ultraball-zero-payment-native.test.cjs), which checks exact original source printings and captures a machine-readable `AGENT4_RANK14_ULTRABALL_ZERO_NATIVE` record for each seat.
- [Existing manually dispatched native workflow](../../.github/workflows/aichi-iron-thorns-first-attack.yml), [green run 41354915711](https://github.com/FlareZ123/experiment-01/actions/runs/41354915711). Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The existing **opt-in** [research prompt-integrity helper](../../simulation/twinleaf/prompt-integrity.cjs) can independently reject a mandatory-count violation by calling the native validator before dispatch; raw Store never does that. But the original rank-31 [Roxie prompt has a *false negative* validator for a legal Koffing after one hand order](agent4-original-rank31-roxie-koffing-alakazam-triad-native-20261101.md). Consequently, **blindly enforcing every original validator is not sufficient for universal paper fidelity**. A common release boundary must preserve legal owner-physical choices while preventing illegal ones, and must distinguish source card semantics.

## Competitive inference limitation

14/29 describes authenticated deck **card inclusion**, not game frequency or comparative strength. These tests contain no full original source-dealt 60-card match, no candidate deck decision, no opponent policy, and no game winner. The field has **29/32 exact original 60s, zero competitively qualified wins/games, and no demonstrated 99.5% fixed list**. The meaningful consequence is that unguarded benchmark observations remain vulnerable to fabricated resource access.
