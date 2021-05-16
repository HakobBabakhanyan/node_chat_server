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

      <video width="460" height="306" :src="video" preload autoplay>
      </video>
      <video width="460" height="306" :src="videoS" preload autoplay>
      </video>
      <button v-on:click="test"
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
import * as constants from "constants";


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
      pc: {},
      userConnected: false,
      userName: null,
      video: '',
      videoS: '',
      socket: {} as Socket,
      mediaConstraints: {
        audio: false,
        video: {width: 400, height: 400},
      }
    }
  },
  mounted() {
    axios.get(`https://127.0.0.1/room/${this.$route.params.roomId}`).then(e => {
      this.roomName = e.data.roomName;
    }).catch((e) => {
      console.log(e.response.status);
      this.$router.push({path: '/'})
    });
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
            console.log(data);
            this.messages = [...this.messages, data]
          })
          ///
          socket.on('new:user', async (data) => {
            socket.emit('new:userStart', {to: data.name, sender: this.userName});

            this.pc[data.name] = new RTCPeerConnection();
            await this.getUserFullMediaNew().then((stream) => {
              stream.getTracks().forEach((track) => {
                this.pc[data.name].addTrack(track, stream);//should trigger negotiationneeded event
              });
            });
            this.pc[data.name].onicecandidate = ({candidate}) => {
              console.log('onicecandidate');
              socket.emit('ice:candidates', {candidate: candidate, to: data.name, sender: this.userName});
            };
            // true
            this.pc[data.name].onnegotiationneeded = async () => {
              let offer = await this.pc[data.name].createOffer();

              await this.pc[data.name].setLocalDescription(offer);

              this.socket.emit('sdp', {
                description: this.pc[data.name].localDescription,
                to: data.name,
                sender: this.userName
              });
            };
            //
            this.pc[data.name].ontrack = (e) => {
              alert(4)
            }

            this.pc[data.name].onconnectionstatechange = (d) => {
              switch (this.pc[data.name].iceConnectionState) {
                case 'disconnected':
                case 'failed':
                  alert('failed')
                  break;

                case 'closed':
                  alert('closed');
                  break;
              }
            };
            this.pc[data.name].onsignalingstatechange = (d) => {
              switch (this.pc[data.name].signalingState) {
                case 'closed':
                  console.log("Signalling state is 'closed'");
                  alert("Signalling state is 'closed'");
                  break;
              }
            };


          })

          socket.on('news:userStart', async (data) => {
            alert(2)

            this.pc[data.name] = new RTCPeerConnection();

            await this.getUserFullMediaNew().then((stream) => {
              stream.getTracks().forEach((track) => {
                this.pc[data.name].addTrack(track, stream);//should trigger negotiationneeded event
              });
            });
            this.pc[data.name].onicecandidate = ({candidate}) => {
              console.log('onicecandidate');
              socket.emit('ice:candidates', {candidate: candidate, to: data.name, sender: this.userName});
            };
            this.pc[data.name].ontrack = (e) => {
              alert(4)
            }
            this.pc[data.name].onconnectionstatechange = (d) => {
              switch (this.pc[data.name].iceConnectionState) {
                case 'disconnected':
                case 'failed':
                  alert('failed')
                  break;

                case 'closed':
                  alert('closed');
                  break;
              }
            };
            this.pc[data.name].onsignalingstatechange = (d) => {
              switch (pc[partnerName].signalingState) {
                case 'closed':
                  console.log("Signalling state is 'closed'");
                  h.closeVideo(partnerName);
                  break;
              }
            };


          })

          socket.on('ice:candidates', async (data) => {
            if (data.candidate) {

              this.pc[data.sender] = new RTCPeerConnection();

              await this.getUserFullMediaNew().then((stream) => {
                stream.getTracks().forEach((track) => {
                  this.pc[data.sender].addTrack(track, stream);//should trigger negotiationneeded event
                });

              });

              console.log(this.pc[data.sender])

              await this.pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate))

            }

          })

          socket.on('sdp', async (data) => {
            console.log(data, 'sdp', data.sender, this.userName)
            if (data.description.type === 'offer') {
              data.description ? await this.pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

              this.getUserFullMediaNew().then(async (stream) => {
                stream.getTracks().forEach((track) => {
                  this.pc[data.sender].addTrack(track, stream);
                });

                let answer = await this.pc[data.sender].createAnswer();
                await this.pc[data.sender].setLocalDescription(answer);

                socket.emit('sdp', {
                  description: this.pc[data.sender].localDescription,
                  to: data.sender,
                  sender: socketId
                });

              })
            }
            // this.videoS = data.description.sdp;
          })

        });
      }
    },
    test() {

      const self = this;
      this.pc[this.userName] = new RTCPeerConnection();

      this.getUserFullMediaNew().then((stream) => {

        for (const track of stream.getTracks()) {
          this.pc[this.userName].addTrack(track, stream);
        }

        this.pc[this.userName].onicecandidate = ({candidate}) => {
          console.log('onicecandidate');
          this.socket.emit('ice:candidates', {candidate: candidate, userName: this.userName});
        };
        this.pc[this.userName].ontrack = () => {
          alert(1)
          // socket.emit('ice candidates', {candidate: candidate, to: partnerName, sender: socketId});
        };

        this.pc[this.userName].onnegotiationneeded = async () => {
          // let offer = await this.pc[this.userName].createOffer();
          //
          // await this.pc[this.userName].setLocalDescription(offer);


          // let answer = await pc.createAnswer();
          //
          // await pc.setLocalDescription(answer);

          // self.socket.emit('sdp', {
          //   description: this.pc[this.userName].localDescription,
          //   user : this.userName
          // });
        };

        // this.socket.emit('std', {
        //   pc
        // })


      })
    }
    ,
    sendMessage(message: any) {

      this.socket.emit('message:to', {
        userName: this.userName,
        message
      })

      /** @type [{name: string, text: string}] */
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
