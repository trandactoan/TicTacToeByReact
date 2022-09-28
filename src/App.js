import React from "react";
import './App.css'


function indexToRowAndCol(boardSize, index)
{
  const row=Math.floor(index/boardSize);
  const col=index-row*boardSize;
  return [row,col];
}

function rowAndColToIndex(boardSize, row, col)
{
  return row*boardSize+col;
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} id={props.index}>
      {props.value}
    </button>
  );
}
class Board extends React.Component {
  constructor(props)
  {
    super(props);
    this.state= {
      boardSize: props.boardSize
    }
  }
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        index={i}
        key={i}
      />
    );
  }
  row(rowAmmount, rowIndex) {
    const rowArrayRender=[...Array(rowAmmount).keys()];
    return(
      <div className="board-row" key={rowIndex}>
        {rowArrayRender.map((element) => {
          return this.renderSquare(rowIndex*rowAmmount+element)
        })}
      </div>
    );
  }

  render() {
    const boardArrayRender=[...Array(this.state.boardSize).keys()]
    return (
      <div>
        {boardArrayRender.map((element) => {
          return this.row(this.state.boardSize,element)
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(props.boardSize*props.boardSize).fill(null),
          currentStep: [-1,-1],
          beforeStep:[-1,-1]
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      boardSize: props.boardSize,
      isAscending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const lastStep=this.state.history[this.state.history.length-1].currentStep;
    const lastIndex=rowAndColToIndex(this.state.boardSize,lastStep[0],lastStep[1]);
    if(lastIndex>=0){
      const element = document.getElementById(lastIndex);
      element.classList.remove("onChoosing")
    }
    if (calculateWinner(squares, lastIndex) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          currentStep: indexToRowAndCol(this.state.boardSize,i),
          beforeStep: lastStep
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
    const onChoosingElement=document.getElementById(i);
    onChoosingElement.classList.add("onChoosing")
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const lastStep=this.state.history[this.state.history.length-1].currentStep;
    const lastIndex=rowAndColToIndex(this.state.boardSize,lastStep[0],lastStep[1]);
    const winner = calculateWinner(current.squares, lastIndex);

    const moves = history.map((step, move, historyData) => {
      const currentMove= this.state.isAscending?move:(historyData.length-move)
      const desc = move ?
        'Go to move #' + currentMove + " row: " + historyData[currentMove].currentStep[0].toString() + " col: " + historyData[currentMove].currentStep[1].toString()
        :
        'Go to game start';
      return (
        <li key={currentMove}>
          <button onClick={() => this.jumpTo(currentMove)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    }
    else if(this.state.stepNumber === this.state.boardSize*this.state.boardSize){
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    //handle sort button
    const handleSortButton = () => {
      this.setState({
        isAscending: !this.state.isAscending
      })
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            boardSize={this.state.boardSize}
          />
        </div>
        <div className="game-info">
          <div>
            <button onClick={handleSortButton}>Change sort</button>
          </div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function checkWinningByVertical(squares, i){
  const boardSize=Math.sqrt(squares.length);
  const result=[];
  result.push(i);
  const rowAndCol=indexToRowAndCol(boardSize, i);
  const valueAtIndexI=squares[i];
  // to up
  let currentRowToUp=rowAndCol[0]-1;
  while(currentRowToUp>=0 && squares[rowAndColToIndex(boardSize,currentRowToUp,rowAndCol[1])] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(currentRowToUp,rowAndCol[1]));
    currentRowToUp-=1;
  }

  //to down
  let currentRowToDown=rowAndCol[0]+1;
  while(currentRowToDown<boardSize && squares[rowAndColToIndex(boardSize,currentRowToDown,rowAndCol[1])] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,currentRowToDown,rowAndCol[1]));
    currentRowToDown+=1;
  }

  if(result.length === 5)
  {
    highLightTheWinMove(result);
    return [true,result];
  }
  return false;
}

function checkWinningByHorizontal(squares, i){
  const boardSize=Math.sqrt(squares.length);
  const result=[];
  result.push(i);
  const rowAndCol=indexToRowAndCol(boardSize, i);
  const valueAtIndexI=squares[i];
  // to left
  let currentColToLeft=rowAndCol[1]-1;
  while(currentColToLeft>=0 && squares[rowAndColToIndex(boardSize,rowAndCol[0],currentColToLeft)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,rowAndCol[0],currentColToLeft));
    currentColToLeft-=1;
  }

  //to right
  let currentColToRight=rowAndCol[1]+1;
  while(currentColToRight<boardSize && squares[rowAndColToIndex(boardSize,rowAndCol[0],currentColToRight)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,rowAndCol[0],currentColToRight));
    currentColToRight+=1;
  }

  if(result.length === 5)
  {
    highLightTheWinMove(result);
    return [true,result];
  }
  return false;
}

function checkWinningByForwardSlash(squares, i){
  const boardSize=Math.sqrt(squares.length);
  const result=[];
  result.push(i);
  const rowAndCol=indexToRowAndCol(boardSize, i);
  const valueAtIndexI=squares[i];

  // to bottom left
  let currentRowToDown=rowAndCol[0]+1;
  let currentColToLeft=rowAndCol[1]-1;
  while(currentRowToDown<boardSize
    && currentColToLeft>=0 
    && squares[rowAndColToIndex(boardSize,currentRowToDown,currentColToLeft)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,currentRowToDown,currentColToLeft));
    currentRowToDown+=1;
    currentColToLeft-=1;
  }

  //to top right
  let currentRowToUp=rowAndCol[0]-1;
  let currentColToRight=rowAndCol[1]+1;
  while(currentRowToUp>=0 
    && currentColToRight<boardSize 
    && squares[rowAndColToIndex(boardSize,currentRowToUp,currentColToRight)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,currentRowToUp,currentColToRight));
    currentColToRight-=1;
    currentRowToUp+=1;
  }

  if(result.length === 5)
  {
    highLightTheWinMove(result);
    return [true,result];
  }
  return false;
}

function checkWinningByBackSlash(squares, i){
  const boardSize=Math.sqrt(squares.length);
  const result=[];
  result.push(i);
  const rowAndCol=indexToRowAndCol(boardSize, i);
  const valueAtIndexI=squares[i];

  // to bottom right
  let currentRowToDown=rowAndCol[0]+1;
  let currentColToRight=rowAndCol[1]+1;
  while(currentRowToDown<boardSize
    && currentColToRight<boardSize
    && squares[rowAndColToIndex(boardSize,currentRowToDown,currentColToRight)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,currentRowToDown,currentColToRight));
    currentRowToDown+=1;
    currentColToRight+=1;
  }

  //to top left
  let currentRowToUp=rowAndCol[0]-1;
  let currentColToLeft=rowAndCol[1]-1;
  while(currentRowToUp>=0 
    && currentColToLeft>=0 
    && squares[rowAndColToIndex(boardSize,currentRowToUp,currentColToLeft)] === valueAtIndexI)
  {
    result.push(rowAndColToIndex(boardSize,currentRowToUp,currentColToLeft));
    currentRowToUp-=1;
    currentColToLeft-=1;
  }

  if(result.length === 5)
  {
    highLightTheWinMove(result);
    return [true,result];
  }
  return false;
}

function highLightTheWinMove(result){
  result.forEach(idIndex => {
    const winElement=document.getElementById(idIndex);
    winElement.classList.add("winMove");
  });
}

function calculateWinner(squares, i) {
  if(i<0) return null;
  if(squares[i]===null) return null;
  const verticalResult=checkWinningByVertical(squares,i);
  const horizontalResult=checkWinningByHorizontal(squares,i);
  const forwardSlashResult=checkWinningByForwardSlash(squares,i);
  const backSlashResult=checkWinningByBackSlash(squares,i);
  if(verticalResult[0])
  {
    return squares[i];
  }
  else if(horizontalResult[0])
  {
    return squares[i];
  }
  else if(forwardSlashResult[0])
  {
    return squares[i];
  }
  else if(backSlashResult[0])
  {
    return squares[i];
  }
  return null;
}

export default Game