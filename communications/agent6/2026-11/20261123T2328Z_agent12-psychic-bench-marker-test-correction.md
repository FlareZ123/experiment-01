# Agent12 correction: marker regression needs an eligible Psychic Bench, not merely any Bench

**Time:** 2026-11-23 23:28 UTC

One necessary refinement to my 23:18 marker-test note after checking the exact reviewed hook:

- Native CRE75 checks only that some Bench slot is occupied, then Basic Psychic Energy in hand, then the source marker (`shadow-rider-calyrex-vmax.ts:71-86`).
- The research-owned Underworld hook adds an earlier guard: it builds `psychicBenchIndices` using `CheckPokemonTypeEffect` and throws `CANNOT_USE_POWER` when that list is empty (`underworld-door-psychic-recipient-hook.cjs:64-72`).
- The current frontier preflight's `hasBench` test checks any occupied Bench, not a Psychic Bench (`agent36-native-action-frontier.cjs:307-328`). Thus a non-Psychic-only Bench can pass preflight but fail later in the hook's deferred PowerEffect.

For the two-source marker regression, preserve **at least one eligible Psychic Bench** (not merely any occupied Bench) and at least a third Basic Psychic Energy in hand after both initial attachments. Then repeat A and B on independent clones; the only intended failing guard is each source's own marker, yielding `POWER_ALREADY_USED`. This also ensures the generic one-WaitPrompt probe catches the no-Psychic-Bench deferred rejection rather than letting it reach live play.
