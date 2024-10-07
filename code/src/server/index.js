import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Queue } from './queue.js';
import { resolve, basename } from 'path';
import {ChartJSNodeCanvas} from 'chartjs-node-canvas';
import { totalNumPerPeriod, addVideos, addText, addVideosStage4, generatePieChart, addShapes, replaceBoardToSockets} from "./apiHelper.js";
const app = express();
const http = createServer(app);
// import mysql from 'mysql';
// const DBHOST = '145.38.195.127';

// var db = mysql.createConnection({
//   host: DBHOST,
//   user: "remote_user",
//   password: "Wzh301712.",
//   port: 80
// });

// db.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
const monthMap = new Map([
  [1, "Jan"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Apr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Aug"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"],
  [12, "Dec"]
]);
const boardMap = new Map();
let numEnteredQueue = 0;
let numPaired = 0;
let leftInBoard = 0;
let totalLeft = 0;
boardMap.set(1, 'uXjVKtgQJ2o=');
boardMap.set(2, 'uXjVKtgQJ3A=');
boardMap.set(3, 'uXjVKtgQJzU=');
boardMap.set(4, 'uXjVKtocwpI=');
boardMap.set(5, 'uXjVKtocwqI=');
boardMap.set(6, 'uXjVKtocwqg=');
boardMap.set(7, 'uXjVKtocwrg=');
// boardMap.set(8, 'uXjVKy79p9A=');
// boardMap.set(9, 'uXjVKy7Wh-c=');
// boardMap.set(10, 'uXjVKy76meQ=');
boardMap.set(9995, 'uXjVKxCQVHY=');//9999 is for test
boardMap.set(9996, 'uXjVKxCQVHY=');//9999 is for test
boardMap.set(9997, 'uXjVKxCQVHY=');//9999 is for test
boardMap.set(9998, 'uXjVKxCQVHY=');//9999 is for test
boardMap.set(9999, 'uXjVKxCQVHY=');//9999 is for test

const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
console.log(monthMap.get(now.getMonth() + 1) +'/' + now.getDate() );
const io = new Server(http, {
    cors: {
      // origins: ['https://insights-investigation-server.onrender.com'],
      origins: ['https://145.38.195.127'],
      methods: ["GET", "POST"],
    }
});

const upload = multer({ dest: 'uploads/' }); // set up multer to handle file uploads
const uploadVideos = multer({ dest: 'videos/' });

let roomIndex = 1;
let queue = new Queue();

let roomsToFill = new Array();
//let roomIndex = 0;
//key: socket id, value: filterdata30days
const boardToSocketsMap = new Map();
const map7daysData = new Map();
//key: socket id, value: filterdata30days
const mapYesterDayData = new Map();
let socketToName = new Map();
let boardToSocketsNoDelete = new Map();
const socketToBoard = new Map();
app.use(cors());
app.use(express.static('uploads'));
app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

app.get('/api', (req, res) => {
  res.send('Welcome to the API endpoint!');
});

io.on('connection', (socket) => { 
    socket.on('disconnect', (reason) => {
      const socketId = socket.id;
      totalLeft += 1;
      
      //TODO: if a user request to fill then return, handle it here
      if (socketToBoard.has(socketId)){
        const bid = socketToBoard.get(socketId);
        removeFile(bid, socketId);
        const twoSockets = boardToSocketsNoDelete.get(bid);
        console.log("two sockets are: " + twoSockets[0] + " --------------- "+twoSockets[1]);
        if(twoSockets[0] == undefined || twoSockets[1] == undefined){
          console.log("222rooms to fill: " + roomsToFill);
          console.log("bid: " + bid)
          const i = roomsToFill.indexOf(bid);
          console.log("i is: " + i);
          if (i > -1) {
            roomsToFill.splice(i, 1);
            console.log("rooms to fill: " + roomsToFill);
          }
        }
        
        if (twoSockets[0] == socketId){
          io.to(twoSockets[1]).emit('peer left');
          boardToSocketsNoDelete.set(bid, [twoSockets[1], undefined]);
          console.table(boardToSocketsNoDelete);
          socketToBoard.delete(twoSockets[0]);
        }else{
          io.to(twoSockets[0]).emit('peer left');
          boardToSocketsNoDelete.set(bid, [twoSockets[0], undefined]);
          console.table(boardToSocketsNoDelete);
          socketToBoard.delete(twoSockets[1]);
        }
      }
    });

    socket.on('request queue info', () => {
      // Sends the length of the current queue to the client
      io.emit('queueing info', queue.getSize());
      //console.log("we have " + queue.getSize() + " users online");
    });

    socket.on('join queue', async (data) => {
      //data is an array representing a user's [user's name', user's socket id];
      numEnteredQueue += 1;
      socketToName.set(data[1], data[0]);
      //console.log("prolific Id: " + data[2] + " joined");

      //If there is a room waiting for a participant. join here.
      if(roomsToFill.length > 0){
        const board_id = roomsToFill[0];
        //roominfo:[room number, board id]
        roomsToFill.shift();
        socketToBoard.set(data[1], board_id);
        const twoSockets = boardToSocketsNoDelete.get(board_id);
        if(twoSockets[0] == data[1]){
          io.to(twoSockets[1]).emit('peer joined');
        }else{
          io.to(twoSockets[0]).emit('peer joined');
        }
        boardToSocketsNoDelete = replaceBoardToSockets(boardToSocketsNoDelete, data[1], board_id)
        io.to(data[1]).emit('pairing success', {id: board_id});
        return;
      }

      queue.enqueue(data);

      //This IF is used to assign people into pairs
      const queueSize = queue.getSize();
      if(queueSize >= 2 && queueSize % 2 == 0){
        //Send confirmation
        numPaired += 2;
        let user1 = queue.dequeue();
        let user2 = queue.dequeue();
        //Send POST request to Miro to add items to a board:
        let boardId = boardMap.get(roomIndex);
        console.log("room index is:" + roomIndex);
        console.log("board id is:" + boardId);
        console.log("num enteredQueue: " + numEnteredQueue );
        console.log("numPaired: " + numPaired);
        //9unW4gFobHlgaCxcAAAJ,     u_uk7aGFpMSVUbC7AAAH
        try{
          recordProlificID(user1,user2,boardId);
          //Put in a map that key is boardid, values are socket id of two users.
          socketToBoard.set(user1[1], boardId);
          socketToBoard.set(user2[1], boardId);
          boardToSocketsNoDelete.set(boardId, [user1[1], user2[1]])
          io.to(user1[1]).to(user2[1]).emit('pairing success', {id: boardId});
          roomIndex += 1;

        }catch(err){
          console.log(err);
          io.to(user1[1]).to(user2[1]).emit('pairing error', {id: boardId});
        }
      }
      io.emit('queueing info', queue.getSize());
    })

    socket.on('leave queue', (data) => {
      const socketToRemove = data[1];
      console.log("get leave queue");
      if (queue.getSize() > 0){
        const removeResult = queue.removeElement(socketToRemove);
        if(removeResult){
          console.log("removed" + socketToRemove);
        }else{
          console.log("remove element failure");
        }
        
      }
      io.emit('queueing info', queue.getSize());
    })
  });

function renameFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}



//This is the endpoint to receive the uploaded file
app.post('/uploadFile', upload.single('file'), async (req, res) => {
  const file = req.file;
  const socket_id = req.header("SocketId");
  const board_id = req.header("BoardId");
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
  }
  // construct the new file path
  //file name is the socket_id + .json
  const newPath = 'uploads/' + file.originalname;
  try {
    // rename the file
    await renameFile(file.path, newPath);
    
    // read the uploaded file
    const jsonData = await readJsonFile(newPath);
    const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    //const now = new Date('2024-05-20T12:00:00Z'); //This date is only used for test.
    const date7daysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7));
    const date3daysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));
    const date2daysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
    const date1daysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const dateMap = new Map();
    dateMap.set(3, date3daysAgo);
    dateMap.set(2, date2daysAgo);
    dateMap.set(1, date1daysAgo);
    // const date30daysAgo = moment().subtract(30, 'days').startOf('day').toDate();
    // const date3daysAgo = moment('2024-05-30'); //This date is only used for test;
    //const date3daysAgo = moment().subtract(3, 'days').startOf('day').toDate();
    // Filter entries in the last month;  
    const filteredData7Days = new Array();
    const dataMapByDate = new Map();

    if (jsonData !== null){
      jsonData.forEach(item => {
        const itemDate = new Date(item.time);
  
        // only google ads have a detail
        if (itemDate >= date7daysAgo && !item.details) {

          filteredData7Days.push({
            "title": item.title.replace(/^Watched\s*/, ''),
            "time": item.time,
            "video_url": item.titleUrl,
          });
        }
        if (itemDate >= date1daysAgo && !item.details) {
          if(dataMapByDate.has(1)){
            const list = dataMapByDate.get(1);
            list.push({
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            });
          }else{
            dataMapByDate.set(1, [{
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            }]);
          }
        }else if (itemDate >= date2daysAgo && !item.details) {
          if(dataMapByDate.has(2)){
            const list = dataMapByDate.get(2);
            list.push({
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            });
          }else{
            dataMapByDate.set(2, [{
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            }]);
          }
        }else if (itemDate >= date3daysAgo && !item.details) {
          if(dataMapByDate.has(3)){
            const list = dataMapByDate.get(3);
            list.push({
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            });
          }else{
            dataMapByDate.set(3, [{
              "title": item.title.replace(/^Watched\s*/, ''),
              "time": item.time,
              "video_url": item.titleUrl,
            }]);
          }
        }
      });
      if(dataMapByDate.size == 0){
        res.status(500).send('You do not have history for the last three days. This was required in the task description before you enter the task. Please return this study.');
        return;
      }
      res.status(200).send('File uploaded successfully');

      const day1VideoNumber = (dataMapByDate.get(1)?.length ?? 0);
      const day2VideoNumber = (dataMapByDate.get(2)?.length ?? 0);
      const day3VideoNumber = (dataMapByDate.get(3)?.length ?? 0);
      const maxVideos = Math.max(day1VideoNumber, day2VideoNumber, day3VideoNumber);

      if(maxVideos === day1VideoNumber){
        mapYesterDayData.set(socket_id, [1, dataMapByDate.get(1)]);
      }else if(maxVideos === day2VideoNumber){
        mapYesterDayData.set(socket_id, [2, dataMapByDate.get(2)]);
      }else{
        mapYesterDayData.set(socket_id, [3, dataMapByDate.get(3)]);
      }
      
      map7daysData.set(socket_id, filteredData7Days); 
      //console.log("filteredDataYesterday size is: " + filteredData3Days.length);
      if(boardToSocketsMap.has(board_id)){
        const existingSockets = boardToSocketsMap.get(board_id);
        const pairedSocketId = existingSockets[0];

        //await addVideos(mapYesterDayData.get(socket_id), board_id, 1);
        //await addVideos(mapYesterDayData.get(pairedSocketId), board_id, 2);
        await addVideosStage4(mapYesterDayData.get(pairedSocketId)[1], board_id, 1, mapYesterDayData.get(pairedSocketId)[0]);
        await addVideosStage4(mapYesterDayData.get(socket_id)[1], board_id, 2, mapYesterDayData.get(socket_id)[0]);
        
        //User1 is yellow, User2 is gray
        //Stage 2
        addText(board_id, -44300, -8200, socketToName.get(pairedSocketId), 1000);    
        addText(board_id, -35000, -8200, socketToName.get(socket_id), 1000);
        //stage 3
        const date1 = dateMap.get(mapYesterDayData.get(socket_id)[0]);
        const date2 = dateMap.get(mapYesterDayData.get(pairedSocketId)[0]);
        addText(board_id, 39000, 25000, socketToName.get(socket_id) + "\n" + date1.getUTCDate() + '.' + monthMap.get((date1.getMonth() + 1)), 1200);
        addText(board_id, 39000, 37000, socketToName.get(pairedSocketId) + "\n" + date2.getUTCDate() + '.' + monthMap.get((date2.getMonth() + 1)), 1200);
        await addBarChart(board_id, pairedSocketId, socket_id);
        //addText(board_id,-45000, 30000,"Move me and the gray rectangle away to see your real data", 2000);
        boardToSocketsMap.delete(board_id);
      }else{
        const socketPairs = new Array(socket_id, undefined);
        boardToSocketsMap.set(board_id, socketPairs);
      }
    }
    else{
      console.log("file: " + file.originalname + " is not correct so the user is denied");
      res.status(500).send('The file you uploaded is not correct, please find the "watch-history.json" file. If you can not find it, you may return the study.');
    }

  } catch (err) {
    console.error('caught the error');
    console.error(err);
    //res.status(500).send('The file you uploaded is not correct, please find the "watch-history.json" file. If you can not find it, you may return the study.');
    //res.status(500).send('Error occurred while processing the file');
  }
});

// app.post('/removeFile',async(req)=>{
//   const board_id = req.header("BoardId");
//   const socketLeft = req.header("SocketId");
//   removeFile(board_id, socketLeft);

// })

function removeFile(board_id, socketLeft){
  console.log("running remove file");
  if(boardToSocketsMap.has(board_id)){
    const list = boardToSocketsMap.get(board_id);
    const i = list.indexOf(socketLeft);
    if (i > -1) { // only splice array when item is found
      list.splice(i, 1); // 2nd parameter means remove one item only
    }

    boardToSocketsMap.set(board_id, list);
    if (Array.isArray(list) && list.every(element => element === undefined)) {
      // If the condition is met, remove the key from the map
      boardToSocketsMap.delete(board_id);
    } 

    

    console.log("-----boardToSocketsMap:");
    console.table(boardToSocketsMap);
  }
}
//This is the endpoint to receive the uploaded video
app.post('/uploadVideo', uploadVideos.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded.');
  }
  const targetPath = 'videos/' + req.file.originalname;
  try {
    await renameFile(req.file.path, targetPath);
    console.log("video uploaded" + req.file.originalname);
    res.send('video uploaded successfully');
  } catch (err) {
    console.error(err);
    res.status = 500;
    res.send('Error occurred while processing the file');
  }
});

app.post('/replace',async(req)=>{
  
  leftInBoard += 1;
  console.log("number of people who left in board: " + leftInBoard);
  console.log('Left while waiting:' + (totalLeft - leftInBoard));
  const board_id = req.header("BoardId");
  //If there is one person in queue
  if(queue.getSize() > 0){
    const user = queue.dequeue();
    socketToBoard.set(user[1], board_id);
    boardToSocketsNoDelete = replaceBoardToSockets(boardToSocketsNoDelete, user[1], board_id);
    io.to(user[1]).emit('pairing success', {id: board_id});
  }else{
    //If there is no person in queue
    roomsToFill.push(board_id);
  }
})


async function generateBarChart(name1, name2, filteredDataByUser) {
  try {
      // filteredDataByUser is a map {key: user name, value: 30 days data of the user, user's name}
      // 创建折线图配置
      const config = totalNumPerPeriod(filteredDataByUser);
      // 创建 CanvasRenderService 实例
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1000, height: 800 });
      
      // 生成图表
      const buffer = await chartJSNodeCanvas.renderToBuffer(config);
      const fileName = `./charts/BarChart_${name1}_${name2}.png`;

      // 将图表保存为图片文件
      fs.writeFileSync(fileName, buffer);

      console.log('Bar chart generated successfully.');
      return fileName;

  } catch (error) {
    console.log("filteredDataByUser in generate bar chart:" + JSON.stringify(filteredDataByUser));
      console.error('An error occurred while generating the bar chart:', error);
  }
}

async function addBarChart(boardId, user1Socket, user2Socket) {
  //const filtered_data = await filterData(historyJson, 4);
  try {
    
    const dataUser1 = map7daysData.get(user1Socket);
    const dataUser2 = map7daysData.get(user2Socket);
    const filteredDataByUser = new Map();
    console.log("name1: " + socketToName.get(user1Socket));
    console.log("name2: " + socketToName.get(user2Socket));
    filteredDataByUser.set(socketToName.get(user1Socket), dataUser1);
    filteredDataByUser.set(socketToName.get(user2Socket), dataUser2);

    var fileName = await generateBarChart(socketToName.get(user1Socket), socketToName.get(user2Socket), filteredDataByUser);
    
    fileName = resolve(fileName);
    const form = new FormData();
    // Use blobFrom to read the file and convert it to a Blob
    const fileBuffer = await fs.promises.readFile(fileName);

    // Create a Blob from the buffer
    const fileBlob = new Blob([fileBuffer]);
    form.append("resource", fileBlob, basename(fileName));
    form.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            title: "Total number of videos viewed in each time period over the past four weeks",
            position: {
              x: -43000,
              y: 31500,
            },
            geometry: {
              width: 31000,
              rotation: 0,
            },
          }),
        ],
        { type: "application/json" }
      )
    );

    const res = await fetch(`https://api.miro.com/v2/boards/${boardId}/images`, {
      method: "POST",
      body: form,
      headers: {
        Authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA',
      },
    });
    
    await addShapes(boardId, -44000, 30000, 27500, 38000, "round_rectangle");
    //addText(boardId,-45000, 30000,"Move me and the gray rectangle away to see your real data", 2000);
    // addText(boardId,-23000, -17000, nameToSocket.get(user2Socket), 800);
  } catch (error) {
      console.error(error);
  }
}
// function addDatesStage2(boardId){
//   const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
//   //const now = new Date('2024-05-20T12:00:00Z'); //This date is only used for test;
//   const day1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
//   const day2 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
//   const day3 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));
//   addText(boardId, 22000, 4000, day1.toISOString().split('T')[0], 800);
//   addText(boardId, 22000, -4000, day2.toISOString().split('T')[0], 800);
//   addText(boardId, 22000, -12000, day3.toISOString().split('T')[0], 800);
// }

function recordProlificID(user1, user2, boardID){
  const data = [
    [user1[2], user1[0], boardID ],
    [user2[2], user2[0], boardID],
    // add more pairs as needed
  ];
  
  data.forEach(pair => {
    const [userName, prolificID] = pair;
    const dataToWrite = `${prolificID}: ${userName} -- ${boardID}\n`;
  
    fs.appendFile('idToName.txt', dataToWrite, (err) => {
      if (err) throw err;
      //console.log(`The data for ${userName} was appended to file!`);
    });
  });
}

async function addPieChart(boardId, userSocket, place) {
  //throw new Error("manual error");
  //const filtered_data = await filterData(historyJson, 4);
  var xPos = -50000;
  var yPos = -3800;
  try {
    var videos = map7daysData.get(userSocket);
    
    var fileName = await generatePieChart(socketToName.get(userSocket), videos);
    
    fileName = resolve(fileName);
    const form = new FormData();
    // Use blobFrom to read the file and convert it to a Blob
    const fileBuffer = await fs.promises.readFile(fileName);
    if (place == 2){
      xPos = -32000;
    }
    // Create a Blob from the buffer
    const fileBlob = new Blob([fileBuffer]);
    form.append("resource", fileBlob, basename(fileName));
    form.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            title: "Percentage of videos watched over the past four weeks",
            position: {
              x: xPos,
              y: yPos,
            },
            geometry: {
              width: 11439,
            },
          }),
        ],
        { type: "application/json" }
      )
    );

    const res = await fetch(`https://api.miro.com/v2/boards/${boardId}/images`, {
      method: "POST",
      body: form,
      headers: {
        Authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA',
      },
    });
    // console.log('res of uploading pie charts:' + JSON.stringify(res));
    // console.log(res.status);
    // console.log(await res.json());
    // console.log("context: " + await res.context.json());
    addShapes(boardId, xPos, yPos, 8500, 8500, 'circle');
  } catch (error) {
    console.error("videos in add piechart:" + videos);
      console.error(error);
  }
}
async function readJsonFile(newPath) {
  try {
      const data = await fs.promises.readFile(newPath, 'utf8');
      const jsonData = JSON.parse(data);
      return jsonData; // Return the parsed JSON data
  } catch (error) {
      console.error("Error reading or parsing file:", error.message);
      return null; // Return null if there is an error
  }
}


http.listen(3000, () => {
  console.log('listening http on *:3000');
});