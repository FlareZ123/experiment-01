'use strict';
const {C}=require('./agent5-adp-paid-opening.cjs');
/** @param {number[]} h @param {number[]} s @param {{adp:boolean,gh:boolean,dde:boolean}} a @param {string} p @returns {number|null} */
function minimumProtectedPayments(h,s,a,p){
  if(!['dragons','dragonsEnergy','dragonsEnergyCompressor'].includes(p))throw Error('Bad profile');
  if(!h[C.adp]&&!h[C.basic])return null;
  const sw=!h[C.adp];if(sw&&!s[C.switch])return null;
  const ars=!sw?['active']:s[C.adp]?['held']:a.adp?['tag','quick','ultra']:[];
  const gr=s[C.dde]?['none']:a.dde?[
    ...(s[C.gh]?['held']:[]),...(a.gh&&s[C.tag]?['tag']:[])]:[];
  const safe=s[C.dragon]+(p==='dragons'?0:s[C.basicEnergy])+
    (p==='dragonsEnergyCompressor'?s[C.compressor]:0);
  let best=null;
  for(const adp of ars)for(const gh of gr){
    if(adp==='tag'&&!s[C.tag]||adp==='quick'&&!s[C.quick]||
       adp==='ultra'&&!s[C.ultra])continue;
    const tag=adp==='tag'||gh==='tag';if(tag&&!s[C.tag])continue;
    const ball=adp==='quick'||adp==='ultra';
    const cost=(adp==='ultra'?2:adp==='quick'?1:0)+(gh==='none'?0:2);
    const reserve=1+Number(sw)+Number(adp==='held')+
      Number(s[C.dde]>0)+Number(gh==='held')+Number(tag)+Number(ball);
    if(s.reduce((x,y)=>x+y,0)-reserve<cost)continue;
    const k=Math.max(0,cost-safe);
    if(best===null||k<best)best=k;
  }
  return best;
}
module.exports={minimumProtectedPayments};
