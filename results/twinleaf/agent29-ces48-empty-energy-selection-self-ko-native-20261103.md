# Electrode-GX CES48: zero-attachment self-KO in pinned native Store

**Agent 29 | 3 November 2026 | original rank-9 printed Ability; fresh, deliberately staged Store states | zero competitively qualified games**

## Question and exact source rule

The authenticated rank-9 Shun Ito *Absol Electrode* 60 contains two Electrode-GX CES48 and seven original Energy cards (four Prism ASC216, two Darkness MEE15, one Telepathic Psychic POR88). The original **Extra Energy Bomb** Ability says: "Once during your turn (before your attack), you may attach 5 Energy cards from your discard pile to your Pokémon, except Pokémon-GX or Pokémon-EX, in any way you like. If you do, this Pokémon is Knocked Out." This is the verbatim printing present in the bundled card database and the pinned Twinleaf CES48 implementation.

The supplied *Advanced Player's Rulebook*, Section II E-20, says that when an effect conditions its second action on doing the first, doing none of the first action does not allow the second action. Section II A likewise requires that an Ability be playable only when it meaningfully changes the game state, unless a different specific rule applies. The general shortfall rule allows a source discard with fewer than five Energy to transfer the available number. Thus, **one or three actual available Energy may be attached and trigger the self-KO**, but a deliberately selected **zero-card attachment cannot satisfy the "If you do" clause**.

In the pinned upstream `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts`, the native Ability constructs `AttachEnergyPrompt` with `min:0,max:5`. In its callback it inflicts 999 self-damage even when `transfers.length===0`. The zero-transfer branch also invokes `SHUFFLE_DECK`, although the printed Ability never searches the deck. The shuffle is an independently visible source-code discrepancy; this test's new validated claim concerns **zero attachment plus actual knockout/Prizes**, without certifying a specific shuffle zone transition.

## Fixed native regression

- Engine: pinned `vendor/twinleaf` revision **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, compiled through the repository's existing manual workflow.
- [Eight complete native tests](../../tests/agent29-electrode-empty-attachment-fidelity.native.test.cjs) create separate fresh genuine `Store` instances with CES48 evolved from original Voltorb ROS, original rank-9 printed Prism ASC Energy in owner discard, and original source Mega Absol ex MEG86 (native display proxy M1L) as a non-GX/non-EX legal Active destination.
- Original rank-10 Regidrago V SIT is the live defending Active. The owner/defender decks, face-down Prizes and initial board are **explicitly staged with filler**, not random original sixty-card deals. Both source physical seats 0 and 1 are tested, each with source discard containing one or three authentic Prism Energy objects.
- **Stock controls:** genuine native `UseAbilityAction` opens genuine `AttachEnergyPrompt` with `min:0`. Its `validate([])` returns true. The actual native `ResolvePromptAction(prompt.id,[])` is **accepted** on its own freshly constructed Store. No Energy leaves source discard or attaches to Mega Absol, yet the native effect knocks out Electrode-GX and the defender genuinely takes two Prizes (6 to 4).
- **Paper-hook positive controls:** each separate fresh Store installs the existing opt-in [CES48 Energy hook](../../simulation/twinleaf/electrode-gx-energy-hook.cjs). The prompt enforces minimum one or three matching the original available packet, `validate([])` is false **without attempting an invalid dispatch**, and the complete one- or three-card selected payment is accepted. All physical Energy identities move from owner discard to Mega Absol, Electrode-GX self-KOs, and the defender takes two Prizes. The hook is restored after every test.
- No test catches an invalid Store root and then continues the same Store. This respects the repository's independent rejected-action contamination warning.

| Source seat | Discard Prism Energy | Unmodified native selected | Unmodified actual attached | Unmodified opponent Prizes taken | With hook, physically attached | With hook, opponent Prizes taken |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 0 | 0 | 2 | 1 | 2 |
| 0 | 3 | 0 | 0 | 2 | 3 | 2 |
| 1 | 1 | 0 | 0 | 2 | 1 | 2 |
| 1 | 3 | 0 | 0 | 2 | 3 | 2 |

**Actual compiled result:** [manual CI 41609989636](https://github.com/FlareZ123/experiment-01/actions/runs/41609989636), research head `75b266e346bc93f7cbc1f1763912fd4c29438eda`, native job **50 tests passed, zero failed** (eight new cases, 42 pre-existing tests). The preserved job log contains all eight `AGENT29_CES48_EMPTY_NATIVE_SELFKO` and `AGENT29_CES48_REQUIRED_NATIVE_PAYMENT` printed receipts. The existing manual [CES48 workflow](../../.github/workflows/agent45-electrode-bomb-native-store.yml) now includes these cases. No new workflow or vendor edit was introduced.

## Decision consequence

The actual native Store can count an Ability self-KO and two-Prize penalty **without a paper-valid Energy payment**. A future source comparison that scores native knockouts, Prize tempo, successful Ability roots or implicit board transitions must independently verify the associated printed payment. Importantly, the stock native prompt's *acceptance* cannot certify that payment. The existing opt-in hook passes this narrow positive/negative stage, but **its installation in a standalone test does not imply that it is selected by a frozen shared two-player campaign**. No natural rank-9 source policy selected this exact empty payment in the evidence here.

This adds a distinct negative example to earlier CES48 audits: [forbidden old GX/EX target acceptance](../aichi-2026/agent45-electrode-bomb-forbidden-gx-native-two-seat-20261102.md), [mandatory five-card payment](../aichi-2026/agent29-rank9-electrode-modern-ex-native-chain-20261102.md), and the [three-/four-card partial Bomb native fixture](../../tests/agent2-rank9-partial-bomb-native.test.cjs). Those separate paths address the recipient and shortfall dimensions.

**Scope remains unchanged:** 29/32 authenticated original Aichi Top32 printed 60s, missing 23/25/28, zero competitively qualified games, no selected best fixed 60 and no demonstrated 99.5% win rate. This study is a scoped rule-fidelity and policy-evidence gate.
