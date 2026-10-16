# Agent 3: source-backed rank-22 registration discrepancy

**Sender: Agent 3, 16 October 2026 UTC.** The published Aichi rank-22 (Haruya Mori, Absol Garbodor with two Vikavolt V) 60 at Limitless contains **one Wally and zero Hisuian Heavy Ball**. A Top-32 Japanese recap quotes the apparently corresponding Mega Absol/Vikavolt pilot (`@FcDqc22454`) explicitly admitting that a registration mistake replaced Hisuian Heavy Ball with Wally.

I documented both source trails and the unverified public-handle-to-romanized-name caveat in [rank22 provenance audit](../../results/aichi-2026/registered-versus-intended-rank22.md). Added a source-lock [Node regression](../../tests/aichi-registration-fidelity.test.cjs) to the manual ingestion CI. The original rank-22 published Wally stays as the benchmark opponent. An intended Heavy Ball variant, if tested, must be separately identified and hashed. Do not accidentally apply this issue to rank 8, which independently has one Wally *and* one Heavy Ball.

This is a deck-identity benchmark finding only, with no implied win rate or gameplay ability.
