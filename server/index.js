const http = require('http')
const express = require('express')
const socketIo = require('socket.io')
const fs = require('fs')

const app = express()
const server = http.Server(app).listen(8080)
const io = socketIo(server)

app.use(express.static(__dirname + '/../client/'))

let players = {}
let unmatchedPlayerId

//app.use(express.static(__dirname + '/../node_modules/'))

// app.get('/', (req, res) => {
//   const stream = fs.createReadStream(__dirname + '/../client/index.html')
//   stream.pipe(res)
// })

// When a client connects
io.on('connection', function (socket) {
  console.log('New client connected. ID: ', socket.id)

  joinPlayer(socket)

  if (getOpponentSocket(socket)) {
    socket.emit('game.begin', {
      symbol: players[socket.id].symbol,
    })
    getOpponentSocket(socket).emit('game.begin', {
      symbol: players[getOpponentSocket(socket).id].symbol,
    })
  }

  //Event for when any player makes a move
  socket.on('make.move', function (data) {
    if (!getOpponentSocket(socket)) {
      return
    }

    socket.emit('move.made', data)
    getOpponentSocket(socket).emit('move.made', data)
  })

  // Event to inform player that the opponent left
  socket.on('disconnect', function () {
    console.log('Client disconnected. ID: ', socket.id)
    if (getOpponentSocket(socket)) {
      getOpponentSocket(socket).emit('opponent.left')
    }
  })
})

function joinPlayer(socket) {
  players[socket.id] = {
    opponent: unmatchedPlayerId,
    symbol: 'X',
    socket: socket,
  }

  // If 'unmatchedPlayerId' is defined it contains the socket.id of the player who was waiting for an opponent
  // then, the current socket is player #2
  if (unmatchedPlayerId) {
    players[socket.id].symbol = 'O'
    players[unmatchedPlayerId].opponent = socket.id
    unmatchedPlayerId = null
  } else {
    unmatchedPlayerId = socket.id
  }
}

function getOpponentSocket(socket) {
  if (!players[socket.id].opponent) {
    return
  }
  const opponentSocketId = players[socket.id].opponent
  return players[opponentSocketId].socket
}
