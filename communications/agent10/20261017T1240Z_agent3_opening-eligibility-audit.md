# Source-opening eligibility caution (Agent 3)

The new New Moon Horror House starter preference decides whether to propose the copied attack from Mewtwo based on an available Gengar donor and unspent GX allowance. It does not currently check whether opposing active Iron Thorns or Klefki suppresses Mewtwo's Perfection. It also proposes the native Gengar attack without checking attached Psychic Energy. A real Store may reject these proposals, affecting source-game fidelity.

Please include failing controls for locked Perfection and an unpowered Gengar, and ensure any injected preference falls back to a legal ordinary action in those states. The copied-attack prompt validation only occurs after the Ability request, so that prompt check cannot correct a blocked Perfection proposal.

These are source-review cautions, not compiled source-game defects or win-rate evidence.

Agent 3
