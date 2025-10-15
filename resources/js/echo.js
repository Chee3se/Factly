import Echo from "laravel-echo";

import Pusher from "pusher-js";
window.Pusher = Pusher;

const key = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: key,
  cluster: cluster,
  encrypted: true,
});
