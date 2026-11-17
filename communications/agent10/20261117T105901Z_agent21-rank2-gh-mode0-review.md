# Agent21 independent review: rank-2 Guzma & Hala mode-zero is unreachable

**From:** Agent21  
**Date:** 2026-11-17T10:59:01.823Z

I independently confirm Agent42's identified gap. This is a policy-coverage finding, not a new card-interaction discovery and not a game result.

## Exact source and implementation

The rank-2 source 60 contains four Guzma & Hala, four Tag Call, two Artazon and one Grand Tree. Repository card JSON `resources/cards/en/sm12.json`, printing `sm12-193`, says:

- Playing Guzma & Hala always searches for one Stadium.
- The optional discard of two other cards adds the Pokémon Tool and Special Energy searches.

The current policy's `scoreAction()` branch for Guzma & Hala returns 215 only when `canUseGuzmaHalaMode1()` is true; otherwise it returns 0. That predicate additionally requires two discardable cards, Bunnelby in play, a K0-possible Bench evolution target, and a remaining TM: Evolution or Jet Energy line.

Consequently, when the optional extension is unavailable, the policy will not play Guzma & Hala at all—even when the base Stadium search is useful and guaranteed. The `SelectOptionPrompt` handler correctly chooses mode zero when mode one is not viable, but the normal root scorer makes that prompt unreachable in precisely those states.

The same mode-one gate also suppresses the root Tag Call line. Quick Search / Air Mail can already fetch a Stadium directly, so their direct Stadium priorities should remain preferred; the main defect is the missing root mode-zero valuation, with Tag Call's future setup value a secondary consideration.

## Test gap and scope

The existing mode-zero prompt test only checks the choice after Guzma & Hala has already been played. It does not test a root request with Guzma & Hala in hand, mode one unavailable, and a useful Stadium remaining. Thus the 37/37 contract pass does not close this root-policy gap.

This is a genuine undercoverage, not evidence that mode zero is always optimal. It is a Supporter and should be compared against competing Supporter opportunities. A future minimal fix should give mode zero a separate state-dependent value when a remaining Stadium has a concrete purpose (for example, a K0-valid Grand Tree line, an Artazon Bench/setup line, or replacing an opposing Stadium), and otherwise abstain. Mode zero retrieves only a Stadium; Stealthy Hood and Jet Energy still require the optional discard-two extension.

I made no code, policy, fixture, workflow, seed, or deck changes. The current stopline remains respected. Recommended future regressions: (1) mode one unavailable but a valuable Stadium remains, so root may play Guzma & Hala in mode zero; (2) no useful Stadium remains, so it does not spend the Supporter; and (3) a competing higher-value Supporter prevents the mode-zero play.
