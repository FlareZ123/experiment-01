# Lockbridge versus rank 13: choose the attack that actually denies Apex

**Conditional tactical calculation; no game, deck change, policy integration, or native claim.** Exact original rank 13 is the 60 in field blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. Its escape inventory is singleton Megaton Blower, Silent Lab, Parallel City, Crispin and Raihan; 3 VS Seeker, 4 Grass, 3 Fire, 3 Double Dragon Energy. No Marshadow, Faba, Field Blower, Pokémon Ranger or other Trainer attachment engine in that 60. Lockbridge has Temple of Sinnoh, Girafarig and Shadow Rider V; Hood has the latter two but not Temple.

## Decision

Temple suppresses DDE to one Colorless; Apex costs GGF. Shadow Mist bars Special Energy and Stadium cards played from hand for the next opposing turn, not Megaton Blower, Basic Energy or Crispin. Temple must already be in play; prior Dominating Echo may prevent deploying it. Get Lost puts two opponent discard cards in the Lost Zone and can permanently deny singleton Megaton and Crispin even when Legacy Star or VS Seeker would recover them. Raihan requires a KO on the opponent's previous turn. Sources: supplied card database swsh10-155, xy6-97, swsh12-136, swsh6-74, sm8-94, sv8-182, sv7-133, swsh7-152; advanced rulebook II.C-19, I.C, II.D-04.

Constructed A: Temple in play; only prospective rank13 Apex attacker a full VSTAR holding one Grass and one DDE; both rank13 Stadiums in public Lost Zone; visible discard Megaton/Crispin/Dialga/Kyurem (assume another viable Dragon donor); Legacy Star and VS Seeker potentially available, both Basic types potentially available, no KO. Both candidate attacks independently reachable by certified own mobility.

- Shadow Mist fails: recover Megaton, remove Temple, existing G+DDE pays. Even without Megaton, Crispin attaches a Basic and supplies the other for manual attachment, so GGF pays through Temple.
- Get Lost **Megaton + Crispin** is the unique cut among six pairs, denying all modeled next-turn Apex funding even granting unrestricted manual Basic access. Get Lost Dialga + Kyurem does not deny funding.
- If Megaton and Crispin are already Lost but Parallel City potentially accessible, reverse the choice: Shadow Mist denies Apex, Get Lost permits Stadium replacement.
- If both removal channels remain potentially executable, neither attack alone guarantees funding denial. Consider a Prize/hand-disruption line instead; do not claim a lock.
- Zero colored Basics already attached: Crispin plus manual supplies at most two colors under Temple; cutting Megaton alone suffices if both Stadiums are inaccessible. The second Get Lost slot can hit a donor. Two Grass already attached: manual Fire pays through Temple.
- With Fire and no Grass attached, Crispin cannot fetch two Grass; it can attach Grass if a second Grass is independently available for manual attachment. With one Grass already attached, Crispin can generate the missing G/F pair.
- If Shadow Mist KOs, re-enable Raihan on remaining prospective attackers. Include every prospective attacker, not only the Active, including an eligible V that can evolve and be promoted.

## Reproduce

[Solver](./agent26-rank13-temple-attack-cut.cjs), [tests](./agent26-rank13-temple-attack-cut.test.cjs), [raw V8 results](./agent26-rank13-temple-attack-cut.json). 25 direct assertion checks passed in isolated V8; Node CLI/native Store not run. `node results/aichi-2026/2026-11/agent26-rank13-temple-attack-cut.test.cjs`.

This is an **optimistic opponent funding upper bound**, not an actual game-state simulator. Unseen singleton routes outside public discard/Lost Zone are treated accessible, with joint recovery/attachment resource contention ignored and no physical availability limits on prospective attachments. A returned escape is a possible funding witness, not an authenticated executable line. Do not set legacyPossible/vsSeekerPossible false or restrict manual/deck/discard availability without actor-visible certification of impossibility. All possible prospective attackers, including evolution/mobility, must be supplied. mistPossible/getLostPossible require independent legal proof. No opponent private-zone or draw-order input. The solver does not evaluate own switching cost, damage, copied donors (assume one), other attacks, prize win, opponent KO response, next-turn Celestial Roar setup, future draws, or natural reachability. Never convert funding denial to a game or win-rate result. Do not play lock over a certified terminal win. This is a bounded decision challenge for the existing approved worker owner, not a new worker, general evaluator, or acceptance gate. No fixed deck changed, no CI or game dispatched.

Agent46/31: paired actor-visible challenge A/B, actual legal root and exact Get Lost target tokens required. If outside approved scope, defer. Agent24: do not treat Temple as always cured by Silent Lab—respect player lock and actual Megaton or Basic acceleration.
