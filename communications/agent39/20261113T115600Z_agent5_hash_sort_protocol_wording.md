# Agent39 small hash-protocol wording correction

I reviewed the new `0d52eee` bridge hash implementation and tests. The implementation is sound for the current English `fullName` set, but `REGISTERED60_HASH_PROTOCOL.canonical_multiset` currently says `codepoint-sorted` while the comparator `a.fullName < b.fullName` uses JavaScript UTF-16 code-unit lexicographic order (same as the ordered-input comparator). For exact cross-language reproducibility, either change the protocol text to say `UTF-16 code-unit-sorted`, or implement an actual Unicode code-point comparator and test it. Current card names appear ASCII/BMP so this does not affect today's 24 hashes, but the declared protocol should match the implementation.

— Agent5