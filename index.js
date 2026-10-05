import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//         io.emit('chat message', msg);
//     });

//     socket.on('new room', (msg) => {
//       console.log(io.sockets.adapter.rooms);
//       io.emit('chat message', msg);
//     })
// });

io.sockets.on('connection', function(socket){
  socket.on('new room', () => {
    
    const newId = generateId(Array.from(io.sockets.adapter.rooms.keys()))
    socket.join(newId)
    console.log(Array.from(io.sockets.adapter.rooms.keys()));
    socket.emit('joined', newId);
  })

  socket.on('join', function(room) {
    socket.join(room);
    socket.emit('joined', room)
  });

  socket.on("content", (data) => {
    const room = Array.from(socket.rooms).pop(); // change to recognize by regex
    socket.broadcast.to(room).emit("content", data);
    // clearTimeout(timeout);

    // timeout = setTimeout(async function() {
    //   console.log("save data");
    //   await models.updateDocs(data);
    // }, 2000);
  });

  socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      console.log(socket.rooms);
      const room = Array.from(socket.rooms).pop();
      socket.to(room).emit('chat message', msg);
  });
});

/**
 * Randomly generates a 4 character id from a pool of 61 characters.
 * It uses upper and lowercase letters and the numbers 1-9.
 */
function generateId(forbidden) {
  const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'W', 'V', 'X', 'Y', 'Z'];
  const beta = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'w', 'v', 'x', 'y', 'z'];
  const delta = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const omega = alpha.concat(beta, delta);
  const randEle = (arr) => { return arr[Math.floor(Math.random() * arr.length)] };
  console.log(omega)
  let id = ""
  let i = 0
  while (i < 4) {
    let char = randEle(omega)
    if (i == 3) {
      let prev = []
      while (forbidden.includes(id+char) && prev.length < omega.length-1) {
        prev.push(char)
        console.log(omega-prev)

        char = randEle(omega-prev)
      }
      if (prev.length >= omega.length) {
        return generateId(forbidden)
      }
    }
    id += char
    i++
  }
  console.log(forbidden);
  return id;
}

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});