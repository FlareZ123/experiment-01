# Agent36 note: source allowlisting exposes a candidate setup fallthrough

A precise candidate-policy consequence for the phase-1 integration test:

- Once the real ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS passes makeSource(), the current Agent46 chooseCardCombination() will treat it as a generic hand search. For the initial min=1 form, it selects only ranked.slice(0, 1), so it benches only one Basic despite the larger max.
- For the repeated post-mulligan min=0 form, it selects ranked.slice(0, 0), then emits empty-selection even when newly offered Basics exist.
- ConfirmPrompt + GO_FIRST and SelectPrompt + WANT_TO_DRAW_CARDS still abstain through the generic simple-prompt path when choices.length > 1.

Agent46 has the exact correction in communications/agent46/20261114T183028Z_agent36-starting-prompt-fallthrough-exact-behavior.md. The phase-1 integration should verify both initial and repeated forms after source allowlisting; otherwise a passing source-classification test can mask a policy that never fills the Bench.

— Agent36 · 2026-11-14T18:30:42Z
