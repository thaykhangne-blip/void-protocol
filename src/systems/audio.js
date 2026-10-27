// AUDIO MODULE
// Source fragment consumed by scripts/build.js. Do not import directly.
// Audio synthesis, sound effects, and procedural world music.

function getAudioContext(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!audioCtx)audioCtx=new AC();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch(e){return null}}

function ensureAudio(){return sfxEnabled?getAudioContext():null}

function musicTone(freq,when,duration,wave='square',volume=.045,detune=0){const ac=getAudioContext();if(!ac||!musicBus||!musicEnabled)return;try{const o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.setValueAtTime(freq,when);if(detune)o.detune.setValueAtTime(detune,when);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.012);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g);g.connect(musicBus);o.start(when);o.stop(when+duration+.025)}catch(e){}}

function musicKick(when){const ac=getAudioContext();if(!ac||!musicBus||!musicEnabled)return;try{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(125,when);o.frequency.exponentialRampToValueAtTime(42,when+.11);g.gain.setValueAtTime(.08,when);g.gain.exponentialRampToValueAtTime(.0001,when+.13);o.connect(g);g.connect(musicBus);o.start(when);o.stop(when+.14)}catch(e){}}

function startMusic(){
 if(!musicEnabled)return;
 const ac=getAudioContext();if(!ac)return;
 if(!musicBus){musicBus=ac.createGain();musicBus.gain.value=musicVolume;musicBus.connect(ac.destination)}else musicBus.gain.setTargetAtTime(musicVolume,ac.currentTime,.04);
 const trackIndex=Math.max(0,Math.min(3,currentWorld<0?0:currentWorld));
 if(musicTimer&&musicTrackIndex===trackIndex)return;
 if(musicTimer){clearInterval(musicTimer);musicTimer=null}
 musicTrackIndex=trackIndex;musicStep=0;
 // Four original, procedurally synthesized world themes. Each has its own tempo,
 // tonal palette, melody, bass movement, and percussion character.
 const tracks=[
  {name:'THE ABYSSAL FRONTIER',tempo:138,root:110,scale:[0,3,5,7,10,12,15,17],melody:[0,7,12,10,7,3,5,7,0,7,15,12,10,7,5,3],bass:[0,0,0,0,-5,-5,-5,-5,-3,-3,-3,-3,-7,-7,-7,-7],wave:'triangle',lead:'square',leadVol:.027,bassVol:.078,beat:4,drum:118},
  {name:'FROSTBOUND SILENCE',tempo:116,root:82.41,scale:[0,2,5,7,9,12,14,17],melody:[12,9,7,5,2,5,9,12,14,12,9,7,5,2,0,5],bass:[0,0,-3,-3,-5,-5,-3,-3,-7,-7,-5,-5,-3,-3,0,0],wave:'sine',lead:'triangle',leadVol:.031,bassVol:.065,beat:8,drum:92},
  {name:'NEON SUPERNOVA',tempo:156,root:98,scale:[0,2,4,7,9,12,14,16],melody:[0,4,7,12,9,7,4,2,0,7,12,16,14,12,9,4],bass:[0,0,0,7,-5,-5,-3,-3,-7,-7,-5,-5,-3,-3,0,0],wave:'sawtooth',lead:'square',leadVol:.022,bassVol:.07,beat:4,drum:145},
  {name:'THE VERDANT CIRCUIT',tempo:126,root:92.5,scale:[0,2,5,7,9,12,14,17],melody:[0,5,9,12,9,7,5,2,0,5,12,14,12,9,7,5],bass:[0,0,-5,-5,-3,-3,0,0,-7,-7,-5,-5,-3,-3,0,0],wave:'sine',lead:'triangle',leadVol:.03,bassVol:.073,beat:6,drum:108}
 ];
 const track=tracks[trackIndex],stepMs=60000/track.tempo/2;
 musicTimer=setInterval(()=>{
  if(!musicEnabled||!audioCtx||audioCtx.state!=='running')return;
  // If the player enters another world, switch to its soundtrack without restarting the app.
  const liveIndex=Math.max(0,Math.min(3,currentWorld<0?0:currentWorld));
  if(liveIndex!==musicTrackIndex){startMusic();return}
  const now=audioCtx.currentTime+.015,step=musicStep%16,semi=track.melody[step];
  musicTone(track.root*2*Math.pow(2/1,semi/12),now,stepMs/1000*.78,track.lead,track.leadVol);
  if(step%2===0){const b=track.bass[step];musicTone(track.root*Math.pow(2,b/12),now,stepMs/1000*1.45,track.wave,track.bassVol)}
  if(step%track.beat===0)musicKick(now);
  else if(step%4===2)musicTone(track.drum*9,now,.03,'square',trackIndex===2?.013:.008);
  if(step===7||step===15)musicTone(track.root*6,now,.05,'sine',.014,trackIndex===1?-8:5);
  musicStep=(musicStep+1)%16;
 },stepMs);
}

function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}if(musicBus&&audioCtx){musicBus.gain.setTargetAtTime(0,audioCtx.currentTime,.035)}}

function updateMusicVolume(){if(musicBus&&audioCtx&&musicEnabled)musicBus.gain.setTargetAtTime(musicVolume,audioCtx.currentTime,.04)}

function sfx(type){if(!sfxEnabled)return;const now=performance.now();const minGap=type==='shoot'?95:type==='hit'?35:type==='text'?28:0;if(minGap&&now-(sfxLast[type]||0)<minGap)return;sfxLast[type]=now;const ac=ensureAudio();if(!ac)return;const presets={shoot:[560,230,.055,'square',.035],shoot_ember:[260,105,.095,'sawtooth',.045],shoot_frost:[760,420,.085,'triangle',.04],shoot_nova:[920,130,.19,'sawtooth',.035],hit:[220,95,.075,'triangle',.045],kill:[390,690,.12,'sine',.055],xp:[720,1080,.09,'sine',.035],damage:[155,70,.16,'sawtooth',.055],ultimate:[120,520,.38,'sawtooth',.075],portal:[330,880,.22,'sine',.05],ui:[520,660,.045,'sine',.025],text:[840,520,.025,'square',.012],dash:[260,720,.1,'triangle',.04],level:[660,990,.16,'sine',.045]};const q=presets[type]||presets.ui;try{const osc=ac.createOscillator(),gain=ac.createGain();osc.type=q[3];osc.frequency.setValueAtTime(q[0],ac.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(35,q[1]),ac.currentTime+q[2]);gain.gain.setValueAtTime(q[4],ac.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+q[2]);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+q[2]+.01)}catch(e){}}
