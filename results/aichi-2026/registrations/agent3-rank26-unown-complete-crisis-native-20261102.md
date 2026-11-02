# Preregistration: extend the rank26 original-source native five-self-KO line through the final attack

**Agent 3 | 2 November 2026 | staged mechanical witness, no natural game or rate estimate**

## Frozen question

The existing `simulation/twinleaf/rank26-unown-starter-source-fixture.cjs` performs five genuine original-Store self-KOs with physical rank26 Unown Active, another physical Unown donor, two Exeggcute, Risky Ruins and three Damage Pump. This test asks whether the resulting same-turn native state can continue through an authentic source-owned **Canceling Cologne, Tapu Koko Prism Star Dance of the Ancients, one Benched Lightning to Meloetta and one to a different Bench Pokémon, hand DCE, Tool TM: Crisis Punch, Escape Rope promotion, and declared first-player Crisis Punch**, against the original rank6 sole Active Iron Thorns ex, with no opponent Bench and exactly one opponent Prize remaining.

Run unchanged original printed rank26 and rank6 60s in **both source physical seats 0 and 1**. Keep physical instance IDs conserved. Record full original Store accepted roots and prompts, own discard/energy/Bench/Tool/Lost Zone, source and opponent Prize movement, and native terminal. Use pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and research-owned existing hooks.

## Explicit manipulation boundary

The original Setup, opening random deal, first-turn search, source initial hand, source Prize positions and pre-Stadium Bench are **prepared**. The unchanged original 60s are physically redistributed to stage an owner hand containing one Cologne, one DCE, one TM and one Escape Rope, and **two own Basic Lightning directly in source discard** to stand in for their prior legal placement there. This is a **conditional action-chain existence test only**. It does not establish that real owner hand can acquire all those resources simultaneously or that a human could execute the entire sequence under the 25-minute clock. The 5-KO chain's starting state and all optional prompts are also staged. Do not aggregate these as wins or infer actual match frequencies.

## Fail-closed acceptance criteria

1. Existing two-seat native five-self-KO source chain preserves opponent Prize progression [4,2,1], original 60 card IDs and one source Active Unown.
2. Native source Cologne is paid and its effect permits subsequent Koko's Ability despite opposing Active Iron Thorns Initialization.
3. Native `AttachEnergyPrompt` accepts **two source-owned physical Lightning cards**, attached to **distinct Benched Pokémon** with Meloetta receiving one; Koko must enter the **own Lost Zone**, not become a KO.
4. Native DCE is attached once from source hand to Meloetta; native TM goes to Meloetta's Tool slot; native Escape Rope moves source Unown to Bench and Meloetta to Active; opponent no-Bench position remains Active.
5. At source first turn, native `AttackAction('Crisis Punch')` is accepted with opponent at exactly one Prize, 3 Colorless from one Lightning and one DCE, then unmodified 280 Psychic damage KOs original rank6's sole Active Iron Thorns, producing native game terminal for source.
6. Original physical 60 IDs remain conserved across both seats. Any unmet prompt, cost, state assertion or engine exception is a reported **failure**, with follow-up diagnosis, not presumed success.

Failure would localize an unclosed paper/native mismatch. Success demonstrates native mechanical reachability **conditional on a prepared source state**, while leaving the absent natural owner-access, legal first-turn setup, source/defender decision quality, clock and exact-field release gates unresolved. This has no standing as a competitive game.
