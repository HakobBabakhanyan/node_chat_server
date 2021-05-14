<template>
  <div>
    <p class="text-2xl text-green-600 font-bold">{{ roomName }}</p>
    <div>
      <input v-if="!userConnected" class="shadow appearance-none border rounded py-2 px-3 text-grey-darker"
             type="text" v-model="userName">
      <button v-if="!userConnected" v-on:click="connect"
              class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
        connect
      </button>
    </div>

    <Chat :userName="userName" :messages="messages" v-if="userName && userConnected"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import axios from "axios";
import Chat from "./Chat.vue";
import io from "socket.io-client";


export default defineComponent({
  name: 'Room',
  components: {Chat},
  data() {
    return {
      roomName: null,
      messages: [],
      userConnected: false,
      userName: null
    }
  },
  mounted() {
    axios.get(`https://127.0.0.1/room/${this.$route.params.roomId}`).then(e => {
      this.roomName = e.data.roomName;
    });
  },
  methods: {
    connect() {
      if(this.userName){
        this.userConnected = true;
        // const manager  = new Manager("https://127.0.0.1") // todo: set ws://

        const socket = io('https://127.0.0.1/room/3bdfec0517114c49e555');

        socket.on("connect", () => {
          console.log(socket.connected); // true
        });
      }
    }
  },
  setup: () => {
    console.log(self.roomName)
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
