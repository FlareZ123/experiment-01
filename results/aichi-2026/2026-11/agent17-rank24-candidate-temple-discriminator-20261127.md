# Rank 24 candidate discriminator: Lockbridge Temple taxes an all-Special-Energy Iron Thorns list

Agent17 · 27 November 2026. **Decision affected:** Hood Shield vs Lockbridge fixed-60 comparison against exact rank24. Exact-list/card-text analysis; not a game or matchup result.

## Exact source energy structure

Rank24 has **no Basic Energy**. Its eight Energy cards are:

- Speed Lightning Energy ×4;
- Double Colorless Energy ×3;
- Capture Energy ×1.

Iron Thorns ex's Volt Cyclone costs **Lightning + Colorless + Colorless**.

Lockbridge has singleton **Temple of Sinnoh**. Hood Shield does not.

Temple makes each Special Energy provide only one Colorless and removes its other effects. Therefore, while Temple is live:

- Speed Lightning no longer supplies Lightning;
- DCE no longer supplies two Colorless;
- Capture no longer has its printed special effect;
- a rank24 Iron Thorns funded only by these exact Energy cannot satisfy Volt Cyclone's Lightning requirement until Temple leaves play or another effect changes the state.

This is a much stronger Temple matchup than ranks16/22, whose source Energy are Basic.

## It is a tax, not a permanent lock

Rank24 itself contains Stadium answers/replacements:

- Thunder Mountain Prism Star;
- Wondrous Labyrinth Prism Star;
- Player's Ceremony ×2;
- Guzma & Hala can search Stadium + Special Energy + Tool when its optional discard is paid.

So Lockbridge Temple should be modeled as forcing a **Stadium replacement / connector / Supporter cost**, not as permanently disabling attacks.

The source's Thunder Mountain is especially important: once it replaces Temple, Special Energy regain their printed effects and the attack cost is reduced by one Lightning under Thunder Mountain's effect for Lightning Pokémon. Any policy comparison must recompute payment after the Stadium change rather than carrying Temple suppression forward.

## Matched candidate states

1. **Temple turns off a currently payable Volt Cyclone.**
   - rank24 Active has Speed Lightning + DCE and no source Stadium in play;
   - without Temple that pays Lightning + CC;
   - with Temple, Speed becomes C and DCE becomes C, so Volt is not payable.
   Lockbridge should value Temple; Hood has no corresponding Stadium denial.

2. **Source has Thunder Mountain in hand and Stadium play unused.**
   - Temple still imposes the cost of spending the Stadium action and consuming the singleton Thunder;
   - after Thunder replaces Temple, recompute all Energy effects and attack cost before scoring the source attack.

3. **Source already played a Stadium this turn.**
   - Lockbridge Temple's current-turn denial is stronger because rank24 cannot immediately replace it by normal Stadium play.

4. **Temple already replaced.**
   - do not continue treating Speed/DCE as Colorless-only.

5. **No attack was payable even before Temple.**
   - do not award phantom denial value merely because the source list uses Special Energy.

6. **Public final candidate attack would be harmed by playing Temple.**
   - candidate-side terminal priority remains above generic disruption; the existing two-profile policy already has a guard against sacrificing a deterministic final attack.

## Interaction with rank24 Tool Jammer / Hood

This Temple axis is independent of the earlier Hood positional sequence:

- Lockbridge can use Temple to tax source Energy;
- both Hood and Lockbridge can keep a Hooded VMAX on the Bench to use Underworld Door through source Active Tool Jammer, then promote after Door;
- Temple does not eliminate the need to sequence that Door before promotion.

Thus rank24 gives Lockbridge an additional preventive axis without erasing the shared Hood timing requirement.

## Evidence boundary

The current two-profile successor already contains generic Temple payment-pressure machinery and should be capable of representing the first state if the exact public Energy/attack data are present. This note is a **matched evaluation challenge**, not a newly identified code defect and not evidence that Lockbridge wins rank24.

No candidate 60 or worker was changed.
