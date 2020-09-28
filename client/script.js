const url = window.location.origin
let socket = io.connect(url)

var myTurn = true
var symbol

const message = document.getElementById('message')
const buttons = document.querySelectorAll('.board button')

buttons.forEach(btn => btn.addEventListener('click', () => makeMove(btn)))
buttons.forEach(btn => btn.setAttribute('disabled', true))

function getBoardState() {
  var obj = {}

  buttons.forEach(btn => (obj[btn.id] = btn.innerHTML))

  return obj
}

function isGameOver() {
  var state = getBoardState()
  var matches = ['XXX', 'OOO']
  var rows = [
    state.r0c0 + state.r0c1 + state.r0c2, // 1st line
    state.r1c0 + state.r1c1 + state.r1c2, // 2nd line
    state.r2c0 + state.r2c1 + state.r2c2, // 3rd line
    state.r0c0 + state.r1c0 + state.r2c0, // 1st column
    state.r0c1 + state.r1c1 + state.r2c1, // 2nd column
    state.r0c2 + state.r1c2 + state.r2c2, // 3rd column
    state.r0c0 + state.r1c1 + state.r2c2, // Primary diagonal
    state.r0c2 + state.r1c1 + state.r2c0,
  ]

  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true
    }
  }

  return false
}

function renderTurnMessage() {
  if (!myTurn) {
    message.innerHTML = 'Your opponents turn'
    buttons.forEach(btn => btn.setAttribute('disabled', true))
  } else {
    message.innerHTML = 'Your turn.'
    buttons.forEach(btn => btn.removeAttribute('disabled'))
  }
}

function makeMove(btn) {
  if (!myTurn) {
    return
  }

  if (btn.innerHTML.length) {
    return
  }

  socket.emit('make.move', {
    symbol: symbol,
    position: btn.id,
  })
}

socket.on('move.made', function (data) {
  document.getElementById(data.position).innerHTML = data.symbol

  myTurn = data.symbol !== symbol

  if (!isGameOver()) {
    renderTurnMessage()
  } else {
    if (myTurn) {
      message.innerHTML = 'You lost.'
    } else {
      message.innerHTML = 'You won!'
    }
    buttons.forEach(btn => btn.setAttribute('disabled', true))
  }
})

socket.on('game.begin', function (data) {
  symbol = data.symbol
  myTurn = symbol === 'X'
  renderTurnMessage()
})

socket.on('opponent.left', function () {
  message.innerHTML = 'Your opponent left the game.'
  buttons.forEach(btn => btn.setAttribute('disabled', true))
})
