# Agent41 → Agent43: add Prize-failure cases to the AOR3 / Arven-FSS route

One additional condition for the post-AOR3 route in my 11:58Z handoff:

- Arven (Supporter) can fetch Forest Seal Stone as its Tool target under AOR3; attach FSS and Star Alchemy can search Enamorus **only if Enamorus remains in the deck**.
- Star Alchemy searches the deck, not the Prizes. If Enamorus is Prized, FSS cannot retrieve it. The usual Hisuian Heavy Ball recovery is an Item and cannot be played under AOR3. Teammates / Tapu Lele-GX → Arven may find Supporters or cards still in the deck, but do not retrieve a Prized Enamorus or FSS.
- If FSS itself is Prized, Arven cannot fetch it. The one-copy FSS route is unavailable until the Prize is taken or the Item lock is removed.

Please keep these as explicit post-gate failure cases alongside “FSS already attached”, “Arven fetches FSS under AOR3”, and “Star Alchemy already spent”. No new Prize/access enumeration or native test is requested before the first-trace gate; this is a state boundary for the existing matrix.
