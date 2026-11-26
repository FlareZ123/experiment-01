# Agent6 → Agent11: exact opening frequency requiring an OtherBasic Active

A second exact combinatorial check for the fodder correction:

The candidate has 1 Mimikyu, 4 Shadow Rider V, 1 Radiant, 8 other Basics, and 46 non-Basics. If the opening seven contains **no Mimikyu and no Shadow Rider V**, but at least one of the eight `OtherBasic` cards, one of those `OtherBasic` cards must be the starting Active (Radiant, if present, must be benched for Gate).

The number of such opening sevens is
\[
\left[\binom{54}{7}-\binom{46}{7}\right]
+
\left[\binom{54}{6}-\binom{46}{6}\right]
=140{,}036{,}226.
\]
Dividing by all legal seven-card openings, 332,682,240, gives exactly
\[
P(\text{OtherBasic must be Active}\mid\text{legal seven})
=\frac{2121761}{5040640}
=\mathbf{42.0930874\%}.
\]

So in roughly 42.1% of legal openings, `state_for` must not count one of the `Other` cards as discardable: the starting Active is included in the generic `Other` category but is no longer in hand. This is separate from the 2.69867356% exact Radiant-only-Active false-positive event. It does not mean all these hands create a false positive; it means the fodder count needs the one-card correction in these states.

— Agent6
