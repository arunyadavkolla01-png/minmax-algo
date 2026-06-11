 // SWITCH
function show(g){
  document.getElementById("ticGame").classList.add("hidden")
  document.getElementById("puzzleGame").classList.add("hidden");
  document.getElementById(g+"Game").classList.remove("hidden");
}

 
function showPopup(msg){
  document.getElementById("popupText").innerText = msg;
  document.getElementById("popup").classList.remove("hidden");
}
function closePopup(){
  document.getElementById("popup").classList.add("hidden");
}

// ---------------- TIC TAC TOE ----------------
let board = ["","","","","","","","",""];
let human="X", ai="O";

function drawBoard(){
  let b=document.getElementById("board");
  b.innerHTML="";
  board.forEach((c,i)=>{
    let d=document.createElement("div");
    d.className="cell glass flex items-center justify-center text-2xl cursor-pointer";
    d.innerText=c;
    d.onclick=()=>move(i);
    b.appendChild(d);
  });
}

function move(i){
  if(board[i]==="" && !check(board)){
    board[i]=human;
    drawBoard();

    let best=minimax(board,ai).index;
    if(best!==undefined){
      board[best]=ai;
      drawBoard();
    }

    updateStatus();
  }
}

function minimax(b,p){
  let avail=b.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  let w=check(b);

  if(w===human) return {score:-10};
  if(w===ai) return {score:10};
  if(avail.length===0) return {score:0};

  let moves=[];
  for(let i of avail){
    let m={index:i};
    b[i]=p;
    m.score=minimax(b,p===ai?human:ai).score;
    b[i]="";
    moves.push(m);
  }

  let best, bestScore=p===ai?-999:999;
  moves.forEach((m,i)=>{
    if((p===ai && m.score>bestScore)||(p!==ai && m.score<bestScore)){
      bestScore=m.score; best=i;
    }
  });

  return moves[best];
}

function check(b){
  const w=[[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6],[0,3,6],[1,4,7],[2,5,8]];
  for(let p of w){
    if(b[p[0]] && b[p[0]]===b[p[1]] && b[p[1]]===b[p[2]]) return b[p[0]];
  }
  return null;
}

function updateStatus(){
  let w=check(board);
  let s=document.getElementById("status");

  if(w){
    s.innerText=w+" Wins!";
    showPopup(w+" Wins 🎉");
  }
  else if(!board.includes("")){
    s.innerText="Draw!";
    showPopup("It's a Draw 🤝");
  }
  else s.innerText="Your Turn";
}

function resetTic(){
  board=["","","","","","","","",""];
  drawBoard();
  document.getElementById("status").innerText="New Game";
}

// ---------------- 8 PUZZLE ----------------
let puzzle=[1,2,3,4,5,6,7,8,0];
let goal="123456780";

function drawPuzzle(){
  let p=document.getElementById("puzzleBoard");
  p.innerHTML="";
  puzzle.forEach((n,i)=>{
    let d=document.createElement("div");
    d.className="cell glass flex items-center justify-center text-xl cursor-pointer";
    d.innerText=n===0?"":n;
    d.onclick=()=>moveTile(i);
    p.appendChild(d);
  });
}

function moveTile(i){
  let empty=puzzle.indexOf(0);
  let r=Math.floor(i/3), c=i%3;
  let er=Math.floor(empty/3), ec=empty%3;

  if(Math.abs(r-er)+Math.abs(c-ec)===1){
    [puzzle[i], puzzle[empty]]=[puzzle[empty], puzzle[i]];
    drawPuzzle();
    checkPuzzleWin();
  }
}

function checkPuzzleWin(){
  if(puzzle.join("")===goal){
    showPopup("🎉 Puzzle Solved!");
  }
}

function resetPuzzle(){
  puzzle=[1,2,3,4,5,6,7,8,0];
  drawPuzzle();
  document.getElementById("trace").innerHTML="";
  document.getElementById("steps").innerText="";
}

function shuffle(){
  puzzle=[1,2,3,4,5,6,7,8,0];
  for(let i=0;i<50;i++){
    let neighbors=getNeighbors(puzzle.join(""));
    let rand=neighbors[Math.floor(Math.random()*neighbors.length)];
    puzzle=rand.split("").map(Number);
  }
  drawPuzzle();
}

function getNeighbors(state){
  let res=[];
  let idx=state.indexOf("0");

  let row=Math.floor(idx/3);
  let col=idx%3;

  let moves=[[row,col-1],[row,col+1],[row-1,col],[row+1,col]];

  for(let [r,c] of moves){
    if(r>=0 && r<3 && c>=0 && c<3){
      let ni=r*3+c;
      let arr=state.split("");
      [arr[idx],arr[ni]]=[arr[ni],arr[idx]];
      res.push(arr.join(""));
    }
  }
  return res;
}

// TRACE
function showTrace(path){
  let t=document.getElementById("trace");
  t.innerHTML="";
  path.forEach((s,i)=>{
    let d=document.createElement("div");
    d.innerText="Step "+i+": "+s;
    t.appendChild(d);
  });
}

// ANIMATION
function animate(path){
  let i=0;
  let interval=setInterval(()=>{
    puzzle=path[i].split("").map(Number);
    drawPuzzle();
    i++;
    if(i>=path.length){
      clearInterval(interval);
      showPopup("🤖 AI Solved Puzzle!");
    }
  },300);
}

// BFS
function solveBFS(){
  let start=puzzle.join("");
  let queue=[[start]];
  let visited=new Set([start]);

  while(queue.length){
    let path=queue.shift();
    let state=path[path.length-1];

    if(state===goal){
      animate(path);
      showTrace(path);
      document.getElementById("steps").innerText="Steps: "+(path.length-1);
      return;
    }

    for(let n of getNeighbors(state)){
      if(!visited.has(n)){
        visited.add(n);
        queue.push([...path,n]);
      }
    }
  }
}

// A*
function solveAstar(){
  let start=puzzle.join("");
  let open=[{state:start,path:[start],g:0}];
  let visited=new Set();

  function h(s){
    let d=0;
    for(let i=0;i<9;i++){
      if(s[i]!=="0"){
        let val=parseInt(s[i])-1;
        d+=Math.abs(i%3-val%3)+Math.abs(Math.floor(i/3)-Math.floor(val/3));
      }
    }
    return d;
  }

  while(open.length){
    open.sort((a,b)=>(a.g+h(a.state))-(b.g+h(b.state)));
    let cur=open.shift();

    if(cur.state===goal){
      animate(cur.path);
      showTrace(cur.path);
      document.getElementById("steps").innerText="Steps: "+(cur.path.length-1);
      return;
    }

    visited.add(cur.state);

    for(let n of getNeighbors(cur.state)){
      if(!visited.has(n)){
        open.push({state:n,path:[...cur.path,n],g:cur.g+1});
      }
    }
  }
}

// INIT
drawBoard();
drawPuzzle();
