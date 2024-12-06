const express = require('express');
const app = express();

const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server);
app.use(express.static(path.resolve("")));

let arr = [];
let playingArray = [];

io.on('connection', (socket) => {
     socket.on('find', (e) => {
          if (e.name != null) {
               arr.push(e.name);
               if (arr.length >= 2) {
                    let p1obj = {
                         p1name: arr[0],
                         p1value: 'X',
                         p1move: ""
                    }

                    let p2obj = {
                         p2name: arr[1],
                         p2value: 'O',
                         p2move: ""
                    }

                    let obj = {
                         p1: p1obj,
                         p2: p2obj,
                         sum: 1,
                         turn: 'X' // Ajout de la propriété turn
                    }
                    playingArray.push(obj);

                    arr.splice(0, 2);

                    io.emit('find', { allPlayers: playingArray });
               }
          }
     });

     socket.on('playing', (e) => {
          console.log('Received playing event:', e);
          let objToChange;
          if (e.value == 'X') {
               objToChange = playingArray.find(obj => obj.p1.p1name === e.name);
               if (objToChange && objToChange.turn === 'X') {
                    objToChange.p1.p1move = e.id;
                    objToChange.sum++;
                    objToChange.turn = 'O'; // Changer le tour
               }
          } else if (e.value == 'O') {
               objToChange = playingArray.find(obj => obj.p2.p2name === e.name);
               if (objToChange && objToChange.turn === 'O') {
                    objToChange.p2.p2move = e.id;
                    objToChange.sum++;
                    objToChange.turn = 'X'; // Changer le tour
               }
          }

          if (objToChange) {
               io.emit('playing', { allPlayers: playingArray });
          } else {
               console.error('objToChange not found or not the correct turn for event:', e);
          }
     });

     socket.on("gameOver", (e) => {
          playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);
     });

     socket.on('chatMessage', (msg) => {
          io.emit('chatMessage', msg);
     });
});

app.get('/', (req, res) => {
     return res.sendFile("index.html", { root: __dirname });
});

server.listen(3000, () => {
     console.log('listening on port 3000');
});