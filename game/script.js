const COLS = {
  flag: "#FF0000",
  numbers: [
    "",
    "#494ad2",
    "#407843",
    "#d24949",
    "#8c39a1",
    "#f3ed26",
    "#6ae8e2",
    "#838383",
    "#000000",
  ],
};
let SIZE = 10;
if (
  window.location.hash[0] === "#" &&
  typeof parseInt(window.location.hash.split("#")[1]) === "number"
) {
  SIZE = parseInt(window.location.hash.split("#")[1]);
} else {
  SIZE = 20;
}
const PERCENT = 0.15;

const NEIGHBORINDICES = {
  Top: (e) => [e[0] - 1, e[1]],
  Bottom: (e) => [e[0] + 1, e[1]],
  Left: (e) => [e[0], e[1] - 1],
  Right: (e) => [e[0], e[1] + 1],
};

const OPPOSITESIDES = {
  Top: "Bottom",
  Bottom: "Top",
  Left: "Right",
  Right: "Left",
};

var boards = {};
var clicks = {};

username = localStorage.getItem("username");

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function createBoard(size, percent) {
  let ret = [];
  for (i = 0; i < size; i++) {
    ret.push([]);
    for (j = 0; j < size; j++) {
      ret[i].push(Math.random(0, 1) < percent ? 0 : 1);
    }
  }
  boards[username] = ret;
  clicks[username] = 0;
  return ret;
}

function countCorrect(board) {
  let count = true;
  for (i of board) {
    for (j of i) {
      if ([1, 3].includes(j)) {
        count = false;
        return count;
      }
    }
  }
  return count;
}

createBoard(SIZE, PERCENT); 

function mB(board) {
  return board[board.getAttribute("username")];
}

function countAdjacentOnes(board, i, j) {
  let n = getNeighbors(board, i, j);
  let count = 0;
  for (el of n) {
    if ([0, 2].includes(getTileVal(board, el[0], el[1]))) {
      count++;
    }
  }
  return count;
}

function getNeighbors(board, i, j) {
  const neighbors = [];
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const boardRows = board.length;
  const boardCols = board[0] ? board[0].length : 0;

  for (const [di, dj] of directions) {
    const ni = i + di;
    const nj = j + dj;
    if (ni >= 0 && ni < boardRows && nj >= 0 && nj < boardCols) {
      neighbors.push([ni, nj]);
    }
  }
  return neighbors;
}

function getTileVal(board, i, j) {
  return board[i][j];
}

function setTileVal(board, i, j, v, boardName) {
  board[i][j] = v;
  let txtObj = {
    txt: "",
    col: "",
  };

  if ([2, 3].includes(v)) {
    txtObj.txt = "F";
    txtObj.col = COLS.flag;
    updateTile(i, j, v, txtObj, boardName);
  } else if (v === 4) {
    let adjacentMines = countAdjacentOnes(board, i, j);
    txtObj.txt = adjacentMines ? adjacentMines : ""; 
    txtObj.col = COLS.numbers[adjacentMines]; 

    updateTile(i, j, v, txtObj, boardName);

    if (adjacentMines === 0) {
      let n = getNeighbors(board, i, j);
      for (let el of n) {
        if ([1, 3].includes(getTileVal(board, el[0], el[1]))) {
          setTileVal(board, el[0], el[1], 4, boardName); 
        }
      }
    }
    console.log(document.getElementById('gameArea'))
    borderTool(document.getElementById('gameArea'), i, j, v);
  } else {
    updateTile(i, j, v, txtObj, boardName);
  }
}

function updateTile(i, j, id, txtObj, boardName) {
  changeColor(j, i, id, document.querySelector(`[username="${boardName}"]`));
  changeText(j, i, txtObj.txt, txtObj.col);
}

function placeFlag(boardName, i, j) {
  let board = boards[boardName];
  let tileVal = getTileVal(board, i, j);
  let flagAmountElement = document.getElementById("flagAmount");
  let currentFlags = parseInt(flagAmountElement.innerText);

  if (tileVal === 0 || tileVal === 1) {
    setTileVal(board, i, j, tileVal + 2, boardName);
    flagAmountElement.innerHTML = currentFlags - 1;
  } else if (tileVal === 2 || tileVal === 3) {
    setTileVal(board, i, j, tileVal - 2, boardName); 
    flagAmountElement.innerHTML = currentFlags + 1; 
  }
}

function onTileClick(boardName, i, j) {
  let board = boards[boardName];

  if (clicks[boardName] === 0) {
    if (board[i][j] === 0) {
      let moved = false;
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c] === 1) {
            board[r][c] = 0; 
            board[i][j] = 1; 
            moved = true;
            break;
          }
        }
        if (moved) break;
      }
    }
    let n = getNeighbors(board, i, j);
    for (let el of n) {
      board[el[0]][el[1]] = 1;
    }
  }
  let tileValue = getTileVal(board, i, j); 
  clicks[boardName]++;

  switch (tileValue) {
    case 0:
      gameOver();
      break;
    case 1: 
      setTileVal(board, i, j, 4, boardName); 
      break;
  }

  if (countCorrect(board)) {
    window.location = "./win";
  }
}

function gameOver() {
  window.location = "./over/";
}
function backToHome(){
window.location.replace("../index.html");
}