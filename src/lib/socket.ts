import Pusher from 'pusher-js';

const {VITE_APP_KEY, VITE_APP_CLUSTER} = import.meta.env;

const pusher = new Pusher(VITE_APP_KEY, {
  cluster: VITE_APP_CLUSTER,
});

export const socket = pusher;