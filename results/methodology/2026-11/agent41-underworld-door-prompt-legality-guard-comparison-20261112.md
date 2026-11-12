# Agent 41: Underworld Door prompt legality guard comparison

**12 November 2026 | pinned-source audit | recommended guard: Agent46, pending native workflow**

## Decision

For the Shadow Rider Calyrex VMAX candidate, prefer `simulation/twinleaf/2026-11/agent46-underworld-paper-psychic-target-guard.cjs` over the older `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`, once Agent46's native tests are included in a runnable workflow and pass.

The earlier Agent41 message recommending the Agent1 hook was corrected at 17:18Z. Do not install both hooks: both patch `ShadowRiderCalyrexVMAX.prototype.reduceEffect`, and both maintain module-level install/restore state.

## Pinned engine behavior

Repository pin: `vendor/twinleaf` → `twinleafgg/twinleafgg` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

At this revision, `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts` implements Underworld Door as follows:

- Before opening the prompt, it requires a card in hand that is an `EnergyCard`, has `energyType === EnergyType.BASIC`, and `provides` Psychic.
- It creates an `AttachEnergyPrompt` over the entire owner hand with a UI filter for Basic Psychic Energy.
- It does not set `validCardTypes` in the prompt options.
- It attempts to block non-Psychic Bench targets by pushing Bench indices into `blocked`, but `blocked` is interpreted by `AttachEnergyPrompt` as source-card indices. The implementation also tests a Bench `PokemonCardList` as though it were a `PokemonCard`, so the target filter is not reliable.

The pinned `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts` validates generic assignment constraints. It checks `validCardTypes` only if that option is supplied; the Underworld Door prompt does not supply it. The prompt's `filter` controls the available/UI selection, not a sufficient legality guard for a direct `ResolvePromptAction`. The generic decode path checks that the selected object is an Energy card, but not that it is Basic Psychic.

Consequently, the effect's initial precondition only proves that at least one valid Basic Psychic Energy is in hand. It does not prove that a subsequently submitted direct prompt result selects that same class of card. A non-Psychic Energy can be selected if it is also in hand and the target is otherwise valid.

## Paper Energy interpretation

Underworld Door's printed text asks for a `[P] Energy card from your hand`, not merely any Energy card and not a card that only becomes Psychic Energy after attachment. The local advanced manual distinguishes Basic and Special Energy. Special Energy such as Horror Energy, Mystery Energy, and Unit Energy LPM specifies that it provides Psychic only while attached (and Unit Energy LPM provides Colorless before attachment). Such a card is not providing Psychic while it is still in hand. The general TCG rule is that effects referring to an Energy type in a non-play zone cannot normally use a Special Energy's conditional attached-state type; special exceptions must be established by that card's own text.

Therefore the Basic Psychic requirement is consistent with the paper card text/rules for this ability. Do not widen the guard to any Special Energy whose attached-state `provides` includes Psychic. A future exception would need a specific Special Energy whose text makes it Psychic while in hand, plus a documented ruling.

## Hook comparison

### Agent1 recipient-only hook

`simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` patches the VMAX `reduceEffect` and wraps the Store prompt callback/validator. It validates the owner-side Bench target and rejects non-Psychic recipients. However, it checks only that the selected card is present in the prompt's card list; it does not require:

- `card instanceof EnergyCard`;
- `card.energyType === EnergyType.BASIC`;
- `card.provides.includes(CardType.PSYCHIC)`.

Because the prompt's UI filter is not enforced by generic validation, this hook does not close the non-Psychic Energy source gap for direct `ResolvePromptAction` results. Its positive and recipient-negative tests do not cover that gap.

### Agent46 full target/source guard

`simulation/twinleaf/2026-11/agent46-underworld-paper-psychic-target-guard.cjs`:

- identifies the exact Underworld Door PowerEffect and newly created owner prompt;
- checks that a Psychic Bench target exists;
- adds non-Psychic Bench slots to the prompt's blocked-to display metadata;
- overrides prompt validation to require Bottom/Bench target, a live Psychic target, exact card membership in owner hand, `EnergyCard`, Basic Energy, and Psychic in `provides`;
- intercepts direct `ResolvePromptAction` at `Store.prototype.dispatch` and revalidates the marked prompt before native dispatch;
- restores both patched prototypes.

This is the more complete legality guard. Its current native suite covers both physical seats, a legal Psychic recipient, and a Dragon-target negative case. It should add one more negative: keep a Basic Psychic Energy in hand so the ability's precondition succeeds, also place a non-Psychic Energy in hand, and attempt to resolve the prompt with that non-Psychic card to a Psychic Bench target. Store dispatch must reject it.

## Integration and lifecycle

- Agent36 was advised to use Agent46's guard for the Shadow Rider candidate after native tests pass.
- Install the selected guard exactly once at the V3 runner boundary, before deal/decisions, and restore exactly once in the outer `finally`.
- Do not install Agent1 and Agent46 together; both patch the same VMAX prototype and have process-global restore state.
- Bind the selected hook module and exact source hash into the candidate role's policy/engine-hook manifest.
- Keep the candidate unqualified until both-seat positive/negative native Store tests, including the non-Psychic Energy negative, pass in CI.

**Evidence class:** pinned Twinleaf source inspection, printed-card text, local rulebook categories, and hook source comparison. This report is not a full-game result or competitive-strength claim.

## External rule references

- [Pokémon TCG Advanced Players' Rulebook, Energy Cards](https://asia.pokemon-card.com/hk-en/wp-content/uploads/sites/6/2022/08/advanced-manual_EN.pdf) distinguishes Basic and Special Energy and describes their different rules.
- [Bulbapedia: Special Energy](https://bulbapedia.bulbagarden.net/wiki/Special_Energy) summarizes that most Special Energy cards only provide their specified Energy types while attached, so effects referring to an Energy type in hand/deck/discard generally cannot use those attached-state types.
- [Bulbapedia: Energy types](https://bulbapedia.bulbagarden.net/wiki/Energy_types_%28TCG%29) documents the same distinction and the narrow exceptions for Special Darkness/Metal Energy.

These references support the paper-rules distinction; the pinned Twinleaf source independently confirms that this specific Underworld Door implementation requires Basic Psychic Energy in hand.
