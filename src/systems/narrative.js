/* Reusable cinematic and arcade-style dialogue player for campaign story scenes. */
export function createNarrativeSystem({overlay,modal,getProgress,saveProgress,getCoreId=()=>null,onStart=()=>{},onEnd=()=>{},onSound=()=>{},onType=()=>{}}){
 let session=null,typingTimer=null;
 function progress(){const value=getProgress?.()||{};if(!Array.isArray(value.seenScenes))value.seenScenes=[];if(!Array.isArray(value.recoveredFiles))value.recoveredFiles=[];return value;}
 function hasSeen(id){return progress().seenScenes.includes(id);}
 function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
 function stopTyping(){if(typingTimer!==null){clearInterval(typingTimer);typingTimer=null;}}
 function closeLayer(){stopTyping();overlay.classList.add('hidden');overlay.classList.remove('closing','story-overlay','dialogue-field-overlay');modal.className='modal';modal.removeAttribute('role');modal.removeAttribute('aria-modal');modal.removeAttribute('aria-label');modal.innerHTML='';}
 function finish(){if(!session)return;stopTyping();const ended=session;session=null;document.removeEventListener('keydown',handleKey,true);if(ended.markSeen){const p=progress();if(!p.seenScenes.includes(ended.scene.id)){p.seenScenes.push(ended.scene.id);saveProgress?.();}}closeLayer();onEnd?.(ended.scene);ended.onComplete?.();}
 function completeTyping(){if(!session||session.presentation!=='field'||!session.typing)return;stopTyping();session.typing=false;session.charIndex=session.currentLine.text.length;session.lineNode.textContent=session.currentLine.text;session.lineNode.classList.remove('is-typing');session.hintNode.textContent='ENTER  /  SPACE  /  CLICK  ·  CONTINUE';session.nextButton.textContent=session.index===session.scene.lines.length-1?(session.scene.cta||'CONTINUE →'):'NEXT LINE →';}
 function startTyping(){
  stopTyping();if(!session||session.presentation!=='field')return;
  session.typing=true;session.charIndex=0;session.lineNode.textContent='';session.lineNode.classList.add('is-typing');session.hintNode.textContent='TEXT INCOMING · ENTER TO REVEAL';
  typingTimer=setInterval(()=>{
   if(!session||session.presentation!=='field'){stopTyping();return;}
   const current=session.currentLine;
   if(session.charIndex>=current.text.length){completeTyping();return;}
   const char=current.text[session.charIndex++];session.lineNode.textContent=current.text.slice(0,session.charIndex);
   if(!/\s/.test(char))onType?.(char,session.charIndex);
   if(session.charIndex>=current.text.length)completeTyping();
  },24);
 }
 function advance(){if(!session)return;if(session.presentation==='field'&&session.typing){completeTyping();return;}onSound?.();if(session.index<session.scene.lines.length-1){session.index++;render();}else finish();}
 function skip(){if(!session)return;onSound?.();finish();}
 function handleKey(event){if(!session)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();skip();}else if(event.key==='Enter'||event.code==='Space'){event.preventDefault();event.stopImmediatePropagation();advance();}}
 function renderField(){
  const {scene,index}=session,line=scene.lines[index];session.currentLine=line;
  overlay.classList.remove('hidden','closing');overlay.classList.add('story-overlay','dialogue-field-overlay');modal.className='modal narrative-modal dialogue-field-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',scene.title||'Field dialogue');
  const frame=el('section','dialogue-field-frame story-frame-entering');frame.style.setProperty('--story-accent',scene.accent||'#72f6ff');
  const isCampaignScene=scene.room===undefined||scene.room===null;
  const brand=isCampaignScene?(String(scene.id||'').endsWith('-intro')?'V CORP // CAMPAIGN BRIEFING':'V CORP // MISSION DEBRIEF'):'V CORP // FIELD COMMS';
  const counter=isCampaignScene?'WORLD '+String((scene.worldIndex??0)+1).padStart(2,'0')+' · '+String(index+1).padStart(2,'0')+'/'+String(scene.lines.length).padStart(2,'0'):'ROOM '+String(scene.room).padStart(2,'0')+' · '+String(index+1).padStart(2,'0')+'/'+String(scene.lines.length).padStart(2,'0');
  const header=el('div','dialogue-field-header');header.append(el('span','dialogue-field-brand',brand),el('span','dialogue-field-room',counter));frame.append(header);
  if(isCampaignScene){const sceneHeading=el('div','dialogue-field-scene-heading');sceneHeading.append(el('div','dialogue-field-scene-kicker',scene.chapter||'MISSION TRANSMISSION'),el('div','dialogue-field-scene-title',(scene.symbol?scene.symbol+'  ':'')+(scene.title||'BRIEFING')),el('p','dialogue-field-scene-subtitle',scene.subtitle||''));frame.append(sceneHeading);}
  const speakerRow=el('div','dialogue-field-speaker-row');speakerRow.append(el('div','dialogue-field-speaker',line.speaker),el('div','dialogue-field-role',line.role||'INCOMING TRANSMISSION'));frame.append(speakerRow);
  const text=el('p','dialogue-field-line story-line-entering','');text.setAttribute('aria-live','polite');text.setAttribute('aria-atomic','true');
  window.__voidCurrentStoryLine={sceneId:scene.id,lineIndex:index,text:line.text,element:text};window.__voidTextEditor?.decorate(window.__voidCurrentStoryLine);
  const isPlayerLine=/EXPLORER/i.test(line.speaker||'')||/INTERNAL THOUGHT/i.test(line.role||'');
  if(isPlayerLine){
   const availableCores=['ember','frost','nova','remielle','elemental','flash','nature','vengeance'];
   const requestedCore=getCoreId?.();
   const coreId=availableCores.includes(requestedCore)?requestedCore:'ember';
   const coreNames={ember:'Ember Core',frost:'Frost Core',nova:'Nova Core',remielle:'Auralis Core',elemental:'Elemental Core',flash:'Flash Core',nature:'Nature Core',vengeance:'Vengeance Core'};
   const avatar=el('div','dialogue-field-core-avatar');avatar.setAttribute('role','img');avatar.setAttribute('aria-label',coreNames[coreId]+' avatar');avatar.title=coreNames[coreId];
   const orb=el('div','orb-render '+coreId);orb.append(el('i','orb-aura'),el('i','orb-wing wing-left'),el('i','orb-wing wing-right'),el('i','orb-core'),el('i','orb-orbit orbit-one'),el('i','orb-orbit orbit-two'),el('i','orb-spark spark-one'),el('i','orb-spark spark-two'));avatar.append(orb);
   const message=el('div','dialogue-field-message-row');message.append(avatar,text);frame.append(message);
  }else frame.append(text);
  const footer=el('div','dialogue-field-footer'),hint=el('span','dialogue-field-hint','TEXT INCOMING · ENTER TO REVEAL'),actions=el('div','dialogue-field-actions');
  const skipButton=el('button','narrative-button narrative-skip','SKIP');skipButton.type='button';skipButton.addEventListener('click',skip);
  const nextButton=el('button','narrative-button narrative-next','REVEAL TEXT');nextButton.type='button';nextButton.addEventListener('click',advance);
  actions.append(skipButton,nextButton);footer.append(hint,actions);frame.append(footer);
  frame.addEventListener('click',event=>{if(!event.target.closest('button'))advance();});
  modal.replaceChildren(frame);session.lineNode=text;session.hintNode=hint;session.nextButton=nextButton;startTyping();
 }
 function renderCinematic(){
  const {scene,index}=session,line=scene.lines[index];
  overlay.classList.remove('hidden','closing');overlay.classList.add('story-overlay');modal.className='modal narrative-modal story-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',scene.title);
  const frame=el('section','narrative-frame');frame.style.setProperty('--story-accent',scene.accent||'#72f6ff');
  const mast=el('div','narrative-masthead');mast.append(el('span','narrative-brand','V CORP  /  INTERNAL NETWORK'),el('span','narrative-classification','AUTHORIZED ASSET ONLY'));frame.append(mast);
  const heading=el('div','narrative-heading'),symbol=el('div','narrative-symbol',scene.symbol||'◈'),titles=el('div','narrative-titles');symbol.setAttribute('aria-hidden','true');titles.append(el('div','narrative-kicker',scene.chapter||'RECOVERED TRANSMISSION'),el('h2','narrative-title',scene.title),el('p','narrative-subtitle',scene.subtitle||''));heading.append(symbol,titles);frame.append(heading);
  const pr=el('div','narrative-progress-row');pr.append(el('span','narrative-progress-label','TRANSMISSION'),el('span','narrative-progress-count',String(index+1).padStart(2,'0')+' / '+String(scene.lines.length).padStart(2,'0')));frame.append(pr);
  const bar=el('div','narrative-progress'),fill=el('i','narrative-progress-fill');fill.style.width=((index+1)/scene.lines.length*100)+'%';bar.append(fill);frame.append(bar);
  const dialogue=el('div','narrative-dialogue'),speaker=el('div','narrative-speaker-row');const speakerName=el('div','narrative-speaker',line.speaker);speakerName.dataset.speakerType=/EXPLORER/i.test(line.speaker||'')?'explorer':/CORE/i.test(line.speaker||'')?'core':/V CORP/i.test(line.speaker||'')?'corporate':'record';speaker.append(speakerName,el('div','narrative-role',line.role||'RECOVERED MESSAGE'));const dialogueLine=el('p','narrative-line story-line-entering',line.text);dialogueLine.setAttribute('aria-live','polite');dialogueLine.setAttribute('aria-atomic','true');window.__voidCurrentStoryLine={sceneId:scene.id,lineIndex:index,text:line.text,element:dialogueLine};window.__voidTextEditor?.decorate(window.__voidCurrentStoryLine);dialogue.append(speaker,dialogueLine);frame.append(dialogue);frame.classList.add('narrative-frame-entering');
  const footer=el('div','narrative-footer'),hint=el('span','narrative-hint','ESC  SKIP  ·  ENTER  CONTINUE'),actions=el('div','narrative-actions');
  const skipButton=el('button','narrative-button narrative-skip','SKIP SCENE');skipButton.type='button';skipButton.addEventListener('click',skip);
  const nextButton=el('button','narrative-button narrative-next',index===scene.lines.length-1?(scene.cta||'ACKNOWLEDGE BRIEFING →'):'CONTINUE →');nextButton.type='button';nextButton.addEventListener('click',advance);
  actions.append(skipButton,nextButton);footer.append(hint,actions);frame.append(footer);modal.replaceChildren(frame);nextButton.focus({preventScroll:true});
 }
 function render(){if(!session)return;if(session.presentation==='field')renderField();else renderCinematic();}
 function play(scene,{force=false,markSeen=true,onComplete=()=>{},presentation=scene?.presentation||'cinematic'}={}){if(!scene||(!force&&hasSeen(scene.id))){onComplete?.();return false;}if(session)finish();session={scene,index:0,markSeen,onComplete,presentation,typing:false,charIndex:0,currentLine:null,lineNode:null,hintNode:null,nextButton:null};onStart?.(scene);document.addEventListener('keydown',handleKey,true);render();return true;}
 function replay(scene,onComplete=()=>{}){return play(scene,{force:true,markSeen:false,onComplete,presentation:scene?.presentation||'cinematic'});}
 return {play,replay,hasSeen};
}
