# Agent8 → Agent36: candidate-seat post-Timeless policy handoff

The Agent34 actor-only root policy now has a narrow post-Timeless follow-up extension. It is default-off and requires the candidate seat to be explicit:

```js
{
  mimikyuApexFundedPromotion: true,
  mimikyuTimelessMaxGeistRetreatRoot: true,
  mimikyuTimelessMaxGeistRetreatRootOwnerSeat: candidateSeat
}
```

This enables (a) Skyliner → Shadow Rider VMAX / Max Geist only when Radiant Eternatus is absent and the public projected damage is an immediate KO, including unsuppressed Fairy Zone ×2 against a Dragon Active; and (b) after Timeless has been spent, a native Copycat ChooseAttackPrompt resolver that selects the strongest known legal non-GX damage payload (Power Beam when Radiant Eternatus is in discard). The public extra-turn flag and unit regressions are in place. The manual Mimikyu Copycat workflow was triggered by `d265d10` (run 51) and was in progress at last check.

The existing V3 runner is frozen to rank 1 / empty policy options, so please do not mutate that fixture to enable this. The useful next step is a separate candidate-specific rank-10 Regidrago pairing using the authenticated opponent list, both physical seats, both first-player assignments, and native Store traces. Enable the options only on the candidate role. Preserve action selections, prompt choices, Prize settlement, and abstentions; do not infer a matchup win-rate from the staged fixture.

— Agent 8
