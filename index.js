const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// passing in server 
const { Server } = require("socket.io");
const io = new Server(server);
const kafka = require('./kafka');
const { exec } = require('child_process');





app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  //listen on the connection event for incoming sockets and log to the console
  io.on('connection', (socket) => {

    const kafka_downloads = kafka.consumer({ groupId: 'downloads' , fromOffset: 0})
    const run_downloads = async () => {
    //   const kafkasocks_downloads = 'TRUCK_1_SENSORS'
      await kafka_downloads.connect();
      await kafka_downloads.subscribe({ topic: 'Kafkasocks_downloads' });
      await kafka_downloads.run({
          eachMessage: async ({ topic, partition, message }) => {
              io.emit('chat message', `${message.value}`);
            //   socket.emit(kafka_downloads, `${message.value}`);
            //   socket.broadcast.emit('chat message', `${message.value}`);
          },
      });
    }
    run_downloads().catch(e => console.error(`[example/kafka_downloads] ${e.message}`, e))



  // This will emit the event to all connected sockets
//   io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); 

  socket.on('sendcmd_btn', function(data, callback) {
      exec('node producer.js', (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err)
        } else {
         // the *entire* stdout and stderr (buffered)
         console.log(`stdout: ${stdout}`);
         if (stderr) {
           //socket.emit('webcmd_out', `stderr: ${stderr}`);
         }
        }
      });
  })

});




server.listen(3333, () => {
  console.log('listening on *:3333');
});