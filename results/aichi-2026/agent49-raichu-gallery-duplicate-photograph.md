# Agent 49: two Raichu gallery images derive from the same physical deck photograph

**20 October 2026.** Public-media provenance control for missing exact rank-25 Alolan Raichu, **not a recovered source 60**.

## Inputs and directly inspectable evidence

Original independently archived [May 12, 2026 Aichi Expanded deck gallery](https://note.com/nayuta_poke/n/n7e3d0552090b) in [Agent 3's artifact 12265475896](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896), source field `raichu-01.png` SHA256 `a840c10fef6fc55813311ee03fa275fc6bc6b829da0315e7393fe11c5accae98`, and `raichu-02.png` SHA256 `c6a4234c02d7ce0e55dcea5e7cdd47eeaf2bdb8b7951afaccbfa6fd55ee39d00`.

The first is an embedded contemporary social post from **@teamprogress007** reporting an Alolan Raichu one-shot deck, 7-1 Swiss, **10th in qualifying**, followed by a first-round knockout loss. Its bottom-left image is a deck laid out on a Pokémon playmat. The second gallery image presents a larger standalone view of that same laid-out card photograph, with the same Pokémon playmat, black/yellow accessories and the number-10 Open League tabletop badge. Visual inspection suggested they were duplicates, independently of player attribution.

## Feature-based verification

The [reproducible OpenCV probe](../../scripts/aichi_raichu_gallery_photo_dedup.py) consumes the original ZIP, fails closed on both exact file SHA-256 checks, and compares the bottom-left crop of the first screenshot (`x=15..471,y=688..1204`) to the entire second standalone photo. With OpenCV **4.13.0**, ORB 3000 features, standard 0.75 ratio filter and 4px RANSAC homography:

- Accepted discriminating descriptor matches: **1072**.
- Matches geometrically consistent under one perspective transform: **1022**, or **95.3358%**.
- Fitted photo relation: nearly uniform 0.94 scale with an approximate +232px horizontal translation. This directly supports that **both images are renderings of one original photo**; they must not be counted as two independently recovered Raichu 60s.

The image comparison is unaffected by participant alias assumptions because it operates on the original photographic pixels only. It does **not** independently verify all card quantities, Japanese printings, deck registration, or the real-name correspondence of **Kazuki Kumegawa / rank 25**. The first image's self-reported qualifier 10th is independent tournament-position metadata, not proof of a registered finish rank. Another published 60 may share exact contents, which would require card-by-card/print-based confirmation rather than photography alone.

**Source coverage remains 29/32 exact rank-assigned 60s**, and the missing rank-25 deck is still unresolved. This reduces the gallery's apparent independent Raichu photographic evidence to **one** observed photographed deck and its repost/crop. No opponent-win or deck-win claim is supported.

## Reproduction

Run the repository script with a local original gallery capture ZIP (it reads the archive and prints JSON; no writes). The method and input checksums are embedded in the script. Its report is evidence of photo reuse, with cross-version feature counts best treated as approximate. No OCR or card inference is involved.
