<template>
  <div class="background4"></div>
  <div class="background5"></div>
  <div class="roof1">
      <button class="backToConsent" @click="backToDownload">🔙</button>
  </div>
  <!-- <div class="icon-name1">
      <div class="iconImg1" style="height:40px;width:40px;"></div>
      <h1 class="site-name1">Website Name</h1>
  </div> -->
  <div>
    <div class="waiting-text">
      <p class="attention">💡Pair with another participant</p>
    </div>
    <div class="waiting-container">
      <p class="queueNum">What would you prefer to be called by your teammate?</p>
      <input :disabled="readyToStart" class="nameInput" type="text" id="name" v-model="userName" required />
      <p class="prolific">Also, may you tell us your Prolific ID?</p>
      <input :disabled="readyToStart" class="nameInput" type="text" id="name"  v-model="prolificID" required />
      
      
      <!-- <div class="waitingLogo" style="height:200px;width: 200px;"></div> -->
      
      <!-- <img alt="Vue logo" class="logo" src="../assets/logo.svg" width="200" height="200" /> -->
      
    </div>
    <div class="waiting-options">
      <button :disabled="!hasID || readyToStart" @click="joinQueue(true)" class="ifCompleteButton">I am ready to join the task and video call</button>
      <!-- <input class="readyBox" @click="joinQueue" type="checkbox" id="checkbox" v-model="readyToStart" :disabled="hasID || isCheckboxDisabled" />
      <label class="readyLabel" for="checkbox"> I am ready to join the task and video call</label> -->
      <p class="queueNum2">{{ queueingUsers }} participants are in the queue now.</p>
      <p class="attention-content" v-if="readyToStart">You will be paired with another participant at any minute. <br>Please don't leave this page unattended cause you may <u>fail attention check if you have no operation after being paired.</u> <br>You may return the study if you are tired of waiting.</p>
      <p v-if=pairingError class="error" >Some errors occured while pairing. Please go back to the previous page.</p>
    </div>
  </div>
  <div v-if="attention" class="completeWindow">
        <p class="windowQuestion">Are you still with us?</p>
        <div class="windowButtons">
            <button @click="attentionCheck(true)" class="ifCompleteButton">Yes</button>
            <button @click="attentionCheck(false)" class="ifCompleteButton">No</button>
        </div>
  </div>
  <!-- <div v-if="confirmJoin" class="completeWindow">
        <p class="windowQuestion">Teammate found! Are you ready to join?</p>
        <p class="windowQuestion">Your teammate didn't confirm to join.</p>
        <div class="windowButtons">
            <button @click="attentionCheck(true)" class="ifCompleteButton">Yes</button>
            <button @click="attentionCheck(false)" class="ifCompleteButton">No</button>
        </div>
  </div> -->
  
  <main>
      
  </main>
</template>
<script>
    import { ref, onMounted, watch, computed, onUnmounted, onBeforeUnmount} from 'vue';
    import {useRouter, onBeforeRouteLeave} from "vue-router";
    import { useStore } from 'vuex';
    export default {
      setup() {
        const userName = ref("");
        const store = useStore();
        const router = useRouter();
        const queueingUsers = ref(0);
        const readyToStart = ref(false);
        const isCheckboxDisabled = ref(true);
        const prolificID = ref('');
        const pairingError = ref(false);
        const attention = ref(false);
        //const confirmJoin = ref(false);
        let timer;

      onBeforeRouteLeave((to, from, next) => {
        console.log("to is: " + JSON.stringify(to));
        if(to.name == "WorkSpace"){
          next(); 
        }else{
          handleBeforeUnload();
          next();
        }
      });

      onMounted(() => {
        timer = setTimeout(check, 2 * 60 * 1000);// 3 minutes in milliseconds
        //timer = setTimeout(returnStudy, 3 * 60 * 1000); // 5 seconds for test
      });

      onBeforeUnmount(() => {
        clearTimeout(timer);
      });

      const check = () => {
        console.log("checked");
        if (readyToStart.value == false){
          attention.value = true;
          timer = setTimeout(closeAttention, 15 * 1000);
        }
      };

      const closeAttention = () => {
        if (readyToStart.value == false){
          attention.value = false;
          timer = setTimeout(finalCheck, 1 * 60 * 1000);
        }
      };

      const finalCheck = () => {
        if (readyToStart.value == false){
          attention.value = true;
          timer = setTimeout(returnStudy, 15 * 1000);
        }
        
      };

      const attentionCheck = (confirmed) => {
        //timer = setTimeout(check, 30 * 1000);
          // 5 seconds for test
        if (confirmed) {
            attention.value = false;
            clearTimeout(timer);
            timer = setTimeout(check, 1 * 60 * 1000); 
        }else {
            attention.value = false;
            //window.location.href = 'https://www.google.com';
            window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
        }
      };

      const returnStudy = () => {
        if (readyToStart.value == false){
          //window.location.href = 'https://www.google.com';
          window.location.href = 'https://app.prolific.com/submissions/complete?cc='+ import.meta.env.VITE_ATTENTION_CHECK_CODE;
        }
      };

      function joinQueue() {

        //queueingUsers.value += 1;
        readyToStart.value = !readyToStart.value;
        if (readyToStart.value){
          store.state.socket.emit("join queue", [userName.value, store.state.socket.id, prolificID.value]);
          
          //store.state.socket.emit("join queue", store.state.socket.id);
        }else{
          store.state.socket.emit("leave queue", [userName.value, store.state.socket.id, prolificID.value]);
          //store.state.socket.emit("leave queue", store.state.socket.id);
        }
      }

      const hasID = computed(() => {
        return (prolificID.value.trim().length >= 23);
      });

      const backToDownload = () => {
        router.push({ name: 'DownloadFile'});
      }
        
        onMounted(async () => {
          // if (!store.state.socket) {
          //   console.log("Socket is not initialized, initializing now...");
          //   try {
          //     const socket = await store.dispatch('initializeSocket');
          //     console.log("Socket initialized", socket);
          //   } catch (error) {
          //     console.error("Error initializing socket:", error);
          //     return;
          //   }
          // }
          // //console.log(import.meta.env.VUE_APP_SOCKET_ENDPOINT)
          await store.dispatch('initializeSocket');
          window.addEventListener('beforeunload', handleBeforeUnload);
          const socket = store.state.socket;
          // console.log(socket.id);
          console.log('socket is ' + socket.id);
          socket.on('connection', () => {
            console.log('Connected to the server');
          });

          socket.emit("request queue info");
          socket.on('queueing info', (data) => {
            queueingUsers.value = data;
          });

          socket.on('pairing success', async (arg) => {
            const boardId = arg.id;
            await store.dispatch('allowWorkSpaceAccess');
            router.push({ name: 'WorkSpace', params: {id: boardId} });
          });

          socket.on('pairing error', (arg) => {
            //tell users pairing error
            pairingError.value = true;
          });
        
        });
        onUnmounted(() =>{
          window.removeEventListener('beforeunload', handleBeforeUnload);
        })
      const handleBeforeUnload = (event) => {
        if (readyToStart.value === true) {    
          store.state.socket.emit("leave queue", [userName.value, store.state.socket.id, prolificID.value]);
        }
      };
        // Watcher for userName
        watch(userName, (newValue) => {
          isCheckboxDisabled.value = newValue.trim() === '';
        });

        return {
          queueingUsers,
          userName,
          isCheckboxDisabled,
          readyToStart,
          attention,
          joinQueue,
          hasID,
          prolificID,
          backToDownload,
          returnStudy,
          check,
          pairingError,
          attentionCheck
        };
      },
    };
  
</script>

<style scoped>
h1, h2, h3, h4, h5, h6, p, span, label, button {
  color: rgb(54,53,49);
}
html{
overflow:scroll;

}
body {
  margin: 0;
  padding: 0;
  background-color: rgba(249,246,245, 0.7);
  
  overflow: hidden;
}
.background4 {
  position: absolute;
  left: 30%; /* 将圆形定位到容器左侧 */
  top: -5%;
  border-radius: 50%;
  width: 100%;
  height: 120%;
  /* background-color: rgb(239, 236, 228); */
  background-color: rgb(228, 229, 220);
  overflow: hidden;
  z-index: -1; /* 确保色块位于页面内容之后 */
}
.background5 {
  position: absolute;
  right: 70%; /* 将圆形定位到容器左侧 */
  bottom: 75%;
  border-radius: 50%;
  width: 65%;
  height: 65%;
  /* background-color: rgb(239, 236, 228); */
  background-color: rgb(228, 229, 220);
  overflow: hidden;
  z-index: -1;
}
.roof2 {
  position: absolute;
  left: 2%;
  top: 1%;
}
.backToUpload {
  margin-top: 10px;
  font-size: 30px;
  border: none;
  background-color: rgb(228, 229, 220);
  cursor: pointer;

}
.waiting-text {
  position: relative;
  left: 0%;
  width: 300%;
}
.waiting-container {
  position: relative;
  /* background-color: aqua; */
  left: 0%;
  width:250%;
  margin-top: 10%;
  /* display: flow-root; */
  /* justify-content: center;*/
  align-items: left;
  /*text-align: center; */
}
.waiting-options {
  height:30%;
  position: relative;
  margin-top: 10%;
  left: 0%;
  width: 200%;
}
.attention {
  margin-left: -1.5%;
  margin-bottom: 20px;
  font-size: 60px;
  font-weight: 700;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.attention-content {
  font-size: 17px;
  margin-top: 10px;
  font-weight: 500;
  width: 150%;
}
.attention-content2 {
  font-size: 17px;
  margin-top: 10px;
  font-weight: 500;
  color:red
}

.queueNum {
  font-size: 22px;
  font-weight: 700;
}
.queueNum2 {
  font-size: 20px;
  font-weight: 300;
}
.error {
  font-size: 22px;
  font-weight: 700;
  color:red
}

.prolific {
  padding-top: 40px;
  font-size: 22px;
  font-weight: 700;
}

.nameInput {
  background-color: #eee;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  width: 80%;
  border-radius: 1rem;
  color: lightcoral;
  box-shadow: 0 0.4rem #dfd9d9;
  cursor: pointer;
}
.waitingLogo {
  margin-top: 40px;
  background-image: url('../assets/coffee logo.svg');
  background-repeat: no-repeat;
  background-size: contain;
  margin: 30px auto;
}
.readyBox {
  transform: scale(1.4);
}
.readyLabel {
  font-size: 20px;
}
.backToConsent {
  margin-top: 10px;
  font-size: 30px;
  border: none;
  cursor: pointer;
}
/* .header {
  line-height: 1.5;
}
  
.logo {
  display: block;
  margin: 0 auto 2rem;
}
  
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  
  .logo {
    margin: 0 2rem 0 0;
  }
  
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style> 
  