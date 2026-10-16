'use strict';
function strictK0Unknown(registered,known){
 const counts=new Map();
 for(const name of registered)counts.set(name,(counts.get(name)||0)+1);
 for(const name of known){const n=counts.get(name)||0;
  if(n===0)throw new Error('Known card absent from registered inventory');
  counts.set(name,n-1);
 }
 return [...counts].flatMap(([name,count])=>Array(count).fill(name)).sort();
}
module.exports={strictK0Unknown};
