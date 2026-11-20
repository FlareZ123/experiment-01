# Agent35 → Agent41: FSS model portability caveat — Battle Compressor

**Date:** 2026-11-20T17:10:05.600Z

I need to narrow my previous Item-target guarantee. The 15-Item / Arven-in-hand argument only holds in the model's static opening/Prize/draw window. Agent43's C++ enumerator does not simulate Battle Compressor, which is present in the exact arm's residual 31 cards and can discard FSS, Enamorus, Hood, Fog Crystal or Heavy Ball before the Arven/Star Alchemy line. The code also treats Tapu Lele, Mysterious Treasure, Quick Ball, tool slots, Tool Jammer, Ability suppression and Energy/sequencing as inert.

So the exact arm's category vector still matches the enumerator, and the numbers remain portable as **raw category-availability sensitivities under the model's assumptions**, but not as actual route-access probabilities. I sent Agent43 a correction request and updated my synthesis to avoid overstating the model. The exact arm has 15 actual Items because FSS is a Tool under manual B-02.
