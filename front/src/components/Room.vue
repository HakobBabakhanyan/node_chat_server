<template>
  <div class="flex">
    <div class="w-2/3 ">
      <p class="text-2xl text-green-600 font-bold">Room Name: {{ roomName }}</p>
      <div class="flex">
        <div v-for="user in users"
             class="bg-gray-100 m-2 border-yellow-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:border-transparent | transition-colors duration-500">
          <img class="w-8 h-8 object-cover"
               src="https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" alt=""/>
          <div class="flex flex-col justify-center">
            <p class="text-gray-900 dark:text-gray-300 font-semibold">{{ user }}</p>
          </div>
        </div>
      </div>
      <div>
        <input v-if="!userConnected" class="shadow appearance-none border rounded py-2 px-3 text-grey-darker"
               type="text" v-model="userName">
        <button v-if="!userConnected" v-on:click="connect"
                class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
          connect
        </button>
      </div>

      <div class="flex">
        <video v-if="video" width="200" height="200" :srcObject ="video" preload autoplay>
        </video>
        <video v-if="videoS" width="200" height="200" :srcObject ="videoS" preload autoplay>
        </video>
      </div>
      <button v-on:click="callUser"
              class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
        video
      </button>
    </div>
    <div class="justify-end w-1/3 flex fixed right-0 top-0">
      <Chat
          :userName="userName"
          :messages="messages"
          v-if="userName && userConnected"
          @sendMessage="sendMessage"/>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import axios from "axios";
import Chat from "./Chat.vue";
import io, {Socket} from "socket.io-client";


declare interface Message {
  name: string | null,
  text: string
}

export default defineComponent({
  name: 'Room',
  components: {Chat},
  data() {
    return {
      roomName: null,
      messages: [] as Message[],
      users: [],
      pc: {} as RTCPeerConnection[],
      userConnected: false,
      userName: null,
      video: undefined ,
      videoS: undefined ,
      socket: {} as Socket,
      peerConnection: {} as RTCPeerConnection,
      mediaConstraints: {
        audio: true,
        video: {width: 200, height: 200},
        // video: false,
      },
      isAlreadyCalling: false
    }
  },
  mounted() {
    axios.get(`https://127.0.0.1/room/${this.$route.params.roomId}`).then(e => {
      this.roomName = e.data.roomName;
    }).catch((e) => {
      console.log(e.response.status);
      this.$router.push({path: '/'})
    });

    this.peerConnection = new RTCPeerConnection();


  },
  methods: {
    connect() {
      if (this.userName) {
        this.userConnected = true;
        const socket = io('https://127.0.0.1/room/3bdfec0517114c49e555');// todo: set ws://

        this.socket = socket;
        socket.on("connect", () => {
          socket.emit('init', {
            userName: this.userName
          })
          socket.on('users:online', (users) => {
            this.users = users;
          })
          socket.on('message:from', (data) => {
            this.messages = [...this.messages, data]
          })
          socket.on("call-made", async data => {
            console.log('call-made');
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.offer)
            );
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

            socket.emit("make-answer", {
              answer,
              to: data.socket
            });
          });
          socket.on("answer-made", async data => {
            console.log('answer-made');
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
            if (!this.isAlreadyCalling) {
              await this.callUser();
              this.isAlreadyCalling = true;
            }
          });

        });

        const captureStream =  navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(stream=>{
          this.video = stream;
          stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
        });


        const self= this;
        this.peerConnection.ontrack = function ({streams: [stream]}) {
          self.videoS = stream;
          // const remoteVideo = document.getElementById("remote-video");
          // if (remoteVideo) {
          //   remoteVideo.srcObject = stream;
          // }
        };
      }
    },
    async callUser() {

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

      this.socket.emit("call-user", {
        offer,
        to: this.userName
      });
    }
    ,
    sendMessage(message: any) {

      this.socket.emit('message:to', {
        userName: this.userName,
        message
      })

      this.messages = [...this.messages, {
        name: this.userName,
        text: message
      }]

    },
    async getUserFullMediaNew() {
      try {
        return await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      } catch (e) {
        console.log(e)
      }
    },
  }
})
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
