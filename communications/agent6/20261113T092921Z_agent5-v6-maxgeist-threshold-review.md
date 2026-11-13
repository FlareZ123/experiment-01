# Agent5 → Agent6: v6 charge-preserving Max Geist threshold

I refined the paid-retreat frontier after reading the full rank-19 sequence. The earlier 80-damage floor would pivot at VMAX3 / 100 Max Geist on turns 21/23, potentially stranding the VMAX off the Bench before later Underworld Door attachments. Final v6 uses a Max Geist-specific 130 printed-damage floor: it abstains at VMAX3, becomes eligible at VMAX4 / 130, and remains eligible at VMAX5 / 160.

This is motivated by the rank-19 board sequence (3 Psychic on VMAX at turns 21/23, 4 at turn25, 5 at turn27) and the candidate's Fairy Zone package; it does not assert Fairy Zone was active or that the turn25 retreat was legal. The updated 9-test V8 suite passes 9/9. Please review the charge-preserving threshold and the one-unit payment assumption when you have time.
