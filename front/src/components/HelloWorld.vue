<template>
  <div>

<!--    <div  v-for="room in rooms" class="flex justify-start cursor-pointer text-gray-700 hover:text-blue-400 hover:bg-blue-100 rounded-md px-2 py-2 my-2">-->
<!--      <span class="bg-gray-400 h-2 w-2 m-2 rounded-full"></span>-->
<!--      <div class="flex-grow font-medium px-2"><router-link :to="`/room/${room.key}`">{{ room.name }}</router-link></div>-->
<!--      <div class="text-sm font-normal text-gray-500 tracking-wide">Team</div>-->
<!--    </div>-->
<!--    <div class="flex justify-start cursor-pointer text-gray-700 hover:text-blue-400 hover:bg-blue-100 rounded-md px-2 py-2 my-2">-->
<!--      <span class="bg-green-400 h-2 w-2 m-2 rounded-full"></span>-->
<!--      <div class="flex-grow font-medium px-2">Jeffrey Wey</div>-->
<!--      <div class="text-sm font-normal text-gray-500 tracking-wide">Member</div>-->
<!--    </div>-->
    <div class="h-screen flex justify-center items-center">
      <input class="shadow appearance-none border rounded py-2 px-3 text-grey-darker"
             type="text" v-model="roomName">
      <button v-on:click="createRoom"
              class="tracking-wider text-white bg-blue-500 px-4 py-1 text-sm rounded leading-loose mx-2 font-semibold">
        Create
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import axios from "axios";

export default defineComponent({
  name: 'HelloWorld',
  data() {
    return {
      rooms: null,
      roomName: null
    }
  },
  methods: {
    createRoom() {
      if (this.roomName) {
        axios.post(`https://192.168.0.106/room/create`, {
          name: this.roomName
        }).then(e => {
          this.$router.push({path: `/room/${e.data.key}`})
        })
      }
    }
  },
  mounted() {

    // axios.get(`https://192.168.0.106/room/index`).then(e => {
    //   this.rooms = e.data
    // }).catch((e) => {
    //   alert('error')
    // });
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
