<template>
  
    <div class="background1"></div>
    <div>
      <div class="icon-name1">
        <div class="iconImg1" style="height:40px;width:40px;"></div>
        <h1 class="site-name1">Know Yourself</h1>
      </div>
      <!-- <div class="iconImg" style="height:40px;width:40px;"></div>
      <div>
          <h1 class="site-name">Website Name</h1>
      </div> -->
      <div>
          <h1 class="reflect" v-if="showHome">Reflect on your YouTube watching history</h1>
      </div>
      <div class="footer1">
        <input class="readyBox" @click="agree" type="checkbox" id="checkbox" v-model="readyToStart"/>
        <label class="readyLabel" for="checkbox">I am comfortable to share my data and have video call with another participant! </label>
        <button v-if="!showPopup" :disabled="!readyToStart" @click="showConsentForm" class="showButton">START NOW</button>
      </div>
    </div>

    

    <div v-if="showHome" class="intro">
      <p>This is a task  for you to understand your YouTube watching behaviour. </p>
      <p>You will be asked to download and upload your Youtube watch history, and join in a video call with another participant to reflect upon your experiences of watching the videos. </p>
    </div>
    
    <div v-if="showPopup" class="popup-container">
      <div class="popup-content">
        <button class="back-btn" @click="backButton">🔙</button>
        <h1 class="consentTitle">Consent Form</h1>
        <p class="consentText">You are being invited to participate in a research study titled “Comparing Individual and Collaborative Approaches: Exploring User Preferences and Behaviors through Personal Reflections and Crowdsourcing”. This study is being done by Zihan Wang from the TU Delft.</p>
        <p class="consentText">The purpose of this research study is to find the insights influencing people’s choices when using recommendation systems, and will take you approximately 40 minutes to complete. We will be asking you to cooperate with another participant to finish some tasks to reflect on your YouTube-watching history. We will record your operations on our task board and your discussions with another participant. The data will be used to support my Master’s thesis and publications. </p>
        <p class="consentText">As with any online activity, the risk of a breach is always possible. To the best of our ability, your answers in this study will remain confidential. We will minimize any risks by making all your data anonymous, and we won’t collect your IP address. The YouTube watching history will be kept anonymous since no information related to identifying you will be gathered. Both the watching histories and recordings will be safely stored in the TU Delft’s database and will be removed in two months. </p>
        <p class="consentText">Your participation in this study is entirely voluntary and you can withdraw at any time. You are free to omit any questions. All the research data and recordings will be uniformly removed at the end of this research in two months.</p>
        <p class="consentText">In case you have further questions, email Zihan Wang at z.wang-24@student.tudelft.nl, the Corresponding Researcher, or Di Yan at D.Yan-1@tudelft.nl, the responsible researcher.</p>
        <p class="consentText">Make sure you have read the statements above and check the box below to proceed to the task</p>
        <div class="Boxes">
          <input type="radio" id="agree" value="agree" v-model="choice" />
          <label for="agree" class="agreeBox">I agree</label>
  
          <input type="radio" id="disagree" value="disagree" v-model="choice" class="disagreeBox" />
          <label for="disagree">I disagree</label>
        </div>
        <button @click="confirmRes" :disabled="!canConfirm" class="confirm-btn">Confirm</button>
        
      </div>

    </div>
    <div v-if="completeWindow" class="completeWindow">
        <p class="windowQuestion">Are you still with us?</p>
        <div class="windowButtons">
            <button @click="attentionCheck(true)" class="ifCompleteButton">Yes</button>
            <button @click="attentionCheck(false)" class="ifCompleteButton">No</button>
        </div>
    </div>
    <!-- <div class="container">
      <h1>Consent Form</h1>
      <p>Some information about the consent form...</p>
  
      <input type="radio" id="agree" value="agree" v-model="choice" />
      <label for="agree">I agree</label>
  
      <input type="radio" id="disagree" value="disagree" v-model="choice" />
      <label for="disagree">I disagree</label>
  
      <button @click="confirmRes" :disabled="!canConfirm">Confirm</button>
    </div> -->
  
  <!-- <div class="pictures1">
    <div class="reflectionImg1" style="height:600px;width: 1000px;"></div>
  </div> -->
  <!-- <div class="pictures2">
    <div class="reflectionImg2" style="height:420px;width: 280px;"></div>
    <div class="reflectionImg3" style="height:490px;width: 275px;"></div>
  </div> -->
</template>


  
<script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const router = useRouter();
      const choice = ref(null);
      const showPopup = ref(false);
      const showHome = ref(true);
      const showRecommend = ref(false);
      const showCrowd = ref(false);
      const showPersonal = ref(false);
      const readyToStart = ref(false);
      const canConfirm = computed(() => choice.value !== null);
      let timer;
      const completeWindow = ref(false);

      onMounted(() => {
        //timer = setTimeout(check, 2 * 60 * 1000);// 3 minutes in milliseconds
        timer = setTimeout(check, 2 * 60 * 1000); // 5 seconds for test
        console.log(import.meta.env.VITE_COMPLETION_CODE);
      });
      onBeforeUnmount(() => {
        clearTimeout(timer);
      });
      const check = () => {
        timer = setTimeout(closeAttention, 15 * 1000);
        completeWindow.value = true;
      };

      const closeAttention = () => {
        completeWindow.value = false;
        timer = setTimeout(finalCheck, 1 * 60 * 1000);
          
      };

      const finalCheck = () => {
          timer = setTimeout(returnStudy, 15 * 1000);
          completeWindow.value = true;
      };

      const returnStudy = () => {
        window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
      };
      const attentionCheck = (confirmed) => {
        //timer = setTimeout(check, 30 * 1000);
         // 5 seconds for test
        if (confirmed) {
            completeWindow.value = false;
            clearTimeout(timer);
            //timer = setTimeout(check, 2 * 30 * 1000);
            timer = setTimeout(check, closeAttention * 60 * 1000); // 5 seconds for test
        }else {
            completeWindow.value = false;
            window.location.href = 'https://app.prolific.com/submissions/complete?cc=' + import.meta.env.VITE_ATTENTION_CHECK_CODE;
        }
      };
      const confirmRes = () => {
        if (choice.value === 'agree') {
          // 导航到下一界面
          router.push({ name: 'DownloadFile'});
        } else if (choice.value === 'disagree') {
          // 退出应用
          window.close();
          window.location.href = 'https://app.prolific.com/submissions/complete?cc=' + import.meta.env.VITE_CONSENT_CODE;
        }
      };
      const showConsentForm = () => {
          showPopup.value = true;
      };

      const HomeView = () => {
        showHome.value = true;
        showRecommend.value = false;
        showCrowd.value = false;
        showPersonal.value = false;
      };
      const RecommendView  = () => {
        showHome.value = false;
        showRecommend.value = true;
        showCrowd.value = false;
        showPersonal.value = false;
      };
      function agree() {
        //queueingUsers.value += 1;
        readyToStart.value = !readyToStart.value;
      }
      const CrowdView = () => {
        showHome.value = false;
        showRecommend.value = false;
        showCrowd.value = true;
        showPersonal.value = false;
      };
      const PersonalView = () => {
        showHome.value = false;
        showRecommend.value = false;
        showCrowd.value = false;
        showPersonal.value = true;
      };
      const backButton = () => {
        showPopup.value = false;
      }
  
      return {
        choice,
        canConfirm,
        confirmRes,
        showConsentForm,
        showPopup,
        showHome,
        showRecommend,
        showCrowd,
        showPersonal,
        readyToStart,
        HomeView,
        RecommendView,
        CrowdView,
        PersonalView,
        backButton,
        agree,
        returnStudy,
        attentionCheck,
        completeWindow
      };
    }
  };
</script>

<style>
h1, h2, h3, h4, h5, h6, p, span, label, button {
  color: rgb(54,53,49);;
}
html{
overflow:scroll;

}
body {
  margin: 0;
  padding: 0;

  background-color: rgba(249,246,245, 0.7);
  /* background-image: url('src/assets/background.jpeg'); */
  /* background: linear-gradient(to bottom, rgba(172, 169, 147, 0.7) 25%, rgba(255, 255, 255, 0.7) 50%);
  background-size: cover; */
}
.background1 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80%;
  background-color: rgba(227,224,215, 1);
  z-index: -1; /* 确保色块位于页面内容之后 */
}

.icon-name1 {
  position: absolute;
  display: flex;
  top: 6.5%;
  left: 6.5%;
}

.iconImg1 {
  background-image: url('../assets/icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}

.site-name1 {
  text-align: left;
  margin: 0;
  font-size: 20px;
  color: rgb(54,53,49);
  width: 200px;
}

.active {
    text-decoration: underline;
    font-weight: bold;
}
.reflect {
  position: absolute;
  top: 170px;
  /* left: 115px; */
  left: 10%;
  text-align: left;
  margin: 0;
  font-size: 70px;
  font-family: Optima;
}
.on-yourself {
  position: absolute;
  top: 250px;
  /* left: 115px; */
  left: 10%;
  text-align: left;
  margin: 0;
  font-size: 70px;
  font-family: Optima;
}

.intro {
  position: absolute;
  /* display: flex; */
  top: 390px;
  left: 10%;
  justify-content: center;
  align-items: center;
  text-align: left;
  font-family: 'Times New Roman', Times, serif;
  font-size: 20px;
}
.footer1 {
    position: absolute;
    top: 70%;
    left: 12%;
}
.showButton {
  /* position: absolute; */
  /* left: 10%; */
  justify-content: center;
  align-items: center;
  text-align: left;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 17px;
  /* border: none; */
  border-radius: 50%;
  color: rgb(54,53,49);
  border: 1.5px solid rgba(168, 165, 159, 0.7);
  background-color: rgb(244, 231, 216);
  padding: 15px;
  cursor: pointer;
}
.pictures1 {   
  position: absolute;
  bottom: 0;
  /* top: 190px; */
  /* left: 650px; */
  left: 45%;
  /* padding: 20px; */
}
.reflectionImg1 {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  padding: 20px;
  background-image: url('../assets/reflection.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 300px 0px;
  /* box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); */
  /* margin-top: 100px; */
}
.pictures2 {
  position: absolute;
  top: 0;
  /* left: 1110px; */
  right: 5%;
  /* padding: 20px; */
}
.reflectionImg2 {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  padding: 20px;
  background-image: url('../assets/thumbs.jpg');
  background-size: contain;
  background-repeat: no-repeat;
  /* background-color: rgb(255,255,255); */
  border-radius: 50px;
  
}
.reflectionImg3 {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  padding: 20px;
  background-image: url('../assets/crowdsourcing.jpg');
  background-size: contain;
  background-repeat: no-repeat;
  margin-top: 45px;
  border-radius: 50px;
}
.popup-container {
  z-index: 1;
  /* text-align: center; */
  background-color: rgb(236, 231, 224);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ffffff;
  /* margin: 320px auto; */
  backdrop-filter: blur(3px) brightness(95%);
  box-shadow: 10px 10px 30px #636466;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 85%;
  display: flow-root;
  overflow-y: auto;
  /* justify-content: center; */
  /* align-items: center; */
}
.back-btn {
  margin-top: 10px;
  font-size: 30px;
  border: none;
  background-color: rgb(236, 231, 224);
  cursor: pointer;
}
.consentTitle {
  /* margin-top: 10px; */
  text-align: center;
  margin-bottom: 20px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 40px;
  font-weight: bold;
}
.consentText {
  padding: 5px;
  text-align: left;
  font-size: 16.5px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  color: rgb(54,53,49);
}
.Boxes {
  margin-top: 30px;
  display: flow-root;
  margin-left: 40%;
  /* text-align: center; */
}
.Boxes label {
  font-size: 18px;
  margin-right: 20px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.confirm-btn {
  margin-top: 20px;
  margin-left: 45%;
  padding: auto;
  font-size: 16px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

}
.readyBox {
  transform: scale(1.4);
}
.readyLabel {
  padding-left: 1%;
  font-size: 20px;
}

</style>