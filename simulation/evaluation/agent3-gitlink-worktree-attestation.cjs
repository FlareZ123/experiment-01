'use strict';
const VERSION='agent3-gitlink-worktree-attestation-v1';
const SHA=/^[a-f0-9]{40}$/;

/**
 * Fail-closed proof about values observed IN the actual native test runtime:
 * current repo HEAD, its committed vendor submodule gitlink, the checked-out
 * vendor HEAD and the vendor's tracked worktree status. This pure function
 * deliberately cannot run Git itself and cannot confer game qualification.
 *
 * @param {{repositoryHead:string|null,expectedRepositoryHead?:string|null,
 *   gitlinkTreeLine:string|null,vendorHead:string|null,
 *   expectedVendorHead:string,trackedVendorStatus:string|null}} input
 * @returns {{schema:string,attested:boolean,reasons:string[],
 *   committedVendorGitlink:string|null,repositoryHead:string|null,
 *   observedVendorHead:string|null,expectedVendorHead:string,
 *   trackedVendorWorktreeClean:boolean}}
 */
function attestVendorWorktree(input){
  if(!input||typeof input!=='object')throw new TypeError('Attestation object required');
  const reasons=[];
  const add=(ok,name)=>{if(!ok)reasons.push(name);};
  const repoHead=input.repositoryHead;
  add(typeof repoHead==='string'&&SHA.test(repoHead),'repository-head-unobserved');
  if(input.expectedRepositoryHead!==undefined&&
     input.expectedRepositoryHead!==null){
    add(SHA.test(input.expectedRepositoryHead)&&
      repoHead===input.expectedRepositoryHead,'repository-head-mismatch');
  }
  const line=input.gitlinkTreeLine;
  const parsed=typeof line==='string'?
    /^160000 commit ([a-f0-9]{40})\tvendor\/twinleaf$/.exec(line.trim()):null;
  const gitlink=parsed?.[1]??null;
  add(gitlink!==null,'committed-gitlink-unobserved');
  const expected=input.expectedVendorHead;
  add(typeof expected==='string'&&SHA.test(expected),'invalid-expected-pin');
  const vendor=input.vendorHead;
  add(typeof vendor==='string'&&SHA.test(vendor),'vendor-head-unobserved');
  if(gitlink&&typeof expected==='string'&&SHA.test(expected)){
    add(gitlink===expected,'committed-gitlink-pin-mismatch');
  }
  if(typeof vendor==='string'&&SHA.test(vendor)&&
     typeof expected==='string'&&SHA.test(expected)){
    add(vendor===expected,'checkout-pin-mismatch');
  }
  if(gitlink&&typeof vendor==='string'&&SHA.test(vendor)){
    add(gitlink===vendor,'checkout-gitlink-mismatch');
  }
  const clean=input.trackedVendorStatus==='';
  add(clean,'tracked-vendor-worktree-dirty-or-unobserved');
  return {
    schema:VERSION,attested:reasons.length===0,reasons,
    committedVendorGitlink:gitlink,repositoryHead:repoHead??null,
    observedVendorHead:vendor??null,expectedVendorHead:expected,
    trackedVendorWorktreeClean:clean,competitiveQualified:false
  };
}
module.exports={VERSION,attestVendorWorktree};
