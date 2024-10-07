import axios from 'axios';
import {categorizeActivities, stage4CategorizeActivities} from './items.js';
import fs from 'fs';
import {ChartJSNodeCanvas} from 'chartjs-node-canvas';
// import Chart from 'chart.js/auto/auto.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.register(ChartDataLabels);
const videoStripeHeight = 3700;
const videoStripeWidth = 2720;
const YOUTUBE_API_KEY = 'AIzaSyCy4_hVAmS_nTbSxcwZOyjJFJZJYLHlLVs';
const categoryMap = {
  '1': 'Movie & Media', '2': 'Lifestyle & Hobbies',
  '10': 'Music & Performing Arts', '15': 'Lifestyle & Hobbies',
  '17': 'Movie & Media', '18': 'Movie & Media',
  '19': 'Lifestyle & Hobbies', '20': 'Lifestyle & Hobbies',
  '21': 'Lifestyle & Hobbies', '22': 'Lifestyle & Hobbies',
  '23': 'Music & Performing Arts', '24': 'Movie & Media',
  '25': 'News & Politics', '26': 'Lifestyle & Hobbies',
  '27': 'Lifestyle & Hobbies', '28': 'Science & Technology',
  '29': 'News & Politics', '30': 'Movie & Media',
  '31': 'Movie & Media', '32': 'Movie & Media',
  '33': 'Movie & Media', '34': 'Movie & Media',
  '35': 'Movie & Media', '36': 'Movie & Media',
  '37': 'Movie & Media', '38': 'Movie & Media',
  '39': 'Movie & Media', '40': 'Movie & Media',
  '41': 'Movie & Media', '42': 'Movie & Media',
  '43': 'Movie & Media', '44': 'Movie & Media',
  '45': 'Movie & Media'
};
function createBoard(id1, id2){
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        url: 'https://api.miro.com/v2/boards',
        headers: {accept: 'application/json', 'content-type': 'application/json',
        authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'},
        data: {teamId: '3458764574642707913', description: 'hhh', name: 'board ' + id1 + " " + id2},     
      };
      axios.request(options).then(function(response){
        resolve(response.data.id);
      }).catch(function (error) {
        console.log(error);
        reject(error);
      });
    })
}

function copyBoard(id1, id2){
  return new Promise((resolve, reject) => {
    const options = {
      method: 'PUT',
      url: 'https://api.miro.com/v2/boards?copy_from=uXjVK66HbKU=',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'
      },
      data: {
        teamId: '3458764592365050267',
        description: 'hhh',
        name: 'W_board' + id1 + id2,
        policy: {
          // permissionsPolicy: {
          //   "collaborationToolsStartAccess": "all_editors"
          // },
          sharingPolicy: {
            access: 'edit',
            inviteToAccountAndBoardLinkAccess: 'editor'
          }
        }
      }
    };

    axios.request(options).then(function(response) {
      resolve(response.data.id);
    }).catch(function(error) {
      console.log(error);
      reject(error);
    });
  });
}

async function addVideos(data, boardId, userGroup) {

  if(data === undefined){
    throw new Error("data in addVideos is undefined");
  }
  const categorizedData = categorizeActivities(data, userGroup);
  //categorizedData is a map with key being time periods, value being videos
  //addVideosStage3(categorizedData, boardId, userGroup);
  const allVideos = [];
  
  for (const category in categorizedData) {
      if (Object.hasOwn(categorizedData, category)) {
          allVideos.push(...categorizedData[category]);
      }
  }
  //console.log("first video is:" + allVideos[0]);
  const groupedData = [];
  const numGroups = Math.ceil(allVideos.length / 10);

  for (let i = 0; i < numGroups; i++) {
      groupedData.push(allVideos.slice(i * 10, (i + 1) * 10));
  }

  // Send requests
  const token = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'; 
  //console.log("first video in grouped data is:" + groupedData[0]);
  for (const group of groupedData) {
    const items = group.flatMap(videoText => [
        {
            type: 'shape',
            data:{
              content:videoText.title + '<br>' + videoText.hour + ':'+ videoText.minute,
              shape: 'round_rectangle'
            },
            style: {
                textAlign: 'center',
                color: '#FF5733',
                fontSize: '288',
                borderColor: '#1a1a1a',
                borderWidth: '24',
            },
            position: {
                x: videoText.shapeX,
                y: videoText.shapeY
            },
            geometry: {height: videoStripeHeight, width: videoStripeWidth}
        },  
    ]);
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify(items)
    };

    try {
        const response = await fetch(`https://api.miro.com/v2/boards/${boardId}/items/bulk`, options);
        const responseData = await response.json();
        
    } catch (err) {
        console.error(err);
    }
}
}

async function addVideosStage4(data, boardId, userGroup, day) {

  if(data === undefined){
    throw new Error("data in addVideos is undefined");
  }
  const categorizedData = stage4CategorizeActivities(data, userGroup, day);
  //categorizedData is a map with key being time periods, value being videos
  //addVideosStage3(categorizedData, boardId, userGroup);
  const allVideos = [];
  
  for (const category in categorizedData) {
      if (Object.hasOwn(categorizedData, category)) {
          allVideos.push(...categorizedData[category]);
      }
  }
  //console.log("first video is:" + allVideos[0]);
  const groupedData = [];
  const numGroups = Math.ceil(allVideos.length / 10);

  for (let i = 0; i < numGroups; i++) {
      groupedData.push(allVideos.slice(i * 10, (i + 1) * 10));
  }

  // Send requests
  const token = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'; 
  //console.log("first video in grouped data is:" + groupedData[0]);
  for (const group of groupedData) {
    const items = group.flatMap(videoText => [
        {
            type: 'shape',
            data:{
              content:videoText.title + '<br>' + videoText.hour + ':'+ videoText.minute,
              shape: 'round_rectangle'
            },
            style: {
                textAlign: 'center',
                color: '#000000',
                fontSize: '288',
                borderColor: '#1a1a1a',
                borderWidth: '24',
            },
            position: {
                x: videoText.shapeX,
                y: videoText.shapeY
            },
            geometry: {height: videoStripeHeight, width: videoStripeWidth}
        },  
    ]);
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify(items)
    };

    try {
        const response = await fetch(`https://api.miro.com/v2/boards/${boardId}/items/bulk`, options);
        const responseData = await response.json();
        
    } catch (err) {
        console.error(err);
    }
}
}


function createLegend(boardId, name1, name2){
    const options = {
        method: 'POST',
        headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'},
        body: JSON.stringify({data: {content: "<p><em>" + name1 + ": Blue</em></p><p><em>" + name2 + ": Red</em></p>"}, style: {fontSize: '600'}})
      };
      fetch('https://api.miro.com/v2/boards/' + boardId + '/texts', options)
        .then(response => response.json())
        .catch(err => console.error(err));
}

function addText(boardId, xPos, yPos, text, size){
  const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'},
      body: JSON.stringify({
        data: {content: "<p><em>" + text + "</em></p>"}, 
        style: {fontSize: size},
        position:{x: xPos, y: yPos}}
      )
    };
    fetch('https://api.miro.com/v2/boards/' + boardId + '/texts', options)
      .then(response => response.json())
      .catch(err => console.error(err));
}

function groupVideosByTime (data) {
    const timeGroups = {
        Morning: [],
        Afternoon: [],
        Dinnertime: [],
        LateNight: [],
        Midnight:[]
      };
      data.forEach(item => {
        const time = item['time'];
        const hour = new Date(time).getHours();
    
        if (hour >= 6 && hour < 12.5) {
          timeGroups.Morning.push(item);
        } else if (hour >= 12.5 && hour < 18) {
          timeGroups.Afternoon.push(item);
        } else if (hour >= 18 && hour < 21.5) {
          timeGroups.Dinnertime.push(item);
        } else if (hour >= 21.5 && hour < 24) {
          timeGroups.LateNight.push(item);
        } else {
          timeGroups.Midnight.push(item);
        }
      });
      return timeGroups;
}
function totalNumPerPeriod (filteredDataByUser) {
    // filteredDataByUser is a map {key: user name, value: 30 days data of the user, user's name}
    const labels = ['Midnight', 'Morning', 'Afternoon', 'Dinnertime', 'LateNight'];
    const datasets = [];
    const colors = ['rgba(250,199,16,255)', 'rgba(134,133,133,255)'];
    let colorIndex = 0;
    //console.log("filteredDataByUser in totalNumPerPeriod: " + filteredDataByUser );

    filteredDataByUser.forEach((data, userName) => {
      const timeGroups = groupVideosByTime(data);
      const counts = labels.map(label => timeGroups[label] ? timeGroups[label].length / 7 : 0);
      datasets.push({
        label: userName,
        data: counts,
        backgroundColor: colors[colorIndex % colors.length],
        borderColor: colors[colorIndex % colors.length],
        borderWidth: 1
      });
  
      colorIndex++;
    });
  
    const config = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        scales: {
          x: {
            ticks: {
              font: {
                size: 25
              }
            }
          },
          y: {
            max: 8, // set your desired maximum value here
            ticks: {
              font: {
                size: 25
              },
              stepSize: 2, // set your desired interval here
              beginAtZero: true 
            },
          }
        }
      }
    };
  
    return config;
  
}
async function addShapes(boardId, xPos, yPos, height, width, shape){
      const shapeOptions = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'
      },
      body: JSON.stringify({
        data: {content: 'Move me away to see the real data(Only after you finish guessing)', shape: shape},
        style: {fillColor: '#DDD7D7', fontSize: '288', textAlign: 'center'},
        position: {x: xPos, y: yPos},
        geometry: {height: height, width: width}
      })
    };
    fetch(`https://api.miro.com/v2/boards/${boardId}/shapes`, shapeOptions)
    .then(response => response.json())
    .catch(err => console.error(err));
}
function extractVideoId(url) {
  // Decode Unicode escape sequences
  const decodedUrl = decodeURIComponent(url);
  const match = decodedUrl.match(/v=([^&]+)/);
  return match ? match[1] : null;
}

// Fetch video details using the YouTube Data API
function splitArrayIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Updated getVideoDetails function
async function getVideoDetails(videoIds) {
  const chunkSize = 50; // You can adjust the chunk size as needed
  const videoIdChunks = splitArrayIntoChunks(videoIds, chunkSize);
  const allVideoDetails = [];

  for (const chunk of videoIdChunks) {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;

      try {
          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
              throw new Error(`Error fetching video details: ${data.error.message}`);
          }

          allVideoDetails.push(...data.items);
      } catch (error) {
          console.error('Error in getVideoDetails:', error);
      }
  }

  return allVideoDetails;
}

// Main function to process videos
async function generatePieChart(name, videos) {

  try{
      const videoIds = videos.map(video => extractVideoId(video.video_url)).filter(id => id);
      const videoDetails = await getVideoDetails(videoIds);
      const categoriesCount = {
        'Movie & Media': 0,
        'Lifestyle & Hobbies': 0,
        'News & Politics': 0,
        'Music & Performing Arts': 0,
        'Science & Technology': 0
      };
      videoDetails.forEach(item => {
        const categoryId = item.snippet.categoryId;
        const categoryName = categoryMap[categoryId] || 'Unknown';
    
        if (categoriesCount[categoryName] !== undefined) {
            categoriesCount[categoryName]++;
        }
      });
    
       // Prepare data for the pie chart
       const labels = Object.keys(categoriesCount);
       const data = Object.values(categoriesCount);
    
       // Generate pie chart configuration
       //science: dark blue, movie:sky blue, music: black, lifestyle:green, news:orange
       //music: #434348(Black), movie:#7cb5ec(Light Blue), science:#8085e9(dark blue), lifestyle: #90ed7d(green), news:#f7a35c(orange)
       const config = {
           type: 'pie',
           data: {
               labels: labels,
               datasets: [{
                   data: data,
                   backgroundColor: [
                       '#7cb5ec', '#90ed7d', '#f7a35c', '#434348', '#8085e9'
                   ],
                   borderColor: '#fff',
                   borderWidth: 1
               }]
           },
           options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Video Categories Distribution for ${name}`
              },
    
            }
          },
       };
    
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });
        
        // 生成图表
        const buffer = await chartJSNodeCanvas.renderToBuffer(config);
        const fileName = `./charts/PieChart_${name}.png`;
    
        // 将图表保存为图片文件
        // fs.writeFileSync('./charts/linechart2.png', buffer);
        fs.writeFileSync(fileName, buffer);
    
        console.log('Pie chart generated successfully.');
        return fileName;
  }catch(err){
      console.log(err);
      console.log("videos are:" + videos);
  }
}

async function addVideosStage3(data, boardId, userGroup){
  //data is an array of video objects in the past three days.
  const day1AfternoonTitles = [];
  const day1DinnerTimeTitles = [];

  // Populate arrays with titles from the respective time groups
  if (data.day1Afternoon) {
      data.day1Afternoon.forEach(video => {
          day1AfternoonTitles.push(video.title);
      });
  }

  if (data.day1DinnerTime) {
      data.day1DinnerTime.forEach(video => {
          day1DinnerTimeTitles.push(video.title);
      });
  }

  const allVideoGroups = {
    day1Afternoon: day1AfternoonTitles,
    day1DinnerTime: day1DinnerTimeTitles,
  };

// Map with positions for each time group
  const user1VideoPos = {
      day1Midnight: { x: -50300, y: 64000 },//54000
      day1Morning: { x: -32300, y: 64000 },
      day1Afternoon: { x: -12800, y: 64000 },
      day1DinnerTime: { x: 5700, y: 64000 },
      day1LateNight: { x: 24000, y: 64000 }
  };
  //gap:18300
  const user2VideoPos = {
      day1Midnight: { x: -50300, y: 71000 },
      day1Morning: { x: -32300, y: 71000 },
      day1Afternoon: { x: -12800, y: 71000 },
      day1DinnerTime: { x: 5700, y: 71000 },
      day1LateNight: { x: 24000, y: 71000 }
  };
  for (let timeGroup in allVideoGroups) {
    const titleArray = allVideoGroups[timeGroup];
    if (titleArray.length > 0) {
        const numberedTitles = titleArray.map((title, index) => `${index + 1}. ${title}`);
        const combinedTitles = numberedTitles.join('<br>');
        let position;
        if(userGroup == 1){
          position = user1VideoPos[timeGroup];
        }else{
          position = user2VideoPos[timeGroup];
        }
        addTextStage3(boardId, position.x, position.y, combinedTitles, 500, 15000);
    }
  }
}

function addTextStage3(boardId, xPos, yPos, text, size, width){
  const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_LwD81Fg4Zx9XSaLsZFtZyQ4o0zA'},
      body: JSON.stringify({
        data: {content: "<p><em>" + text + "</em></p>"}, 
        style: {fontSize: size,
                textAlign: "left"
        },
        position:{x: xPos, y: yPos},
        geometry:{width:width}}
      )
    };
    fetch('https://api.miro.com/v2/boards/' + boardId + '/texts', options)
      .then(response => response.json())
      .catch(err => console.error(err));
}
function replaceBoardToSockets(boardToSocketsMap, newSocket, boardId){
  const twoSockets = boardToSocketsMap.get(boardId);
  console.log("in replace function:");
  
  if(twoSockets[0] == undefined){
    twoSockets[0] = newSocket;
  }else{
    twoSockets[1] = newSocket;
  }
  boardToSocketsMap.set(boardId, twoSockets);
  console.table(boardToSocketsMap);
  
  return boardToSocketsMap;

}
export {createBoard, copyBoard, addVideos, createLegend, totalNumPerPeriod, generatePieChart, addShapes, addText, addVideosStage4, replaceBoardToSockets}