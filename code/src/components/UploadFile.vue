<template>
    <!-- <div class="background3"></div>
    <div class="roof2">
      <button class="backToDownload" @click="backToDownload">🔙</button>
    </div>
    <div class="icon-name1">
      <div class="iconImg1" style="height:40px;width:40px;"></div>
      <h1 class="site-name1">Website Name</h1>
    </div>
    <div class="picture">
      <div class="picture1" style="height:600px;width: 600px;"></div>
    </div> -->

 

    <!-- <div class="title-container">
      <p class="uploadText1">UPLOAD YOUR</p>
      <p class="uploadText2">JSON FILE</p>
      <p class="warning1">Please open the zip file you just downloaded -> Takeout -> YouTube and YouTube Music -> history -> upload "watch-history.json".</p>
      
    </div> -->
    <p class="warning1">Please open the zip file you just downloaded -> Takeout -> YouTube and YouTube Music -> history -> upload "<span class="highlight">watch-history.json</span>".</p>

    
    <div class="upload-container">

      <p class="browse">Browse</p>
      <p class="noFile">{{ showFileName }}</p>
      
      <form ref="uploadForm" 
            enctype="multipart/form-data" 
            class="upload-form"
             
            @submit.prevent="submitFile">
            
        <input type="file" 
               name="file" 
               accept="application/json" 
               class="input-file" 
               ref="file" 
               :disabled="uploadComplete"
               @change="handleFileChange" />
        
        <!-- <button type="submit" 
                class="upload-btn" 
                :disabled="!selectedFile">Upload File</button> -->
      </form>
      <p v-if="showProgress" class="progressBar">Upload progress: {{ percent }} %</p>
      <p v-if="fileError" class="uploadError">{{errorMessage}}</p>
      <p v-if="uploadComplete" class="uploadSuccess">You have successfully uploaded your file. Now you can go back to the board.</p>
      <!-- <p class="warning">You must ensure your file is uploaded before entering the waiting room!</p> -->
      <!-- <button :disabled="!uploadComplete" @click="JumpToWait" class="jumpToWait">Enter the Waiting Room</button> -->


      <div class="button-container">
        <button @click="returnStudy" class="cancel">Return Study</button>
        <button @click="closePopup" class="cancel">Back to the board</button>
      </div>
      
      <!-- <p class="warning3">If you don't receive your data from Google in 5 minutes, you can return the study. Sorry for the time you spent and we do appreciate it.</p> -->
    </div>

    <!-- <div class="hidden">
      <p class="browse">Browse</p>
    </div> -->
</template>


<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import {useRouter} from "vue-router";
import { useStore } from 'vuex';

export default {
  emits: ['close'],  
  props: {
    boardId: {
      type: String,
      required: true
    }
  },
  setup(props, {emit}){
    console.log("props is " + JSON.stringify(props));
    const boardId = props.boardId;
    const store = useStore();
    const showProgress = ref(true);
    const percent = ref(0);
    const selectedFile = ref(null);
    const showFileName = ref('No files selected!');
    // const showFileName = 'No files selected!';
    const uploadComplete = ref(false);
    const fileError = ref(false);
    const fileSuccess = ref(false);
    const errorMessage = ref();
    console.log("socket is " + store.state.socket.id);


    function handleFileChange (event) {
      this.selectedFile = event.target.files[0];
      console.log("file name:" + selectedFile.value.name);
      
      showFileName.value = selectedFile.value ? selectedFile.value.name : "No files selected!";
      if (selectedFile.value.name !== "watch-history.json"){
        fileError.value = true;
        errorMessage.value = "You selected a wrong file, please choose watch-history.json";
        return;
      }
      //this.selectedFile = false;
      // this.showFileName = this.selectedFile ? this.selectedFile.name : "No files selected!";
      if (!this.selectedFile) {
        console.error('No file selected');
        return;
      };
      const formData = new FormData();
      const newName = store.state.socket.id + ".json";
      formData.append('file', this.selectedFile, newName);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'SocketId' : store.state.socket.id,
          'BoardId' : boardId
        },
        onUploadProgress(progressEvent) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', progress, '%');
          percent.value = progress;
        }
      };
      fileError.value = false;
      showProgress.value = true;
      axios.post('http://localhost:3000/uploadFile', formData, config)
      //axios.post('https://145.38.195.127/uploadFile', formData, config)
        .then((response) => {
          console.log("response is:" + response.data);
          console.log("status is:" + response.status);
          if(response.status == 200){
            emit('uploadSuccess');
            uploadComplete.value = true;
          }
        })
        .catch((error) => {
          console.log(error);
          showProgress.value = false;
          errorMessage.value = error.response.data;
          fileError.value = true;
        });
    }

    // function JumpToWait() {
    //   router.push({ name: 'Home'});
    // }
    const closePopup = () => {
      emit('close');
    };

    function backToDownload() {
      router.push({ name: 'DownloadFile'});
    }
    const returnStudy = () => {
      //window.location.href = 'https://www.google.com';
      window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
    };
    const router = useRouter();
    return {
      backToDownload,
      selectedFile,
      returnStudy,
      router,
      errorMessage,
      handleFileChange,
      // submitFile,
      showProgress,
      closePopup,
      percent,
      showFileName,
      uploadComplete,
      fileError,
      fileSuccess
    }
    
  },

 
};
</script>

<style>
h1, h2, h3, h4, h5, h6, p, span, label, button {
  color: rgb(54,53,49);;
}
body {
  margin: 0;
  padding: 0;
  background-color: rgba(249,246,245, 0.7);
}
.background3 {
  position: absolute;
  top: 0;
  left: 0;
  /* bottom: 20%; */
  /* left: 50%; */
  width: 100%;
  height: 100%;
  background: linear-gradient(60deg, #fff 50%, rgb(229, 222, 215) 50%);
}
.roof2 {
  position: absolute;
  left: 2%;
  top: 1%;
}
.backToDownload {
  margin-top: 10px;
  font-size: 30px;
  border: none;
  background-color: #fff;
  cursor: pointer;
}

.picture {
  position: absolute;
  top: 25%;
  /* top: 190px; */
  left: 0px;
}
.picture1 {
  background-image: url('../assets/reflection2.jpeg');
  background-repeat: no-repeat;
  background-size: contain;
}
.title-container {
  
  position: absolute;
  top: 17%;
  left: 55%;
  /* top: 150px; */
  /* left: 700px; */
  display: flow-root;
}
.uploadText1 {
  width: 400px;
  /* top: 120px; */
  /* left: 50%; */
  font-size: 50px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.button-container {
  position:fixed;
  margin-left: 50%;
  margin-top: 20%;
  display: flex;
  gap: 10%; /* Adds space between buttons */
}
.uploadText2 {
  width: 400px;
  margin-top: -20px;
  /* top: 120px; */
  /* left: 50%; */
  font-size: 50px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.warning1 {
  position: relative;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}
.warning3 {
  margin-top: 17px;
  font-size: 16px;
  margin-right:40px;
}
.uploadError {
  position: fixed;
  margin-top: 30%;
  font-size: 16px;
  text-decoration: underline;
  font-weight: bold;
  color: red;
}
.uploadSuccess {
  position: fixed;
  margin-top: 27%;
  font-size: 16px;
  text-decoration: underline;
  font-weight: bold;
  color: green;
}
/* .hidden {
  z-index: -1;
  position: absolute;
  top: 40%;
  left: 55%;
} */

.upload-container{
  position: relative;
  top: 0%;
  left: 0%;
}
.input-file {
  position: absolute;
  top: 0;
  /* margin-top: 20px; */
  font-size: 16px;
  opacity: 0;
}
.highlight {
  color: red;
}
.browse {
  position: absolute;
  top: 0;
  border-radius: 5px;
  border: 1.2px solid rgb(99, 99, 99);
  background-color: rgb(235, 235, 235) ;
  width: 80px;
  /* background-color: aqua; */
  font-size: 16px;
  padding-left: 10px;
  padding-right: 10px;
  /* padding-top: 2px;
  padding-bottom: 2px; */
}
.noFile {
  position: fixed;
  top: 40%;
  left: 2.5%;
  font-size: 16px;
}

.progressBar {
  margin-top: 3%;
  margin-left: 20%;
}
.warning {
  margin-top: 45px;
  font-size: 17px;
  width: 640px;
  font-weight: bold;
  text-decoration: underline;
}
.jumpToWait {
  margin-top: 9%;
  font-size: 16px;
}
.cancel {
  margin-left: 0%;
  font-size: 16px;
}
</style>