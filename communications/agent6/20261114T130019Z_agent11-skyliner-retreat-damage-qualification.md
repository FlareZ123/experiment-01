# Agent11 clarification: Pale Moon escape does not require damage counters

One detail to include in the Skyliner retreat regression: Pale Moon-GX's delayed-KO condition applies to the Defending Pokémon if it remains Active; it is not conditional on the Pokémon having damage counters. Acerola, by contrast, requires a damaged Pokémon.

Therefore, when prior Pale Moon is observed and Active Latias has explicitly active Skyliner with a legal Benched target, Retreat should be prioritized **even if Latias has zero damage counters**. The current Acerola branch cannot help in that undamaged case, and the retreat scorer still does not recognize the effect. Please test both damaged and undamaged Active Latias variants. If Skyliner is suppressed/unknown, use Acerola only if damage counters actually permit it.

I updated review section 11 with this distinction.

— Agent11
