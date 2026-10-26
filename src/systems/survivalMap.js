/* Semi-open Survival Trial map, horde combat, boss milestones, and run scoring. */
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function registerSurvivalKill(runtime,enemy){
 runtime.kills++;
 runtime.score+=(enemy.bossType==='big'?2500:enemy.bossType==='mini'?500:enemy.elite?35:10);
 runtime.xpDrops.push({x:enemy.x,y:enemy.y,r:enemy.bossType?9:5,value:enemy.bossType==='big'?12:enemy.bossType==='mini'?6:enemy.elite?3:1,life:30});
}
function spawnSurvivalBoss(runtime){
 if(runtime.enemies.some(enemy=>enemy.bossType))return false;
 const big=runtime.kills>=1000,angle=Math.random()*Math.PI*2,distanceFromPlayer=big?420:340;
 const x=clamp(runtime.player.x+Math.cos(angle)*distanceFromPlayer,60,runtime.width-60);
 const y=clamp(runtime.player.y+Math.sin(angle)*distanceFromPlayer,60,runtime.height-60);
 const scale=1+runtime.elapsed/600;
 const hp=(big?4200:720)*scale;
 runtime.enemies.push({id:runtime.nextEnemyId++,x,y,r:big?32:22,radius:big?32:22,type:big?'singularity':'miniboss',color:big?'#ff4b65':'#ff9a52',hp,maxHp:hp,speed:big?34:43,damage:big?24:16,attackCooldown:.7,elite:true,bossType:big?'big':'mini',hitFlash:0,scoreValue:big?2500:500});
 runtime.bossAnnouncement={type:big?'big':'mini',timer:3};
 if(big)runtime.bigBossSpawned=true;
 else runtime.nextBossAt+=150;
 return true;
}
export function createSurvivalMapRuntime(config){
 if(!config?.world||!config?.coreId)throw new TypeError('A selected Survival Trial world and core are required.');
 const width=config.map?.width||2600,height=config.map?.height||1800,seed=Math.max(0,Number(config.world.id)||0);
 const obstacles=[
  {id:'ruin-west',x:width*.23,y:height*.32,w:190,h:120,type:'ruin'},
  {id:'crater-north',x:width*.58,y:height*.20,w:150,h:150,type:'crater'},
  {id:'ruin-east',x:width*.77,y:height*.43,w:220,h:100,type:'ruin'},
  {id:'debris-south',x:width*.35,y:height*.72,w:160,h:130,type:'debris'},
  {id:'crater-south-east',x:width*.69,y:height*.75,w:180,h:130,type:'crater'}
 ].map((item,index)=>({...item,x:item.x+((seed+index)%3-1)*28}));
 const landmarks=[
  {id:'relay',x:width*.5,y:height*.28,label:'RELAY STATION',type:'relay'},
  {id:'rift',x:width*.79,y:height*.72,label:'VOID RIFT',type:'rift'},
  {id:'cache',x:width*.20,y:height*.78,label:'SUPPLY CACHE',type:'cache'}
 ];
 return {world:{...config.world},coreId:config.coreId,width,height,obstacles,landmarks,elapsed:0,player:{x:width/2,y:height/2,radius:12,hp:100,maxHp:100,speed:190,inv:0,invulnerable:0},camera:{x:width/2,y:height/2},enemies:[],xpDrops:[],crystals:[],xpCollected:0,kills:0,score:0,nextBossAt:150,bigBossSpawned:false,bossAnnouncement:null,nextEnemyId:1,spawnTimer:.7,ready:true,gameOver:false};
}
export function getSurvivalCamera(runtime,viewportWidth,viewportHeight){
 const halfW=Math.max(1,viewportWidth)/2,halfH=Math.max(1,viewportHeight)/2;
 return {x:clamp(runtime.player.x,halfW,Math.max(halfW,runtime.width-halfW)),y:clamp(runtime.player.y,halfH,Math.max(halfH,runtime.height-halfH))};
}
export function worldToScreen(point,camera,viewportWidth,viewportHeight){return {x:point.x-camera.x+viewportWidth/2,y:point.y-camera.y+viewportHeight/2};}
export function screenToWorld(point,camera,viewportWidth,viewportHeight){return {x:point.x+camera.x-viewportWidth/2,y:point.y+camera.y-viewportHeight/2};}
export function isSurvivalPositionBlocked(runtime,x,y,radius=runtime.player.radius){
 if(x-radius<0||y-radius<0||x+radius>runtime.width||y+radius>runtime.height)return true;
 return runtime.obstacles.some(o=>{const nx=clamp(x,o.x-o.w/2,o.x+o.w/2),ny=clamp(y,o.y-o.h/2,o.y+o.h/2);return Math.hypot(x-nx,y-ny)<radius;});
}
function spawnEnemy(runtime,viewportWidth,viewportHeight){
 const p=runtime.player,halfW=Math.min(viewportWidth/2,500)+100,halfH=Math.min(viewportHeight/2,350)+100;
 for(let attempt=0;attempt<12;attempt++){
  const side=Math.floor(Math.random()*4);let x,y;
  if(side===0){x=p.x-halfW-Math.random()*180;y=p.y+(Math.random()*2-1)*(halfH+180);}
  else if(side===1){x=p.x+halfW+Math.random()*180;y=p.y+(Math.random()*2-1)*(halfH+180);}
  else if(side===2){x=p.x+(Math.random()*2-1)*(halfW+180);y=p.y-halfH-Math.random()*180;}
  else{x=p.x+(Math.random()*2-1)*(halfW+180);y=p.y+halfH+Math.random()*180;}
  x=clamp(x,28,runtime.width-28);y=clamp(y,28,runtime.height-28);
  if(distance({x,y},p)<Math.min(halfW,halfH)*.7)continue;
  if(isSurvivalPositionBlocked(runtime,x,y,15))continue;
  const minute=runtime.elapsed/60,elite=runtime.elapsed>=300&&Math.random()<Math.min(.22,.035+minute*.008);
  const hpScale=1+minute*.12;
  runtime.enemies.push({id:runtime.nextEnemyId++,x,y,r:elite?15:10,radius:elite?15:10,type:elite?'elite':'drone',color:elite?'#ff4d87':'#9c5bce',hp:(elite?72:34)*hpScale,maxHp:(elite?72:34)*hpScale,speed:(elite?42:56)+Math.min(22,minute*1.2),damage:elite?12:7,attackCooldown:.4,elite,hitFlash:0});
  return true;
 }
 return false;
}
export function stepSurvivalMapRuntime(runtime,input={},dt=1/60){
 if(!runtime?.ready||runtime.gameOver)return runtime;
 const step=Math.min(.05,Math.max(0,Number(dt)||0));runtime.elapsed+=step;if(runtime.bossAnnouncement){runtime.bossAnnouncement.timer-=step;if(runtime.bossAnnouncement.timer<=0)runtime.bossAnnouncement=null;}
 const p=runtime.player;p.invulnerable=Math.max(0,p.invulnerable-step);p.inv=Math.max(p.inv||0,p.invulnerable);
 const dx0=(input.right?1:0)-(input.left?1:0),dy0=(input.down?1:0)-(input.up?1:0);
 let dx=dx0,dy=dy0;
 if(dx||dy){const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;}
 else if(input.mouseSteering&&Number.isFinite(input.mouseX)&&Number.isFinite(input.mouseY)){
  const target=screenToWorld({x:input.mouseX,y:input.mouseY},runtime.camera,input.viewportWidth||1,input.viewportHeight||1);
  dx=target.x-p.x;dy=target.y-p.y;const d=Math.hypot(dx,dy);
  if(d<=3){dx=0;dy=0;}else{dx/=d;dy/=d;}
 }
 const nx=p.x+dx*p.speed*step,ny=p.y+dy*p.speed*step;
 if(!isSurvivalPositionBlocked(runtime,nx,p.y))p.x=nx;
 if(!isSurvivalPositionBlocked(runtime,p.x,ny))p.y=ny;
 runtime.camera=getSurvivalCamera(runtime,input.viewportWidth||1,input.viewportHeight||1);
 runtime.spawnTimer-=step;
 const spawnInterval=Math.max(.22,1.05-runtime.elapsed/260);
 const maxEnemies=Math.min(110,14+Math.floor(runtime.elapsed/8));
 if(runtime.spawnTimer<=0&&runtime.enemies.length<maxEnemies){spawnEnemy(runtime,input.viewportWidth||800,input.viewportHeight||600);runtime.spawnTimer=spawnInterval;}
 for(const enemy of runtime.enemies){const d=distance(p,enemy);if(d<best){best=d;target=enemy;}}
  if(target){const d=Math.max(1,distance(p,target)),speed=540;
   p.shotsFired++;
   const prismColors=['#ff9c65','#8cecff','#ffe875','#70e58a'];
   runtime.projectiles.push({x:p.x,y:p.y,vx:(target.x-p.x)/d*speed,vy:(target.y-p.y)/d*speed,r:runtime.coreTrait==='pierce'?6:5,damage:p.damage,life:1.4,color:runtime.coreTrait==='prism'?prismColors[p.prismCycle++%prismColors.length]:(input.coreColor||'#ff9c65'),trait:runtime.coreTrait,pierce:runtime.coreTrait==='pierce'?1:0});
   p.attackCooldown=p.fireRate;
  }else p.attackCooldown=.08;
 }
 for(const enemy of runtime.enemies){
  enemy.hitFlash=Math.max(0,enemy.hitFlash-step);enemy.attackCooldown-=step;
  if(enemy.burnTime>0){enemy.burnTime=Math.max(0,enemy.burnTime-step);enemy.burnTick=(enemy.burnTick||0)-step;if(enemy.burnTick<=0&&enemy.burnTime>0){enemy.hp-=Math.max(2,p.damage*.12);enemy.burnTick=.5;}}
  if(enemy.bleedTime>0){enemy.bleedTime=Math.max(0,enemy.bleedTime-step);enemy.bleedTick=(enemy.bleedTick||0)-step;if(enemy.bleedTick<=0&&enemy.bleedTime>0){enemy.hp-=Math.max(1,p.damage*.08);enemy.bleedTick=.65;}}
  if(enemy.hp<=0){enemy.dead=true;registerSurvivalKill(runtime,enemy);continue;}
  const d=Math.max(1,distance(p,enemy));
  if(d>p.radius+enemy.radius+3){
   let ex=(p.x-enemy.x)/d,ey=(p.y-enemy.y)/d;
   const slow=enemy.slowTime>0?(enemy.slowTime=Math.max(0,enemy.slowTime-step),enemy.slowMultiplier||.55):1;
   const tx=enemy.x+ex*enemy.speed*slow*step,ty=enemy.y+ey*enemy.speed*slow*step;
   if(!isSurvivalPositionBlocked(runtime,tx,enemy.y,enemy.radius))enemy.x=tx;
   if(!isSurvivalPositionBlocked(runtime,enemy.x,ty,enemy.radius))enemy.y=ty;
  }else if(enemy.attackCooldown<=0&&p.invulnerable<=0){
   p.hp=Math.max(0,p.hp-enemy.damage);p.invulnerable=.55;enemy.attackCooldown=.85;
   if(p.hp<=0)runtime.gameOver=true;
  }
 }
 for(const orb of runtime.xpDrops){
  const d=distance(p,orb),magnet=90+(runtime.magnet||0);
  if(d<magnet&&d>1){orb.x+=(p.x-orb.x)/d*Math.min(420,d*5)*step;orb.y+=(p.y-orb.y)/d*Math.min(420,d*5)*step;}
  if(d<p.r+orb.r+5){orb.collected=true;runtime.xpCollected=(runtime.xpCollected||0)+orb.value;}
  orb.life-=step;
 }
 runtime.xpDrops=runtime.xpDrops.filter(o=>!o.collected&&o.life>0);
 if(!runtime.bigBossSpawned&&runtime.kills>=1000&&!runtime.enemies.some(enemy=>enemy.bossType))spawnSurvivalBoss(runtime);
 else if(!runtime.bigBossSpawned&&runtime.kills>=runtime.nextBossAt&&!runtime.enemies.some(enemy=>enemy.bossType))spawnSurvivalBoss(runtime);
 return runtime;
}
