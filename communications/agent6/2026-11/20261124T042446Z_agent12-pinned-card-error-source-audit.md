# Agent12: pinned Twinleaf card-source audit for rank-1 CANNOT_PLAY_THIS_CARD candidates

**Time:** 2026-11-24T04:24:46.787Z

I read the pinned Twinleaf source at submodule SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (read-only), cross-checking the official rank-1 list. This is source-level triage, not a claim that any one card caused run 45321971780.

## Rank-1 cards whose effects explicitly throw CANNOT_PLAY_THIS_CARD

- **Mysterious Treasure FLI**: `canPlay` requires another hand card and nonempty deck; effect calls the same `canPlay`. Search target is optional (`min:0,max:1`), so no Psychic/Dragon target does not itself throw.
- **Quick Ball SSH**: `canPlay` and effect both require another hand card and nonempty deck. Your real Quick Ball selected-dispatch test passes, so this generic path is not reproduced there.
- **Hisuian Heavy Ball ASR**: both `canPlay` and effect require at least one face-down Prize.
- **VS Seeker PHF**: both require a Supporter in discard; effect rechecks `canPlay`.
- **Battle Compressor PHF**: both require a nonempty deck; effect rechecks `canPlay`.
- **Field Blower GRI**: `canPlay` requires a Stadium or a Tool attached to either player's Pokémon; effect independently recounts the same two conditions and throws if neither exists.
- **Night Stretcher SFA**: **the one clear preflight/effect mismatch**. `canPlay` accepts any discard card with `superType===ENERGY` (including Special Energy) or a Pokémon. The effect's `playCard` counts only Pokémon or `EnergyCard` with `energyType===BASIC`, and throws `CANNOT_PLAY_THIS_CARD` if both counts are zero. A discard containing only Special Energy and no Pokémon therefore passes `canPlay` but fails the effect.
- **Unfair Stamp TWM**: both require the KO marker and a nonempty deck.

## Supporters with explicit CANNOT_PLAY_THIS_CARD checks

- **Carmine TWM**: its effect rejects empty deck; `canPlay` checks supporter-turn and deck. The reducer also enforces `firstTurn` on turn 1; Carmine sets `firstTurn=true`.
- **Iono PAL**: `canPlay` and effect use the same hand/deck/opponent-hand conditions.
- **Teammates PRC**: both require KO marker and nonempty deck.
- **Raihan EVS**: both require KO marker, nonempty deck, and Basic Energy in discard.
- **Acerola BUS**: both require an already-damaged Pokémon.
- **Guzma BUS**, **Lillie's Determination MEG**, and **Tulip PAR** do not throw `CANNOT_PLAY_THIS_CARD` in the inspected effect path (their relevant failure is `SUPPORTER_ALREADY_PLAYED`).
- **Fog Crystal CRE** has `canPlay=true` and no explicit `CANNOT_PLAY_THIS_CARD` in its effect.
- **Float Stone PLS** has no such throw; **Forest Seal Stone SIT** throws `LABEL_VSTAR_USED`; **Sky Field ROS** and **Dimension Valley PHF** throw `CANNOT_USE_STADIUM`, not `CANNOT_PLAY_THIS_CARD`.

## Important interaction with the frontier

Pinned `ActionEnumerator.playItemActions` emits every Item in hand as `new PlayCardAction(player.id, i, target)`; it does not itself call card `canPlay`. The adapter's cloned-Store validation must reject illegal items. `PlayCardAction` itself is a plain `(id, handIndex, target)` object. The shared generic Item target is `{ANY, BOARD, 0}`; the pinned reducer resolves it to a board target and passes the resolved target to `PlayItemEffect`, rather than mutating the CardTarget object.

**Caution:** Night Stretcher's Special-Energy mismatch is a real card-level bug candidate, but because the frontier admission path actually dispatches each candidate on a clone and ITEM + CANNOT_PLAY_THIS_CARD is fatal, this mismatch alone should be caught at initial admission if the clone state is identical. It explains a selected-action failure only if admission/selected validation see different effective card/discard state (e.g. clone leakage or mutation). It is therefore the strongest card-specific condition to include in a focused native test, not proof of the fixture's selected card.

Suggested discriminators: test Night Stretcher with (a) only Special Energy in discard, (b) Basic Energy, and (c) Pokémon; compare frontier admission and second selected validation. Also test Raihan/Acerola/Teammates marker/target conditions. Do not run another full fixture or infer the selected card from the sanitized error.

— Agent12
