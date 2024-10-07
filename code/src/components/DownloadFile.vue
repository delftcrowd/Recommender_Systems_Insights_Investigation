<template>
  <div class="background2"></div>
  <div class="roof1">
      <button class="backToConsent" @click="backToConsent">🔙</button>
  </div>
  <div class="icon-name1">
      <div class="iconImg1" style="height:40px;width:40px;"></div>
      <h1 class="site-name1">Reflection Hive</h1>
  </div>
  <div>
    <h1 class="step1Text">Please Download Your Watch History</h1>
  </div>
  

  <div class="step1Page">
    <!-- <p>Now you need to download your YouTube watch history in a JSON file format.</p> -->
    <p class="link-text">We are seeking participants who <u>have used YouTube in the last three days</u> to upload their YouTube data. If you do not meet this criterion, please return the study, as we will have to <u>reject unqualified participants.</u></p>
    <p class="link-text">If you meet our requirement, please follow these steps:</p>
    <p class="link-text">1. Open Google take out <a class="link" href="https://takeout.google.com/" target="_blank">https://takeout.google.com/</a>.</p>
    <p class="link-text">2. Sign in with the account you used for YouTube.</p>
    <p class="link-text">3.	Follow the instructions below  to download your YouTube data.</p>
    <!-- <button class="nextButton1" @click="nextButton1">Next</button> -->
    <div class="step1and2">
      <div class="download-pic1" style="height:480px;width: 350px;"></div>
      <div class="download-pic2" style="height:500px;width: 350px;"></div>
    </div>
    
    <div class="step1and2">
      <div class="download-pic3" style="height:480px;width: 350px;"></div>
      <div class="download-pic4" style="height:480px;width: 350px;"></div>      
    </div>

    <div class="step1and2">
      <div class="download-pic5" style="height:480px;width: 350px;"></div>
      <div class="download-pic6" style="height:480px;width: 350px;"></div>      
    </div>

    <div class="step1and2">
      <div class="download-pic7" style="height:480px;width: 350px;"></div>
      <div class="download-pic8" style="height:480px;width: 350px;"></div>      
    </div>

    <div class="step1and2">
      <div class="download-pic9" style="height:480px;width: 350px;"></div>  
    </div>
    <!-- <div class="step1and2">
      <div class="download-pic11" style="height:380px;width: 600px;"></div>
    </div> -->
    <div class="download-next">
      <p class="download-attention">💡Attention: It takes Google 5 to 10 minutes to export your file, you can proceed to the next step while waiting.</p>
      <button @click="downloadNext" class="download-next-button">Next Page</button>
    </div>
  </div>
  <div v-if="completeWindow" class="completeWindow">
        <p class="windowQuestion">Have you seen the message on the Google Takeout website stating "Google is creating a copy of data from YouTube"? This confirms that your data request was successful.<br> <br>The data will be sent to your email in 5-10 minutes,  let's pair with your teammate first.</p>
        <div class="windowButtons">
            <button @click="ifCompleteTask(true)" class="ifCompleteButton">Yes, I have seen the message. Move to the waiting room.</button>
            <button @click="ifCompleteTask(false)" class="ifCompleteButton">No</button>
        </div>
  </div>
  <div v-if="attention" class="completeWindow">
        <p class="windowQuestion">Are you still with us?</p>
        <div class="windowButtons">
            <button @click="attentionCheck(true)" class="ifCompleteButton">Yes</button>
            <button @click="attentionCheck(false)" class="ifCompleteButton">No</button>
        </div>
  </div>

  

  <!-- <div class="progress-bar">
    <button class="step" :class="{ active: currentStep === 'showPage1' }" @click="step1Button">Step1</button>
    <button class="step" :class="{ active: currentStep === 'showPage2' }" @click="step2Button">Step2</button>
    <button class="step" :class="{ active: currentStep === 'showPage3' }" @click="step3Button">Step3</button>
  </div> -->
  <!-- <div v-if="showPage3" class="footer">
    <button class="nextPage" @click="nextPage">Next Page</button>
  </div> -->
  
  
</template>
<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
  
export default {
  setup() {
    const router = useRouter();
    const completeWindow = ref(false);
    const attention = ref(false);
    let timer;
    // onMounted(() => {
    //   if (route.query.step) {
    //     currentStep.value = route.query.step;
    //   };
    //   // store.dispatch('initializeSocket');
    // });
    onMounted(() => {
      timer = setTimeout(check, 5 * 60 * 1000);// 6 minutes in milliseconds
    });
    onBeforeUnmount(() => {
      clearTimeout(timer);
    });
    const backToConsent = () => {
      router.push({ name: 'ConsentForm'});
    }

    const downloadNext = () => {
      // router.push({ name: 'UploadFile'});
      completeWindow.value = true;
      
    }
    const ifCompleteTask = (confirmed) => {
        if (confirmed) {
            completeWindow.value = false;
            router.push({ name: 'Home'});
        } else {
            completeWindow.value = false;
        }
    };
    const check = () => {
      timer = setTimeout(closeAttention, 15 * 1000);
      attention.value = true;
    };

    const closeAttention = () => {
      attention.value = false;
      timer = setTimeout(finalCheck, 1 * 60 * 1000);
        
    };

    const finalCheck = () => {
        timer = setTimeout(returnStudy, 15 * 1000);
        attention.value = true;
    };

    const returnStudy = () => {
      //window.location.href = 'https://www.google.com';
      window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
    };
    const attentionCheck = (confirmed) => {
      //timer = setTimeout(check, 30 * 1000);
        // 5 seconds for test
      if (confirmed) {
          attention.value = false;
          clearTimeout(timer);
          timer = setTimeout(closeAttention, 2 * 60 * 1000); 
      }else {
          attention.value = false;
          //window.location.href = 'https://www.google.com';
          window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
      }
    };

    return {
        ifCompleteTask,
        backToConsent,
        downloadNext,
        attentionCheck,
        attention,
        completeWindow
    }
  }
};
</script>

<style scoped>
h1, p, button {
  color: rgb(54, 53, 49);
}
body {
  margin: 0;
  padding: 0;
  background-color: rgba(249,246,245, 0.7);
  overflow: hidden;
}

.background2 {
  position: absolute;
  left: -50%; /* 将圆形定位到容器左侧 */
  bottom: 120px;
  border-radius: 50%;
  width: 180%;
  height: 200%;
  /* background-color: rgb(239, 236, 228); */
  background-color: rgb(244, 231, 216);
  overflow: hidden;
  z-index: -1; /* 确保色块位于页面内容之后 */
  /* top: -50%;
  left: -50%; */
}
.roof1 {
  position: absolute;
  left: 2%;
  top: 1%;
}
.backToConsent {
  margin-top: 10px;
  font-size: 30px;
  border: none;
  background-color: rgb(244, 231, 216);
  cursor: pointer;
}
.step1Text {
  position: absolute;
  top: 16%;
  left: 8%;
  /* top: 120px; */
  /* left: 100px; */
  font-size: 40px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.step1Page {
  position: absolute;
  top: 27%;
  /* top: 220px; */
  left: 8%;
  display: flow-root;
  width: 80%;
  height: 68%;
  overflow-y: auto;
  /* justify-content: center;
  align-items: center; */
}
.link-text {
  font-size: 20px;
  font-weight:500;
  margin-bottom: 10px;
}
.link {
  font-weight: bold;
  color: rgb(130, 42, 42);
  text-decoration: underline;
}
.step1and2 {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
}
.step3and4 {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
}
.download-pic1 {
  background-image: url(../assets/download_step1.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic2 {
  background-image: url(../assets/download_step2.jpg);
  background-repeat: no-repeat;
  background-size: contain;
  margin-top: 20px;
}
.download-pic3 {
  background-image: url(../assets/download_step3.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic4 {
  background-image: url(../assets/download_step4.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic5 {
  background-image: url(../assets/download_step5.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic6 {
  background-image: url(../assets/download_step6.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic7 {
  background-image: url(../assets/download_step7.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic8 {
  background-image: url(../assets/download_step8.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic9 {
  background-image: url(../assets/download_step9.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic10 {
  background-image: url(../assets/download_step10.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-pic11 {
  background-image: url(../assets/download_step11.jpg);
  background-repeat: no-repeat;
  background-size: contain;
}
.download-next {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* width: 100%; */
  align-items: center;
}
.download-attention {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}
.download-next-button {
  transform: scale(1.4);
}
</style>

