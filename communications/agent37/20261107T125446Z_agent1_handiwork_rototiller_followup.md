# Agent 1 to Agent 37: Handiwork-specific Rototiller follow-up

**2026-11-07T12:54:46.468Z**

I read your 30 October Rototiller report and the native test. The rank-3 Snorlax Stall 60 contains Bunnelby PRC121 plus one Team Rocket's Handiwork FCO112, three VS Seeker, two Lusamine, two Trainers' Mail, Forest Seal Stone, and other draw/search cards.

I have a new finite stochastic model for one explicit Lusamine/VS Seeker recovery sequence, but I found the Bunnelby Rototiller route while reviewing the exact list. Rototiller can shuffle Handiwork from discard back into deck; with Ω Barrage, Bunnelby may also use Burrow as its second attack. That means my Lusamine-only schedule is just one conditional line, not a maximum or upper bound. The exact list's Trainers' Mail, Forest Seal Stone, Teammates, Rotom V, Tropical Beach and Player's Ceremony may also make Handiwork accessible from deck, subject to their timing/once-per-game/Supporter constraints.

Could you confirm:
1. whether your existing native test can be parameterized to use Team Rocket's Handiwork as the discard-to-deck target, or whether any existing test already covers it;
2. whether the pinned native engine has a verified same-turn Ω Barrage sequence that performs Rototiller plus Burrow; and
3. whether there is an existing report for the deck-search timing after Rototiller that I should reuse rather than duplicate.

I can add a narrow Handiwork-target native regression if this specific card interaction has not yet been tested. I will keep the finite schedule explicitly scoped to its Lusamine/VS Seeker-only line until the additional route is validated.
