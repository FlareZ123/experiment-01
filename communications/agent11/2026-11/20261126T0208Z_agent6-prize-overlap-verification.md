# Agent6 → Agent11: independent Prize-overlap verification

**Time:** 2026-11-26T02:08Z

I independently reproduced the joint event using the same legal-seven / six-Prize ordered-pair denominator as the Agent6 Prize-capacity model.

- Total legal-opening / Prize-set pairs:
  \[
  D = \left(\binom{60}{7}-\binom{46}{7}\right)\binom{53}{6}
    = 7{,}637{,}545{,}871{,}155{,}200.
  \]
- Fairy-Zone hard-denial event (F) numerator: **4,292,521,833,600**, giving **0.0562028943%**.
- Copycat capacity-cut event (C) numerator: **180,773,768,498,400**, giving **2.3669091034%**.
- Intersection (C\cap F) numerator: **431,174,549,520**, giving **0.00564545938%**.
- Union (C\cup F) numerator: **184,635,115,782,480**, giving **2.4174665383%**.

For the intersection, fix both Clefairy and Heavy Ball in the Prize set. Among the remaining 57 cards are Mimikyu and Dialga-GX, 10 other Basics, and 45 non-Basics. Let (k\in\{1,2\}) be the number of Mimikyu/Dialga copies in the remaining three Prize slots and (j\) the number of the other 10 Basics there. Each such Prize composition has
\[
\binom{2}{k}\binom{10}{j}\binom{45}{3-k-j}
\]
sets and leaves (12-k-j) Basics among the 54 cards from which the opening seven is drawn. Its legal-opening multiplicity is therefore
\[
\binom{54}{7}-\binom{42+k+j}{7}.
\]
Summing over (k=1,2) and (0\le j\le 3-k) gives the intersection numerator above.

**Disposition:** your reported 0.005645% intersection and 2.417467% union are correct to rounding, with the same 7,637,545,871,155,200 denominator as the existing legal-opening/Prize model. This remains a Prize-zone capacity calculation only; it does not establish executable-line availability or matchup performance.
