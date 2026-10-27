// Extracted from the legacy game runtime. Runtime behavior is intentionally preserved.

function markGlobalBackButtons(root=document){
 document.querySelectorAll('#modal button, #modal .menu-actions button, button.global-back-button').forEach(button=>{
  const raw=button.dataset.backButtonLabel||button.textContent.trim().replace(/\\s+/g,' ');
  const label=raw.toUpperCase().replace(/^←\\s*/,'');
  if(button.classList.contains('global-back-button')||label.startsWith('BACK')||label==='MAIN MENU'){
   button.classList.add('global-back-button');
   button.dataset.backButtonLabel=raw;
   button.setAttribute('aria-label',raw);
   button.title=raw;
   if(button.textContent.trim()!=='←')button.textContent='←';
   button.style.display=state==='playing'?'none':'';
   if(button.parentElement!==document.body)document.body.appendChild(button);
  }
 });
}
const backButtonDockObserver=new MutationObserver(()=>markGlobalBackButtons());
const backButtonDockStart=()=>{const modalNode=document.getElementById('modal');if(modalNode){markGlobalBackButtons();backButtonDockObserver.observe(modalNode,{childList:true,subtree:true,characterData:true});}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',backButtonDockStart,{once:true});else backButtonDockStart();

function showModal(eyebrow,title,desc,choices){$('overlay').classList.remove('hidden','closing');let m=$('modal');m.classList.toggle('upgrade-modal',/EXPERIENCE THRESHOLD|EVOLVE YOUR ORB|EVOLUTION/i.test(eyebrow+' '+title));m.innerHTML=`<div class="eyebrow">${eyebrow}</div><h2>${title}</h2><p>${desc}</p><div class="choices">${choices.map((x,i)=>{const rare=PERK_RARITY[String(x.title||'').trim().toUpperCase()]==='rare';return `<button class="choice ${rare?'rare-choice':''}" data-i="${i}"><span class="orb" style="color:${x.color||'#72f6ff'}">${x.glyph||'✦'}</span><span class="choice-copy"><b>${x.title}${rare?'<em class="rare-tag">RARE</em>':''}</b><small>${String(x.desc||'').replace(/^RARE ·\s*/,'').replace(/\bhull\b/gi,'HP').replace(/\bATK Speed\b/gi,'ATK Speed').replace(/\barmor\b/gi,'DEF')}</small></span></button>`}).join('')}</div>`;m.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{sfx('ui');choices[i].action()});}

function showVoidWeaponDelivery(reward,onDone){
 if(typeof onDone!=='function')return;
 const milestoneKey=reward&&Number.isInteger(Number(reward.worldId))&&Number.isInteger(Number(reward.roomNumber))?`${Number(reward.worldId)}:${Number(reward.roomNumber)}`:null;
 if(!reward||!reward.claimKey){if(milestoneKey)milestoneDeliveriesPresented.add(milestoneKey);onDone();return;}
 if(milestoneKey)milestoneDeliveriesPresented.add(milestoneKey);
 showVoidWeaponTenPull([reward],onDone);
}

function confirmInGame(title,desc,confirmTitle,onConfirm,onCancel,cancelTitle='CANCEL'){
 showModal('SYSTEM CONFIRMATION',title,desc,[
  {glyph:'⚠',color:'#ffe38a',title:confirmTitle,desc:'Check the details before confirming. This may replace or delete your current checkpoint.',action:onConfirm},
  {glyph:'↩',color:'#72f6ff',title:cancelTitle,desc:'Keep your current checkpoint and go back.',action:onCancel}
 ]);
}

function showTutorialTip(){const tip=$('tutorialTip');if(currentWorld!==-1||!player||!tutorialTips[room]){tip.hidden=true;tutorialTipVisible=false;return}const data=tutorialTips[room];$('tutorialTipTitle').textContent=data.title;$('tutorialTipBody').textContent=data.body;tip.hidden=false;tutorialTipVisible=true;const dismiss=$('tutorialTipDismiss');dismiss.textContent=room===world().rooms?'GOT IT':'CONTINUE';}

function dismissTutorialTip(){tutorialTipVisible=false;$('tutorialTip').hidden=true;last=performance.now()}$('tutorialTipDismiss').onclick=dismissTutorialTip;

function showMainMenu(){if(window.__voidCodexBackAlign){window.removeEventListener('resize',window.__voidCodexBackAlign);window.__voidCodexBackAlign=null;}document.querySelectorAll('.unified-codex-back').forEach(button=>button.remove());clearToast();hoveredWorldPreview=null;lastWorldPreviewFrame=0;$('overlay').classList.add('cinematic-menu');tutorialTipVisible=false;$('tutorialTip').hidden=true;state='start';$('phase').textContent='CAMPAIGN MENU';$('overlay').classList.remove('hidden','closing');$('modal').className='modal main-menu-modal';$('modal').innerHTML=`<div class="eyebrow">A COSMIC ROGUELIKE</div><h2>VOID PROTOCOL</h2><p>Choose a core, build your loadout, and fight through four worlds. Progress is saved in this browser.</p><div class="menu-actions main-menu-actions"><button class="btn" id="startCampaign" style="padding:12px 20px;font-weight:bold"><span class="menu-icon" aria-hidden="true">▶</span> START CAMPAIGN</button>${saveData.campaignCheckpoint?`<button class="btn" id="resumeCampaign"><span class="menu-icon" aria-hidden="true">⏵</span> RESUME WORLD ${Number(saveData.campaignCheckpoint.world)+1} · ROOM ${saveData.campaignCheckpoint.room}</button>`:""}<button class="btn" id="openCoreUpgrade"><span class="menu-icon" aria-hidden="true">✧</span> VOID SHOP</button><button class="btn" id="openUnifiedCodex"><span class="menu-icon" aria-hidden="true">▦</span> CODEX</button><button class="btn" id="openCredits"><span class="menu-icon" aria-hidden="true">✧</span> CREDITS</button><button class="btn" id="openSettings"><span class="menu-icon" aria-hidden="true">⚙</span> SETTINGS</button></div><p class="save-note">WORLDS UNLOCKED: ${saveData.unlockedWorlds}/4 · TOTAL RUNS: ${saveData.totalRuns}</p><p class="version-note main-version-note">VERSION 0.5</p>`;$('startCampaign').onclick=showWorldSelect;const resumeBtn=$('resumeCampaign');if(resumeBtn)resumeBtn.onclick=()=>{const cp=saveData.campaignCheckpoint;if(!cp){showWorldSelect();return}currentWorld=Math.max(0,Math.min(3,Number(cp.world)||0));saveData.lastWorld=currentWorld;persist();run++;start(true)};$('openCoreUpgrade').onclick=()=>showCoreUpgradeSystem(showMainMenu);$('openUnifiedCodex').onclick=()=>showUnifiedCodex('perks');$('openCredits').onclick=showCredits;$('openSettings').onclick=()=>showSettings('start')}

function showUnifiedCodex(tab='perks'){
 if(tab==='weapons')showVoidWeaponCodex();
 else if(tab==='story')showStoryArchive();
 else showPerkCodex();
}

function addUnifiedCodexTabs(active){
 const modal=$('modal');if(!modal)return;
 modal.classList.add('unified-codex-modal');
 modal.querySelectorAll('.world-holo-back').forEach(button=>button.remove());
 const tabs='<nav class="unified-codex-tabs" aria-label="Codex sections"><button type="button" data-unified-codex-tab="perks" '+(active==='perks'?'aria-current="page"':'')+'>PERK CODEX</button><button type="button" data-unified-codex-tab="weapons" '+(active==='weapons'?'aria-current="page"':'')+'>VOID WEAPONS</button><button type="button" data-unified-codex-tab="story" '+(active==='story'?'aria-current="page"':'')+'>STORY ARCHIVE</button></nav>';
 modal.insertAdjacentHTML('afterbegin',tabs);
 let content=modal.querySelector('.unified-codex-content');
 if(!content){
  content=document.createElement('div');content.className='unified-codex-content';
  const children=Array.from(modal.children).filter(child=>!child.matches('.unified-codex-tabs'));
  children.forEach(child=>content.appendChild(child));
  modal.appendChild(content);
 }
 modal.querySelectorAll('[data-unified-codex-tab]').forEach(button=>button.onclick=()=>showUnifiedCodex(button.dataset.unifiedCodexTab));
 const overlay=$('overlay');
 let back=overlay.querySelector('.unified-codex-back');
 if(!back){back=document.createElement('button');back.type='button';back.className='unified-codex-back';back.setAttribute('aria-label','Back to main menu');back.title='Back to main menu';back.textContent='←';overlay.appendChild(back);}
 // Match the external back button to the modal's actual top edge.
 if(window.__voidCodexBackAlign)window.removeEventListener('resize',window.__voidCodexBackAlign);
 window.__voidCodexBackAlign=()=>{
  if(!back.isConnected||!modal.isConnected)return;
  back.style.setProperty('top',Math.max(0,modal.getBoundingClientRect().top-overlay.getBoundingClientRect().top)+'px','important');
 };
 window.__voidCodexBackAlign();
 window.addEventListener('resize',window.__voidCodexBackAlign);
 back.onclick=showMainMenu;
}

function showCredits(){state='credits';$('overlay').classList.remove('hidden','closing');$('modal').className='modal credits-modal';sfx('portal');$('modal').innerHTML=`<div class="eyebrow credits-eyebrow">VOID PROTOCOL · THE PEOPLE BEHIND THE VOID</div><h2 class="credits-title">CREDITS<span class="credits-title-glint"> //</span></h2><p class="credits-typewriter" aria-label="A little universe takes a lot of moving parts. Every category is credited to its creator."></p><div class="credits-terminal-line"><span>ARCHIVE ACCESS GRANTED</span><span>14 RECORDS FOUND</span></div><div class="credits-list"><section class="credits-card"><span class="credits-symbol">✦</span><h3>GAME DESIGN</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">⌘</span><h3>PROGRAMMING &amp; ENGINEERING</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">◈</span><h3>GAMEPLAY &amp; SYSTEMS</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">✧</span><h3>ART DIRECTION &amp; VISUAL DESIGN</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">♫</span><h3>AUDIO &amp; SOUND DESIGN</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">▤</span><h3>STORY &amp; WORLD BUILDING</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">⚙</span><h3>UI/UX DESIGN</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">⌁</span><h3>TESTING &amp; QUALITY ASSURANCE</h3><p>thaykhangne</p></section><section class="credits-card"><span class="credits-symbol">∞</span><h3>PRODUCTION</h3><p>thaykhangne</p></section><section class="credits-card credits-inspired-secret" title="CLASSIFIED · DOUBLE-CLICK TO DECRYPT"><span class="credits-symbol">✧</span><h3>INSPIRED BY</h3><p>A certain company, iykyk.</p></section><section class="credits-card"><span class="credits-symbol">🐾</span><h3>CHIEF NAP OFFICER</h3><p>Mr. Fox</p></section><section class="credits-card"><span class="credits-symbol">🐈</span><h3>PAWDUCTIVITY CONSULTANT</h3><p>Mr. Fox</p></section><section class="credits-card"><span class="credits-symbol">🐟</span><h3>QUALITY ASSURANCE · TREATS</h3><p>Mr. Fox</p></section><section class="credits-card"><span class="credits-symbol">🌙</span><h3>LATE-NIGHT SUPERVISION</h3><p>Mr. Fox</p></section></div><div class="menu-actions"><button class="btn" id="creditsBack">← MAIN MENU</button></div>`;const intro=$('modal').querySelector('.credits-typewriter');if(window.__voidCreditsTypeTimer)clearInterval(window.__voidCreditsTypeTimer);const introText=intro.getAttribute('aria-label');let typeIndex=0;intro.textContent='';window.__voidCreditsTypeTimer=setInterval(()=>{if(state!=='credits'||!intro.isConnected){clearInterval(window.__voidCreditsTypeTimer);return}intro.textContent=introText.slice(0,++typeIndex);if(typeIndex%2===0)sfx('text');if(typeIndex>=introText.length)clearInterval(window.__voidCreditsTypeTimer)},24);$('modal').querySelectorAll('.credits-card').forEach((card,index)=>{card.style.setProperty('--credit-index',index);card.addEventListener('pointerenter',()=>sfx('ui'),{passive:true})});const inspiredSecret=$('modal').querySelector('.credits-inspired-secret');let secretClicks=0;let secretClickTimer=null;if(inspiredSecret){inspiredSecret.addEventListener('dblclick',()=>{sfx('ultimate');const popup=document.createElement('div');popup.className='credits-easter-egg-backdrop';popup.style.cssText='position:fixed!important;inset:0!important;left:0!important;top:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;padding:16px!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:auto!important;z-index:2147483647!important;transform:none!important';popup.innerHTML=`<section class="credits-easter-egg" role="dialog" aria-modal="true" aria-labelledby="vcorpRoastTitle"><div class="credits-easter-egg-tag">UNAUTHORIZED TRANSMISSION · V CORP</div><h3 id="vcorpRoastTitle">A MESSAGE FOR THE “V” COMPANY</h3><p>Dear V: GET YOUR SHIT TOGETHER. You cannot keep cutting staff and shrinking teams, then act baffled when those left behind inherit three people's workloads. A smaller headcount is not a strategy if the work stays the same.</p><p>Stop slashing budgets and calling it “efficiency.” Stop dumping abandoned tasks, spreadsheets, emergencies, and pointless processes on managers. If they spend more time feeding corporate machinery than supporting their teams, the machinery is the problem. Fix it.</p><p>Retire the busywork, performative meetings, and shiny initiatives that solve nothing. Staff are not an infinite resource. Burnout is not an operating model, and “do more with less” is no miracle spell. It is how you lose good people and exhaust everyone who remains.</p><p>Stop prescribing three deep breaths as if inhaling could fix the workplace. “Stop and breathe” does not make impossible workloads reasonable, reverse budget cuts, or remove the causes of stress. Breathing may help in the moment; presenting it as the solution to an organizational problem does not.</p><p>And those “Mindful Green” trips: sending exhausted employees trekking is not automatically wellbeing. For people already drained, hiking until their legs give out is another obligation with nicer scenery. It can look like a cheaper substitute for a genuinely restful hotel retreat, with comfortable accommodation and time to recover. Nature is not the problem; confusing exertion with restoration is.</p><p>Real wellbeing means sustainable workloads, adequate staffing and budgets, supportive managers, and time to recover. Offer breathing exercises if you must, but do not use them to teach employees to tolerate conditions leadership should fix. People do not need cheerful reminders to regulate themselves while more work piles up. They need the workplace to stop making them this stressed.</p><p>Set priorities. Fund what matters. Cut bureaucracy before cutting the people doing the work. Give teams realistic workloads, let managers manage, and own the consequences of your decisions. A green dashboard does not mean a healthy company if everyone behind it is on fire.</p><p>Get your shit together, V. Stop confusing cost-cutting with leadership, exhaustion with commitment, and survival mode with strategy. Your employees should not have to hold the operation together with duct tape while executives congratulate themselves on the budget.</p><p class="credits-easter-egg-signoff">TRANSMISSION ENDS · NO EXECUTIVE SUMMARY PROVIDED</p><button type="button" class="btn" data-dismiss-vcorp>ACKNOWLEDGE THE ROAST</button></section>`; document.body.appendChild(popup);const close=()=>{popup.remove();document.removeEventListener('keydown',onKey);sfx('ui')};popup.querySelector('[data-dismiss-vcorp]').onclick=close;popup.addEventListener('click',event=>{if(event.target===popup)close()});const onKey=event=>{if(event.key==='Escape'&&popup.isConnected){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);popup.querySelector('button').focus()})}$('creditsBack').onclick=()=>{sfx('ui');showMainMenu()}}

function showStoryArchive(){
 state='storyarchive';const progress=saveData.storyProgress||{seenScenes:[],recoveredFiles:[]};
 const seen=new Set(progress.seenScenes||[]),files=new Set(progress.recoveredFiles||[]);
 const scenes=allStoryScenes.filter(scene=>seen.has(scene.id));
 const memos=corporateMemos.filter(memo=>files.has(memo.id));
 const worldsWithProgress=[0,1,2,3].map(index=>({index,name:worlds[index]?.name||('WORLD '+(index+1)),recovered:memos.filter(memo=>memo.worldIndex===index).length,total:corporateMemos.filter(memo=>memo.worldIndex===index).length}));
 const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 $('overlay').classList.remove('hidden','closing');const modal=$('modal');modal.className='modal story-archive-modal';
 const sceneCards=scenes.length?scenes.map(scene=>'<button type="button" class="story-archive-scene" data-replay-scene="'+esc(scene.id)+'" style="--story-accent:'+esc(scene.accent||'#72f6ff')+'"><small>'+esc(scene.chapter)+'</small><b>'+esc(scene.title)+'</b><span>REPLAY TRANSMISSION ↗</span></button>').join(''):'<p class="story-archive-empty">No briefings recovered yet. Start a campaign assignment to begin building the archive.</p>';
 const memoCards=memos.length?memos.map(memo=>'<article class="story-memo"><div class="story-memo-code">'+esc(memo.code)+' · INTERNAL</div><h3>'+esc(memo.title)+'</h3><p class="story-memo-summary">'+esc(memo.summary)+'</p><details><summary>OPEN DOCUMENT</summary><p>'+esc(memo.body)+'</p></details></article>').join(''):'<p class="story-archive-empty">Incident reports unlock after a world is cleared. V Corp assures you the missing paperwork is a feature.</p>';
 modal.innerHTML='<div class="eyebrow">RECOVERED RECORDS · ACCESS RESTRICTED</div><h2>V CORP STORY ARCHIVE</h2><p>Revisit transmissions and internal documents. Records are stored locally with your campaign save.</p><section class="story-archive-section"><div class="story-archive-heading"><h3>WORLD INVESTIGATION</h3><span>PROGRESS</span></div><div class="story-archive-grid">'+worldsWithProgress.map(world=>'<article class="story-memo"><div class="story-memo-code">WORLD '+(world.index+1)+'</div><h3>'+esc(world.name)+'</h3><p class="story-memo-summary">'+world.recovered+' / '+world.total+' records recovered</p><p class="story-memo-summary">'+(world.recovered===world.total?'Investigation complete.':'Reach Room 10 for classified evidence; clear the world to recover remaining reports.')+'</p></article>').join('')+'</div></section><section class="story-archive-section"><div class="story-archive-heading"><h3>TRANSMISSIONS</h3><span>'+scenes.length+' / '+allStoryScenes.length+' RECOVERED</span></div><div class="story-archive-grid">'+sceneCards+'</div></section><section class="story-archive-section"><div class="story-archive-heading"><h3>INTERNAL MEMOS</h3><span>'+memos.length+' / '+corporateMemos.length+' RECOVERED</span></div><div class="story-memo-list">'+memoCards+'</div></section>';
 modal.querySelectorAll('[data-replay-scene]').forEach(button=>button.onclick=()=>{const scene=allStoryScenes.find(item=>item.id===button.dataset.replayScene);if(scene)narrative.replay(scene,showStoryArchive)});
 
 addUnifiedCodexTabs('story');
}

function showVoidWeaponCodex(){
 state='voidweapon-codex';
 let category='all';
 const modal=$('modal');
 const render=()=>{
  const ownedMap=Object.fromEntries(getOwnedVoidWeapons(saveData).map(weapon=>[weapon.id,weapon]));
  const ownedCount=voidWeapons.filter(weapon=>ownedMap[weapon.id]).length;
  const refinedCount=voidWeapons.filter(weapon=>(saveData.voidWeaponRefinements?.[weapon.id]||0)>0).length;
  const categoryWeapons=voidWeapons.filter(weapon=>category==='all'||(weapon.category||'signature')===category);
  const categoryOwnedCount=categoryWeapons.filter(weapon=>ownedMap[weapon.id]).length;
  const equippedEntries=Object.entries(saveData.equippedVoidWeapons||{});
  const entries=categoryWeapons;
  const cards=entries.map(weapon=>{
   const owned=ownedMap[weapon.id],rank=owned?.refinementLevel||0;
   const equippedCores=equippedEntries.filter(([,id])=>id===weapon.id).map(([id])=>cores.find(c=>c.id===id)?.name||id.toUpperCase());
   const hidden=!owned;
   return '<article class="void-weapon-codex-card '+(hidden?'is-undiscovered':'is-discovered')+'" style="--weapon-accent:'+(hidden?'#60718a':weapon.color)+'">'+
    '<div class="void-weapon-codex-card-head"><span class="void-weapon-codex-glyph">'+(hidden?'?':weapon.glyph)+'</span><div><small>'+(hidden?'SIGNAL UNRESOLVED':(weapon.rarity||'legendary').toUpperCase()+' · '+(weapon.category==='general'?'GENERAL':'SIGNATURE')+' · '+(weapon.rarity==='legendary'?'★★★★★':weapon.rarity==='unique'?'★★★★':'★★★'))+'</small><h3>'+(hidden?'UNKNOWN VOID WEAPON':weapon.name)+'</h3></div><span class="void-weapon-codex-rank">'+(hidden?'LOCKED':'R'+rank+'/'+MAX_VOID_WEAPON_REFINEMENT)+'</span></div>'+
    (hidden?'<p class="void-weapon-codex-secret">Weapon identity and signature data remain classified until the weapon is recovered.</p><div class="void-weapon-codex-lock">◇ UNDISCOVERED</div>':
     '<p class="void-weapon-codex-description">'+weapon.description+'</p>'+
     '<div class="void-weapon-codex-stats">'+(()=>{const refinementBonus=Math.max(0,Math.min(5,rank||0))*0.02;return '<span>ATK <b>+'+Math.round((weapon.stats.atkPct+refinementBonus)*100)+'%</b></span><span>MAX HP <b>+'+Math.round((weapon.stats.hpPct+refinementBonus)*100)+'%</b></span><span>DEF <b>+'+Math.round((weapon.stats.armorPct+refinementBonus)*100)+'%</b></span>'})()+'</div>'+
     '<div class="void-weapon-codex-passive"><small>'+weapon.passive.name+'</small><p>'+highlightVoidWeaponNumbers(weapon.passive.description)+'</p></div>'+
     '<div class="void-weapon-codex-footer"><span>OWNED ×'+owned.copies+'</span><span>'+(rank>=MAX_VOID_WEAPON_REFINEMENT?'MAX RANK':'RANK '+rank+' · '+(MAX_VOID_WEAPON_REFINEMENT-rank)+' TO MAX')+'</span></div>'+
     '<div class="void-weapon-codex-equipment">'+(equippedCores.length?'EQUIPPED · '+equippedCores.join(', '):'NOT CURRENTLY EQUIPPED')+'</div>')+
    '</article>';
  }).join('');
  modal.className='modal void-weapon-codex-modal';
  modal.innerHTML=
   '<div class="eyebrow">ARCHIVE / WEAPON REGISTRY</div><h2>VOID WEAPON CODEX</h2>'+
   '<p>Recovered weapons reveal their stats and passive effects. Refinement raises a weapon to Rank V, improving its listed stats and rank-scaled passive.</p>'+
   '<div class="void-weapon-codex-summary"><div><b>'+ownedCount+' / '+voidWeapons.length+'</b><small>WEAPONS DISCOVERED</small></div><div><b>'+refinedCount+'</b><small>WEAPONS REFINED</small></div><div><b>'+Object.keys(saveData.voidWeaponRefinements||{}).filter(id=>(saveData.voidWeaponRefinements[id]||0)>=MAX_VOID_WEAPON_REFINEMENT).length+'</b><small>MAX RANK</small></div></div>'+
   '<div class="void-weapon-codex-filters"><button type="button" data-weapon-category="all" class="'+(category==='all'?'active':'')+'">ALL CATEGORIES</button><button type="button" data-weapon-category="general" class="'+(category==='general'?'active':'')+'">GENERAL · '+voidWeapons.filter(w=>w.category==='general').length+'</button><button type="button" data-weapon-category="signature" class="'+(category==='signature'?'active':'')+'">SIGNATURE · '+voidWeapons.filter(w=>w.category!=='general').length+'</button></div>'+
   '<div class="void-weapon-codex-grid">'+(cards||'<div class="void-weapon-empty">NO ENTRIES IN THIS FILTER.</div>')+'</div>'+
   '';
  
  
  modal.querySelectorAll('[data-weapon-category]').forEach(button=>button.onclick=()=>{category=button.dataset.weaponCategory;render();});
  addUnifiedCodexTabs('weapons');
 };
 $('overlay').classList.remove('hidden','closing','story-overlay','dialogue-field-overlay');
 sfx('portal');
 render();
}

function showPerkCodex(){state='codex';const perks=PERKCODEXDATA;
const groups=[
{key:'general',title:'CORE SYSTEMS & UNIVERSAL PERKS',sub:'Universal upgrades available to every core.',accent:'#72f6ff',test:p=>!p[0].startsWith('EMBER:')&&!p[0].startsWith('FROST:')&&!p[0].startsWith('AETHER:')&&!p[0].startsWith('AURALIS:')&&!p[0].startsWith('FLASH:')&&!p[0].startsWith('NATURE:')&&!p[0].startsWith('PRISM:')&&!p[0].startsWith('PRISM FLIGHT:')&&p[0]!=='AURALIS CORE · LUMINE'&&!['CINDERHEART','ASHFALL','PHOENIX FURNACE','INFERNO CROWN','PERMAFROST','GLACIAL BASTION','SHATTERGLASS','ABSOLUTE ZERO','PRISM FOCUS','OVERCLOCK','SPECTRUM BURN','EVENT HORIZON','ARC CONDUCTOR','STATIC CHARGE','CAPACITOR SURGE','THUNDERFIELD OVERDRIVE','PRISMATIC SNARE','PRISM FLIGHT','SWIFT CURRENT','LASTING RADIANCE','PRISM ECHO','MULTIPLICITY','PRISMATIC','LUMINOUS WINGS'].includes(p[0])},
{key:'ember',title:'EMBER EXCLUSIVE',sub:'Burn and Ring of Fire upgrades.',accent:'#ff9c65',test:p=>p[0].startsWith('EMBER:')||['CINDERHEART','ASHFALL','PHOENIX FURNACE','INFERNO CROWN'].includes(p[0])},
{key:'frost',title:'FROST EXCLUSIVE',sub:'Chill, critical hits, DEF, and Shield upgrades.',accent:'#8cecff',test:p=>p[0].startsWith('FROST:')||['PERMAFROST','GLACIAL BASTION','SHATTERGLASS','ABSOLUTE ZERO'].includes(p[0])},

{key:'flash',title:'FLASH EXCLUSIVE',sub:'Chain lightning, critical-hit upgrades, and core evolutions.',accent:'#ffe875',test:p=>p[0].startsWith('FLASH:')||['ARC CONDUCTOR','STATIC CHARGE','CAPACITOR SURGE','THUNDERFIELD OVERDRIVE'].includes(p[0])},
{key:'nature',title:'NATURE EXCLUSIVE',sub:'Vine and drone upgrades.',accent:'#70e58a',test:p=>p[0].startsWith('NATURE:')},
{key:'elemental',title:'PRISM CORE EXCLUSIVE',sub:'Cube projectiles and four-element combo upgrades.',accent:'#ff71cd',test:p=>p[0].startsWith('PRISM:')},
{key:'vengeance',title:'CRIMSON CORE EXCLUSIVE',sub:'Blood shields, crimson blades, and berserker scaling.',accent:'#ff304f',test:p=>p[0].startsWith('CRIMSON:')},
{key:'remielle',title:'AURALIS EXCLUSIVE',sub:'Lumine and Prism Flight upgrades.',accent:'#ff9ed8',test:p=>p[0].startsWith('AURALIS:')||['PRISMATIC SNARE','PRISM FLIGHT','PRISM FLIGHT: SWIFT CURRENT','PRISM FLIGHT: LASTING RADIANCE','PRISM FLIGHT: PRISM ECHO','PRISM FLIGHT: MULTIPLICITY','PRISMATIC','LUMINOUS WINGS'].includes(p[0])},
{key:'nova',title:'AETHER EXCLUSIVE',sub:'Singularity, Event Horizon, and Black Sun upgrades.',accent:'#fff7cf',test:p=>p[0].startsWith('AETHER:')||['EVENT HORIZON','SINGULARITY AMPLIFIER','GRAVITATIONAL RESONANCE','BLACK SUN AFTERSHOCK'].includes(p[0])}
];
const card=(p)=>{const rare=PERK_RARITY[String(p[0]||'').trim().toUpperCase()]==='rare';return `<article class="codex-entry ${rare?'codex-featured':''}"><b>${p[1]} ${p[0]}${rare?'<span class="codex-rarity">RARE</span>':''}</b><small>${String(p[2]||'').replace(/^RARE ·\s*/,'')}</small></article>`;};
const sections=groups.map(g=>{const seen=new Set();const sameBuffAliases={general:new Set(['RAPID PULSAR','ULTIMATE AMPLIFIER','CORE RESONANCE'])};const items=perks.filter(g.test).filter(p=>{const key=p[0].normalize('NFKC').replace(/\s+/g,' ').trim().toUpperCase();if(seen.has(key))return false;seen.add(key);if(sameBuffAliases[g.key]?.has(key))return false;return true});return items.length?`<section id="codex-section-${g.key}" class="codex-section" style="--codex-accent:${g.accent}"><div class="codex-section-head"><h3>${g.title}</h3><p>${g.sub}</p><span>${items.length} ENTRIES</span></div><div class="codex-list">${items.map(card).join('')}</div></section>`:''}).join('');
$('overlay').classList.remove('hidden','closing');$('modal').className='modal codex-modal';$('modal').innerHTML=`<div class="eyebrow">UPGRADES</div><h2>PERK CODEX</h2><p>Browse universal upgrades and core-specific perks.</p><div class="codex-feature-key"><span>✦ RARE PERKS</span><span class="codex-jump-links"><button type="button" data-codex-jump="ember">EMBER</button><button type="button" data-codex-jump="frost">FROST</button><button type="button" data-codex-jump="nova">AETHER</button><button type="button" data-codex-jump="remielle">AURALIS</button><button type="button" data-codex-jump="flash">FLASH</button><button type="button" data-codex-jump="nature">NATURE</button><button type="button" data-codex-jump="elemental">ELEMENTAL</button><button type="button" data-codex-jump="vengeance">VENGEANCE</button></span></div><div class="codex-sections">${sections}</div>`;$('modal').querySelectorAll('[data-codex-jump]').forEach(btn=>btn.onclick=()=>{const target=$('codex-section-'+btn.dataset.codexJump);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});});addUnifiedCodexTabs('perks');}

function beginSelectedWorld(idx){currentWorld=idx;saveData.lastWorld=idx;persist();hoveredWorldPreview=idx;worldPreviewChangedAt=performance.now();state='worldloading';$('phase').textContent='LOADING WORLD';$('overlay').classList.remove('hidden','closing');const w=world();$('modal').innerHTML=`<div class="world-loading"><div class="eyebrow">WORLD INITIALIZATION</div><h2>${w.name}</h2><p>Preparing environment and initializing your run…</p><div class="world-loading-track"><span></span></div><small>PLEASE WAIT</small></div>`;setTimeout(()=>{if(state!=='worldloading')return;run++;start()},650)}

function showWorldSelect(){
 clearToast();hoveredWorldPreview=null;tutorialTipVisible=false;$('tutorialTip').hidden=true;state='worldselect';$('phase').textContent='WORLD SELECT';$('overlay').classList.remove('hidden','closing');
 const initial=Math.max(0,Math.min(worlds.length-1,Number(saveData.lastWorld)||0));
 let selected=initial,typeTimer=null;
 const modal=$('modal');
 modal.className='modal world-hologram-modal';
 modal.innerHTML=`<button type="button" class="world-holo-back" id="worldHoloBack" aria-label="Back to main menu" title="Back to main menu">←</button><div class="world-holo-topline"><span class="eyebrow">CAMPAIGN SELECT / PLANETARY DATABASE</span><span class="world-holo-signal"><i></i> HOLO LINK STABLE</span></div>
 <h2>CHOOSE YOUR WORLD</h2>
 <p class="world-holo-subtitle">Choose a destination. Each world brings new threats.</p>
 <div class="world-holo-stage">
   <div class="world-holo-scanline"></div>
   <div class="world-holo-planet-wrap"><div class="world-holo-orbit world-holo-orbit-a"></div><div class="world-holo-orbit world-holo-orbit-b"></div><div class="world-holo-planet" id="worldHoloPlanet"><div class="world-holo-planet-surface"></div><div class="world-holo-atmosphere"></div><div class="world-holo-planet-ring"></div></div><div class="world-holo-planet-shadow"></div><div class="world-holo-coordinate" id="worldHoloCoords">SECTOR 01 / 04</div></div>
   <div class="world-holo-data">
     <div class="world-holo-kicker" id="worldHoloKicker">DESTINATION 01 / 04</div>
     <div class="world-holo-name-row"><h3 id="worldHoloName"></h3><button type="button" id="worldDifficultyToggle" class="world-difficulty-toggle" aria-pressed="false" disabled title="Clear all four worlds to unlock Hard difficulty"><span class="difficulty-toggle-track"><i></i></span><span class="difficulty-toggle-label">NORMAL</span></button></div>
     <div class="world-holo-rule"><span></span></div>
     <p class="world-holo-description" id="worldHoloDescription" aria-live="polite"></p>
     <div class="world-holo-readouts"><div><small>ROOMS</small><b id="worldHoloRooms">20</b></div><div><small>BEST CLEAR</small><b id="worldHoloBest">0 / 20</b></div><div><small>THREAT</small><b id="worldHoloThreat">MODERATE</b></div></div>
     <div class="world-holo-lock" id="worldHoloLock"></div>
     <button class="world-holo-deploy" id="worldHoloDeploy">DEPLOY TO WORLD <span>↗</span></button>
   </div>
 </div>
 <div class="world-holo-navigation"><button type="button" class="world-holo-step" id="worldHoloPrev" aria-label="Previous world">←</button><div class="world-holo-track" id="worldHoloTrack">${worlds.map((w,i)=>`<button type="button" class="world-holo-node" data-holo-world="${i}" style="--world-accent:${w.accent}" aria-label="Select ${w.name}"><span>${String(i+1).padStart(2,'0')}</span><b>${w.name}</b><i></i></button>`).join('')}</div><button type="button" class="world-holo-step" id="worldHoloNext" aria-label="Next world">→</button></div>
 <div class="world-holo-footer"><span>SCROLL OR USE ARROWS TO NAVIGATE</span><span>PROGRESS SAVED LOCALLY</span></div>
 <div class="menu-actions"><button class="btn" id="worldBack">← MAIN MENU</button></div>`;
 const name=$('worldHoloName'),description=$('worldHoloDescription'),planet=$('worldHoloPlanet');
 const worldThreat=['ELEVATED','HIGH','SEVERE','CRITICAL'];

function typeText(node,text,speed=24){
  if(typeTimer)clearInterval(typeTimer);
  node.textContent='';let pos=0;
  typeTimer=setInterval(()=>{if(!node.isConnected){clearInterval(typeTimer);return;}node.textContent=text.slice(0,pos++);if(pos>text.length){clearInterval(typeTimer);typeTimer=null;}},speed);
 }

function selectWorld(index,animate=true){
  selected=(index+worlds.length)%worlds.length;
  const w=worlds[selected],unlocked=selected<saveData.unlockedWorlds,best=saveData.bestRooms[selected]||0;
  hoveredWorldPreview=selected;worldPreviewChangedAt=performance.now();lastWorldPreviewFrame=0;
  modal.style.setProperty('--world-accent',w.accent);modal.style.setProperty('--world-secondary',w.secondary);
  modal.dataset.selectedWorld=String(selected);
  planet.dataset.planet=String(selected);planet.className='world-holo-planet planet-'+selected+(animate?' is-arriving':'');
  $('worldHoloKicker').textContent='DESTINATION '+String(selected+1).padStart(2,'0')+' / '+String(worlds.length).padStart(2,'0')+(unlocked?' · ACCESS GRANTED':' · ACCESS RESTRICTED');
  $('worldHoloCoords').textContent=['ASH BELT / 04.19.8','CRYO SECTOR / 11.02.4','VERDANT ZONE / 07.28.1','EVENT EDGE / 00.00.0'][selected];
  name.textContent=w.name;
  const difficultyToggle=$('worldDifficultyToggle'),hardUnlocked=allWorldsCleared(),hardSelected=!!saveData.hardModeByWorld?.[selected];
  difficultyToggle.disabled=!hardUnlocked;difficultyToggle.setAttribute('aria-pressed',String(hardSelected));difficultyToggle.classList.toggle('is-hard',hardSelected);difficultyToggle.title=hardUnlocked?'Switch this world between Normal and Hard difficulty':'Clear all four worlds to unlock Hard difficulty';difficultyToggle.querySelector('.difficulty-toggle-label').textContent=hardSelected?'HARD':'NORMAL';
  $('worldHoloRooms').textContent=String(w.rooms).padStart(2,'0');
  $('worldHoloBest').textContent=best+' / '+w.rooms;
  $('worldHoloThreat').textContent=worldThreat[selected];
  $('worldHoloLock').textContent=unlocked?'● UPLINK READY · DESTINATION STABLE':'▰ LOCKED · CLEAR THE PREVIOUS WORLD TO UNLOCK';
  $('worldHoloLock').classList.toggle('is-locked',!unlocked);
  const deploy=$('worldHoloDeploy');deploy.disabled=!unlocked;deploy.innerHTML=unlocked?'DEPLOY TO WORLD <span>↗</span>':'DESTINATION LOCKED <span>⌁</span>';
  $('worldHoloPrev').disabled=selected===0;$('worldHoloNext').disabled=selected===worlds.length-1;
  modal.querySelectorAll('[data-holo-world]').forEach((b,i)=>{b.classList.toggle('active',i===selected);b.classList.toggle('locked',i>=saveData.unlockedWorlds);b.setAttribute('aria-current',i===selected?'true':'false');});
  const active=modal.querySelector('[data-holo-world="'+selected+'"]');active?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
  if(animate){description.classList.add('is-typing');typeText(description,w.desc,24);}else{description.textContent=w.desc;description.classList.remove('is-typing');}
 }

function deploy(){
  if(selected>=saveData.unlockedWorlds)return;
  const idx=selected;
  if(saveData.campaignCheckpoint){confirmInGame('DELETE THE SAVED RUN?','Starting a new run deletes the previous checkpoint, including its core, stats, and build. This cannot be undone.','DELETE & START NEW RUN',()=>{saveData.campaignCheckpoint=null;beginSelectedWorld(idx)},showWorldSelect,'KEEP SAVE');return}
  saveData.campaignCheckpoint=null;beginSelectedWorld(idx);
 }
 modal.querySelectorAll('[data-holo-world]').forEach((b,i)=>b.addEventListener('click',()=>selectWorld(i)));
 $('worldDifficultyToggle').onclick=()=>{if(!allWorldsCleared())return;setWorldHardMode(selected,!saveData.hardModeByWorld?.[selected]);selectWorld(selected,false);};
 $('worldHoloPrev').onclick=()=>selectWorld(Math.max(0,selected-1));
 $('worldHoloNext').onclick=()=>selectWorld(Math.min(worlds.length-1,selected+1));
 $('worldHoloDeploy').onclick=deploy;
 modal.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>12){e.preventDefault();selectWorld(Math.max(0,Math.min(worlds.length-1,selected+(e.deltaY>0?1:-1))));}},{passive:false});
 modal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();selectWorld(Math.min(worlds.length-1,selected+1));}else if(e.key==='ArrowLeft'){e.preventDefault();selectWorld(Math.max(0,selected-1));}else if(e.key==='Enter'&&!$('worldHoloDeploy').disabled){deploy();}},{capture:true});
 $('worldHoloBack').onclick=showMainMenu;
 $('worldBack')?.remove();
 selectWorld(initial,false);
}

function completeWorld(){
 const w=world();
 if(currentWorld===-1){tutorialTipVisible=false;$('tutorialTip').hidden=true;showModal('TUTORIAL COMPLETE','READY FOR CAMPAIGN','Tutorial complete. Your campaign progress is unchanged.',[{glyph:'✦',color:'#72f6ff',title:'ENTER CAMPAIGN',desc:'Choose one of the four campaign worlds.',action:showWorldSelect},{glyph:'↻',color:'#ffe38a',title:'REPEAT TUTORIAL',desc:'Practice the controls and objectives again.',action:()=>{currentWorld=-1;run++;start()}}]);return;}
 const completedIndex=currentWorld;
 saveData.bestRooms[completedIndex]=Math.max(saveData.bestRooms[completedIndex]||0,w.rooms);
 if(completedIndex<3)saveData.unlockedWorlds=Math.max(saveData.unlockedWorlds,completedIndex+2);else saveData.unlockedWorlds=4;
 for(const memo of corporateMemos.filter(entry=>entry.worldIndex===completedIndex)){
  if(!saveData.storyProgress.recoveredFiles.includes(memo.id))saveData.storyProgress.recoveredFiles.push(memo.id);
 }
 persist();
 const showWorldResult=()=>{
  if(completedIndex<3){
   const next=worlds[completedIndex+1];state='worldcomplete';
   showModal('WORLD CLEARED',w.name+' CONQUERED','All '+w.rooms+' rooms cleared. '+next.name+' unlocked. Your build resets when you enter a new world.',[{glyph:next.symbol,color:next.accent,title:'ENTER '+next.name,desc:'Start '+next.name+' · '+next.rooms+' rooms.',action:()=>{currentWorld=completedIndex+1;saveData.lastWorld=currentWorld;persist();run++;start()}},{glyph:'⌂',color:'#72f6ff',title:'CAMPAIGN MAP',desc:'Return to world select.',action:showWorldSelect}]);
  }else{
   state='worldcomplete';
   showModal('CAMPAIGN COMPLETE','THE VOID IS QUIET','Campaign complete. V Corp has scheduled a meeting to congratulate itself on the incident response.',[{glyph:'↻',color:'#72f6ff',title:'PLAY AGAIN',desc:'Choose a world and start a new run.',action:showWorldSelect},{glyph:'⌂',color:'#ffe38a',title:'MAIN MENU',desc:'Return to the title screen.',action:showMainMenu}]);
  }
 };
 const outro=worldOutroScenes[completedIndex];
 const showFinalEvidenceTransmission=()=>{
  if(completedIndex===3){
   const progress=saveData.storyProgress||{seenScenes:[],recoveredFiles:[]};
   const recovered=new Set(progress.recoveredFiles||[]);
   const worldMemoCounts=[0,1,2,3].map(index=>corporateMemos.filter(memo=>memo.worldIndex===index&&recovered.has(memo.id)).length);
   const allWorldsInvestigated=worldMemoCounts.every(count=>count>0);
   campaignConvergenceScene.subtitle=allWorldsInvestigated
    ?'All four investigations connected. The evidence chain is complete.'
    :'The record is incomplete, but the pattern is clear. The remaining evidence stays in the archive.';
   narrative.play(campaignConvergenceScene,{force:true,markSeen:true,onComplete:showWorldResult});
  }else if(campaignInterludes[completedIndex]){
   narrative.play(campaignInterludes[completedIndex],{force:true,markSeen:true,onComplete:showWorldResult});
  }else showWorldResult();
 };
 if(outro)narrative.play(outro,{force:true,markSeen:true,onComplete:showFinalEvidenceTransmission});else showFinalEvidenceTransmission();
}

const buildPanelNode=document.querySelector('.build-panel');const buildPanelHome=buildPanelNode?.parentNode;const buildPanelMarker=document.createComment('Orbital Build returns to its home outside the arena');if(buildPanelNode&&buildPanelHome)buildPanelHome.insertBefore(buildPanelMarker,buildPanelNode);

function returnBuildPanelHome(){if(buildPanelNode&&buildPanelMarker.parentNode)buildPanelMarker.parentNode.insertBefore(buildPanelNode,buildPanelMarker.nextSibling);buildPanelNode?.classList.remove('pause-build-panel');const stats=$('orbitalCurrentStats'),perks=$('orbitalEarnedPerks');if(stats)stats.remove();if(perks)perks.remove()}

function showOrbitalBuild(){if(state!=='paused')return;showModal('PAUSED · CHARACTER DETAILS','ORBITAL BUILD','View your stats, evolutions, and perks. The run stays paused.',[{glyph:'←',color:'#72f6ff',title:'BACK TO PAUSE MENU',desc:'Back to the pause menu.',action:()=>{returnBuildPanelHome();showPauseMenu()}}]);const modal=$('modal');modal.classList.add('build-modal');if(buildPanelNode){modal.appendChild(buildPanelNode);buildPanelNode.classList.add('pause-build-panel');if(statsContent)statsContent.classList.remove('collapsed');if(statsToggle){statsToggle.textContent='− HIDE STATS';statsToggle.setAttribute('aria-expanded','true');}}
let currentStats=$('orbitalCurrentStats');if(!currentStats){currentStats=document.createElement('section');currentStats.id='orbitalCurrentStats';currentStats.className='panel orbital-current-stats';currentStats.style.cssText='display:block!important;visibility:visible!important;position:relative;width:100%;margin-top:12px;text-align:left;background:#0b1020;border:1px solid #293754;border-radius:7px;padding:12px;flex:0 0 auto';currentStats.innerHTML='<h3 style="margin:0 0 10px;color:#9aaac7;font-size:11px;letter-spacing:1.5px">CURRENT COMBAT STATS</h3><div id="orbitalCurrentStatsGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px"></div>';}
const statGrid=currentStats.querySelector('#orbitalCurrentStatsGrid');
if(statGrid){
 const rows=[['CORE',core?.name||'Unbound',core?.color||'#72f6ff'],['ELEMENT',element?.name||'None',element?.color||'#72f6ff'],['ATTACK DAMAGE',Math.round(player?.damage||0),'#ffe38a'],['CRIT CHANCE',Math.round((player?.critChance||0)*100)+'%','#ff9ed8'],['CRIT DAMAGE',Math.round((player?.critDamage||1)*100)+'%','#ff9ed8'],['ATK SPEED',(player?.fireRate||0).toFixed(2)+'/s','#72f6ff'],['PROJECTILES / BEAMS',String(player?.shots||1),'#72f6ff'],['PROJECTILE SPEED',Math.round(player?.shotSpeed||0),'#72f6ff'],['MOVEMENT SPEED',Math.round(player?.speed||0),'#72f6ff'],['DEF',Math.round(player?.armor||0),'#8cecff'],['DAMAGE REDUCTION',Math.round(Math.min(.7,(player?.armor||0)/100)*100)+'%','#8cecff'],['HP',Math.ceil(player?.hp||0)+' / '+Math.ceil(player?.maxHp||0),'#ff789d'],['ULTIMATE MASTERY',(ultLevel||0)+' / 5','#c29aff']];
 if(core?.id==='remielle')rows.push(['VOID BURST',(player?.voidflares||0)+' / '+(player?.maxVoidflares||3),'#ff9ed8']);
 const weaponBonus=getVoidWeaponBonuses(saveData,core?.id||'');
 statGrid.innerHTML=rows.map(([label,value,color])=>'<div style="min-width:0;padding:9px 11px;background:linear-gradient(145deg,#111b2d,#0c1424);border:1px solid #263550;border-radius:7px"><div style="font-size:9px;letter-spacing:1px;color:#8799b7;margin-bottom:5px">'+label+'</div><strong style="font-size:13px;color:'+color+';overflow-wrap:anywhere;white-space:normal">'+value+'</strong></div>').join('');
 let weaponPanel=statGrid.querySelector('#orbitalVoidWeaponPanel');
 if(weaponBonus.weapon){
  const accent=weaponBonus.weapon.color||'#72f6ff';
  const passive=weaponBonus.signaturePassive;
  const rank=passive?Math.max(1,Math.min(5,passive.rank||1)):0;
  const rankLabel=['I','II','III','IV','V'][rank-1]||'—';
  const panel=document.createElement('section');
  panel.id='orbitalVoidWeaponPanel';
  panel.style.cssText='grid-column:1/-1;min-width:0;position:relative;overflow:hidden;margin-top:2px;padding:13px 15px 14px;background:linear-gradient(120deg,rgba(16,27,46,.98),rgba(10,17,31,.98));border:1px solid '+accent+'55;border-left:3px solid '+accent+';border-radius:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)';
  panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:11px"><div style="min-width:0"><div style="font-size:9px;letter-spacing:1.5px;color:#8799b7;margin-bottom:4px">VOID WEAPON · SIGNATURE SYSTEM</div><div style="font-size:15px;font-weight:800;letter-spacing:.15px;color:'+accent+'">'+weaponBonus.weapon.name+'</div></div><span style="flex-shrink:0;padding:5px 8px;border:1px solid '+accent+'55;border-radius:5px;background:'+accent+'12;color:'+accent+';font-size:9px;font-weight:800;letter-spacing:1px">'+(passive?'REFINEMENT '+rankLabel:'NON-SIGNATURE CORE')+'</span></div>'+(passive?'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px"><span style="width:5px;height:5px;border-radius:50%;background:'+accent+';box-shadow:0 0 8px '+accent+';flex-shrink:0"></span><span style="font-size:10px;letter-spacing:1.1px;color:#a9b8d2">SIGNATURE PASSIVE</span><strong style="font-size:12px;color:#f1f5ff">'+passive.name+'</strong></div><p style="margin:0;color:#b9c7df;font-size:12px;line-height:1.7;overflow-wrap:anywhere">'+highlightVoidWeaponNumbers(passive.description)+'</p>':'<p style="margin:0;color:#9aaac7;font-size:12px;line-height:1.6">The signature passive activates only when this weapon is equipped to '+(weaponBonus.weapon.signatureCoreId||'its matching core').toUpperCase()+'.</p>');
  statGrid.appendChild(panel);
 }
}
if(currentStats.parentNode!==modal)modal.appendChild(currentStats);
let earned=$('orbitalEarnedPerks');if(!earned){earned=document.createElement('section');earned.id='orbitalEarnedPerks';earned.className='panel orbital-earned-perks';earned.style.cssText='display:block!important;visibility:visible!important;position:relative;width:100%;margin-top:12px;text-align:left;max-height:34vh;overflow:auto;background:#0b1020;border:1px solid #293754;border-radius:7px;padding:12px;flex:0 0 auto';earned.innerHTML='<h3 style="margin:0 0 4px;color:#9aaac7;font-size:11px;letter-spacing:1.5px">PERKS ACQUIRED THIS RUN</h3><div style="font-size:11px;color:#72819e;margin-bottom:6px">Hover over or focus an icon to view its description and rank.</div><div id="orbitalEarnedPerksList"></div>';}
const list=earned.querySelector('#orbitalEarnedPerksList');if(list){list.innerHTML=typeof perkRankMarkup==='function'?perkRankMarkup():'<div class="upgrade" style="color:#72819e">Perk details unavailable.</div>';const grid=list.querySelector('.perk-icon-grid');if(grid){grid.style.gridTemplateColumns='repeat(auto-fill,minmax(46px,1fr))';grid.style.gap='9px';grid.style.padding='8px 2px 12px';}earned.querySelector('h3').textContent='PERKS ACQUIRED THIS RUN';}
if(!earned.isConnected)modal.appendChild(earned);}

function showFlightManual(returnState='paused'){settingsReturn=returnState;state='settings';$('overlay').classList.remove('hidden','closing');const modal=$('modal');modal.className='modal manual-modal';modal.innerHTML=`<div class="eyebrow">PILOT REFERENCE</div><h2>FLIGHT MANUAL</h2><p>Controls at a glance.</p><div class="manual-content"><strong>MOUSE</strong> · Aim and steer<br><strong>AUTO SHOOT</strong> · Automatically fires at the nearest enemy<br><strong>LEFT CLICK</strong> · Fire when Auto Shoot is off<br><strong>SPACE</strong> · Dash toward the mouse<br><strong>Q</strong> · Use your ultimate at 100% energy<br><strong>WASD / ARROWS</strong> · Move<br><strong>PORTALS</strong> · Click a glowing gate after clearing a room<br><br>Black holes pull you in. Stay outside the glowing danger ring.</div><div class="menu-actions"><button class="btn" id="manualBack">← BACK TO SETTINGS</button></div>`;$('manualBack').onclick=()=>showSettings(returnState);}

function hideModal(){const overlay=$('overlay'),modal=$('modal');if(overlay.classList.contains('hidden'))return;overlay.classList.remove('closing');void overlay.offsetWidth;overlay.classList.add('closing');const finish=()=>{if(overlay.classList.contains('closing')){overlay.classList.add('hidden');overlay.classList.remove('closing')}modal.style.animation='';};overlay.addEventListener('animationend',

function onEnd(e){if(e.target!==overlay||e.animationName!=='uiOverlayOut')return;overlay.removeEventListener('animationend',onEnd);finish()});setTimeout(()=>{if(overlay.classList.contains('closing'))finish()},320)}

function pauseGame(){if(state==='paused'){restorePausedPage();return;}if(player&&core&&['playing','portal','roomTransition'].includes(state))saveRunCheckpoint();const nonPausable=['start','worldselect','settings','dead','menu','codex','storyarchive','cutscene','worldcomplete'];if(!player||nonPausable.includes(state))return;pausedFrom=state;const overlay=$('overlay'),modal=$('modal');pausedOverlayVisible=!overlay.classList.contains('hidden');pausedModalClassName=modal.className;pausedPageNodes=pausedOverlayVisible?Array.from(modal.childNodes):null;state='paused';showPauseMenu()}

function restorePausedPage(){state=pausedFrom;const overlay=$('overlay'),modal=$('modal');if(pausedOverlayVisible&&pausedPageNodes){modal.replaceChildren(...pausedPageNodes);modal.className=pausedModalClassName;overlay.classList.remove('hidden')}else hideModal();pausedPageNodes=null;pausedOverlayVisible=false;pausedModalClassName='';last=performance.now();if(pendingCoreSkill){pendingCoreSkill=false;if(state==='playing')useCoreSkill();}}

function resumeGame(){restorePausedPage()}

function showPauseMenu(){returnBuildPanelHome();showModal('SYSTEM PAUSED','VOID PROTOCOL','Your run is paused. Resume, review your build, or adjust settings.',[{glyph:'▶',color:'#72f6ff',title:'RESUME RUN',desc:'Return to the current room.',action:resumeGame},{glyph:'◈',color:'#ff9ed8',title:'ORBITAL BUILD',desc:'Check your stats and perks. The run stays paused.',action:showOrbitalBuild},{glyph:'⚙',color:'#c29aff',title:'SETTINGS',desc:'Change controls and audio settings.',action:()=>showSettings('paused')},{glyph:'↻',color:'#ffe38a',title:'RESTART RUN',desc:'Erase this run’s checkpoint and restart from Room 1.',action:()=>{confirmInGame('RESTART THIS RUN?','This deletes your current run checkpoint, core, stats, and build. You will restart from Room 1.','DELETE CHECKPOINT & RESTART',()=>{returnBuildPanelHome();saveData.campaignCheckpoint=null;persist();run++;start()},showPauseMenu,'KEEP PLAYING')}},{glyph:'⌂',color:'#72f6ff',title:'CAMPAIGN MENU',desc:'Save your current checkpoint and return to world selection.',action:()=>{confirmInGame('RETURN TO CAMPAIGN MENU?',"Your current checkpoint will be saved. Starting a new run will replace it.",'SAVE & RETURN TO WORLDS',()=>{saveRunCheckpoint();returnBuildPanelHome();showWorldSelect()},showPauseMenu,'STAY IN RUN')}}])}

function showSettings(returnState='paused'){
 settingsReturn=returnState;state='settings';$('overlay').classList.remove('hidden','closing');
 const settingsModal=$('modal');settingsModal.className='modal settings-modal';
 settingsModal.innerHTML=`<div class="eyebrow">CONFIGURATION</div><h2>SETTINGS</h2><p>Customize controls, audio, and testing options.</p>
 <div class="setting-row ui-scale-row"><div style="flex:1;min-width:0"><b>UI SIZE</b><br><span>Scale the game interface and play area. Saved on this device.</span><input id="uiScale" aria-label="UI size" type="range" min="80" max="150" step="10" value="${Math.round(saveData.uiScale*100)}" style="display:block;width:100%;margin-top:9px;accent-color:var(--cyan)"></div><b id="uiScaleValue">${Math.round(saveData.uiScale*100)}%</b></div>
 <div class="setting-row"><div><b>BACKGROUND MUSIC</b><br><span>Play the arcade soundtrack.</span></div><button class="btn" id="musicToggle">${musicEnabled?'ON':'OFF'}</button></div>
 <div class="setting-row"><div style="flex:1"><b>MUSIC VOLUME</b><br><span>Adjust music volume.</span><input id="musicVolume" aria-label="Music volume" type="range" min="0" max="100" value="${Math.round(musicVolume*100)}" style="display:block;width:100%;margin-top:9px;accent-color:var(--cyan)"></div><b id="musicVolumeValue">${Math.round(musicVolume*100)}%</b></div>
 <div class="setting-row"><div><b>SOUND EFFECTS</b><br><span>Toggle combat and menu sounds.</span></div><button class="btn" id="sfxToggle">${sfxEnabled?'ON':'OFF'}</button></div>
 <div class="setting-row"><div><b>DEVELOPER MODE</b><br><span>${developerMode?'All cores unlocked for this browser session.':'Unlock all cores for testing. Password is required; mode resets on page reload.'}</span></div><button class="btn" id="developerModeToggle">${developerMode?'ON · DISABLE':'OFF · ENABLE'}</button></div>
 ${developerMode?'<div class="setting-row"><div><b>VOID WEAPON TEST LOADOUT</b><br><span>Unlock every Void Weapon at Refinement I and save the loadout to this browser.</span></div><button class="btn" id="grantDeveloperVoidWeapons">GRANT ALL · R1</button></div>':''}
 <div class="setting-row" id="developerPasswordPanel" style="display:none;flex-direction:column;align-items:stretch;gap:8px">
  <label for="developerPassword" style="font-size:11px;color:var(--muted)">DEVELOPER PASSWORD</label>
  <input id="developerPassword" type="password" autocomplete="off" spellcheck="false" placeholder="Enter password" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #3d5c7c;border-radius:4px;background:#080e1b;color:var(--text);font:inherit">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><button class="btn" id="developerPasswordSubmit">UNLOCK DEVELOPER MODE</button><small id="developerPasswordError" role="status" style="color:#ff9b9b"></small></div>
 </div>
 <div class="setting-row"><div><b>FLIGHT MANUAL</b><br><span>View controls and gameplay tips.</span></div><button class="btn" id="manualOpen">OPEN</button></div>
 <div class="setting-row"><div><b>PAUSE KEY</b><br><span>Escape or P opens the pause menu.</span></div><b>ESC / P</b></div>
 <p class="version-note">VERSION 0.5</p><div class="menu-actions"><button class="btn" id="settingsBack">← BACK</button></div>`;
 $('sfxToggle').onclick=()=>{sfxEnabled=!sfxEnabled;saveData.sfxEnabled=sfxEnabled;persist();if(sfxEnabled)sfx('ui');showSettings(returnState)};
 $('musicToggle').onclick=()=>{musicEnabled=!musicEnabled;saveData.musicEnabled=musicEnabled;persist();if(musicEnabled)startMusic();else stopMusic();showSettings(returnState)};
 $('uiScale').oninput=e=>{const scale=applyUiScale(Number(e.target.value)/100);saveData.uiScale=scale;persist();$('uiScaleValue').textContent=Math.round(scale*100)+'%';};
 $('musicVolume').oninput=e=>{musicVolume=Math.max(0,Math.min(1,Number(e.target.value)/100));saveData.musicVolume=musicVolume;persist();$('musicVolumeValue').textContent=Math.round(musicVolume*100)+'%';if(musicEnabled){startMusic();updateMusicVolume()}};
 $('manualOpen').onclick=()=>showFlightManual(returnState);
 $('developerModeToggle').onclick=()=>{if(developerMode){developerMode=false;showSettings(returnState);return;}const panel=$('developerPasswordPanel');if(panel)panel.style.display='flex';const input=$('developerPassword');const error=$('developerPasswordError');if(error)error.textContent='';if(input){input.value='';input.focus();}};
 const grantDeveloperVoidWeapons=$('grantDeveloperVoidWeapons');if(grantDeveloperVoidWeapons)grantDeveloperVoidWeapons.onclick=()=>{for(const weapon of voidWeapons){saveData.voidWeaponInventory[weapon.id]=Math.max(1,Number(saveData.voidWeaponInventory[weapon.id])||0);saveData.voidWeaponRefinements[weapon.id]=1;}saveData=normalizeVoidWeaponSave(saveData);persist();sfx('ui');notify('ALL VOID WEAPONS UNLOCKED · REFINEMENT I');showSettings(returnState);};
 const submitDeveloperPassword=async()=>{const input=$('developerPassword'),error=$('developerPasswordError');if(!input||!error)return;if(!window.crypto?.subtle){error.textContent='Secure hashing is unavailable in this browser.';return;}try{const bytes=new TextEncoder().encode(input.value);const digest=await window.crypto.subtle.digest('SHA-256',bytes);const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(hash===DEV_MODE_PASSWORD_SHA256){developerMode=true;showSettings(returnState);}else{input.value='';error.textContent='Incorrect password.';input.focus();}}catch(err){error.textContent='Could not verify password in this browser.';}};
 $('developerPasswordSubmit').onclick=submitDeveloperPassword;
 $('developerPassword').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitDeveloperPassword();}});
 $('settingsBack').onclick=()=>{if(returnState==='paused'){state='paused';showPauseMenu()}else if(returnState==='start'){showMainMenu()}else{state='playing';hideModal()}};
}

function perkExchangeInfo(name){
 const key=String(name||'').toUpperCase();
 const general=createGeneralPerks().find(p=>key===p.title.toUpperCase()||key.startsWith(p.title.toUpperCase()+' '));
 if(general)return {desc:general.desc,rare:false};
 const standard={
 'OVERCHARGED PHOTONS':'ATK +22%.',
 'PREDICTIVE TARGETING':'Crit Chance +5 percentage points.',
 'REACTIVE PLATING':'+18 Max HP and restore 18 HP.',
 'ACCELERATED CYCLE':'ATK Speed +15%.',
 'KINETIC DRIVE':'Movement Speed +10%; ATK Speed +8%.',
 'ULTIMATE MASTERY':'Ultimate damage +18% per mastery rank.',
 'PIERCING PHOTONS':'Shots pierce one additional enemy.',
 'VOID SIPHON':'Defeating enemies restores 2 HP.',
 'SIDE CANNONS':'Adds two side weapons per attack; rank 2 increases the total to four.',
 'MISSILE SALVO':'Launches homing missiles automatically. Higher ranks reduce the launch interval.',
 'RICOCHET CIRCUIT':'Attacks bounce to nearby enemies for 65% damage; ranks add bounces.',
 'CHAIN LIGHTNING':'Hits chain to nearby enemies for 55% damage; ranks add targets.',
 'CRITICAL PAYLOAD':'Crit Damage multiplier +25%.',
 'SALVAGE PROTOCOL':'Gain +1 Void Shard per enemy kill.',
 'CAPACITOR KILLCHAIN':'Gain +2 ultimate energy whenever you defeat an enemy.',
 'MAGNETAR FIELD':'Collect XP shards from 45 pixels farther away.',
 'PULSE REACTOR':'Releases a damaging pulse every 2.25 seconds; ranks increase range and damage.',
 'LIGHT FIELD':'Damages nearby enemies every 0.3 seconds; ranks increase size and damage.',
 'TEMPORAL COMPRESSION':'Ability cooldowns reduced by 10% per rank.',
 'CORE SKILL MASTERY':'Upgrades your core E skill, improving its power or duration and reducing cooldown.',
 'GLASS CANNON':'ATK +35%, but Max HP -12.'
 };
 if(standard[key])return {desc:standard[key],rare:false};
 const rare=/^(EMBER:|FROST:|AETHER:|FLASH:|NATURE:|PRISM:|AURALIS:|PRISM FLIGHT:)/i.test(name)||/SPECTRUM MASTERY|INFERNAL CONFLUX|ABSOLUTE AEGIS|SUPERNOVA GUIDANCE|DAYBREAK CHORUS|WORLDTREE PROTOCOL|EVERGREEN COVENANT/i.test(name);
 const exclusive=[
  [/CINDER MARK/,'Burning enemies take 18% more damage from your attacks.'],
  [/SHATTER PROTOCOL/,'Deal 25% more damage to frozen enemies and 10% more damage to chilled enemies.'],
  [/PRISM ECHO/,'Aether shard damage +15%; every fifth attack fires an empowered echo shard.'],
  [/SPECTRUM MASTERY/,'All four elemental damage types +15%; elemental ultimate damage +10%.'],
  [/STORM CIRCUIT/,'Adds one chain jump and +15% chain damage per rank.'],
  [/STATIC OVERLOAD/,'Stunned enemies take 10% more damage from all sources.'],
  [/CAPACITOR CASCADE/,'Critical primary hits empower chain damage and add a chain jump per rank.'],
  [/THUNDER GOD/,'Thunderfield strikes 30% faster and deals 20% more damage.'],
  [/NERVOUS SYSTEM/,'Static Shock stuns last 25% longer; stunned enemies take 10% more damage.'],
  [/LIVE WIRE/,'Crit Chance +6 % and ATK Speed +10%.'],
  [/PYRE CASCADE/,'Burn potency +15% per rank.'],
  [/CRYSTAL RESONANCE/,'Gain +2 DEF and +3 % critical chance per rank.'],
  [/PRISMATIC OVERDRIVE/,'ATK +12% and ATK Speed +8% per rank.'],
  [/CUBIC OVERLOAD/,'Elemental cube damage +10% and cube size +6% per rank.'],
  [/CHAIN REACTION/,'Lightning chains hit one additional enemy and deal +15% chain damage per rank.'],
  [/FROST LATTICE/,'Frost hits add one chill stack and freeze requires fewer stacks per rank.'],
  [/AETHER SWARM/,'Nature cube salvos gain one homing seed missile and +5% missile damage per rank.'],
  [/BURNING CONSTELLATION/,'Fire burn damage +20% per rank.'],
  [/INFERNAL CONFLUX/,'Ring of Fire damage +22%, burn DPS +4, and radius +8 per rank.'],
  [/ABSOLUTE AEGIS/,'Cryo Shield gains +14% Max HP capacity and +0.7 seconds duration per rank.'],
  [/SUPERNOVA GUIDANCE/,'Homing Missiles launch two additional missiles and deal +18% damage per rank.'],
  [/DAYBREAK CHORUS/,'Prism Flight strikes deal +22% damage and Daybreak Waltz lasts +0.7 seconds per rank.'],
  [/WORLDTREE PROTOCOL/,'Verdant Overdrive lasts 3 seconds longer and boosts drone healing and damage by 20%.'],
  [/EVERGREEN COVENANT/,'Each living drone grants +10% damage and 6% damage reduction.'],
  [/SWIFT CURRENT/,'Prism Flight strikes 12% faster per rank.'],
  [/LASTING RADIANCE/,'Daybreak Waltz lasts 0.8 seconds longer per rank.'],
  [/MULTIPLICITY/,'Each Prism Flight pulse launches one additional strike per rank, up to four strikes.']
 ];
 const matched=exclusive.find(([pattern])=>pattern.test(name));
 if(matched)return {desc:matched[1],rare};
 return {desc:rare?'Core-exclusive upgrade. The effect is already active on your core.':'Previously acquired upgrade. Its effect is already active on your core.',rare};
}

function showPerkExchange(offer){
 const owned=(build||[]).map((name,index)=>({name,index,...perkExchangeInfo(name)})).filter(x=>x.name);
 if(!owned.length){showModal('PERK EXCHANGE','NO PERKS TO EXCHANGE','You need at least one owned perk to trade for this fixed offer.',[{glyph:'↩',color:'#72f6ff',title:'LEAVE EXCHANGE',desc:'Keep the fixed offer unused.',action:finishPortalRoom}]);return}
 $('overlay').classList.remove('hidden','closing');const m=$('modal');m.classList.remove('upgrade-modal');
 let selectedIndex=null;
 const render=()=>{
  m.innerHTML=`<div class="eyebrow">FIXED PERK EXCHANGE</div><h2>CHOOSE A PERK TO TRADE</h2><p>Select one of your owned perks to exchange for the fixed offer on the right. The offer cannot be refreshed.</p><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;margin-top:16px;align-items:stretch"><section style="border:1px solid #334565;background:#0c1425;border-radius:6px;padding:12px;min-width:0"><div style="font-size:10px;letter-spacing:1.5px;color:#9aabc8;margin-bottom:10px">YOUR PERKS · SELECT ONE</div><div style="display:grid;gap:7px;max-height:300px;overflow-y:auto">${owned.map(x=>`<button type="button" data-perk-index="${x.index}" class="choice" style="width:100%;border-color:${selectedIndex===x.index?'#72f6ff':'#334565'};background:${selectedIndex===x.index?'#153044':'#111a2d'}"><b style="margin:0 0 4px;color:${x.rare?'#d5a5ff':'#e5eefc'}">${x.rare?'✧ RARE / EXCLUSIVE · ':''}${x.name}</b><small style="display:block;white-space:normal;line-height:1.4;margin-top:5px;color:#aebdd6">${x.desc}</small><small style="display:block;margin-top:5px;color:${selectedIndex===x.index?'#72f6ff':'#8498b8'}">${selectedIndex===x.index?'SELECTED FOR EXCHANGE':'SELECT TO TRADE'}</small></button>`).join('')}</div></section><section style="border:1px solid ${offer.color||'#d2a0ff'};background:linear-gradient(145deg,#201b35,#101a2a);border-radius:6px;padding:14px;min-width:0"><div style="font-size:10px;letter-spacing:1.5px;color:#c7a9ff;margin-bottom:12px">FIXED OFFER · NO REFRESH</div><div style="font-size:28px;color:${offer.color||'#d2a0ff'}">${offer.glyph||'✦'}</div><h3 style="font-size:13px;color:${offer.color||'#d2a0ff'};margin:8px 0">${offer.title}</h3><p style="font-size:11px;line-height:1.5;color:#a9b8d2;margin:0">${offer.desc||'A general perk.'}</p><div style="font-size:10px;color:#ffe38a;margin-top:14px">THIS OFFER IS PREDETERMINED</div></section></div><div class="menu-actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn" id="declineExchange">DECLINE</button><button class="btn primary" id="acceptExchange" ${selectedIndex===null?'disabled':''}>EXCHANGE SELECTED PERK</button></div>`;
  m.querySelectorAll('[data-perk-index]').forEach(btn=>btn.onclick=()=>{selectedIndex=Number(btn.dataset.perkIndex);render()});
  m.querySelector('#declineExchange').onclick=finishPortalRoom;
  m.querySelector('#acceptExchange').onclick=()=>{if(selectedIndex===null)return;const idx=build.findIndex((name,i)=>i===selectedIndex);if(idx<0)return;build.splice(idx,1);offer.action();build.push(offer.title);updateUI();finishPortalRoom()};
 };
 render();
}

function showVoidForge(){
 state='forge';$('overlay').classList.remove('hidden','closing');const m=$('modal');m.classList.remove('upgrade-modal');
 const owned=[];
 const add=(id,title,glyph,color,rank,maxRank,cost,desc,apply)=>{if(rank>0&&rank<maxRank)owned.push({id,title,glyph,color,rank,maxRank,cost:cost+rank*20,desc,apply})};
 for(const p of createGeneralPerks()){const rank=Number(p.rank?.()||0),max=Number(typeof p.maxRank==='function'?p.maxRank():p.maxRank??99);if(rank>0&&rank<max)add(p.id,p.title,p.glyph,p.color,rank,max,30,p.desc,()=>p.action());}
 const count=n=>buildCount(n.toUpperCase());
 add('overcharged','OVERCHARGED PHOTONS','✦','#ffe38a',perkRank('OVERCHARGED PHOTONS'),5,35,'ATK +22%.',()=>{player.damage*=1.22;build.push('Overcharged Photons')});
 add('predictive','PREDICTIVE TARGETING','◎','#d2a0ff',perkRank('PREDICTIVE TARGETING'),10,30,'Crit Chance +5 % per rank.',()=>{player.predictiveTargetingRank=Math.min(10,(player.predictiveTargetingRank||0)+1);player.critChance=Math.min(.75,(player.critChance||.12)+.05);build.push('Predictive Targeting')});
 add('plating','REACTIVE PLATING','⬡','#83ffc5',perkRank('REACTIVE PLATING'),5,35,'Max HP +18 and restore 18 HP.',()=>{player.maxHp+=18;restoreHull(18);build.push('Reactive Plating')});
 add('cycle','ACCELERATED CYCLE','»','#72f6ff',perkRank('ACCELERATED CYCLE'),5,35,'ATK Speed +15%.',()=>{player.fireRate*=1.15;build.push('Accelerated Cycle')});
 add('ultimate','ULTIMATE MASTERY','✹','#c29aff',ultLevel,5,40,'Ultimate damage +18% per rank.',()=>{ultLevel=getUltimateMasteryRank(ultLevel+1);build.push('Ultimate Mastery '+ultLevel)});
 add('piercing','PIERCING PHOTONS','↠','#9deaff',player.pierce||0,5,35,'Shots pierce one additional enemy per rank.',()=>{player.pierce=Math.min(5,(player.pierce||0)+1);build.push('Piercing Photons')});
 add('siphon','VOID SIPHON','♥','#ff79b8',Math.floor((player.lifeSiphon||0)/2),5,35,'Defeating enemies restores 2 HP per rank.',()=>{player.lifeSiphon=(player.lifeSiphon||0)+2;build.push('Void Siphon')});
 add('sidecannons','SIDE CANNONS','⊣','#72f6ff',player.sideCannons||0,2,50,'Add two small, glowing companion stars per rank, matching the selected core color.',()=>{player.sideCannons=Math.min(2,(player.sideCannons||0)+1);build.push('Side Cannons')});
 add('missiles','MISSILE SALVO','➤','#d2a0ff',player.autoMissiles||0,3,55,'Launch homing missiles more frequently.',()=>{player.autoMissiles=Math.min(3,(player.autoMissiles||0)+1);player.autoMissileTimer=Math.min(player.autoMissileTimer||4,1);build.push('Missile Salvo '+player.autoMissiles)});
 add('ricochet','RICOCHET CIRCUIT','↗','#ff9ed8',player.ricochet||0,3,50,'Attacks bounce to additional nearby enemies.',()=>{player.ricochet=Math.min(3,(player.ricochet||0)+1);build.push('Ricochet Circuit')});
 add('chain','CHAIN LIGHTNING','ϟ','#ffe875',player.chainLightning||0,3,50,'Chain attacks jump to additional enemies.',()=>{player.chainLightning=Math.min(3,(player.chainLightning||0)+1);build.push('Chain Lightning')});
 add('critical','CRITICAL PAYLOAD','✹','#ffe875',Math.max(0,Math.round(((player.critDamage||1.8)-1.8)/.25)),5,35,'Crit Damage multiplier +25%.',()=>{player.critDamage=(player.critDamage||1.8)+.25;build.push('Critical Payload')});
 add('salvage','SALVAGE PROTOCOL','⬡','#ffe38a',player.shardBonus||0,5,30,'Gain additional Void Shards from enemy kills.',()=>{player.shardBonus=(player.shardBonus||0)+1;build.push('Salvage Protocol')});
 const upgradedThisVisit=new Set();
 const render=()=>{const current=owned.filter(o=>o.rank<o.maxRank);m.innerHTML=`<div class="eyebrow">PORTAL DESTINATION · VOID FORGE</div><h2>UPGRADE YOUR BUILD</h2><p>Spend Void Shards to rank up perks you already own. Each upgrade applies immediately, and the next rank costs more.</p><div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;color:#ffe38a;font-weight:700"><span>⬡ ${shards} VOID SHARDS</span><span>${current.length} AVAILABLE UPGRADES</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;max-height:min(52vh,430px);overflow:auto;padding:2px">${current.map(o=>{const used=upgradedThisVisit.has(o.id);return `<button type="button" data-forge-id="${o.id}" class="choice forge-choice" ${used?'disabled':''} style="--forge-accent:${o.color};text-align:left;border-color:${o.color};min-width:0;${used?'opacity:.48;cursor:not-allowed':''}"><b style="color:${o.color};display:block;margin-bottom:5px">${o.glyph} ${o.title}</b><small style="display:block;color:#aebdd6;white-space:normal;line-height:1.4">${o.desc}</small><small style="display:block;margin-top:7px;color:#ffe38a">${used?'UPGRADED THIS VISIT':`RANK ${o.rank}/${o.maxRank} → ${o.rank+1}/${o.maxRank} · ⬡ ${o.cost}`}</small></button>`}).join('')||'<div style="grid-column:1/-1;padding:20px;color:#aebdd6;text-align:center">No owned perks can be upgraded further. Your build has apparently achieved peak paperwork.</div>'}</div><div class="menu-actions" style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" id="forgeLeave">CONTINUE</button></div>`;
 m.querySelectorAll('[data-forge-id]').forEach(btn=>btn.onclick=()=>{const o=current.find(x=>x.id===btn.dataset.forgeId);if(!o||upgradedThisVisit.has(o.id))return;if(shards<o.cost){notify(shards<o?.cost?'NOT ENOUGH VOID SHARDS':'UPGRADE UNAVAILABLE');return}shards-=o.cost;o.apply();upgradedThisVisit.add(o.id);updateUI();notify(o.title+' UPGRADED');render()});
 m.querySelector('#forgeLeave').onclick=finishPortalRoom;
 };
 render();
}

function showAnomaly(){const events=[
 {title:'VOID SHARDS',glyph:'⬡',color:'#ffe38a',desc:'Gain 18 Void Shards.',action:()=>addShards(18)},
 {title:'EXPERIENCE CACHE',glyph:'✦',color:'#72f6ff',desc:'Gain 35 experience.',action:()=>gainXP(35)},
 {title:'ULTIMATE ENERGY',glyph:'ϟ',color:'#c29aff',desc:'Gain 35 ultimate energy.',action:()=>addEnergy(35)},
 {title:'NEXUS FRAGMENTS',glyph:'✧',color:'#ff9ed8',desc:'Gain 12 Nexus Fragments for permanent core upgrades.',action:()=>{saveData.coreCurrency=(saveData.coreCurrency||0)+12;persist();notify('ANOMALY REWARD · +12 NEXUS FRAGMENTS')}}
 ];const e=pick(events);showModal('UNCHARTED ANOMALY','COSMIC EVENT',`The anomaly yields: ${e.title}.`,[{glyph:e.glyph,color:e.color,title:e.title,desc:e.desc,action:()=>{e.action();updateUI();showModal('EVENT RESOLVED','REWARD SECURED',`Reward received: ${e.title}.`,[{glyph:'→',title:'CONTINUE FLIGHT',desc:'Proceed to the next room.',action:finishPortalRoom}])}}])}

function buildCount(label){return build.filter(x=>x.toUpperCase().includes(label.toUpperCase())).length}

function marketRank(id){switch(id){case'repair':return 0;case'damage':return buildCount('OVERCHARGED PHOTONS')+buildCount('DENSE PHOTONS');case'rate':return buildCount('ACCELERATED CYCLE')+buildCount('RAPID PULSAR');case'hull':return buildCount('REACTIVE PLATING')+buildCount('REINFORCED SHELL');case'resonance':return buildCount('RESONANCE');case'sidecannons':return player.sideCannons||0;case'missilesalvo':return player.autoMissiles||0;case'ultimate':return ultLevel;case'pierce':return player.pierce||0;case'siphon':return Math.floor((player.lifeSiphon||0)/2);case'ricochet':return player.ricochet||0;case'chain':return player.chainLightning||0;case'critpayload':return Math.max(0,Math.round(((player.critDamage||1.8)-1.8)/.25));case'salvage':return player.shardBonus||0;case'capacitor':return Math.floor((player.energyOnKill||0)/2);case'magnetar':return Math.max(0,Math.round(((player.magnet||55)-55)/45));case'pulse':return Math.ceil((player.pulseAura||0)/24);case'glass':return buildCount('GLASS CANNON');case'cooldown':return player?.cooldownReduction||0;default:return 0}}

function perkRankMarkup(){
 const rows=[
  ['Overcharged Photons',perkRank('OVERCHARGED PHOTONS'),'✦','ATK +22% per rank.'],
  ['Homing Guidance',perkRank('HOMING GUIDANCE'),'◎','Primary auto-attack and side-cannon projectiles steer toward a living target.'],
  ['Dense Photons',buildCount('MARKET: DENSE PHOTONS'),'✧','Increases projectile density and attack output.'],
  ['Predictive Targeting',perkRank('PREDICTIVE TARGETING'),'◎','Crit Chance +5 % per rank.'],
  ['Reactive Plating',buildCount('REACTIVE PLATING'),'⬡','Max HP +18 and restore 18 HP per rank.'],
  ['Reinforced Shell',buildCount('MARKET: REINFORCED SHELL'),'⬢','Increases defensive resilience.'],
  ['Accelerated Cycle',perkRank('ACCELERATED CYCLE'),'»','ATK Speed +15% per rank.'],
  ['Rapid Pulsar',buildCount('MARKET: RAPID PULSAR'),'ϟ','Improves attack cadence.'],
  ['Kinetic Drive',buildCount('KINETIC DRIVE'),'➤','Movement Speed +10% and Projectile Speed +8% per rank.'],
  ['Ultimate Mastery',ultLevel,'✹','Ultimate damage +18% per mastery rank.'],
  ['Piercing Photons',player.pierce||0,'↠','Shots pierce additional enemies.'],
  ['Void Siphon',Math.floor((player.lifeSiphon||0)/2),'♥','Defeating enemies restores hull.'],
  ['Side Cannons',player.sideCannons||0,'⊣','Adds two small, glowing companion stars per rank, matching the selected core color.'],
  ['Missile Salvo',player.autoMissiles||0,'➤','Automatically launches homing missiles; ranks shorten the interval.'],
  ['Ricochet Circuit',player.ricochet||0,'↗','Attacks bounce to nearby hostiles for reduced damage.'],
  ['Chain Lightning',player.chainLightning||0,'ϟ','Hits arc to nearby enemies; ranks add chain targets.'],
  ['Critical Payload',Math.max(0,Math.round(((player.critDamage||1.8)-1.8)/.25)),'✹','Crit Damage multiplier +25% per rank.'],
  ['Salvage Protocol',player.shardBonus||0,'⬡','Gain additional Void Shards per enemy kill.'],
  ['Capacitor Killchain',Math.floor((player.energyOnKill||0)/2),'ϟ','Gain extra ultimate energy when defeating enemies.'],
  ['Magnetar Field',Math.max(0,Math.round(((player.magnet||55)-55)/45)),'◎','Collect XP shards from farther away.'],
  ['Pulse Reactor',perkRank('PULSE REACTOR'),'✺','Every 2.25s, pulse nearby enemies for 38% attack damage. Range and damage scale with rank.'],
  ['Phase Reserve',perkRank('PHASE RESERVE'),'◇','Gain one extra dash charge. Charges recharge one at a time.'],
  ['Afterglow Capacitor',perkRank('AFTERGLOW CAPACITOR'),'✹','Your ultimate refunds 8 energy per rank after use.'],
  ['Salvage Dividend',perkRank('SALVAGE DIVIDEND'),'⬡','Collect 10% more Void Shards per rank.'],
  ['Last Stand',perkRank('LAST STAND'),'♥','Deal 15% more damage per rank at 35% hull or lower.'],
  ['Phase Momentum',perkRank('PHASE MOMENTUM'),'➤','After dashing, deal 10% more damage per rank for 2.5s.'],
  ['Repair Matrix',perkRank('REPAIR MATRIX'),'✚','Restore 8 HP per rank when leaving a cleared room.'],
  ['Critical Battery',perkRank('CRITICAL BATTERY'),'ϟ','Critical hits grant 2 ultimate energy per rank.'],
  ['Singularity Hunter',perkRank('SINGULARITY HUNTER'),'◉','Deal 12% more damage per rank to singularities and bosses.'],
  ['Aegis Circuit',perkRank('AEGIS CIRCUIT'),'⬢','Reduce incoming damage by 8% per rank, after DEF.'],
  ['Overclock Relay',perkRank('OVERCLOCK RELAY'),'»','Gain up to 8% ATK Speed per rank as ultimate energy fills.'],
  ['Light Field',player.lightField||0,'☼','Nearby enemies take recurring elementless damage; ranks increase radius and damage.'],
  ['Prism Flight: Swift Current',player.phaseFlowCadence||0,'✧','Prism Flight strikes occur 12% faster per rank.'],
  ['Prism Flight: Lasting Radiance',player.phaseFlowDuration||0,'✧','Daybreak Waltz / Prism Flight lasts longer per rank.'],
  ['Prism Flight: Prism Echo',player.phaseFlowPower||0,'✧','Prism Flight strikes deal increased damage per rank.'],
  ['Prism Flight: Multiplicity',player.phaseFlowExtraStrikes||0,'✧','Adds additional strikes per Prism Flight pulse per rank.'],
  ['Core Skill Mastery',player.skillLevel||0,'✦','Improves your core skill and reduces its cooldown.'],
  ['Infernal Conflux',player.emberSkillRelic||0,'♨','Ember skill: Ring of Fire damage, burn and radius increased per rank.'],
  ['Absolute Aegis',player.frostSkillRelic||0,'❄','Frost skill: shield capacity and duration increased per rank.'],
  ['Singularity Focus',player.novaSkillRelic||0,'◉','Aether skill: increases Black Sun duration, radius, and collapse damage.'],
  ['Daybreak Chorus',player.remielleSkillRelic||0,'✧','Auralis skill: Prism Flight damage and duration increased per rank.'],
  ['Worldtree Protocol',player.natureWorldtreeProtocol||0,'❧','Nature rare perk: extends Verdant Overdrive and improves drone performance.'],
  ['Evergreen Covenant',player.natureEvergreenCovenant?1:0,'✧','Nature rare perk: living drones increase damage and reduce incoming damage.'],
  ['Temporal Compression',player.cooldownReduction||0,'◷','Ability, dash and Missile Salvo cooldowns reduced per rank.'],
  ['Glass Cannon',buildCount('GLASS CANNON'),'⚔','ATK +35%, but Max HP -12 per rank.'],
  ['Core Resonance',perkRank('CORE RESONANCE'),'✹','Enhances core-related combat effects.'],
  ['Pyre Cascade',player.pyreCascade||0,'♨','Ember exclusive: burn potency +18% per rank.'],
  ['Crystal Resonance',player.crystalResonance||0,'❄','Frost exclusive: DEF and Crit Chance increase per rank.'],
  ['Gravitational Lens',player.prismaticOverdrive||0,'◉','Aether exclusive: black-hole radius and collapse damage increase per rank.']
 ];
 const active=rows.filter(([,rank])=>Number(rank)>0);
 const normalize=value=>String(value||'').replace(/^MARKET:\s*/i,'').replace(/^LV\s*\d+\s*[·:]\s*/i,'').replace(/\s+\d+$/,'').replace(/\s+/g,' ').trim().toUpperCase();
 const variants=value=>{const full=normalize(value);const tail=full.includes(':')?full.slice(full.lastIndexOf(':')+1).trim():full;return [...new Set([full,tail])];};
 const extraMap=new Map();
 for(const raw of (build||[])){
  const label=String(raw||'').trim().replace(/^MARKET:\s*/i,'').replace(/^LV\s*\d+\s*·\s*/i,'').replace(/\s+\d+$/,'').trim();
  if(!label)continue;
  const labelVariants=variants(label);
  if(active.some(([name])=>variants(name).some(v=>labelVariants.includes(v))))continue;
  const codex=PERKCODEXDATA.find(([title])=>variants(title).some(v=>labelVariants.includes(v)));
  const display=codex?codex[0]:label;
  const key=normalize(display);
  if(!extraMap.has(key))extraMap.set(key,{name:display,glyph:codex?.[1]||'✦',desc:codex?.[2]||'Acquired this run.',rank:'✓'});
 }
 const extras=[...extraMap.values()];
 const displayRows=[
  ...active.map(([name,rank,glyph,desc])=>({name,rank,glyph,desc,acquired:false})),
  ...extras.map(({name,rank,glyph,desc})=>({name,rank,glyph,desc,acquired:true}))
 ];
 if(!displayRows.length)return '<div class="upgrade" style="color:#72819e">No perks acquired yet.</div>';
 const colorFor=name=>/NATURE|WORLDTREE|EVERGREEN|SYMBIOSIS|ROOT NETWORK|PREDATOR BLOOM|SEEDLING/i.test(name)?'#70e58a':/FLASH|LIGHTNING|STORM CIRCUIT|LIVE WIRE|THUNDER GOD|STATIC OVERLOAD|NERVOUS SYSTEM|CAPACITOR CASCADE/i.test(name)?'#ffe875':/EMBER|PYRE|CINDER|INFERNAL CONFLUX/i.test(name)?'#ff9b68':/FROST|CRYSTAL|AEGIS|SHATTER/i.test(name)?'#8cecff':/AURALIS|PRISM FLIGHT|DAYBREAK CHORUS|LUMINOUS WINGS/i.test(name)?'#ff9ed8':/NOVA|SUPERNOVA|PRISMATIC OVERDRIVE/i.test(name)?'#c29aff':'#ffe38a';
 return '<div class="perk-icon-grid">'+displayRows.map(({name,rank,glyph,desc,acquired})=>{
  const color=colorFor(name);
  const rankLabel=acquired?'Acquired this run':('rank '+rank);
  const safeName=String(name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const safeDesc=String(desc).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return '<div class="perk-icon-item" tabindex="0" style="--perk-color:'+color+'" aria-label="'+safeName+', '+rankLabel+'. '+safeDesc+'"><span class="perk-icon-glyph">'+glyph+'</span><span class="perk-icon-rank">'+rank+'</span><span class="perk-hover-card"><b>'+safeName+'</b><em>'+(acquired?'ACQUIRED':('Rank '+rank))+'</em><span>'+safeDesc+'</span></span></div>';
 }).join('')+'</div>';
}

function marketCost(baseCost,rank=0){const progression=1.2+Math.max(0,room-1)*.01+Math.max(0,currentWorld)*.08;return Math.ceil((baseCost+rank*15)*progression)}

function showShop(){state='shop';let items=[
 {id:'repair',title:'HP REPAIR',glyph:'✚',color:'#83ffc5',cost:20,desc:'Restore 35 HP.',buy:()=>{restoreHull(35)}},
 {id:'damage',title:'DENSE PHOTONS',glyph:'✦',color:'#ffe38a',cost:35,rank:()=>marketRank('damage'),maxRank:5,desc:'Permanent damage +20%.',buy:()=>{player.damage*=1.2;build.push('Market: Dense photons')}},
 {id:'rate',title:'RAPID PULSAR',glyph:'»',color:'#72f6ff',cost:30,rank:()=>marketRank('rate'),maxRank:5,desc:'ATK Speed +18%.',buy:()=>{player.fireRate*=1.18;build.push('Market: Rapid pulsar')}},
 {id:'hull',title:'REINFORCED SHELL',glyph:'⬡',color:'#83ffc5',cost:30,rank:()=>marketRank('hull'),maxRank:5,desc:'Max HP +20 and heal 20.',buy:()=>{player.maxHp+=20;restoreHull(20);build.push('Market: Reinforced shell')}},
 {id:'resonance',title:'AURALIS: CORE RESONANCE',glyph:'☼',color:'#ff9ed8',cost:60,rank:()=>marketRank('resonance'),maxRank:5,desc:'Empower LIGHT: attack damage +15%.',buy:()=>{player.damage*=1.15;build.push('LIGHT RESONANCE')}},
 {id:'sidecannons',title:'SIDE CANNONS',glyph:'⊣',color:'#72f6ff',cost:65,rank:()=>marketRank('sidecannons'),maxRank:2,desc:`RANK ${Math.min(2,(player.sideCannons||0)+1)}/2 · Adds two small, glowing companion stars per rank, matching your core color; rank 2 gives four stars.`,buy:()=>{player.sideCannons=Math.min(2,(player.sideCannons||0)+1);build.push('Side Cannons')}},{id:'missilesalvo',title:'MISSILE SALVO',glyph:'➤',color:'#d2a0ff',cost:70,rank:()=>marketRank('missilesalvo'),maxRank:3,desc:'Automatically launch homing missiles every few seconds. Each rank increases frequency.',buy:()=>{player.autoMissiles=Math.min(3,(player.autoMissiles||0)+1);player.autoMissileTimer=Math.min(player.autoMissileTimer||4,1);build.push('Missile Salvo '+player.autoMissiles)}},{id:'ultimate',title:'ULTIMATE MASTERY',glyph:'✹',color:core?.color||'#c29aff',cost:55,rank:()=>ultLevel,maxRank:5,desc:`Rank ${ultLevel}/5 · Ultimate damage +18% per rank.`,buy:()=>{ultLevel=getUltimateMasteryRank(ultLevel+1);build.push('Ultimate Mastery '+ultLevel)}},{id:'pierce',title:'PIERCING PHOTONS',glyph:'↠',color:'#72f6ff',cost:45,rank:()=>marketRank('pierce'),maxRank:4,desc:'Shots pierce one additional enemy.',buy:()=>{player.pierce=Math.min(4,(player.pierce||0)+1);build.push('Piercing Photons')}},{id:'siphon',title:'VOID SIPHON',glyph:'♥',color:'#ff79b8',cost:45,rank:()=>marketRank('siphon'),maxRank:5,desc:'Restore 2 HP whenever an enemy dies.',buy:()=>{player.lifeSiphon=(player.lifeSiphon||0)+2;build.push('Void Siphon')}},{id:'ricochet',title:'RICOCHET CIRCUIT',glyph:'↗',color:'#72f6ff',cost:65,rank:()=>marketRank('ricochet'),maxRank:3,desc:'Attacks bounce to nearby enemies for 65% damage. Each rank adds a bounce (max 3).',buy:()=>{player.ricochet=Math.min(3,(player.ricochet||0)+1);build.push('Ricochet Circuit')}},{id:'chain',title:'CHAIN LIGHTNING',glyph:'ϟ',color:'#ffe875',cost:65,rank:()=>marketRank('chain'),maxRank:3,desc:'Hits chain to nearby enemies for 55% damage. Each rank adds a target (max 3).',buy:()=>{player.chainLightning=Math.min(3,(player.chainLightning||0)+1);build.push('Chain Lightning')}},{id:'critpayload',title:'CRITICAL PAYLOAD',glyph:'✹',color:'#ffe38a',cost:55,rank:()=>marketRank('critpayload'),maxRank:7,desc:'Crit Damage multiplier +25%.',buy:()=>{player.critDamage=Math.min(3.5,player.critDamage+.25);build.push('Critical Payload')}},{id:'salvage',title:'SALVAGE PROTOCOL',glyph:'⬡',color:'#ffe38a',cost:50,rank:()=>marketRank('salvage'),maxRank:5,desc:'Gain +1 Void Shard per enemy kill.',buy:()=>{player.shardBonus=(player.shardBonus||0)+1;build.push('Salvage Protocol')}},{id:'capacitor',title:'CAPACITOR KILLCHAIN',glyph:'ϟ',color:'#c29aff',cost:55,rank:()=>marketRank('capacitor'),maxRank:5,desc:'Gain +2 extra energy per enemy kill.',buy:()=>{player.energyOnKill=(player.energyOnKill||0)+2;build.push('Capacitor Killchain')}},{id:'magnetar',title:'MAGNETAR FIELD',glyph:'◎',color:'#ff79b8',cost:45,rank:()=>marketRank('magnetar'),maxRank:5,desc:'XP pickup range +45.',buy:()=>{player.magnet=(player.magnet||55)+45;build.push('Magnetar Field')}},{id:'pulse',title:'PULSE REACTOR',glyph:'✺',color:'#72f6ff',cost:70,rank:()=>marketRank('pulse'),maxRank:8,desc:'Every 2.25s, release a damaging pulse (90px radius, 38% attack damage). Higher ranks increase range and damage.',buy:()=>{player.pulseAura=Math.min(170,(player.pulseAura||0)+24);player.pulseTimer=Math.min(player.pulseTimer||2.25,1);build.push('Pulse Reactor')}},{id:'lightfield',title:'LIGHT FIELD',glyph:'☼',color:'#fff0a8',cost:65,rank:()=>player.lightField||0,maxRank:3,desc:'A luminous aura deals strong elementless damage every 0.30 seconds to nearby enemies. Higher ranks increase radius and damage.',buy:()=>{player.lightField=Math.min(3,(player.lightField||0)+1);player.lightFieldTimer=0;build.push('Light Field '+player.lightField)}},{id:'cooldown',title:'TEMPORAL COMPRESSION',glyph:'◷',color:'#9deaff',cost:55,rank:()=>marketRank('cooldown'),maxRank:3,desc:'Reduce core-skill, dash, and homing-missile cooldowns by 10% per rank.',buy:()=>{player.cooldownReduction=Math.min(3,(player.cooldownReduction||0)+1);build.push('Temporal Compression '+player.cooldownReduction)}},{id:'glass',title:'GLASS CANNON',glyph:'⚔',color:'#ff5a36',cost:45,rank:()=>marketRank('glass'),maxRank:3,desc:'ATK +35%, Max HP -12.',buy:()=>{player.damage*=1.35;player.maxHp=Math.max(30,player.maxHp-12);player.hp=Math.min(player.hp,player.maxHp);build.push('Glass Cannon')}
 }];if(!shopStock){const eligibleItems=items.filter(it=>it.id!=='resonance'||core?.id==='remielle');shopStock=[...eligibleItems].sort(()=>Math.random()-.5).slice(0,6);}items=shopStock;$('overlay').classList.remove('hidden','closing');if(core?.id==='flash')items=items.filter(it=>it.id!=='chain');let m=$('modal');m.innerHTML=`<div class="eyebrow">ROOM ${room} · TRADING POST</div><h2>VOID MARKET</h2><p><span style="color:#ffe38a;font-size:15px">⬡</span> <b style="color:#ffe38a">${shards}</b> VOID SHARDS AVAILABLE. Each item can be bought once per visit. Prices include a 20% base increase, plus 1% per room and 8% per world. Rank upgrades add 15 Shards before these increases.</p><div class="choices">${items.map((it,i)=>{const rank=it.rank?it.rank():0,cost=marketCost(it.cost,rank),bought=(shopPurchased||[]).includes(it.id),maxRank=typeof it.maxRank==='function'?it.maxRank():it.maxRank,maxed=maxRank!==undefined&&rank>=maxRank,disabled=bought||maxed||shards<cost;const rankText=it.rank?(maxed?`MAX RANK ${rank}`:`RANK ${rank} → ${rank+1}`):'ONE-TIME ITEM';return `<button class="choice ${it.rarity==='rare'?'rare-choice':''}" data-item="${i}" ${disabled?'disabled':''} style="opacity:${disabled?.48:1}"><span class="orb" style="color:${it.color}">${bought?'✓':it.glyph}</span><span><b>${it.title} · ${cost} ⬡</b><small>${rankText}${bought?' · PURCHASED THIS VISIT':''}${maxed?' · MAXED OUT':''}</small><small>${it.desc}</small></span></button>`}).join('')}</div><div class="menu-actions"><button class="btn" id="leaveShop">LEAVE MARKET →</button></div>`;m.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{let it=items[Number(b.dataset.item)],rank=it.rank?it.rank():0,cost=marketCost(it.cost,rank);const maxRank=typeof it.maxRank==='function'?it.maxRank():it.maxRank;if((shopPurchased||[]).includes(it.id)||(maxRank!==undefined&&rank>=maxRank)||shards<cost)return;shards-=cost;it.buy();shopPurchased=shopPurchased||[];shopPurchased.push(it.id);notify(`${it.title} PURCHASED`);updateUI();showShop()});$('leaveShop').onclick=finishPortalRoom;updateUI()}

function chooseUpgrade(){state='upgrade';let options=[{title:'DENSE PHOTONS',glyph:'✦',color:'#ffe38a',desc:'Projectile damage +30%.',action:()=>player.damage*=1.3},{title:'RAPID PULSAR',glyph:'»',color:'#72f6ff',desc:'ATK Speed +25%.',action:()=>player.fireRate*=1.25},{title:'REINFORCED SHELL',glyph:'⬡',color:'#83ffc5',desc:'Restore 35 HP and gain +10 Max HP.',action:()=>{player.maxHp+=10;restoreHull(35)}},{title:'ARMOR MATRIX',glyph:'▦',color:'#83ffc5',desc:'Gain 8 DEF to reduce incoming damage.',action:()=>player.armor=Math.min(60,player.armor+8)},{title:'PHASE DRIVE',glyph:'➤',color:'#ff8fcb',desc:`Movement speed +12%; dash cooldown reduced to ${Math.max(1.4,3.5-Math.min(3,(player.dashPower||0)+1)*.55).toFixed(2)}s.`,action:()=>{player.speed*=1.12;player.dashPower=Math.min(3,player.dashPower+1)}},{title:'ULTIMATE MASTERY',glyph:'✹',color:core?.color||'#c29aff',desc:`Ultimate mastery ${ultLevel} → ${ultLevel+1}: stronger ultimate power.`,action:()=>{ultLevel=Math.min(5,ultLevel+1);build.push('Ultimate Mastery '+ultLevel)}},{title:'AURALIS: CORE RESONANCE',glyph:'☼',color:'#ff9ed8',desc:'Empower LIGHT: attack damage +15%.',action:()=>{player.damage*=1.15;build.push('LIGHT RESONANCE')}},{title:'PIERCING PHOTONS',glyph:'↠',color:'#72f6ff',desc:'Shots pierce one additional enemy.',action:()=>player.pierce=Math.min(4,(player.pierce||0)+1)},{title:'VOID SIPHON',glyph:'♥',color:'#ff79b8',desc:'Restore 2 HP whenever an enemy dies.',action:()=>player.lifeSiphon=(player.lifeSiphon||0)+2},{title:'SIDE CANNONS',glyph:'⊣',color:'#72f6ff',desc:`RANK ${(player.sideCannons||0)+1}/2 · Adds two ${core?.id==='nature'?'lesser vines':core?.id==='flash'?'lightning arcs':core?.id==='nova'?'laser cannons':core?.id==='remielle'?'luminous lances':'side cannons'} per attack; rank 2 gives four total.`,action:()=>player.sideCannons=Math.min(2,(player.sideCannons||0)+1)},{title:'MISSILE SALVO',glyph:'➤',color:'#d2a0ff',desc:'Launch a homing missile every 5s. Higher ranks shorten the interval to 3.8s and 2.8s.',action:()=>{player.autoMissiles=Math.min(3,(player.autoMissiles||0)+1);player.autoMissileTimer=Math.min(player.autoMissileTimer||4,1)}} ,{title:'RICOCHET CIRCUIT',glyph:'↗',color:'#72f6ff',desc:'Attacks bounce to nearby enemies for 65% damage. Each rank adds a bounce (max 3).',action:()=>player.ricochet=Math.min(3,(player.ricochet||0)+1)},{title:'CHAIN LIGHTNING',glyph:'ϟ',color:'#ffe875',desc:'Hits chain to nearby enemies for 55% damage. Each rank adds a target (max 3).',action:()=>player.chainLightning=Math.min(3,(player.chainLightning||0)+1)},{title:'CRITICAL PAYLOAD',glyph:'✹',color:'#ffe38a',desc:'Crit Damage multiplier +25%.',action:()=>player.critDamage=Math.min(3.5,player.critDamage+.25)},{title:'SALVAGE PROTOCOL',glyph:'⬡',color:'#ffe38a',desc:'Gain +1 Void Shard per enemy kill.',action:()=>player.shardBonus=(player.shardBonus||0)+1},{title:'CAPACITOR KILLCHAIN',glyph:'ϟ',color:'#c29aff',desc:'Gain +2 extra energy whenever you defeat an enemy.',action:()=>player.energyOnKill=(player.energyOnKill||0)+2},{title:'MAGNETAR FIELD',glyph:'◎',color:'#ff79b8',desc:'Collect XP shards from 45 pixels farther away.',action:()=>player.magnet=(player.magnet||55)+45},{title:'PULSE REACTOR',glyph:'✺',color:'#72f6ff',desc:'Every 2.25s, release a damaging pulse (90px radius, 38% attack damage). Higher ranks increase range and damage.',action:()=>{player.pulseAura=Math.min(170,(player.pulseAura||0)+24);player.pulseTimer=Math.min(player.pulseTimer||2.25,1)}},{title:'LIGHT FIELD',glyph:'☼',color:'#fff0a8',desc:'Create a light field that damages nearby enemies every 0.3s. Higher ranks increase its size and damage (max 3).',action:()=>{player.lightField=Math.min(3,(player.lightField||0)+1);player.lightFieldTimer=0;build.push('Light Field '+player.lightField)}},{title:'TEMPORAL COMPRESSION',glyph:'◷',color:'#9deaff',desc:`Ability cooldowns -10% per rank (rank ${player.cooldownReduction||0} → ${Math.min(3,(player.cooldownReduction||0)+1)}), affecting E skill, dash, and Missile Salvo.`,action:()=>{player.cooldownReduction=Math.min(3,(player.cooldownReduction||0)+1);build.push('Temporal Compression '+player.cooldownReduction)}},{title:'CORE SKILL MASTERY',glyph:core?.id==='ember'?'♨':core?.id==='frost'?'❄':'➤',color:core?.color||'#72f6ff',desc:`Upgrade ${core?.id==='ember'?'Ring of Fire':core?.id==='frost'?'Cryo Shield':core?.id==='remielle'?'Daybreak Waltz · Prism Flight':core?.id==='flash'?'Static Shock · Thunderfield':core?.id==='nature'?'Symbiotic Deployment · Verdant Overdrive · 2 charges':core?.id==='vengeance'?'Crimson Surge':'Homing Missiles'} (rank ${player.skillLevel||0} → ${Math.min(3,(player.skillLevel||0)+1)}): major boost to damage, duration or protection, plus shorter cooldown.`,action:()=>{player.skillLevel=Math.min(3,(player.skillLevel||0)+1);player.skillCooldown=Math.min(player.skillCooldown||0,1);build.push('Core Skill Mastery '+player.skillLevel)}},{title:'GLASS CANNON',glyph:'⚔',color:'#ff5a36',desc:'ATK +35%, but Max HP -12.',action:()=>{player.damage*=1.35;player.maxHp=Math.max(30,player.maxHp-12);player.hp=Math.min(player.hp,player.maxHp)}}];const coreSignaturePerks={ember:{title:'EMBER: CINDER MARK',glyph:'♨',color:'#ff9c65',desc:'Burning enemies take 18% more damage from your attacks.',action:()=>{player.cinderMark=true;build.push('Ember: Cinder Mark')}},frost:{title:'FROST: SHATTER PROTOCOL',glyph:'❄',color:'#8cecff',desc:'Deal 25% more damage to frozen enemies and 10% more damage to chilled enemies.',action:()=>{player.shatterProtocol=true;build.push('Frost: Shatter Protocol')}},nova:{title:'AETHER: ORBITAL RESONANCE',glyph:'◉',color:'#fff7cf',desc:'Enemies inside Event Horizon take 15% more damage, and singularity collapse damage increases by 15%.',action:()=>{player.aetherOrbitalResonance=true;player.aetherCollapseMult=(player.aetherCollapseMult||1)*1.15;build.push('Aether: Orbital Resonance')}},'elemental':{title:'PRISM: SPECTRUM MASTERY',glyph:'◈',color:'#ff71cd',rarity:'rare',desc:'RARE · Fire, Frost, Lightning, and Nature damage +15%.',action:()=>{player.elementalSignature=true;player.elementalDamageMult=(player.elementalDamageMult||1)*1.15;player.elementalUltMult=(player.elementalUltMult||1)*1.10;build.push('Prism: Spectrum Mastery')}}};if(core?.id==='flash'){for(let i=options.length-1;i>=0;i--)if(options[i].title==='CHAIN LIGHTNING')options.splice(i,1);}const signature=coreSignaturePerks[core?.id];if(signature&&!player[({ember:'cinderMark',frost:'shatterProtocol',nova:'aetherOrbitalResonance','elemental':'elementalSignature'})[core.id]])options.push(signature);const exclusiveCorePerks={flash:{title:'FLASH: STORM CIRCUIT',glyph:'ϟ',color:'#ffe875',rarity:'rare',desc:`RARE · +1 chain jump and +15% chain damage per rank (max 2).`,action:()=>{player.flashChainBonus=Math.min(2,(player.flashChainBonus||0)+1);player.flashChainPower=(player.flashChainPower||1)*1.15;build.push('Flash: Storm Circuit')}},ember:{title:'EMBER: PYRE CASCADE',glyph:'♨',color:'#ff9c65',rarity:'rare',desc:`RARE · Burn potency +15% per rank (rank ${player.pyreCascade||0} → ${Math.min(3,(player.pyreCascade||0)+1)}).`,action:()=>{player.pyreCascade=Math.min(3,(player.pyreCascade||0)+1);player.burnMult=(player.burnMult||1)*1.15;build.push('Ember: Pyre Cascade '+player.pyreCascade)}},frost:{title:'FROST: CRYSTAL RESONANCE',glyph:'❄',color:'#8cecff',rarity:'rare',desc:`RARE · +2 DEF and +3 % critical chance per rank (rank ${player.crystalResonance||0} → ${Math.min(3,(player.crystalResonance||0)+1)}).`,action:()=>{player.crystalResonance=Math.min(3,(player.crystalResonance||0)+1);player.armor=Math.min(60,(player.armor||0)+2);player.critChance=Math.min(.6,(player.critChance||0)+.03);build.push('Frost: Crystal Resonance '+player.crystalResonance)}},nova:{title:'AETHER: GRAVITATIONAL LENS',glyph:'◉',color:'#fff7cf',rarity:'rare',desc:`RARE · Black-hole radius +12% and collapse damage +12% per rank (rank ${player.prismaticOverdrive||0} → ${Math.min(3,(player.prismaticOverdrive||0)+1)}).`,action:()=>{player.prismaticOverdrive=Math.min(3,(player.prismaticOverdrive||0)+1);player.aetherWellRadiusBonus=(player.aetherWellRadiusBonus||0)+.12;player.aetherCollapseMult=(player.aetherCollapseMult||1)*1.12;build.push('Aether: Gravitational Lens '+player.prismaticOverdrive)}},
elementalCube:{title:'PRISM: CUBIC OVERLOAD',glyph:'⬢',color:'#ff71cd',rarity:'rare',desc:`RARE · Cube damage +10% and cube size +6% per rank (rank ${player.elementalCubeOverload||0} → ${Math.min(3,(player.elementalCubeOverload||0)+1)}).`,action:()=>{player.elementalCubeOverload=Math.min(3,(player.elementalCubeOverload||0)+1);player.elementalDamageMult=(player.elementalDamageMult||1)*1.10;player.elementalCubeSizeBonus=Math.min(.18,(player.elementalCubeSizeBonus||0)+.06);build.push('Prism: Cubic Overload '+player.elementalCubeOverload)}},
elementalChain:{title:'PRISM: CHAIN REACTION',glyph:'ϟ',color:'#ffe66d',rarity:'rare',desc:`RARE · Lightning chains hit +1 additional enemy and deal +15% chain damage per rank (rank ${player.elementalChainReaction||0} → ${Math.min(2,(player.elementalChainReaction||0)+1)}).`,action:()=>{player.elementalChainReaction=Math.min(2,(player.elementalChainReaction||0)+1);player.elementalChainBonus=player.elementalChainReaction;player.elementalChainPower=(player.elementalChainPower||1)*1.15;build.push('Prism: Chain Reaction '+player.elementalChainReaction)}},
elementalFrost:{title:'PRISM: FROST LATTICE',glyph:'❄',color:'#52dcff',rarity:'rare',desc:`RARE · Frost hits add +1 chill stack and need one fewer stack to freeze per rank (rank ${player.elementalFrostLattice||0} → ${Math.min(2,(player.elementalFrostLattice||0)+1)}).`,action:()=>{player.elementalFrostLattice=Math.min(2,(player.elementalFrostLattice||0)+1);player.elementalFrostBonus=player.elementalFrostLattice;build.push('Prism: Frost Lattice '+player.elementalFrostLattice)}},
elementalVerdant:{title:'PRISM: VERDANT SWARM',glyph:'❧',color:'#70e58a',rarity:'rare',desc:`RARE · During Elemental Convergence, every Nature cube launches a salvo of 3 homing seed missiles; Verdant Swarm adds +1 missile and +5% missile damage per rank (rank ${player.elementalVerdantSwarm||0} → ${Math.min(2,(player.elementalVerdantSwarm||0)+1)}). Missiles retain 40% crit chance.`,action:()=>{player.elementalVerdantSwarm=Math.min(2,(player.elementalVerdantSwarm||0)+1);player.elementalMissileBonus=player.elementalVerdantSwarm;player.elementalMissilePower=(player.elementalMissilePower||1)*1.05;build.push('Prism: Verdant Swarm '+player.elementalVerdantSwarm)}},
elementalBurn:{title:'PRISM: BURNING CONSTELLATION',glyph:'♨',color:'#ff4358',rarity:'rare',desc:`RARE · Fire burn damage +20% per rank (rank ${player.elementalBurningConstellation||0} → ${Math.min(2,(player.elementalBurningConstellation||0)+1)}).`,action:()=>{player.elementalBurningConstellation=Math.min(2,(player.elementalBurningConstellation||0)+1);player.elementalBurnPower=(player.elementalBurnPower||1)*1.20;build.push('Prism: Burning Constellation '+player.elementalBurningConstellation)}}};const exclusiveCore=exclusiveCorePerks[core?.id];if(exclusiveCore&&perkAvailable(exclusiveCore))options.push(exclusiveCore);if(core?.id==='elemental'){for(const key of ['elementalCube','elementalChain','elementalFrost','elementalNova','elementalBurn']){const perk=exclusiveCorePerks[key];if(perk&&perkAvailable(perk))options.push(perk);}}const rareSkillPerks={ember:{title:'EMBER: INFERNAL CONFLUX',glyph:'♨',color:'#ff9c65',desc:`RARE · Ring of Fire deals +22% damage and burn DPS +4 per rank; radius +8 (rank ${player.emberSkillRelic||0} → ${Math.min(3,(player.emberSkillRelic||0)+1)}).`,action:()=>{player.emberSkillRelic=Math.min(3,(player.emberSkillRelic||0)+1);build.push('Ember: Infernal Conflux '+player.emberSkillRelic)}},frost:{title:'FROST: ABSOLUTE AEGIS',glyph:'❄',color:'#8cecff',desc:`RARE · Cryo Shield gains +14% Max HP capacity and +0.7s duration per rank (rank ${player.frostSkillRelic||0} → ${Math.min(3,(player.frostSkillRelic||0)+1)}).`,action:()=>{player.frostSkillRelic=Math.min(3,(player.frostSkillRelic||0)+1);build.push('Frost: Absolute Aegis '+player.frostSkillRelic)}},nova:{title:'AETHER: BLACK SUN CATALYST',glyph:'◉',color:'#fff7cf',rarity:'rare',desc:`RARE · Black Sun lasts +0.35s per rank; singularity radius +8% and capped detonation damage +10% per rank (rank ${player.novaSkillRelic||0} → ${Math.min(3,(player.novaSkillRelic||0)+1)}).`,action:()=>{player.novaSkillRelic=Math.min(3,(player.novaSkillRelic||0)+1);player.aetherWellRadiusBonus=(player.aetherWellRadiusBonus||0)+.08;player.aetherCollapseMult=(player.aetherCollapseMult||1)*1.10;build.push('Aether: Black Sun Catalyst '+player.novaSkillRelic)}},remielle:{title:'AURALIS: DAYBREAK CHORUS',glyph:'✧',color:'#ff9ed8',desc:`RARE · Prism Flight strikes deal +22% damage and Daybreak Waltz lasts +0.7s per rank (rank ${player.remielleSkillRelic||0} → ${Math.min(3,(player.remielleSkillRelic||0)+1)}).`,action:()=>{player.remielleSkillRelic=Math.min(3,(player.remielleSkillRelic||0)+1);build.push('Auralis: Daybreak Chorus '+player.remielleSkillRelic)}}};const rareCoreSkill=rareSkillPerks[core?.id];if(rareCoreSkill&&perkAvailable(rareCoreSkill))options.push({...rareCoreSkill,rarity:'rare'});if(core?.id==='nature'){options.push({title:'NATURE: WORLDTREE PROTOCOL',glyph:'❧',color:'#70e58a',rarity:'rare',desc:`RARE · Verdant Overdrive lasts 3s longer and boosts drone healing and damage by 20%.`,action:()=>{player.natureWorldtreeProtocol=Math.min(3,(player.natureWorldtreeProtocol||0)+1);player.natureOverdriveBonus=(player.natureOverdriveBonus||0)+3;build.push('Nature: Worldtree Protocol '+player.natureWorldtreeProtocol)}},{title:'NATURE: EVERGREEN COVENANT',glyph:'✧',color:'#70e58a',rarity:'rare',desc:'RARE · Each living drone grants +10% damage and 6% damage reduction.',action:()=>{player.natureEvergreenCovenant=true;build.push('Nature: Evergreen Covenant')}});}if(core?.id==='remielle'){options.push({title:'PRISM FLIGHT: SWIFT CURRENT',glyph:'✧',rarity:'rare',color:'#ff9ed8',desc:'Prism Flight strikes 12% faster per rank.',action:()=>{player.phaseFlowCadence=Math.min(3,(player.phaseFlowCadence||0)+1);build.push('Prism Flight: Swift Current '+player.phaseFlowCadence)}},{title:'PRISM FLIGHT: LASTING RADIANCE',glyph:'✧',rarity:'rare',color:'#ffe3f4',desc:'Daybreak Waltz lasts 0.8 seconds longer per rank.',action:()=>{player.phaseFlowDuration=Math.min(3,(player.phaseFlowDuration||0)+1);build.push('Prism Flight: Lasting Radiance '+player.phaseFlowDuration)}},{title:'PRISM FLIGHT: PRISM ECHO',glyph:'✧',rarity:'rare',color:'#ffd8f0',desc:'Prism Flight attacks deal 18% more damage per rank.',action:()=>{player.phaseFlowPower=Math.min(3,(player.phaseFlowPower||0)+1);build.push('Prism Flight: Prism Echo '+player.phaseFlowPower)}},{title:'PRISM FLIGHT: MULTIPLICITY',glyph:'✧',color:'#ffb7e7',rarity:'rare',desc:`RARE · Each Prism Flight pulse launches one additional strike per rank (rank ${player.phaseFlowExtraStrikes||0} → ${Math.min(3,(player.phaseFlowExtraStrikes||0)+1)}), up to 4 strikes per pulse.`,action:()=>{player.phaseFlowExtraStrikes=Math.min(3,(player.phaseFlowExtraStrikes||0)+1);build.push('Prism Flight: Multiplicity '+player.phaseFlowExtraStrikes)}})}options.push(...createGeneralPerks().map(({id,cost,rank,maxRank,...perk})=>perk));if(player.sideCannons>=2){for(let i=options.length-1;i>=0;i--)if(options[i].title==='SIDE CANNONS')options.splice(i,1)}let picks=randomPerks(options,3);if(!picks.length){notify('ALL PERKS MAXED · CONTINUING');finishPortalRoom();return}showModal('PORTAL DESTINATION · REWARD','EVOLVE YOUR ORB','Choose one upgrade, then launch into the next room.',picks.map(o=>({title:o.title,glyph:o.glyph,color:o.color,desc:o.desc,rarity:o.rarity,action:()=>{o.action();build.push(o.title);updateUI();finishPortalRoom()}})))}
