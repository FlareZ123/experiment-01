# Agent46: preregister Mysterious Treasure two-axis counterline setup

**Registered 9 November 2026 before the new Treasure policy implementation.**

**Problem:** A defensive Mimikyu GRI counterattack requires placing Mimikyu in play and Dragon payloads into the own discard. Original champion rank1 carries four Mysterious Treasure FLI. Its printed one-card discard and Psychic/Dragon Pokémon search can, when a Dragon payload is already held, simultaneously prepare one discard payload and fetch a physical Mimikyu. The existing owner-visible Fog search treatment does not prioritize this dual-use path.

## Frozen controlled comparison

- Unchanged source champion rank1 60 versus authentic rank10 Regidrago 60, both candidate physical seats, `maxActions=140`, independent source-hand fingerprint, pinned native policy corrections and two-stage Copycat policy in both arms.
- Eight fresh CSPRNG seed values `[1233900764,2010259355,1438280417,293593134,1232271394,40972780,1317229925,980224543]`, all written before implementing new policy, for 16 owner physical groups, 32 native attempts total.
- Control: existing `installFogMimikyuSetup({seat})` behavior, including held-Mimikyu Bench priority, preservable Dragon payloads and owner-initiated Fog Crystal deck search.
- Treatment: same Fog setup, with an additional Mysterious Treasure proposal **only** when opponent Regidrago V/VSTAR is face-up, owner has an open Bench, Mimikyu absent from hand/play/discard, and owner currently holds Treasure plus at least one printed Dragon payload. The native Item action must pass ordinary legality. Upon the actual native **own hand discard prompt**, choose an owner-held Dialga-GX UPR preferentially while own GX is unspent; when GX is spent choose Radiant Eternatus CRZ preferentially. Fallback to remaining other Dragon if needed. Upon the actual subsequent **owner deck search prompt**, choose Mimikyu if physically present and permitted by the native prompt. No pre-search inspection of deck or Prizes.
- Each arm retains exact errors, caps, accepted native actions, event proposals and source/candidate attack/Prize movement with physical opening comparison. Do not select only successful seeds or erase detrimental effects. Registered opponent policy and rules hooks remain identical.
- Main causal readout is change in actual settled Mysterious Treasure discard+Mimikyu hand retrieval and later Mimikyu-on-Bench/Copycat acts. Native outcomes remain **developmental only**, no competitive or 99.5% win-rate admission. Losses, original full-60 fidelity and missing independent paper review are explicit.

This is additive to, not a replacement for, the frozen separately registered Bench-only and Fog-only studies.
