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
     // Événement 'find' pour ajouter des joueurs et démarrer une partie
     socket.on('find', (e) => {
          if (e.name != null) {
               arr.push(e.name);
               if (arr.length >= 2) {
                    // Création des objets joueurs et initialisation de la partie
                    let p1obj = { p1name: arr[0], p1value: 'X', p1move: "" }
                    let p2obj = { p2name: arr[1], p2value: 'O', p2move: "" }
                    let obj = { p1: p1obj, p2: p2obj, sum: 1, turn: 'X' }
                    playingArray.push(obj);
                    arr.splice(0, 2);
                    io.emit('find', { allPlayers: playingArray });
               }
          }
     });

     // Événement 'playing' pour gérer les mouvements des joueurs
     socket.on('playing', (e) => {
          console.log('Received playing event:', e);
          let objToChange;
          if (e.value == 'X') {
               objToChange = playingArray.find(obj => obj.p1.p1name === e.name);
               if (objToChange && objToChange.turn === 'X') {
                    objToChange.p1.p1move = e.id;
                    objToChange.sum++;
                    objToChange.turn = 'O';
               }
          } else if (e.value == 'O') {
               objToChange = playingArray.find(obj => obj.p2.p2name === e.name);
               if (objToChange && objToChange.turn === 'O') {
                    objToChange.p2.p2move = e.id;
                    objToChange.sum++;
                    objToChange.turn = 'X';
               }
          }

          if (objToChange) {
               io.emit('playing', { allPlayers: playingArray });
          } else {
               console.error('objToChange not found or not the correct turn for event:', e);
          }
     });

     // Événement 'gameOver' pour supprimer un joueur après la fin de la partie
     socket.on("gameOver", (e) => {
          playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);
     });

     // Événement 'chatMessage' pour gérer les messages de chat
     socket.on('chatMessage', (msg) => {
          io.emit('chatMessage', msg);
     });
});

// Route pour servir le fichier index.html
app.get('/', (req, res) => {
     return res.sendFile("index.html", { root: __dirname });
});

// Démarrage du serveur sur le port 3000
server.listen(3000, () => {
     console.log('listening on port 3000');
});