const screenDiv = document.getElementById("screen");

// `init` is responsible for building the visual grid
function init(username) {
  if (screenDiv) {
    // Check if screenDiv exists before appending
    const gameArea = document.createElement("div");
    gameArea.id = "gameArea";
    gameArea.setAttribute("username", username);
    screenDiv.appendChild(gameArea);
  }

  let currBoard = boards[username]; // `boards` is assumed to be globally available from script.js

  for (let i = 0; i < currBoard.length; i++) {
    // Iterating through columns (j in your previous script, now i here)
    const div = document.createElement("div");
    div.className = "col";
    div.id = "COL" + i; // ID for the column
    document.getElementById("gameArea").appendChild(div);

    for (let j = 0; j < currBoard[i].length; j++) {
      // Iterating through rows (i in your previous script, now j here)
      const div = document.createElement("div");
      div.className = "cell";

      // Apply initial background colors based on checkerboard pattern
      if (j % 2 === i % 2) {
        div.style.backgroundColor = "rgb(88, 168, 88)";
      } else {
        div.style.backgroundColor = "rgb(82, 153, 82)";
      }

      div.id = "COL" + i + "CELL" + j; // Correct ID format for consistency: COL{col}CELL{row}

      // Prevent default right-click context menu
      div.addEventListener("contextmenu", function (event) {
        event.preventDefault();
      });

      // Attach click event listeners (left-click and right-click)
      // Note: `j` for column, `i` for row for `onTileClick` and `placeFlag` as per `COL{col}CELL{row}` IDs.
      div.setAttribute(
        "onclick",
        "onTileClick(" + "'" + username + "'," + j + "," + i + ")"
      );
      div.setAttribute(
        "oncontextmenu",
        "placeFlag(" + "'" + username + "'," + j + "," + i + ")"
      );
      document.getElementById("COL" + i).appendChild(div);
    }
  }

  // Apply border radius to corners
  document.getElementById(
    "COL" + (SIZE - 1) + "CELL" + (SIZE - 1)
  ).style.borderBottomRightRadius = "10px";
  document.getElementById(
    "COL" + (SIZE - 1) + "CELL" + 0 // Corrected to top-right corner
  ).style.borderTopRightRadius = "10px";
  document.getElementById("COL" + 0 + "CELL" + 0).style.borderTopLeftRadius =
    "10px";
  document.getElementById(
    "COL" + 0 + "CELL" + (SIZE - 1) // Corrected to bottom-left corner
  ).style.borderBottomLeftRadius = "10px";

  // Initial resize and flag count update
  resizeTool();

  // Initial flag count display (assuming '0' is for mine, which should be counted)
  let initialFlagCount = 0;
  for (let r = 0; r < currBoard.length; r++) {
    for (let c = 0; c < currBoard[r].length; c++) {
      if (currBoard[r][c] === 0) {
        // Count initial mines
        initialFlagCount++;
      }
    }
  }
  document.getElementById("flagAmount").innerHTML = initialFlagCount;

  console.log("Game grid displayed");
}

// Colors for tiles based on their state (id) and checkerboard pattern
// `couleurs[0]` for one pattern, `couleurs[1]` for the other
const couleurs = [
  [
    "rgb(88, 168, 88)", // 0: mine not discovered (dark green)
    "rgb(88, 168, 88)", // 1: terrain not discovered (dark green)
    "rgb(88, 168, 88)", // 2: flag on mine (dark green with flag text)
    "rgb(88, 168, 88)", // 3: flag without mine (dark green with flag text)
    "rgb(231,164,133)", // 4: terrain discovered (light brown)
  ],
  [
    "rgb(82, 153, 82)", // 0: mine not discovered (lighter green)
    "rgb(82, 153, 82)", // 1: terrain not discovered (lighter green)
    "rgb(82, 153, 82)", // 2: flag on mine (lighter green with flag text)
    "rgb(82, 153, 82)", // 3: flag without mine (lighter green with flag text)
    "rgb(214,140,105)", // 4: terrain discovered (darker brown)
  ],
];

// Changes the background color of a cell based on its state (id)
// `x` is column index, `y` is row index
function changeColor(x, y, id) {
  const cell = document.getElementById("COL" + x + "CELL" + y);
  if (cell) {
    cell.style.backgroundColor = couleurs[((x % 2) + (y % 2)) % 2][id];
  }
}

// Changes the text content and color of a cell
// `x` is column index, `y` is row index
function changeText(x, y, text, color) {
  const cell = document.getElementById("COL" + x + "CELL" + y);
  if (cell) {
    cell.innerHTML = text;
    cell.style.color = color;
  }
}

// Event listener to initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  init(username); // `username` is assumed to be globally available from script.js
});

let long;
if (window.innerHeight <= window.innerWidth) {
  long = window.innerHeight;
} else {
  long = window.innerWidth;
}

// `borderTool` adjusts cell borders based on whether adjacent cells have different states (revealed/hidden)
// `boardEl` is the #gameArea element, `iVal` is row index, `jVal` is column index, `tileVal` is the tile's current state
function borderTool(boardEl, iVal, jVal, tileVal) {
  let boardName = boardEl.getAttribute("username");
  let currBoard = boards[boardName]; // `boards` is globally available from script.js
  const cell = document.getElementById("COL" + jVal + "CELL" + iVal); // COL{col}CELL{row}


  if (!cell) return; // Ensure cell exists

  // Iterate over neighbor indices (NEIGHBORINDICES from script.js)
  for (let [k, v] of Object.entries(NEIGHBORINDICES)) {
    let [n_i, n_j] = v([iVal, jVal]); // Calculate neighbor's row (n_i) and column (n_j)

    // Check if neighbor is within board boundaries
    if (
      n_i >= 0 &&
      n_i < currBoard.length &&
      n_j >= 0 &&
      n_j < currBoard[0].length
    ) {
      // Use currBoard[0].length for column check
      const ncell = document.getElementById("COL" + n_j + "CELL" + n_i); // Get neighbor cell
      if (!ncell) continue; // Ensure neighbor cell exists

      // Adjust borders if the neighbor's value is different from the current tile's value
      // This is for dynamic border rendering around revealed/hidden areas.
      if (getTileVal(currBoard, n_i, n_j) !== tileVal) {
        // getTileVal from script.js
        //1072
        cell.style["border" + k] = 1072 / long / SIZE + "px solid"; // Example: borderTop, borderBottom, etc.
        ncell.style["border" + OPPOSITESIDES[k]] =
          1072 / long / SIZE + "px solid"; // OPPOSITESIDES from script.js
      } else {
        cell.style["border" + k] = "none";
        ncell.style["border" + OPPOSITESIDES[k]] = "none";
      }
    }
  }
}

// `borderToolWhole` seems to be for applying borders based on color changes across the entire board.
// Its implementation suggests it's for drawing borders between revealed and unrevealed areas.
function borderToolWhole(boardEl) {
  let boardName = boardEl.getAttribute("username");
  let currBoard = boards[boardName]; // `boards` is globally available from script.js

  // Top/Bottom borders (iterating columns, then rows for vertical comparisons)
  for (let i = 0; i < currBoard.length; i++) {
    // Iterate through columns (i)
    let lastBgColor = null;
    for (let j = currBoard[i].length - 1; j >= 0; j--) {
      // Iterate rows (j) from bottom to top
      const cell = document.getElementById("COL" + i + "CELL" + j);
      if (!cell) continue;

      const currentBgColor = window.getComputedStyle(cell).backgroundColor;
      const color1 = "rgb(231, 164, 133)"; // Light brown for revealed cells
      const color2 = "rgb(214, 140, 105)"; // Darker brown for revealed cells
      const isRevealedColor = (color) => color === color1 || color === color2;

      // If the current cell is a revealed color AND the previous cell (below it) was not, or vice-versa
      // This creates a border when there's a transition between revealed and unrevealed sections.
      if (isRevealedColor(lastBgColor) && !isRevealedColor(currentBgColor)) {
        cell.style.borderBottom = "1px solid";
      } else if (
        isRevealedColor(currentBgColor) &&
        !isRevealedColor(lastBgColor)
      ) {
        cell.style.borderBottom = "1px solid";
      } else {
        cell.style.borderBottom = "none";
      }
      lastBgColor = currentBgColor;
    }
  }

  // Left/Right borders (iterating rows, then columns for horizontal comparisons)
  for (let i = 0; i < currBoard[0].length; i++) {
    // Iterate through rows (i)
    let lastBgColor = null;
    for (let j = 0; j < currBoard.length; j++) {
      // Iterate columns (j) from left to right
      const cell = document.getElementById("COL" + j + "CELL" + i); // COL{col}CELL{row}
      if (!cell) continue;

      const currentBgColor = window.getComputedStyle(cell).backgroundColor;
      const color1 = "rgb(231, 164, 133)";
      const color2 = "rgb(214, 140, 105)";
      const isRevealedColor = (color) => color === color1 || color === color2;

      // Similar logic for left/right borders
      if (isRevealedColor(lastBgColor) && !isRevealedColor(currentBgColor)) {
        cell.style.borderLeft = "1px solid";
      } else if (
        isRevealedColor(currentBgColor) &&
        !isRevealedColor(lastBgColor)
      ) {
        cell.style.borderLeft = "1px solid";
      } else {
        cell.style.borderLeft = "none";
      }
      lastBgColor = currentBgColor;
    }
  }
}

// `resizeTool` adjusts the size of columns, cells, and flag display based on window dimensions
function resizeTool() {
  const cols = document.getElementsByClassName("col");
  let long;
  if (window.innerHeight <= window.innerWidth) {
    long = window.innerHeight;
  } else {
    long = window.innerWidth;
  }

  // Adjust column widths
  for (let i = 0; i < cols.length; i++) {
    cols[i].style.width = (long * 0.8) / SIZE + "px"; // `SIZE` is assumed to be globally available from script.js
  }

  // Adjust cell heights and font sizes
  const cells = document.getElementsByClassName("cell");
  for (let i = 0; i < cells.length; i++) {
    cells[i].style.height = (long * 0.8) / SIZE + "px";
    cells[i].style.fontSize = (long * 0.4) / SIZE + "px";
  }

  // Adjust font size for the flag display
  document.getElementById("flag").style.fontSize =
    (window.innerHeight * 0.8) / SIZE + "px";
}

// Event listener to call resizeTool whenever the window is resized
window.addEventListener("resize", () => {
  resizeTool();
});

function sizeChange(){
    let tempSIZE = prompt("Choose the size of the square :")
    if(parseInt(tempSIZE) === NaN){
        alert("It's not a number")
        return
    }
    if(parseInt(tempSIZE) < 5){
        alert("Too small")
        return
    }
    if(parseInt(tempSIZE) > 100){
        alert("Too big")
        return
    }
    if(confirm("Warning you will lost your actual progression.\nDo you want to continue ?")){
        window.location.hash = tempSIZE;
        window.location.reload();
    }
}