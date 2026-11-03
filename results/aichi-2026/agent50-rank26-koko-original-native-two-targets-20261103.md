# Agent50: native Koko Prism Star two-target attachment and Lost Zone verified

**3 November 2026.** Authentic pinned Store staged substep for original source rank26. This is a source card-text mechanical result, with zero natural games and zero win-rate inference.

Source-authenticated original rank26 Meloetta 60 from `planAichi(26)`, exact printed physical cards, two separately instantiated **Lightning Energy MEE** in source discard, **Meloetta ex** and a surviving **10-damage Exeggcute** on the Bench, **Tapu Koko Prism Star** also Benched, Squawkabilly ex Active, and a locked-free opposing Active. Invoked actual `PowerEffect` for Koko's `Dance of the Ancients`, and selected two distinct lightning cards and **two distinct Benched recipient slots** using the actual live `AttachEnergyPrompt` and owner `ResolvePromptAction`.

Compiled [CI run 41571053679](https://github.com/FlareZ123/experiment-01/actions/runs/41571053679) at head `0d6e88f52471f3bfccf0647c2cf87b4a73425e6e` emitted **2/2 Koko tests passed** on source physical seats 0 and 1. Exact post-prompt receipts both seats:

- Meloetta Bench received **one original Lightning Energy MEE**.
- Surviving 10-damage Exeggcute Bench received the **other** original Lightning Energy MEE.
- Source discard has **zero** remaining Lightning cards from the two original starting cards.
- Koko Prism Star physically entered the source Lost Zone and is **no longer on the Bench**.
- No unsettled prompt remains.

The native `AttachEnergyPrompt` was `min=1,max=2,differentTargets=true`, and our full two-recipient choice was accepted and settled exactly. This validates the **Koko handoff substep** required by the [zero-Unown conditional Crisis Punch line](agent50-rank26-unownless-crisis-punch-ledger-20261103.md) after the previously [six-passed native Damage Pump and opponent Prize fixtures](agent50-rank26-unownless-native-damage-pump-20261103.md).

The **same CI workflow concluded failure** overall because a *separate* original Meloetta first-turn TM Crisis Punch staged attack fixture produced `NOT_ENOUGH_ENERGY` on both seats. The Koko case itself passed; root of the attack fixture's energy-payment discrepancy remains under investigation (attack action selection signature, special Energy encoding, or pinned engine behavior). Printed Meloetta BLK44's first-turn ability is named **Debut Performance** in the supplied English source card pool but pinned Twinleaf names the corresponding native power **Live Debut**. The label difference alone proves no missing Ability.

Exact reproducible Koko test: [`tests/agent50-rank26-koko-dual-recipient.native.test.cjs`](../../tests/agent50-rank26-koko-dual-recipient.native.test.cjs). Manual workflow: [`agent50-rank26-koko-dual-recipient-native.yml`](../../.github/workflows/agent50-rank26-koko-dual-recipient-native.yml). Its first diagnostic-only invocation [41570152625](https://github.com/FlareZ123/experiment-01/actions/runs/41570152625) 2/2 also passed to identify authentic prompt type; final two-target settlement is the later 41571053679.

**Qualification boundary:** staged original cards and damage, no full turn, no natural card assembly, no certified first-turn final attack or winning engine terminal, no representative opponent policy. The full 32-opponent field still has 29 authenticated originals and zero competitive-qualified games.
