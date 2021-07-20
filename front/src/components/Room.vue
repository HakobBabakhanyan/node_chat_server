<template>
  <!--START  component todo create new component-->
  <div v-if="!userConnected" class="h-screen bg-green-50">
    <div class="h-1/2 flex p-8 flex-col justify-between items-center">
      <p class="text-2xl font-bold">Room name: <span class="text-green-500">{{ roomName }}</span></p>
      <div class="flex flex-col">
        <span class="p-0 m-0 font-bold">Name</span>
        <div class="flex">
          <input
              class="shadow appearance-none border rounded py-1 px-3 text-grey-darker"
              type="text" v-model="userName">
          <button v-on:click="connect"
                  class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
            Connect
          </button>
        </div>
      </div>
    </div>
  </div>


  <!--  END-->
  <div class="flex h-screen flex-wrap">
    <div class="flex w-full">
      <div class="w-2/3">
        <div class="flex">
          <div v-for="user in users"
               class="bg-gray-100 m-2 border-yellow-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:border-transparent | transition-colors duration-500">
            <img class="w-8 h-8 object-cover"
                 src="https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" alt=""/>
            <div class="flex flex-col justify-center">
              <p class="text-gray-900 dark:text-gray-300 font-semibold">{{ user.name }}</p>
            </div>
          </div>
        </div>
        <div class="flex w-full">
          <div v-for="user in users" class="m-2">
            <div v-if="videos[user.id]" class="relative">
              <video class="relative z-0"
                     :srcObject="videos[user.id]"
                     v-bind:muted="user.id === socketId"
                     preload
                     autoplay></video>
              <span class="absolute bottom-1 z-10 text-white">{{ user.name }}</span>
            </div>
            <div v-else>
              {{ user.name }}
            </div>
          </div>
        </div>
        <button v-if="false" v-on:click="callUser"
                class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
          video
        </button>
      </div>
      <div class="justify-end w-1/3">
        <Chat
            :userName="userName"
            :userId="socketId"
            :messages="messages"
            v-if="userName && userConnected"
            @sendMessage="sendMessage"/>
      </div>
    </div>
    <div class="w-full mt-auto bg-black">
      <button class="p-0 w-16 h-16 bg-red-600 rounded-full mouse shadow transition ease-in duration-200 focus:outline-none flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 40px" viewBox="0 0 20 20" fill="white">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      </button>

    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject} from 'vue'
import axios from "axios";
import Chat from "./Chat.vue";
import io, {Socket} from "socket.io-client";

declare interface Message {
  userId: string | null,
  userName: string | null,
  text: string
}

declare interface Videos {
  [key: string]: MediaStream
}

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }

  // if constraints config still lose some prop, you can define it by yourself also
  interface MediaTrackConstraintSet {
    displaySurface?: ConstrainDOMString;
    logicalSurface?: ConstrainBoolean;
    // more....
  }
}
// interface ImportMetaEnv {
//   VITE_APP_TITLE: string
//   // more env variables...
// }
// OR const mediaDevices = navigator.mediaDevices as any;
// const stream = await mediaDevices.getDisplayMedia();


export default defineComponent({
  name: 'Room',
  components: {Chat},
  inject: ['serverName'],
  data() {
    return {
      roomName: null,
      messages: [] as Message[],
      users: [],
      userConnected: false,
      userName: toString(),
      video: undefined,
      videos: {} as Videos,
      socket: {} as Socket,
      socketId: toString(),
      peerConnection: {} as RTCPeerConnection,
      peerConnections: {} as RTCPeerConnection[],
      mediaConstraints: {
        audio: true,
        video: {
          width: {exact: 640},
          height: {exact: 480},
          frameRate: {ideal: 10, max: 15}
        },

      }
    }
  },
  mounted() {
    console.log(import.meta.env)
    axios.get(`https://${this.serverName}/room/${this.$route.params.roomId}`).then(e => {
      this.roomName = e.data.roomName;
    }).catch(() => {

      this.$router.push({path: '/'})
    });

    this.userName = sessionStorage.getItem('userName')!;

    this.peerConnection = new RTCPeerConnection();
  },
  methods: {
    connect() {
      if (this.userName) {
        sessionStorage.setItem('userName', this.userName!)
        this.userConnected = true;

        const socket = io(`https://${this.serverName}/room/${this.$route.params.roomId}`);// todo: set ws://

        this.socket = socket;
        socket.on("connect", () => {
          this.socketId = socket.id;
          this.callUser()
          socket.emit('init', {
            socketId: this.socketId,
            userName: this.userName
          })
          socket.on('users:online', (users) => {
            this.users = users;
          })
          socket.on('new:user', (data) => {
            console.log('new:user', data);
            const self = this;
            this.peerConnections[data.socketId] = new RTCPeerConnection();
            if (self.videos[this.socketId!]) {
              this.call_user(self.videos[this.socketId!], data.socketId)
            }
            this.peerConnections[data.socketId].ontrack = function ({streams: [stream]}) {
              self.videos[data.socketId] = stream
            };
            this.peerConnections[data.socketId].onicecandidate = function ({candidate}) {
              if (candidate && candidate.candidate) {
                candidate && socket.emit('ice-candidates', {
                  candidate: candidate.candidate,
                  socketId: self.socketId,
                  sdpMLineIndex: candidate.sdpMLineIndex
                })
              }
            }
            socket.emit('new:userStart', {
              socketId: this.socketId,
              to: data.socketId,
            })
          })
          socket.on('new:userStart', async (data) => {
            console.log('new:userStart', data);
            const self = this;

            this.peerConnections[data.socketId] = new RTCPeerConnection();
            this.peerConnections[data.socketId].ontrack = function ({streams: [stream]}) {
              self.videos[data.socketId] = stream
              console.log(stream, 'new:userStart')
            };
            this.peerConnections[data.socketId].onicecandidate = function ({candidate}) {
              if (candidate && candidate.candidate) {
                candidate && socket.emit('ice-candidates', {
                  candidate: candidate.candidate,
                  socketId: self.socketId,
                  sdpMLineIndex: candidate.sdpMLineIndex
                })
              }
            }
            // this.peerConnections[data.socketId].onnegotiationneeded = function (event) {
            //   console.log(event, 2);
            // };

          })
          socket.on('message:from', (data) => {
            this.messages = [...this.messages, data]
          })
          socket.on("call-made", async data => {

            await this.peerConnections[data.socketId].setRemoteDescription(
                new RTCSessionDescription(data.offer)
            );
            const answer = await this.peerConnections[data.socketId].createAnswer();
            await this.peerConnections[data.socketId].setLocalDescription(new RTCSessionDescription(answer));

            socket.emit("make-answer", {
              answer,
              to: data.socketId,
              socketId: this.socketId
            });
          });
          socket.on("answer-made", async data => {
            console.log('answer-made');
            await this.peerConnections[data.socketId].setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
          });
          socket.on("ice-candidates", data => {
            const candidate = new RTCIceCandidate({sdpMLineIndex: data.sdpMLineIndex, candidate: data.candidate});
            this.peerConnections[data.socketId].addIceCandidate(candidate);
          });

          socket.on('set:messages', (messages) => {
            this.messages = messages
          })

        });
      }
    },
    async callUser() {
      const self = this;
      navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(stream => {
        self.videos[this.socketId!] = stream;
        for (const userName in self.peerConnections) {

          this.call_user(stream, userName)
        }
      }).catch(e => {
        navigator.mediaDevices.getDisplayMedia(this.mediaConstraints).then(stream => {
          self.videos[this.socketId!] = stream;
          for (const userName in self.peerConnections) {

            this.call_user(stream, userName)

          }
        })
      });
    },
    async call_user(stream: any, userName: any) {
      stream.getTracks().forEach((track: any) => this.peerConnections[userName!].addTrack(track, stream));
      const offer = await this.peerConnections[userName!].createOffer();
      await this.peerConnections[userName!].setLocalDescription(new RTCSessionDescription(offer));
      this.socket.emit("call-user", {
        offer,
        to: userName,
        socketId: this.socketId
      });
    },
    sendMessage(message: string) {
      this.socket.emit('message:to', {
        userId: this.socketId,
        userName: this.userName,
        message
      })
      this.messages = [...this.messages, {
        userId: this.socketId,
        userName: this.userName,
        text: message
      }]
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
