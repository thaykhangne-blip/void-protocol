/* Semi-open Survival Trial map runtime. World coordinates are independent from canvas/camera. */
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
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
 return {world:{...config.world},coreId:config.coreId,width,height,obstacles,landmarks,elapsed:0,player:{x:width/2,y:height/2,radius:12,speed:260},camera:{x:width/2,y:height/2},ready:true};
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
export function stepSurvivalMapRuntime(runtime,input={},dt=1/60){
 if(!runtime?.ready)return runtime;
 const step=Math.min(.05,Math.max(0,Number(dt)||0));runtime.elapsed+=step;
 const p=runtime.player;let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);
 if(dx||dy){const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;}
 else if(input.mouseSteering&&Number.isFinite(input.mouseX)&&Number.isFinite(input.mouseY)){
  const target=screenToWorld({x:input.mouseX,y:input.mouseY},runtime.camera,input.viewportWidth||1,input.viewportHeight||1);
  dx=target.x-p.x;dy=target.y-p.y;const distance=Math.hypot(dx,dy);
  if(distance<=3){dx=0;dy=0;}else{dx/=distance;dy/=distance;}
 }
 const nx=p.x+dx*p.speed*step,ny=p.y+dy*p.speed*step;
 if(!isSurvivalPositionBlocked(runtime,nx,p.y))p.x=nx;
 if(!isSurvivalPositionBlocked(runtime,p.x,ny))p.y=ny;
 runtime.camera=getSurvivalCamera(runtime,input.viewportWidth||1,input.viewportHeight||1);return runtime;
}
