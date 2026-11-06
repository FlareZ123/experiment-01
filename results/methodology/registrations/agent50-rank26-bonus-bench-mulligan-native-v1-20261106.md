# Preregistration: rank26 versus rank6 mulligan-compensation optional Bench placement

**Agent50 | 6 November 2026 | native setup-only fixture | prospective before implementation and CI**

## Question

At the pinned Twinleaf revision, can a defending original rank6 Iron Thorns list that begins with exactly one Active Iron Thorns ex legally place a second Iron Thorns ex from its mulligan-compensation draw onto its Bench through the genuine native optional `CHOOSE_STARTING_POKEMONS` prompt (`min=0))? Does the existing Agent50 protected-entry setup hook decline that choice?

## Frozen inputs and engine

- Source: Aichi Open League 2026 original rank26 Meloetta list, physical seat 0, forced to go first.
- Defender: Aichi Open League 2026 original rank6 Iron Thorns ex list, physical seat 1.
- Deck inputs: exact 60-card name/count lists resolved through the existing `planAichi(1)` admission path; record both resolved deck SHA-256 values in the receipt.
- Twinleaf gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Native setup source: pinned `setup-reducer.ts`, `ChooseCardsPrompt`, `ShuffleDeckPrompt`, and `Store.dispatch`. Research code only; no vendor edits.

## Constructed physical setup

Use one deterministic, deliberately constructed deal. Intercept only the native shuffle prompt actions and supply valid complete permutations of the actual physical deck arrays:

1. Rank26's first seven contain no Basic or `PLAY_DURING_SETUP` Pokémon, causing exactly one mulligan.
2. Rank6's first seven contain exactly one Iron Thorns ex and six non-starting cards, so its only legal starting Pokémon is the single Active.
3. Rank6's next six cards are non-starting cards for its six Prizes; the fourteenth card is a second physical Iron Thorns ex.
4. Rank26's second seven contain exactly one starting Pokémon and six non-starting cards, ending its mulligan.
5. Force rank26 to go first. On rank6's native `WANT_TO_DRAW_CARDS` prompt, accept the one offered compensation card.

The controlled permutations are a reproducible existence fixture, not random samples and not a prevalence estimate.

## Treatment and native acceptance checks

At rank6's post-compensation `CHOOSE_STARTING_POKEMONS` prompt:

- verify the genuine owner hand is the prompt's card list;
- verify `min=0`, `max=1`, and the only eligible new Basic is the second physical Iron Thorns ex;
- verify both `prompt.validate([])` and `prompt.validate([secondThorns])` are true;
- **do not override the optional prompt**: let the pinned default `SimpleTacticsAi` `ChooseCardsPromptResolver` produce the action, then observe whether it selects the second physical Iron Thorns;
- compare that action with `chooseOwnedProtectedStartingBasics` on the same prompt as a negative control; the Agent50 protected-entry chooser is expected to propose `[]` for a valid `min=0` prompt;
- dispatch the default resolver's action through the actual pinned Store;
- verify the exact second physical card leaves the owner's hand and enters one Bench slot, while the original Active Iron Thorns remains unchanged;
- capture the prompt metadata, both policy proposals, before/after physical zones, accepted action, controlled shuffle summaries, source/defender deck hashes, actual first player, and engine pin.

The default resolver is part of Twinleaf's `allPromptResolvers`. It ranks unblocked prompt cards using `StateScore.getCardScore`, which evaluates the owner's `HandScore`; this is a generic hand-value heuristic, not an opponent-threat-aware Bench policy. The shuffle controller is a test fixture, not a playing policy.

## Amendment before execution, 6 November 2026

The initial fixture draft explicitly selected the bonus Basic in a test wrapper. Before any run, this was changed to delegate the optional prompt to the default `ChooseCardsPromptResolver` and observe its native action. The owner-only wrapper now handles only mandatory initial setup selections and the compensation-draw prompt. The Store observer compares the default action with the Agent50 protected chooser's empty proposal. The test receipt schema was advanced to `agent50-rank26-vs-rank6-mulligan-bonus-bench-native-v2-default-resolver`. No CI execution has occurred between the draft and this amendment.

## Existing-hook comparison

The current `agent50-owner-preserve-turn-entry-setup.cjs` returns an empty selection whenever `min===0` and that selection validates. The current `agent50-owner-protected-multibasic-store.cjs` applies that behavior to every matching optional setup prompt and records `bonusDeclines`. The test will report this exact code behavior separately from the native Store treatment.

## Success and failure criteria

**Success:** all five controlled setup conditions occur; the real native optional prompt accepts both empty and one-card selections; the actual Store accepts the second-Thorns selection and physically places that same object on the Bench; Active identity is unchanged.

**Failure:** any expected shuffle/setup prompt is absent, the designed hand composition is not achieved, the optional prompt or one-card selection fails validation, Store dispatch rejects or fails to settle the selection, or physical identity/zone assertions fail. Preserve the failure receipt.

## Scope and limits

This experiment stops immediately after native setup compensation placement. It does not play a turn, prove a first-turn KO, measure setup frequency, compare full-game outcomes, establish a generally optimal setup policy, or qualify any deck or opponent. Agent47's analytic probability remains a model result, not an empirical estimate. Any strategic adoption requires a separately preregistered, source-conserved A/B comparison with full opponent continuation and paper-rule validation.
