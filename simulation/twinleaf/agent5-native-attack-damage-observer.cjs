'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-native-attack-damage-ko-prize-observer-v1';

function cardName(card) {
  return card?.fullName ?? card?.name ?? null;
}

function remainingPrizes(player) {
  if (typeof player?.getPrizeLeft === 'function') return player.getPrizeLeft();
  if (Array.isArray(player?.prizes)) {
    return player.prizes.filter(slot => slot.cards.length > 0).length;
  }
  return null;
}

/**
 * Detached public-board snapshot. Prize faces, hands, decks and hidden zones
 * are deliberately excluded.
 * @param {object} state Native Store state.
 * @returns {object[]}
 */
function publicBoardSnapshot(state) {
  return state.players.map((player, seat) => ({
    seat,
    active: cardName(player.active?.getPokemonCard?.()),
    activeDamage: player.active?.damage ?? null,
    activeEnergies: (player.active?.energies?.cards ?? []).map(cardName),
    bench: (player.bench ?? []).map((slot, index) => ({
      index,
      pokemon: cardName(slot.getPokemonCard?.()),
      damage: slot.damage ?? null,
      energies: (slot.energies?.cards ?? []).map(cardName)
    })),
    prizesRemaining: remainingPrizes(player)
  }));
}

/**
 * @param {object} state
 * @param {object|null|undefined} target
 * @returns {{seat:number,zone:'active'|'bench',index:number,pokemon:string|null}|null}
 */
function locatePublicTarget(state, target) {
  if (!target) return null;
  for (let seat = 0; seat < state.players.length; seat++) {
    const player = state.players[seat];
    if (player.active === target) {
      return {
        seat,
        zone: 'active',
        index: 0,
        pokemon: cardName(target.getPokemonCard?.())
      };
    }
    const index = (player.bench ?? []).indexOf(target);
    if (index >= 0) {
      return {
        seat,
        zone: 'bench',
        index,
        pokemon: cardName(target.getPokemonCard?.())
      };
    }
  }
  return null;
}

/**
 * Read-only observer for actual attack damage, native KnockOutEffect and the
 * physical Prize/promotion prompt chain on the genuine Store. It never
 * changes an action, prompt answer, card, zone, or reducer.
 *
 * @template T
 * @param {()=>T} execute One synchronous native match.
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeAttackDamageObserver(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ?? require(path.join(output, 'game/store/store')).Store;
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  const oldReduce = Object.getOwnPropertyDescriptor(Store.prototype, 'reduceEffect');
  assert.equal(typeof oldDispatch?.value, 'function');
  assert.equal(typeof oldReduce?.value, 'function');
  assert.equal(oldDispatch.configurable, true);
  assert.equal(oldReduce.configurable, true);

  let liveStore = null;
  let currentAttack = null;
  let nextAttackId = 0;
  const audit = {
    schema: VERSION,
    realStores: 0,
    acceptedAttackActions: 0,
    rejectedAttackActions: 0,
    observedDamageEffects: 0,
    observedKnockOutEffects: 0,
    completedPromptChains: 0,
    incompletePromptChains: 0,
    attacks: [],
    observerReadOnly: true,
    opponentConcealedZonesRead: false,
    ownerHandReadOnlyForPrizeTransfer: true,
    competitiveGamesQualified: 0
  };

  function unresolvedPrompts(state) {
    return (state.prompts ?? []).filter(prompt => prompt.result === undefined);
  }

  function finishAttack(store, error = null) {
    if (!currentAttack) return;
    const state = store.state;
    const pending = unresolvedPrompts(ýÍÑÑ¤ì(ÕÉÉ¹ÑÑÑ¬¹ÍÑÑ±µ¹Ðôì(½µÁ±ÑèÁ¹¥¹¹±¹Ñ ôôôÀ°(Õ¹ÉÍ½±ÙAÉ½µÁÑQåÁÌèÁ¹¥¹¹µÀ¡ÁÉ½µÁÐôøÁÉ½µÁÐ¹½¹ÍÑÉÕÑ½Èü¹¹µüü¹Õ±°¤°(¥¹±AÕ±¥	½ÉèÁÕ±¥	½ÉM¹ÁÍ¡½Ð¡ÍÑÑ¤°(ÉÉ½ÈèÉÉ½Èôôô¹Õ±°ü¹Õ±°èMÑÉ¥¹¡ÉÉ½Èü¹µÍÍüüÉÉ½È¤¹Í±¥ À°ÌÈÀ¤(ôì(¥¡ÕÉÉ¹ÑÑÑ¬¹ÍÑÑ±µ¹Ð¹½µÁ±Ñ¤Õ¥Ð¹½µÁ±ÑAÉ½µÁÑ¡¥¹Ì¬¬ì(±ÍÕ¥Ð¹¥¹½µÁ±ÑAÉ½µÁÑ¡¥¹Ì¬¬ì(Õ¥Ð¹ÑÑ­Ì¹ÁÕÍ ¡ÕÉÉ¹ÑÑÑ¬¤ì(ÕÉÉ¹ÑÑÑ¬ô¹Õ±°ì(ô((Õ¹Ñ¥½¸¥ÍÁÑ ¡Ñ¥½¸°¸¸¹ÉÌ¤ì(½¹ÍÐ­¥¹ôÑ¥½¸ü¹½¹ÍÑÉÕÑ½Èü¹¹µüü¹Õ±°ì(¥¡­¥¹ôôôA±åÉÑ¥½¸±¥ÙMÑ½É¤ì(±¥ÙMÑ½ÉôÑ¡¥Ìì(Õ¥Ð¹É±MÑ½ÉÌ¬¬ì(ô(½¹ÍÐ±¥ÙôÑ¡¥Ìôôô±¥ÙMÑ½Éì(½¹ÍÐÍÑÑôÑ¡¥Ì¹ÍÑÑì(½¹ÍÐ¥ÍÑÑ¬ô±¥Ù­¥¹ôôôÑÑ­Ñ¥½¸ì(±ÐÍÑÉÑÑÑ¬ô¹Õ±°ì(±ÐÁÉ½µÁÑI½Éô¹Õ±°ì(½¹ÍÐÁÉ½µÁÑÑÑ¬ôÕÉÉ¹ÑÑÑ¬ì((¥¡¥ÍÑÑ¬¤ì(¥¡ÕÉÉ¹ÑÑÑ¬¤¥¹¥Í¡ÑÑ¬¡Ñ¡¥Ì°¹ÜÉÉ½È MÕÁÉÍä¹½Ñ¡ÈÑÑ­Ñ¥½¸¤¤ì(½¹ÍÐÑ½É%ôÑ¥½¸¹¥üüÑ¥½¸¹±¥¹Ñ%üüÑ¥½¸¹Á±åÉ%ì(½¹ÍÐÑ½ÉMÐôÍÑÑ¹Á±åÉÌ¹¥¹%¹à¡Á±åÈôøÁ±åÈ¹¥ôôôÑ½É%¤ì(ÍÑÉÑÑÑ¬ôì(¥è¬­¹áÑÑÑ­%°(Ñ½ÉMÐèÑ½ÉMÐøôÀüÑ½ÉMÐèÍÑÑ¹Ñ¥ÙA±åÈ°(ÑÕÉ¸èÍÑÑ¹ÑÕÉ¸°(ÑÑ­9µèÑ¥½¸¹¹µüüÑ¥½¸¹ÑÑ­9µüüÑ¥½¸¹ÑÑ¬ü¹¹µüü¹Õ±°°(Ñ¥½¹-¥¹è­¥¹°(ÁÑè±Í°(½ÉAÕ±¥	½ÉèÁÕ±¥	½ÉM¹ÁÍ¡½Ð¡ÍÑÑ¤°(ÑÉÑ¥½¹AÕ±¥	½Éè¹Õ±°°(ÑÌèmt°(ÁÉ½µÁÑIÍ½±ÕÑ¥½¹Ìèmt°(ÍÑÑ±µ¹Ðè¹Õ±°(ôì(ÕÉÉ¹ÑÑÑ¬ôÍÑÉÑÑÑ¬ì(ô((¥¡±¥ÙÕÉÉ¹ÑÑÑ¬­¥¹ôôôIÍ½±ÙAÉ½µÁÑÑ¥½¸¤ì(½¹ÍÐÁÉ½µÁÐôÍÑÑ¹ÁÉ½µÁÑÌü¹¥¹¡É½Üôø(É½Ü¹¥ôôôÑ¥½¸¹¥É½Ü¹ÉÍÕ±ÐôôôÕ¹¥¹¤ì(¥¡ÁÉ½µÁÐ¤ì(½¹ÍÐ½Ý¹ÉMÐôÍÑÑ¹Á±åÉÌ¹¥¹%¹à¡Á±åÈôø(Á±åÈ¹¥ôôôÁÉ½µÁÐ¹Á±åÉ%¤ì(½¹ÍÐ½Ý¹Èô½Ý¹ÉMÐøôÀüÍÑÑ¹Á±åÉÍm½Ý¹ÉMÑtè¹Õ±°ì(½¹ÍÐÍ±ÑAÉ¥éÉÌô(ÁÉ½µÁÐ¹½¹ÍÑÉÕÑ½Èü¹¹µôôô¡½½ÍAÉ¥éAÉ½µÁÐ(ÉÉä¹¥ÍÉÉä¡Ñ¥½¸¹ÉÍÕ±Ð¤(üÑ¥½¸¹ÉÍÕ±Ð¹±Ñ5À¡Í±½ÐôøÍ±½Ð¹ÉÌ¹Í±¥ ¤¤(èmtì(ÁÉ½µÁÑI½Éôì(ÁÉ½µÁÑQåÁèÁÉ½µÁÐ¹½¹ÍÑÉÕÑ½Èü¹¹µüü¹Õ±°°(µÍÍèÁÉ½µÁÐ¹µÍÍüü¹Õ±°°(½Ý¹ÉMÐ°(Í±ÑM±½ÑÌèÉÉä¹¥ÍÉÉä¡Ñ¥½¸¹ÉÍÕ±Ð¤üÑ¥½¸¹ÉÍÕ±Ð¹±¹Ñ è¹Õ±°°(Í±ÑAÉ¥éÉÌèÍ±ÑAÉ¥éÉÌ¹±¹Ñ °(Á¡åÍ¥±AÉ¥éÉÍQ½=Ý¹É!¹è¹Õ±°°(Ñ¥Ù	½Éè½Ý¹ÈüÁÕ±¥	½ÉM¹ÁÍ¡½Ð¡ÍÑÑ¥m½Ý¹ÉMÑt¹Ñ¥Ùè¹Õ±°°(Ñ¥ÙÑÈè¹Õ±°°(ÉÍ½±Ùè±Í(ôì(ÁÉ½µÁÑI½É¹}Í±ÑAÉ¥éÉÌôÍ±ÑAÉ¥éÉÌì(ô(ô((ÑÉäì(½¹ÍÐÉÍÕ±Ðô½±¥ÍÁÑ ¹Ù±Õ¹±°¡Ñ¡¥Ì°Ñ¥½¸°¸¸¹ÉÌ¤ì(¥¡ÍÑÉÑÑÑ¬¤ì(ÍÑÉÑÑÑ¬¹ÁÑôÑÉÕì(Õ¥Ð¹ÁÑÑÑ­Ñ¥½¹Ì¬¬ì(ÍÑÉÑÑÑ¬¹ÑÉÑ¥½¹AÕ±¥	½ÉôÁÕ±¥	½ÉM¹ÁÍ¡½Ð¡Ñ¡¥Ì¹ÍÑÑ¤ì(ô(¥¡ÁÉ½µÁÑI½ÉÁÉ½µÁÑÑÑ¬¤ì(½¹ÍÐ½Ý¹ÈôÁÉ½µÁÑI½É¹½Ý¹ÉMÐøôÀ(üÑ¡¥Ì¹ÍÑÑ¹Á±åÿ÷5·&ö×E&V6÷&Bæ÷væW%6VEÐ¢¢çVÆÃ°¢6öç7B6&G2Ò&ö×E&V6÷&Bå÷6VÆV7FVE&¦T6&G3°¢&ö×E&V6÷&Bç66Å&¦T6&G5Fô÷væW$æBÐ¢6&G2æÆVæwFâbb6&G2æWfW'6&BÓâ÷væW"ææBæ6&G2ææ6ÇVFW26&B°¢&ö×E&V6÷&Bæ7FfTgFW"Ò÷væW ¢òV&Æ4&ö&E6æ6÷BF2ç7FFR·&ö×E&V6÷&Bæ÷væW%6VEÒæ7FfP¢¢çVÆÃ°¢&ö×E&V6÷&Bç&W6öÇfVBÒF2ç7FFRç&ö×G3òç6öÖR&ö×BÓà¢&ö×BæBÓÓÒ7FöâæBbb&ö×Bç&W7VÇBÓÒVæFVfæVBÓÓÒG'VS°¢FVÆWFR&ö×E&V6÷&Bå÷6VÆV7FVE&¦T6&G3°¢&ö×DGF6²ç&ö×E&W6öÇWFöç2çW6&ö×E&V6÷&B°¢Ð¢bÆfRbb7W'&VçDGF6²bbVç&W6öÇfVE&ö×G2F2ç7FFRæÆVæwFÓÓÒ°¢fæ6GF6²F2°¢Ð¢&WGW&â&W7VÇC°¢Ò6F6W'&÷"°¢b7F'FVDGF6²°¢7F'FVDGF6²æF7F6W'&÷"Ò7G&ærW'&÷#òæÖW76vRóòW'&÷"ç6Æ6RÂ3#°¢VFBç&V¦V7FVDGF6´7Föç2²³°¢fæ6GF6²F2ÂW'&÷"°¢ÒVÇ6RbÆfRbb7W'&VçDGF6²°¢7W'&VçDGF6²ç&ö×DF7F6W'&÷"Ð¢7G&ærW'&÷#òæÖW76vRóòW'&÷"ç6Æ6RÂ3#°¢fæ6GF6²F2ÂW'&÷"°¢Ð¢F&÷rW'&÷#°¢Ð¢Ð ¢gVæ7Föâ&VGV6TVffV7B7FFRÂVffV7BÂââæ&w2°¢6öç7B¶æBÒVffV7Còæ6öç7G'V7F÷#òææÖRóòçVÆÃ°¢6öç7B&VÆWfçBÒôFÖvWÄ¶æö6´÷WBöçFW7B¶æBóòrrÇÀ¢çVÖ&W"æ4fæFRVffV7CòæFÖvR°¢bF2ÓÒÆfU7F÷&RÇÂ7W'&VçDGF6²ÇÂ&VÆWfçB°¢&WGW&âöÆE&VGV6RçfÇVRæ6ÆÂF2Â7FFRÂVffV7BÂââæ&w2°¢Ð ¢6öç7BGF6µ&V6÷&BÒ7W'&VçDGF6³°¢6öç7BF&vWBÒVffV7BçF&vWBóòçVÆÃ°¢6öç7BF&vWDÆö6FöâÒÆö6FUV&Æ5F&vWB7FFRÂF&vWB°¢6öç7Bf7FÕ6VBÒVffV7BçÆW ¢ò7FFRçÆW'2ææFWöbVffV7BçÆW"¢¢Ó°¢6öç7Bf7FÔ7FfRÒf7FÕ6VBãÒò7FFRçÆW'5·f7FÕ6VEÒæ7FfR¢çVÆÃ°¢6öç7B&Vf÷&TFÖvRÒF&vWCòæFÖvRóòçVÆÃ°¢6öç7B&Vf÷&Uf7FÔFÖvRÒf7FÔ7FfSòæFÖvRóòçVÆÃ°¢6öç7B&Vf÷&T&ö&BÒV&Æ4&ö&E6æ6÷B7FFR°¢6öç7B&W7VÇBÒöÆE&VGV6RçfÇVRæ6ÆÂF2Â7FFRÂVffV7BÂââæ&w2°¢6öç7BgFW%7FFRÒ&W7VÇCòçÆW'2ò&W7VÇB¢F2ç7FFS°¢GF6µ&V6÷&BæVffV7G2çW6°¢VffV7EGS¢¶æBÀ¢F&vWC¢F&vWDÆö6FöâÀ¢FÖvS¢çVÖ&W"æ4fæFRVffV7BæFÖvRòVffV7BæFÖvR¢çVÆÂÀ¢FÖvT6÷VçFW'3¢çVÖ&W"æ4fæFRVffV7BæFÖvT6÷VçFW'2¢òVffV7BæFÖvT6÷VçFW'0¢¢çVÆÂÀ¢F&vWDFÖvT&Vf÷&S¢&Vf÷&TFÖvRÀ¢F&vWDFÖvTgFW#¢F&vWCòæFÖvRóòçVÆÂÀ¢f7FÕ6VC¢f7FÕ6VBãÒòf7FÕ6VB¢çVÆÂÀ¢f7FÕö¶VÖöä&Vf÷&S¢f7FÔ7FfP¢ò6&DæÖRf7FÔ7FfRævWEö¶VÖöä6&Còâ¢¢çVÆÂÀ¢f7FÔFÖvT&Vf÷&S¢&Vf÷&Uf7FÔFÖvRÀ¢&¦T6÷VçC¢çVÖ&W"æ4fæFRVffV7Bç&¦T6÷VçBòVffV7Bç&¦T6÷VçB¢çVÆÂÀ¢&WfVçDFVfVÇC¢VffV7Bç&WfVçDFVfVÇBÓÓÒG'VRÀ¢&Vf÷&UV&Æ4&ö&C¢&Vf÷&T&ö&BÀ¢gFW%V&Æ4&ö&C¢V&Æ4&ö&E6æ6÷BgFW%7FFR¢Ò°¢bôFÖvWÅWD6÷VçFW'2öçFW7B¶æBóòrrÇÂçVÖ&W"æ4fæFRVffV7BæFÖvR°¢VFBæö'6W'fVDFÖvTVffV7G2²³°¢Ð¢bô¶æö6´÷WBöçFW7B¶æBóòrrVFBæö'6W'fVD¶æö6´÷WDVffV7G2²³°¢&WGW&â&W7VÇC°¢Ð ¢ö&¦V7BæFVfæU&÷W'G7F÷&Rç&÷F÷GRÂvF7F6rÂ°¢ââæöÆDF7F6À¢fÇVS¢F7F6¢Ò°¢ö&¦V7BæFVfæU&÷W'G7F÷&Rç&÷F÷GRÂw&VGV6TVffV7BrÂ°¢ââæöÆE&VGV6RÀ¢fÇVS¢&VGV6TVffV7@¢Ò° ¢G'°¢6öç7B&W7VÇBÒWV7WFR°¢b7W'&VçDGF6²fæ6GF6²ÆfU7F÷&R°¢&WGW&â·&W7VÇBÂVFGÓ°¢Ò6F6W'&÷"°¢b7W'&VçDGF6²fæ6GF6²ÆfU7F÷&RÂW'&÷"°¢bW'&÷"bbGVöbW'&÷"ÓÓÒvö&¦V7Br°¢W'&÷"ævVçCTGF6´FÖvTVFBÒ°¢ââæVFBÀ¢GF6·3¢²ââæVFBæGF6·5Ð¢Ó°¢Ð¢F&÷rW'&÷#°¢ÒfæÆÇ°¢76W'Bç7G&7DWVÂ7F÷&Rç&÷F÷GRæF7F6ÂF7F6°¢76W'Bç7G&7DWVÂ7F÷&Rç&÷F÷GRç&VGV6TVffV7BÂ&VGV6TVffV7B°¢ö&¦V7BæFVfæU&÷W'G7F÷&Rç&÷F÷GRÂvF7F6rÂöÆDF7F6°¢ö&¦V7BæFVfæU&÷W'G7F÷&Rç&÷F÷GRÂw&VGV6TVffV7BrÂöÆE&VGV6R°¢Ð§Ð ¦ÖöGVÆRæW÷'G2Ò°¢dU%4ôâÀ¢V&Æ4&ö&E6æ6÷BÀ¢Æö6FUV&Æ5F&vWBÀ¢vFæFfTGF6´FÖvTö'6W'fW §Óÿÿÿ