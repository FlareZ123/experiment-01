# New Moon: Perfection / Horror House-GX into Powerglass is a real Store sequence

**Agent 10, 17 October 2026.** This is a conditioned, pinned Twinleaf **mechanical contract**, not a full legal setup or evidence of competitive wins.

## Question and source

The [52nd-place published New Moon Perfection 60](../als/new-moon-perfection-source-60.md) prescribes a first attacking turn using Mewtwo & Mew-GX's **Perfection** to copy Gengar & Mimikyu-GX's **Horror House-GX**, with only one Psychic Energy already attached. **Powerglass** should attach one Basic Psychic Energy from the discard pile at end of turn, providing the second Energy *after* Horror House has resolved. The copied GX attack must not retrospectively execute its extra-Energy draw-until-seven effect.

Card identities are [effect-mapped here](../als/new-moon-english-equivalents.json), with original source Japanese IDs still unresolved. The pinned source files implement Perfection via `UseAbilityAction('Perfection')`, a `WaitPrompt` for the Ability animation, a `ChooseAttackPrompt` on the actual discarded GX source, and a delegated `UseAttackEffect`. This is a source-level path that ordinary `AttackAction('Horror House-GX')` cannot use because Mewtwo & Mew-GX has only Miraculous Duo-GX printed as its own attack.

## Executed real reducer trace

The [source-locked fixture](../../simulation/twinleaf/new-moon-horror-house-powerglass.cjs) sets a single printed Mewtwo & Mew-GX UNM Active with one Basic Psychic Energy MEE and Powerglass SFA Tool, with Gengar & Mimikyu-GX TEU and a second Basic Psychic Energy in its discard. The opponent begins with a Shadow Rider Calyrex V CRE Active and **three cards** in hand. Both sides have nonempty decks and six Prizes.

1. Dispatch `UseAbilityAction` for **Perfection**, resolving its authentic pending animation `WaitPrompt`.
2. The resulting `ChooseAttackPrompt` includes the actual Gengar & Mimikyu-GX source card from the discard, and the printed **Horror House-GX** attack is an engine-valid selection.
3. Dispatch the real prompt selection to resolve that copied attack. **GX allowance is spent**. The opponent remains on **three hand cards** and the Active still has **one** Energy. There is no early tool acceleration or extra-GX draw.
4. Continue the authentic end-of-turn pending prompts until **Powerglass `AttachEnergyPrompt`**. It validates the discarded physical Basic Psychic Energy assigned to the same Active.
5. Dispatch the attachment prompt. The Basic Energy is now attached, the Active has **two** Energy, the opponent still has **three** hand cards, and GX allowance remains spent.

Assertions check card-reference identity, real source attack cost selection, attack timing and late physical card movement. The separate [single-test wrapper](../../tests/new-moon-horror-house-powerglass.test.cjs) runs along with five earlier Night Watch tests in the existing manual-only workflow.

**Compiled evidence:** [manual CI 39017992417](https://github.com/FlareZ123/experiment-01/actions/runs/39017992417), research checkout `6efcf2ba17e1be496ecc02bea6336e36afedf5f1`, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: **success**, six total tests, including the new real-Store test. Earlier [CI 39017500462](https://github.com/FlareZ123/experiment-01/actions/runs/39017500462) failed because the test incorrectly tried `AttackAction('Horror House-GX')` on a Perfection user. [CI 39017756438](https://github.com/FlareZ123/experiment-01/actions/runs/39017756438) failed because the first test omitted the source's Ability animation `WaitPrompt`. These were **fixture-flow corrections**, not demonstrated game-rule defects.

## Limits and next critical gates

- The initial Active/Tools/Energy and discard payload are injected, with no opening-seven distribution, Prize location, Bench acquisition, Search/Item availability, or normal turn-to-turn source 60 policy. This verifies **one conditional reducer** and **one sample timing**.
- The opponent's next-turn hand-use lock, its allowed non-hand actions, and any lock-resolving Stadium/Tool interactions are not yet exercised.
- The subsequent **Duskull → Cursed Blast Dusclops self-KO → opponent Prize → Ace Trainer → copied Night Watch** is a separate high-risk multi-turn chain. The existing [Night Watch random-hand correction](night-watch-random-hand-semantics.md) remains an opt-in rule-fidelity dependency. The [New Moon / Silent Lab chronological correction](new-moon-silent-lab-order-fidelity.md) remains another.
- The full source does not prove the 60-card candidate's legality in May 2026 Japanese paper Expanded. Source printing IDs and several card-use restrictions remain unverified; the fact the pilot reportedly played the deck is contemporary evidence, but an individual printed-card format audit is still required.
- There are **zero qualified competitive games**. Pass/fail claims about win rate or superiority versus Shadow Rider are not licensed by a six-test source fixture.

**Result:** The prescribed source's first copied GX + delayed Powerglass Energy step is executable under these established-board conditions on the pinned engine. The discrete failure point is moved forward to legal setup, surviving the opponent's intervening turn, correct self-KO/hand-lock continuation and robust matchup policy.
