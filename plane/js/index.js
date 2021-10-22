/** @type {HTMLCanvasElement} */

// 获取页面元素部分
const myCanvas = document.querySelector(".canvas > canvas");
const ctx = myCanvas.getContext("2d");
const start = document.querySelector(".aside .start");
const ranking = document.querySelector(".aside .ranking tbody");
const ranking_list = ranking.children;

const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;

// 常数 & 变量区域
const rate = 8;
const bulletRate = 20;
const planeSize = 60;
let startflag = true;
let mapIteator = 0;
let scoreMap = new Map();
let enemyArr = [];
let bulletQueue = [];
let bulletCooling = false;
let myplane = null;
let score = 0;
let bulletCool = null;
let pushEnemyArr = null;
let gamerun = null;


// 图片加载部分
const bgi = new Image();
const bgi0 = new Image();
const bgi1 = new Image();
const planeN = new Image();
const planeE = new Image();
const enemy = new Image();
const bullet = new Image();
planeE.src = "image/planeExplode.png";
planeN.src = "image/planeNormal.png";
enemy.src = "image/enemyPlane.png";
bullet.src = "image/bullet.png";
bgi.src = "image/background.jpg";
bgi0.src = "image/background0.jpg";
bgi1.src = "image/background1.jpg";


// 类及函数定义部分
class myBullet {
  constructor(pX, pY) {
    this.positonX = pX;
    this.positonY = pY;
  }
}
class myPlane {
  constructor() {
    this.positonX = canvasWidth / 2 - planeSize / 2;
    this.positonY = canvasHeight * 5 / 7;
  }
  fireBullet () {
    if (!bulletCooling) {
      bulletQueue.push(new myBullet(this.positonX, this.positonY));
      bulletCooling = true;
      clearInterval(bulletCool);
      bulletCool = setInterval(() => {
        bulletCooling = false;
      }, 500);
    }
  }
}
class enemyPlane {
  constructor(pX, pY) {
    this.positonX = pX;
    this.positonY = pY;
    this.rate = Math.floor(Math.random() * 3 + 2.4);
    // 敌机速度为3，4的概率大于2大于5
  }
}
function createEnemy () {
  const pX = Math.floor(Math.random() * (canvasWidth - planeSize + 1));
  const pY = -planeSize;
  return new enemyPlane(pX, pY);
}
function reliveEnemy (k) {
  enemyArr[k].positonY = NaN;
  // 我直接给你搞成NaN(￣_￣ )
  const time = Math.floor(Math.random() * 2000 + 4000);
  // 随机的复活时间
  setTimeout(() => {
    enemyArr[k] = createEnemy();
  }, time);
}
function drawGame (plane) {
  ctx.drawImage(bgi, 0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(plane, myplane.positonX, myplane.positonY, planeSize, planeSize);
  for (const k of enemyArr) {
    ctx.drawImage(enemy, k.positonX, k.positonY, planeSize, planeSize);
  }
  for (const k of bulletQueue) {
    ctx.drawImage(bullet, k.positonX + planeSize / 2 - 10, k.positonY, 12, 16);
  }
  ctx.font = '30px 微软雅黑';
  const scorestr = score >= 10 ? score >= 100 ? score.toString() : '0' + score : '00' + score;
  ctx.fillText("score:" + scorestr, canvasWidth - 140, 40);
}
function initGame () {
  startflag = true;
  score = 0;
  enemyArr = null;
  bulletQueue = null;
  enemyArr = [];
  bulletQueue = [];
  // 应该先将两个数组设为空在进行游戏配置的初始化，因为游戏配置里有需要判断空数组的条件
  myplane = new myPlane();
  gameSet();
  drawGame(planeN);
}

bgi1.onload = function () {
  ctx.drawImage(bgi1, 0, 0, canvasWidth, canvasHeight);
}

start.addEventListener("click", () => {
  initGame();
  start.disabled = true;
})

window.onkeydown = function (e) {
  if (startflag) {
    if (e.key === "w" && myplane.positonY > 0) {
      myplane.positonY -= rate;
    } else if (e.key === "s" && myplane.positonY < canvasHeight - planeSize) {
      myplane.positonY += rate;
    } else if (e.key === "d" && myplane.positonX < canvasWidth - planeSize) {
      myplane.positonX += rate;
    } else if (e.key === "a" && myplane.positonX > 0) {
      myplane.positonX -= rate;
    } else if (e.key === " ") {
      myplane.fireBullet();
    } else if (e.key === "1") {
      score++;
    }
    drawGame(planeN);
  }
}

function gameSet () {
  clearInterval(pushEnemyArr);
  clearInterval(bulletCool);
  clearInterval(gamerun);
  pushEnemyArr = setInterval(() => {
    if (startflag && enemyArr.length < 8 + score / 25 && enemyArr.length <= 16) {
      enemyArr.push(createEnemy());
    }
  }, 5000);
  bulletCool = setInterval(() => {
    bulletCooling = false;
  }, 500);
  gamerun = setInterval(() => {
    if (bulletQueue.length !== 0) {
      for (const k of bulletQueue) {
        k.positonY -= bulletRate;
        if (k.positonY < 0) {
          bulletQueue.shift();
        }
        for (let e = 0; e < enemyArr.length; e++) {
          if (k.positonY >= enemyArr[e].positonY && k.positonY <= enemyArr[e].positonY + planeSize) {
            if (k.positonX + planeSize / 2 >= enemyArr[e].positonX + 10 && k.positonX + planeSize / 2 <= enemyArr[e].positonX + planeSize) {
              score++;
              reliveEnemy(e);
              bulletQueue.shift();
            }
          }
        }
      }
      drawGame(planeN);
    }
    if (enemyArr.length !== 0) {
      for (let k = 0; k < enemyArr.length; k++) {
        console.log(enemyArr[k]);
        enemyArr[k].positonY += enemyArr[k].rate;
        if (enemyArr[k].positonY >= canvasHeight) {
          reliveEnemy(k);
        }
      }
      drawGame(planeN);
      for (let k = 0; k < enemyArr.length; k++) {
        const myPoX = myplane.positonX + planeSize / 2;
        const myPoY = myplane.positonY + planeSize / 2;
        if (myPoX >= enemyArr[k].positonX && myPoX <= enemyArr[k].positonX + planeSize) {
          if (myPoY >= enemyArr[k].positonY && myPoY <= enemyArr[k].positonY + planeSize * 3 / 2) {
            drawGame(planeE);
            startflag = false;
            const scorestr = score >= 10 ? score >= 100 ? score.toString() : '0' + score : '00' + score;
            let name = start.nextElementSibling.value;
            name = name === "" ? "无名氏" : name;
            scoreMapAdd(name, scorestr);
            start.innerHTML = "游戏结束";
            let tout1 = setTimeout(() => {
              start.innerHTML = "距离重新开始还有2秒";
              clearTimeout(tout1);
            }, 1000);
            let tout2 = setTimeout(() => {
              start.innerHTML = "距离重新开始还有1秒";
              clearTimeout(tout2);
            }, 2000);
            let tout3 = setTimeout(() => {
              start.innerHTML = "开始游戏";
              start.disabled = false;
              clearTimeout(tout3);
            }, 3000);
            clearInterval(gamerun);
          }
        }
      }
    }
  }, 40);
}
function scoreMapAdd (...data) {
  if (scoreMap.size < ranking_list.length) {
    scoreMap.set(mapIteator++, data);
  } else if (scoreMap.size === ranking_list.length) {
    scoreMap.set(mapIteator, data);
    mapSort(scoreMap);
    scoreMap.delete(mapIteator);
  }
  mapSort(scoreMap);
  scoreMap.forEach((value, key, scoreMap) => {
    const rk = ranking_list[key];
    if (rk.children.length === 0) {
      const tdNumber = document.createElement('td');
      const tdValue = document.createElement('td');
      const tdName = document.createElement('td');
      tdNumber.innerHTML = key + 1 + ":";
      tdValue.innerHTML = value[1];
      tdName.innerHTML = value[0];
      rk.appendChild(tdNumber);
      rk.appendChild(tdValue);
      rk.appendChild(tdName);
    } else if (rk.children.length === 3) {
      rk.removeChild(rk.children[2]);
      rk.removeChild(rk.children[1]);
      rk.removeChild(rk.children[0]);
      const tdNumber = document.createElement('td');
      const tdValue = document.createElement('td');
      const tdName = document.createElement('td');
      tdNumber.innerHTML = key + 1 + ":";
      tdValue.innerHTML = value[1];
      tdName.innerHTML = value[0];
      rk.appendChild(tdNumber);
      rk.appendChild(tdValue);
      rk.appendChild(tdName);
    }

  })

}
function mapSort (map) {
  map.forEach((value, key, map) => {
    let max = value;
    let maxk = key;
    for (let k = key + 1; k < map.size; k++) {
      if (parseInt(map.get(k)[1], 10) > parseInt(max[1], 10)) {
        max = map.get(k);
        maxk = k;
      }
    }
    let temp = map.get(key);
    map.set(key, map.get(maxk));
    map.set(maxk, temp);
  })
}

// // 测试代码，测试生成敌军飞机可用性及随机性
// let rarr = [0, 0, 0, 0];
// for (let k = 0; k < 100; k++) {
//   let enemy1 = createEnemy();
//   console.log(enemy1.positonX);
//   if (enemy1.rate == 2) {
//     rarr[0]++;
//   } else if (enemy1.rate == 3) {
//     rarr[1]++;
//   } else if (enemy1.rate == 4) {
//     rarr[2]++;
//   } else if (enemy1.rate == 5) {
//     rarr[3]++;
//   }
// }
// console.log(rarr, rarr[0] + rarr[1] + rarr[2] + rarr[3]);
