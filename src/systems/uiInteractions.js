// UI INTERACTIONS MODULE
// Source fragment consumed by scripts/build.js. Do not import directly.
// HUD button bindings share the runtime closure by design.

function setupUIInteractions(){
$('ultimateHud').onclick=()=>{sfx('ui');castUltimate()};$('skillHud').onclick=()=>{sfx('ui');useCoreSkill()};$('dashHud').onclick=performDash;$('pauseBtn').onclick=()=>{sfx('ui');if(['playing','portal','shop','paused'].includes(state))pauseGame();else if(state==='settings'){state='paused';showPauseMenu()}else if(state==='start'||state==='worldselect')showWorldSelect();else showPauseMenu()};
}
