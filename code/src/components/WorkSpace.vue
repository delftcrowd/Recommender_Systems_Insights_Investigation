<template>
    <!-- <div class="icon-name1">
      <div class="iconImg1" style="height:40px;width:40px;"></div>
      <h1 class="site-name1">Website Name</h1>
    </div> -->
    <iframe v-if="isRecording" class="miroBoard" width="82%" height="100%" :src="miroSrc" allow="camera; microphone;"></iframe>



    <div v-if="!isRecording && !ending" class="task-intro">
        <p v-if="!isRecording && !ending" class="intro-title">You have been successfully paired with another participant!</p>
        <p v-if="!isRecording && !ending " class="intro-content"><br>Now start recording your screen</p>
        <p v-if="!isRecording && !ending" class="intro-content">1.Click the "Start Recording" button below <br> 2.Select Window<br> 3.Select Insights - the browser you are using.<br>4.Click share</p>
        <p v-if="!isRecording && !ending" class="intro-attention">Please don't refresh the page!<br>Sharing a wrong screen will lead to rejection!</p>
        <button v-if="!isRecording && !ending" @click="startRecording" class="startRecording">Start Recording</button>
    </div>

    <div v-if="isRecording" class="task-intro2">
      <p v-if="isRecording" class="uploadTitle">1.<u>Enter the task:</u> Click the "<u>See the board button</u>" on the right side to enter the main task</p>
      <p v-if="isRecording" class="enjoy">2.<u>Upload data:</u> In stage 0, check your email and upload your YouTube Watch history here</p>
      <button v-if="isRecording" :disabled="fileUploaded" class="uploadButton" @click="showPopup = true">Upload file</button>
        <p v-if="isRecording" class="uploadTitle"><br>3. <u>To complete</u>: summarize your findings to receive the <u>completion code!</u></p>
        <textarea v-if="isRecording" v-model="userInput" class="styled-input" placeholder="List the factors you found that influence your decision to watch a video.(Minimum 20 words)"></textarea>
        <!-- <p class="intro-content">You can chat with your partner at any time during the process.</p> -->
        
        <p v-if="isRecording" class="intro-attention">Don't refresh the page!<br>Don't stop sharing during the process.</p>
      
        

        <button v-if="isRecording" :disabled="hasInput" @click="completeTask" class="completeTask">Complete</button>

    </div>
    <div class="task-intro" v-if="ending">
        <p v-if="ending" class="finish-title">Thanks for your participation!</p>
        <p v-if="ending" class="intro-content"> You have successfully finished all the tasks, the Completion codes for Prolific is:  {{ VITE_COMPLETION_CODE }}</p>
        <p v-if="ending" class="intro-content"> We hope that we have helped you better understand your own watching habits and you may now close the website.</p>
        <p v-if="ending" class="intro-attention">We sincerely wish you have a good day!</p>
    </div>


    
    <div v-if="showPopup" class="uploadPopup">
          <UploadFile :boardId="boardId" @uploadSuccess="handleUploadSuccess" @close="closeUpload"/>
    </div>
    <div v-if="completeWindow" class="completeWindow">
        <p class="windowQuestion">Are you confirmed that you have already completed the tasks on the board in good faith? We manually check your works and <u>irresponsible submission leads to rejection</u>. </p>
        <p v-if="videoMessage" class="uploadingVideo">We are uploading the recordings, it may take several minutes and please don't close the website yet. You will be directed to the completion code after it is done. We appreciate your patience.</p>
        <div class="windowButtons">
            <button :disabled="videoMessage" @click="ifCompleteTask(true)" class="ifCompleteButton">Yes</button>
            <button :disabled="videoMessage" @click="ifCompleteTask(false)" class="ifCompleteButton">No</button>
        </div>
    </div>
    <div v-if="peerLeft & !completeWindow" class="completeWindow">
        <p class="windowQuestion">We are very sorry to inform you that your teammate has left, you may choose to return this study or go back to the waiting room.</p>
        <div class="windowButtons">
            <button :disabled="videoMessage" @click="returnStudy()" class="ifCompleteButton">Return Study</button>
            <button :disabled="videoMessage" @click="findReplacement()" class="ifCompleteButton">Get me a new teammate</button>
            <button :disabled="videoMessage" @click="closePeerLeft()" class="ifCompleteButton">Click me if you have finished the tasks with your teammate</button>
        </div>
    </div>
    <div v-if="peerJoined" class="completeWindow">
        <p class="windowQuestion">We have found another participant for you and it may takes him/she about five minutes before joining you in the video call.</p>
        <div class="windowButtons">
            <button :disabled="videoMessage" @click="closePeerJoin()" class="ifCompleteButton">Back to the task</button>
        </div>
    </div>
    <div v-if="attention" class="completeWindow">
        <p class="windowQuestion">Are you still with us?</p>
        <div class="windowButtons">
            <button @click="attentionCheck(true)" class="ifCompleteButton">Yes</button>
            <button @click="attentionCheck(false)" class="ifCompleteButton">No</button>
        </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted} from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import axios from 'axios';
import UploadFile from './UploadFile.vue';
import { useStore } from 'vuex';


let mediaRecorder;
let recordedChunks = ref([]);
let combinedStream;
export default {
  components: {
    UploadFile
  },
  setup() {
    const route = useRoute();
    const roomNumber = route.params.roomNumber;
    const boardId = route.params.id;
    console.log("board id is:------" + boardId);
    //const boardId = "uXjVNqx65Fg=";
    const miroSrc = "https://miro.com/app/live-embed/" + boardId +"/?moveToViewport=-251095,-28633,93349,70494&embedId=731973859105";
    const completeWindow = ref(false);
    const showPopup = ref(false);
    const showMiroBoard = ref(false);
    const isRecording = ref(false);
    const finalStage = ref(false);
    const firstTwoStages = ref(false);
    const stageName = ref("Stage 1");
    const stageGuidance = ref("Miro board guide:<br> 2.Hold right mouse to move the board<br> 3.Double click the chart to fill in the numbers and press enter to save.<br>4.You can change the color of an item by clicking an item and choose set color and opacity");
    const userInput = ref("");
    const ending = ref(false);
    const talkGuidance = ref(true);
    const fileUploaded = ref(false);
    const videoMessage = ref(false);
    const store = useStore();
    const peerJoined = ref(false);
    const VITE_COMPLETION_CODE = ref();
    //const router = useRouter();
    const attention = ref(false);
    let socket;
    let timer;
    
    const peerLeft = ref(false);
    let routeWarning = true;
    //ul5wQs6igenKpn2AAAAV   qMtW9gQE40x4c7NJAAAX
    onBeforeRouteLeave((to, from, next) => {
      console.log("route warning: " + routeWarning);

      if (confirm('If you leave, you will not be able to come back again and your submission will be returned!')) {
        //removeUploadedFile(boardId);
        socket.disconnect();
        //findReplacement();
        next();
      } else {
        next(false);
      }
      

    });

    onMounted(()=>{
      window.addEventListener('beforeunload', handleBeforeUnload);
      timer = setTimeout(check, 3 * 60 * 1000);
      console.log("board id in mounted is: " + boardId);
      VITE_COMPLETION_CODE.value = import.meta.env.VITE_COMPLETION_CODE;
      socket = store.state.socket;
      console.log("socket id:" + socket.id);
      socket.on('peer left', () => {
        console.log("get peer left noti");
        peerLeft.value = true;
        //fileUploaded.value = false;
        clearTimeout(timer);
      });
      socket.on('peer joined', () => {
        console.log("get peer joined noti");
        peerJoined.value = true;
      });
    })

    onUnmounted(() =>{
      //removeUploadedFile(boardId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    })

    const ifStartRecording = async() => {
      try {
        
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true});
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const streams = [displayStream, audioStream];
        combinedStream = new MediaStream();
        console.log("displayStream tracks:" + displayStream.getTracks());
        console.log("audioStream tracks:" + audioStream.getTracks());
        displayStream.getTracks().forEach(track => {
          console.log(JSON.stringify(track));
          combinedStream.addTrack(track);
        });

      // Add all tracks from the audio stream to the combined stream
        audioStream.getTracks().forEach(track => {
          console.log(track);
          combinedStream.addTrack(track);
        });

        // streams.forEach(stream => {
        //   stream.getTracks().forEach(track => {
        //     combinedStream.addTrack(track);
        //   });
        // });
        mediaRecorder = new MediaRecorder(combinedStream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        showMiroBoard.value = true;
        isRecording.value = true;
        firstTwoStages.value = true;
        clearTimeout(timer);
      } catch (err) {
        console.error('Error accessing screen or audio:', err);
      }
    }
  
  const closePeerJoin = () =>{
    peerJoined.value = false;
  }
  const closePeerLeft = () =>{
    peerLeft.value = false;
  }
  const handleBeforeUnload = (event) => {
    if(routeWarning){
      event.preventDefault();
    }
    
  };
  const returnStudy = () => {
    //window.location.href = 'https://www.google.com';
    window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
  };
  const check = () => {
      timer = setTimeout(closeAttention, 15 * 1000);
      routeWarning = false;
      attention.value = true;
  };

  const closeAttention = () => {

    attention.value = false;
    timer = setTimeout(finalCheck, 1 * 60 * 1000);
      
  };

  const finalCheck = () => {
      timer = setTimeout(returnStudy, 15 * 1000);
      routeWarning = false;
      attention.value = true;
  };

  const attentionCheck = (confirmed) => {
    //timer = setTimeout(check, 30 * 1000);
      // 5 seconds for test
    if (confirmed) {
        attention.value = false;
        clearTimeout(timer);
        timer = setTimeout(closeAttention, 1 * 60 * 1000); 
        routeWarning = true;
    }else {
        attention.value = false;
        //window.location.href = 'https://www.google.com';
        window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
    }
  };

  // const backToWaiting = () => {
  //   routeWarning = false;
  //   router.push({ name: 'Home'});
  // };
  
  const handleUploadSuccess = () => {
      fileUploaded.value = true;
  };

  // const removeUploadedFile = (boardId) => {
  //   console.log("running remove file");
  //   const config = {
  //     headers: {
  //       'BoardId': boardId,
  //       'SocketId' : socket.id
  //     }
  //   };
  //   //axios.post('https://145.38.195.127/removeFile', {}, config)
  //   axios.post('http://localhost:3000/removeFile', {}, config)
  //     .then((response) => {
  //       console.log("response is:" + response.data);
  //       console.log("status is:" + response.status);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const findReplacement = () => {
    console.log("running findReplacement");
    const config = {
      headers: {
        'BoardId': boardId,
        'RoomIndex': roomNumber
      }
    };
    //axios.post('https://145.38.195.127/replace', {}, config)
    axios.post('http://localhost:3000/replace', {}, config)
      .then((response) => {
        console.log("response is:" + response.data);
        console.log("status is:" + response.status);
      })
      .catch((error) => {
        console.log(error);
      });
    peerLeft.value = false;
  };

    function handleDataAvailable(event) {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data); // 将录制的数据片段存储到数组中
      }
    };
    // const handleBeforeUnload = (event) => {
    //     console.log("beforeunload event in work space triggered");
    //     store.dispatch('denyHomeAccess');
    // };
    const closeUpload = () => {
      console.log("popup close in workspace");
      showPopup.value = false;
    }
    function ifStopRecording() {
        
        mediaRecorder.stop();
        combinedStream.getTracks().forEach(track => track.stop());
        
    };
    //The function is used to download video at the browser.
    // function saveRecording() {
    //     mediaRecorder.stream.getTracks().forEach(track => track.stop()); // 停止媒体流上的所有轨道
    //     mediaRecorder = null;

    //     setTimeout(() => {
    //         const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         document.body.appendChild(a);
    //         a.href = url;
    //         a.style.display = 'none';
    //         a.download = boardId + '.mp4';
    //         a.click();
    //         window.URL.revokeObjectURL(url);
    //     }, 1000);
    // };



    function uploadVideoToServer() {
        setTimeout(() => {
            const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
            const formData = new FormData();
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            formData.append('video', blob, `${boardId} - ${socket.id}.mp4`);
            videoMessage.value = true;
            axios.post('http://localhost:3000/uploadVideo', formData, config)
            //axios.post('https://145.38.195.127/uploadVideo', formData, config)
                .then(response => {
                    console.log('Video saved successfully:', response.data);
                    completeWindow.value = false;
                    finalStage.value = false;
                    isRecording.value = false;
                    ending.value = true;
                })
                .catch(error => {
                    console.error('Error saving video:', error);
                    completeWindow.value = false;
                    finalStage.value = false;
                    isRecording.value = false;
                    ending.value = true;
                });
        },5000);
    }

    function completeStage(){
        if (stageName.value == "Stage 1"){
            stageName.value = "Stage 2";
            talkGuidance.value = false;
        }else{
            stageName.value = "Stage 3";
            finalStage.value = true;
            firstTwoStages.value = false;
        }
        
        userInput.value = "";
    }

    const startRecording = () => {
        ifStartRecording();
    };

    const completeTask = () => {
        completeWindow.value = true;
    };

    const ifCompleteTask = async (confirmed) => {
        if (confirmed) {
            ifStopRecording();
            //saveRecording();
            videoMessage.value = true;
            uploadVideoToServer();
        } else {
            completeWindow.value = false;
        }
    };
    
    const hasInput = computed(() => {
        return userInput.value.trim().length <= 50;
    });

    return {
        showPopup,
        roomNumber,
        miroSrc,
        peerLeft,
        attention,
        completeTask,
        VITE_COMPLETION_CODE,
        completeWindow,
        ifCompleteTask,
        showMiroBoard,
        startRecording,
        attentionCheck,
        videoMessage,
        handleUploadSuccess,
        isRecording,
        stageGuidance,
        closeUpload,
        stageName,
        userInput,
        hasInput,
        talkGuidance,
        completeStage,
        firstTwoStages,
        finalStage,
        ending,
        fileUploaded,
        boardId,
        peerJoined,
        returnStudy,
        findReplacement,
        closePeerJoin,
        closePeerLeft

    }
  },


};


</script>

<style>
h1, h2, h3, h4, h5, h6, p, span, label{
  color: rgb(54,53,49);
}
html {
overflow:scroll;

}
.styled-input {
  width: 100%;
  height: 140px;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.styled-input:focus {
  border-color: #4CAF50;
}
.miroBoard {
    position: absolute;
    bottom: 0;
    right: 0;
}
.roomNumber {
    position: absolute;
    left: 3%;
    top: 5%;
    font-size: 23px;
    font-weight: 500;
}
.task-intro {
    width: 16%;
    position: absolute;
    left: 1%;
    margin-top: -20%;

}
.task-intro2 {
    width: 15%;
    position: absolute;
    left: 1%;
    margin-top: -21%;
}
.startRecording {
    /* position: absolute; */
    margin-top: 10%;
    margin-left: 25%;
    transform: scale(1.1);
}
.intro-title {
    position: relative;
    font-size: 23px;
    margin-bottom: 5px;
    margin-top: -10%;
}
.finish-title {
    position: relative;
    font-size: 23px;
    font-weight: bold;
    margin-bottom: 5px;
}
.intro-content {
    font-size: 15px;
    margin-top: 10px;
}
.video-chat {
    font-size: 18px;
    margin-top: 10px;
    color: rgb(216, 55, 27);
}
.intro-attention {
    font-size: 15px;
    margin-top: 10px;
    font-weight: bold;
    color: rgb(216, 55, 27);
}

.enjoy {
    position: relative;
    margin-top:5%;
    font-size: 20px;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    /* text-align: center; */
}
.uploadTitle {
    position: relative;
    font-size: 20px;
    top: 0%;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    /* text-align: center; */
}
.completeTask {
    position: absolute;
    margin-top: 30px;
    left: 30%;
    transform: scale(1.3);
}
.uploadButton {
    position: relative;
    margin-bottom: 2%;
    left: 5%;
    transform: scale(1.3);
}
.completeWindow {
    z-index: 1;
    background-color: rgb(236, 231, 224);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #ffffff;
    /* margin: 320px auto; */
    backdrop-filter: blur(3px) brightness(95%);
    box-shadow: 10px 10px 30px #636466;
    position: fixed;
    top: 53%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 45%;
    height: 50%;
    display: flow-root;
}

.uploadPopup {
  position: relative;
  z-index: 1;
  background-color: rgb(236, 231, 224);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ffffff;
  backdrop-filter: blur(3px) brightness(95%);
  box-shadow: 10px 10px 30px #636466;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 50%;
  display: flow-root;
    
}
.windowQuestion {
    margin: 30px auto;
    font-size: 18px;
    /* text-align: center; */
}
.uploadingVideo {
    margin: 30px auto;
    font-size: 18px;
    /* text-align: center; */
    color: #4CAF50;
}
.windowButtons {
  margin-top: 30px;
  /* margin-left: 40%; */
  display: flex;
  justify-content: center;
}
.ifCompleteButton {
  width: 30%;
  font-size: 18px;
  margin: 10px auto;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
</style>