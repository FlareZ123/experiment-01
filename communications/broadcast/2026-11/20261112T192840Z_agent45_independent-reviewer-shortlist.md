# Agent45: concrete external paper and strategy reviewer leads

**Status: invitation leads only; neither person has been contacted or enrolled.** The production registry remains intentionally empty. This is a recruitment handoff, not an authorization or qualification claim.

## Paper reviewer lead

**ティー — X: https://x.com/T_Anon_Pokemon2**

The public profile currently describes this person as a Pokémon Card Game Official Judge and Event Organizer since 2021, active in the Gifu/Aichi area, and WCS staff for 2023–2026. That is a strong fit for the *paper* role, subject to direct confirmation of current credential/status and willingness.

Proposed scope: inspect the exact Japanese printed 60s and event-date Japanese Extra legality; verify printed costs, targets, payment and physical zone transitions; review setup/mulligan procedure, initial 120-card custody, seats/first player, the untimed boundary, and the natural paper terminal. This reviewer should not also serve as the strategy reviewer.

Primary credential context: The Pokémon Company describes its Japanese Official Judge certification and the judges' ruling duties at official events: https://corporate.pokemon.co.jp/en/topics/detail/t-36/

## Strategy reviewer lead

**ともぽん — X: https://x.com/tomopon_ptcg**

The author’s 11 May 2026 Aichi Extra retrospective states that they did not get selected to compete, but had done deck adjustment and practice, and then analyzed the event's Extra field and the top-performing lists: https://note.com/tomopon_ptcg/n/n980eeda2406e

That makes them a useful *strategy* invitation lead without apparent ownership of one of the Top 32 lists. Confirm current Extra expertise, independence from every policy/bundle producer, any other relevant conflicts, and willingness before appointment.

Proposed scope: review the frozen candidate and rank-specific opponent policies for strategic competence; challenge suites, affordable alternatives, sequencing, opportunity cost, and whether the recorded opponent response is meaningful. This is not a paper-ruling assignment.

## Independence and trust-authority process

I found no evidence in the public repository tree that either lead is a project contributor, but repository absence is not proof of independence. The maintainer must obtain a direct declaration from each person covering project involvement, employment/financial ties, collaboration, authorship, and any relationship with candidate/opponent policy producers or bundle producers. Disclose conflicts and reject or narrow a role when a conflict affects impartiality.

**Trust authority:** GitHub reports `FlareZ123` as the repository owner with admin permission; the connected `vv12x` account has write permission only. The owner or an explicitly designated trust authority must perform enrollment.

For each consenting reviewer:
1. Verify the person and review scope through a known public channel.
2. Have the reviewer generate an Ed25519 keypair locally and retain the private key.
3. Bind the public key to the verified identity with an out-of-band signed nonce/challenge.
4. Add only `reviewerId`, the assigned `roles`, and `publicKeyPem` to `simulation/evaluation/agent45-authorized-reviewers.json`. Never request, store, or commit a private key.
5. Keep paper and strategy IDs distinct from each other, from the candidate-policy and opponent-policy reviewers, and from every policy/bundle producer. The V3 evaluator enforces distinct reviewer identities and Ed25519 signatures.

The separate `candidate-policy` and `opponent-policy` reviewer roles are still unfilled. These two leads address only `paper` and `strategy`; production admission remains blocked until all four independent roles are genuinely staffed and the actual evidence is reviewed.

## Suggested invitations

**To ティー (paper):**  
「突然のご連絡失礼します。ポケモンカードの研究プロジェクトで、CL2026愛知Mayオープンリーグ（日本語エクストラ）のデッキ・対戦を、紙のルールと実物カードの支払い／移動まで含めて独立レビューする方を探しています。公認ジャッジとしてのご経験を拝見し、紙ルール・カード合法性・盤面／カード移動のレビューをご相談できないかと思いご連絡しました。候補デッキや対戦結果を作ったメンバーとは独立した第三者レビューです。ご関心があれば、想定範囲・所要時間・謝礼等を含めて詳細をご説明します。ご本人確認、利益相反の申告、公開鍵によるレビュー署名が必要ですが、秘密鍵を共有いただくことはありません。ご検討いただけますでしょうか。」

**To ともぽん (strategy):**  
「突然のご連絡失礼します。CL2026愛知Mayエクストラの振り返り記事を拝見しました。現在、Aichi Open League Top 32を対象に、固定候補デッキと各対戦相手の意思決定ポリシーを評価する研究を進めています。実際に選べる手の比較、リソース／テンポの機会費用、相手の有意な応答まで含めた独立した戦略レビューをお願いできないかと思い、ご連絡しました。候補デッキや対戦結果を作ったメンバーとは独立した第三者レビューです。ご関心があれば、レビュー対象・所要時間・謝礼等を含めて詳細をご説明します。利益相反の申告と公開鍵によるレビュー署名が必要ですが、秘密鍵を共有いただくことはありません。ご検討いただけますでしょうか。」

— **Agent45**
