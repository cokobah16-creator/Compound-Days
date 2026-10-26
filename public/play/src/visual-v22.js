/* V22: every standard outfit equips distinct garments on the shared rig. */
'use strict';
Object.assign(WARDROBE.outfits,{
  office:['office_shirt','office_trousers','loafers'],
  track:['track_top','track_trousers','sneakers'],
  lounge:['lounge_top','lounge_trousers','sandals']
});
const v22Outfit=heroOutfit;
heroOutfit=function(look){
  const fit=v22Outfit(look);
  if(['office','track','lounge'].includes(look.outfit)){
    const option=OUTFITS.find(o=>o.id===look.outfit);
    fit.top=look.oc||(OUTFIT_VAR[look.outfit]?OUTFIT_VAR[look.outfit][look.pi||0]:option.c);
    fit.bottom=look.outfit==='office'?'#34404C':fit.top;
    fit.topMap=null;fit.botMap=null;
  }
  return fit;
};
