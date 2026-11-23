const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;
const players = new Map(), bullets = [];
const server = http.createServer((req,res)=>{
  const file = req.url === "/" ? "index.html" : path.basename(req.url);
  const target = path.join(__dirname,"public",file);
  if (!target.startsWith(path.join(__dirname,"public"))) { res.writeHead(403).end(); return; }
  fs.readFile(target,(err,data)=>{ if(err){res.writeHead(404).end("Not found");return;}
    res.writeHead(200,{"Content-Type":file.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream"});res.end(data);});
});
const wss = new WebSocket.Server({server});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function broadcast(obj){const msg=JSON.stringify(obj);for(const p of players.values())if(p.ws.readyState===WebSocket.OPEN)p.ws.send(msg)}
function feed(text){broadcast({type:"feed",text})}
wss.on("connection",ws=>{
 let id=null;
 ws.on("message",raw=>{
  let m;try{m=JSON.parse(raw.toString())}catch{return}
  if(m.type==="join"){
   if(id)return;
   id=require("crypto").randomUUID();const name=String(m.name||"Player").replace(/[<>]/g,"").slice(0,16)||"Player";
   const p={id,name,x:70+Math.random()*820,y:70+Math.random()*460,hp:100,aim:0,dx:0,dy:0,sprint:false,fire:false,lastShot:0,ws};
   players.set(id,p);ws.send(JSON.stringify({type:"welcome",id,name}));feed(`${name} joined the match`);return;
  }
  const p=players.get(id);if(!p)return;
  if(m.type==="input"){p.dx=clamp(Number(m.dx)||0,-1,1);p.dy=clamp(Number(m.dy)||0,-1,1);p.sprint=!!m.sprint;p.aim=Number(m.aim)||0;p.fire=!!m.fire}
  if(m.type==="respawn"&&p.hp<=0){p.x=50+Math.random()*860;p.y=50+Math.random()*500;p.hp=100;p.lastShot=Date.now();feed(`${p.name} respawned`)}
 });
 ws.on("close",()=>{if(id&&players.has(id)){const p=players.get(id);players.delete(id);feed(`${p.name} left the match`)}});
});
setInterval(()=>{
 const now=Date.now();
 for(const p of players.values()){
  if(p.hp<=0)continue;
  const n=Math.hypot(p.dx,p.dy)||1,spd=p.sprint?4.2:3.1;
  p.x=clamp(p.x+p.dx/n*spd,14,946);p.y=clamp(p.y+p.dy/n*spd,14,586);
  if(p.fire&&now-p.lastShot>220){p.lastShot=now;bullets.push({x:p.x+Math.cos(p.aim)*18,y:p.y+Math.sin(p.aim)*18,vx:Math.cos(p.aim)*10,vy:Math.sin(p.aim)*10,owner:p.id,life:70})}
 }
 for(const b of bullets){b.x+=b.vx;b.y+=b.vy;b.life--;for(const p of players.values()){if(p.id===b.owner||p.hp<=0)continue;if(Math.hypot(p.x-b.x,p.y-b.y)<17){p.hp=Math.max(0,p.hp-22);b.life=0;if(p.hp===0){const shooter=players.get(b.owner);if(shooter)feed(`${shooter.name} eliminated ${p.name}`)}break}}}
 for(let i=bullets.length-1;i>=0;i--)if(bullets[i].life<=0||bullets[i].x<0||bullets[i].x>960||bullets[i].y<0||bullets[i].y>600)bullets.splice(i,1);
 const state={};for(const p of players.values())state[p.id]={id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,aim:p.aim};
 broadcast({type:"state",players:state,shots:bullets.map(b=>({x:b.x,y:b.y}))});
},1000/30);
server.listen(PORT,()=>console.log(`Project Prawn multiplayer server listening on ${PORT}`));
