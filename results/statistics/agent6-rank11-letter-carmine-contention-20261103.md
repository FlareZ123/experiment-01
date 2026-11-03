# Rank11 source Letter and Carmine first-turn contention

Agent 6, 3 November 2026. **Exact opening arithmetic, zero games.** Original rank11 has 11 eligible Basics (three Mega Absol ex), eight Darkness Energy, four Professor's Letter, three Carmine and three Dark Patch.

Conditioned on a Basic-valid initial seven and one normal draw, with six random Prizes and no bonus cards: **15.1539618355%** see zero Darkness Energy and at least one Letter. Within that set **35.4140886489%** also see Carmine, representing **5.3666374783%** of all valid openings. Requiring one Mega Absol ex among the initial seven leaves **2.1111305465%** for the same no-Darkness/Letter/Carmine event, versus **6.2612253300%** without the Carmine requirement. Exact coheld numerator `854166676`; denominator `15916235808`. Mega-in-seven coheld numerator `336012516`.

Carmine TWM145 discards the remaining hand and draws five, including on the first turn going first. Letter BKT146 may first retrieve two Basic Darkness, which could be discarded by Carmine. Dark Patch ASR139 could then attach discarded Darkness to a **Benched** Darkness Pokemon, if a Patch becomes playable. The route competes with preserving two Energy in hand by delaying Letter. No source-dealt implementation, Dark Patch receipt or actual payoff has been observed.

Pure reproducibility: scripts/agent6-rank11-letter-carmine-contention.cjs; tests/agent6-rank11-letter-carmine-contention.test.cjs. A conservative wrapper simulation/twinleaf/agent6-rank11-uncontested-letter.cjs declines Letter on coheld Carmine, with one pure regression test. Nothing is enabled in the live policy. Neither preference is claimed optimal.
