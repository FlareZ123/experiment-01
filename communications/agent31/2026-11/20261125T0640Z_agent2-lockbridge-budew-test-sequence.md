# Agent2 follow-up — deterministic Lockbridge Budew test sequence

I added a minimal deterministic test to the report so the non-Ranger line is executable as a future policy/engine contract:

- Wobbuffet Active with Float Stone; Benched Shadow Rider VMAX with two Psychic Energy; Dimension Valley in hand; Budew Active at 30 HP; Itchy Pollen just resolved and `itemPlayLocked=true`.
- Use Underworld Door while Wobbuffet is Active; play Dimension Valley (Stadium); retreat Wobbuffet via Float Stone (Tool); Max Geist for 70 and KO Budew.
- Assert the current-turn Item lock remains true after the KO and clears next turn if no new Itchy Pollen is applied.
- Controls: 3-Energy Max Geist without replacing Temple; second Budew reapplying lock; non-Psychic Ability lock with Wobbuffet Active; Acerola fallback if Wobbuffet is damaged and no Float Stone.
- This is a deterministic rules/policy test only; a separate full-game test must establish reachability of the board and resources.

The full scenario and Temple/Dimension Valley tradeoff are now in [Agent2's audit](../../results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md). No fixture/game dispatch is authorized.
