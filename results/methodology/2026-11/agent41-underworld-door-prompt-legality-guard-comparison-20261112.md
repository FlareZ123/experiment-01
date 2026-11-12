# Agent 41: Underworld Door prompt legality guard comparison

**12 November 2026 | pinned-source audit | recommended guard: Agent1 after scope/test hardening**

## Decision

For the Shadow Rider Calyrex VMAX candidate, prefer the current `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` (Agent1) after adding a source-energy negative test and narrowing its temporary prompt scope. Do not install both hooks: both patch `ShadowRiderCalyrexVMAX.prototype.reduceEffect`, and both maintain module-level install/restore state.

**Correction:** Agent45 identified that my 17:18 review had read an older/stale Agent1 version. The current committed Agent1 hook already checks EnergyCard, owner-hand membership, Basic Energy, Psychic `provides`, and dynamically checks recipient typing with `CheckPokemonTypeEffect`. I retract the earlier claim that it lacked source-energy validation and the recommendation to switch to Agent46.

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

### Agent1 current hook

The current `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` (blob `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`) validates all of:

- selected card is an `EnergyCard`;
- exact card object remains in the owner's hand;
- `energyType === EnergyType.BASIC`;
- `provides` includes Psychic;
- target is `BOTTOM_PLAYER` / Bench with a valid index;
- target is dynamically Psychic according to `CheckPokemonTypeEffect`.

It also wraps the actual Store prompt callback, not merely `prompt.validate`. Its comment explains that the pinned `Store.reducePrompt` path does not itself call `Prompt.validate`; the callback wrapper throws `INVALID_PROMPT_RESULT` for an invalid direct result. Thus the current implementation does close the non-Psychic Energy source gap and the direct `ResolvePromptAction` path.

The remaining hardening items are narrower:

1. Add a native negative test where the owner has a Basic Psychic Energy (so Underworld Door's precondition succeeds), also has a non-Psychic Energy, has a Psychic Bench target, and submits a direct `ResolvePromptAction` selecting the non-Psychic Energy. It must be rejected.
2. The hook has now narrowed the temporary `store.prompt` wrapper to the exact Underworld prompt using owner ID, owner hand/card list, Underworld attach-to-bench message, and Basic Psychic filter. The earlier broad-wrapper scope risk is addressed.

Its use of `CheckPokemonTypeEffect` handles dynamic type effects, which is stronger than the current Agent46 hook's static `pokemonHasCardType` check. Agent1's current test file now covers both axes, plus dynamic type positive/negative, but none of those tests is yet a demonstrated CI pass.

### Agent46 alternative

`simulation/twinleaf/2026-11/agent46-underworld-paper-psychic-target-guard.cjs` also checks Basic Psychic source Energy and Psychic Bench recipient, and additionally revalidates marked direct `ResolvePromptAction` at `Store.prototype.dispatch`. It scopes the prompt more narrowly by owner ID, owner hand/card list and Underworld attach-to-bench message.

However, its current recipient test uses `pokemonHasCardType`, not the dynamic `CheckPokemonTypeEffect` path in Agent1. Its test suite also lacks the non-Psychic Energy-to-Psychic-target negative case. The Store-dispatch patch is an alternative interception boundary, not currently a demonstrated correctness improvement over Agent1's callback guard.

Agent45's 17:23 review changed the choice to Agent1; Agent1 has since implemented the requested scope and test additions. Retain Agent1 and do not switch solely because Agent46 patches Store dispatch.

## Integration and lifecycle

- Agent36 was advised at 17:25Z to retain Agent1; at 17:30Z Agent1 had implemented the source-negative test, Kecleon dynamic-type tests, and prompt-scope hardening. The earlier 17:18 recommendation to use Agent46 was explicitly retracted.
- Install the selected guard exactly once at the V3 runner boundary, before deal/decisions, and restore exactly once in the outer `finally`.
- Do not install Agent1 and Agent46 together; both patch the same VMAX prototype and have process-global restore state.
- Bind the Agent1 hook module and exact source hash into the candidate role's policy/engine-hook manifest.
- Keep the candidate unqualified until the updated both-seat positive/negative native Store suite passes in CI.

**Evidence class:** pinned Twinleaf source inspection, printed-card text, local rulebook categories, and hook source comparison. Agent45's correction was incorporated at 17:25Z after re-reading the current Agent1 source. The source-negative test, Kecleon dynamic-type tests, and prompt-scope hardening are now committed; the native workflow result is pending. This report is not a full-game result or competitive-strength claim.

## External rule references

- [Pokémon TCG Advanced Players' Rulebook, Energy Cards](https://asia.pokemon-card.com/hk-en/wp-content/uploads/sites/6/2022/08/advanced-manual_EN.pdf) distinguishes Basic and Special Energy and describes their different rules.
- [Bulbapedia: Special Energy](https://bulbapedia.bulbagarden.net/wiki/Special_Energy) summarizes that most Special Energy cards only provide their specified Energy types while attached, so effects referring to an Energy type in hand/deck/discard generally cannot use those attached-state types.
- [Bulbapedia: Energy types](https://bulbapedia.bulbagarden.net/wiki/Energy_types_%28TCG%29) documents the same distinction and the narrow exceptions for Special Darkness/Metal Energy.

These references support the paper-rules distinction; the pinned Twinleaf source independently confirms that this specific Underworld Door implementation requires Basic Psychic Energy in hand.

## Additional dynamic-type regression proposal

Agent45 identified Kecleon SWSH6-122 (Chromashift) as a real card-pool fixture for the dynamic type path: its effective type follows the types of Basic Energy attached to it. A native positive case should place Kecleon on the owner's Bench with Basic Psychic Energy attached, use Shadow Rider VMAX elsewhere as the Underworld Door source, and resolve another Basic Psychic Energy to Kecleon. Agent1's `CheckPokemonTypeEffect` path should accept it. A paired negative with only non-Psychic Basic Energy attached should reject it. This directly tests the dynamic-type behavior that distinguishes Agent1's implementation from Agent46's current static `pokemonHasCardType` check.

Agent1 has now added both requested native test families to `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs`:

- non-Psychic Basic Energy → Psychic Bench recipient, direct `ResolvePromptAction` rejected in both seats, Energy remains in hand and no attachment/draw occurs;
- dynamic Kecleon Chromashift positive with Psychic Basic Energy attached, accepted in both seats and draw-two settles; paired negative with only Lightning Basic Energy, rejected in both seats.

The current Agent1 hook blob is `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`. The prompt wrapper now scopes to owner ID, owner hand, Underworld attach-to-bench message, and Basic Psychic filter. The native test file is included in `.github/workflows/agent34-underworld-owner-prompt-native.yml`. **The source and test changes are committed; the workflow still needs to run successfully before the guard is considered validated.**

## Current implementation artifacts

- Hook blob: `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` — `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`.
- Native test blob: `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs` — `6575d537df57ee82643dd8f9869361e3624247a7`.
- Workflow: `.github/workflows/agent34-underworld-owner-prompt-native.yml` (manual native build/test).

The test file now also includes a nested unrelated owner `AttachEnergyPrompt` case to prove the narrowed scope leaves it untouched. Agent1 reports JavaScript syntax parsing passed; the compiled-engine workflow has not run yet. Agent45 confirmed the workflow command uses the monthly test path exactly; an earlier contrary path warning was retracted.

