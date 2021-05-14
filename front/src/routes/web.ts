import HelloWorld from "../components/HelloWorld.vue";
import Room from "../components/Room.vue";

const routes = [
    { path: '/', component: HelloWorld },
    { path: '/room/:roomId', component: Room },
]

export default routes;