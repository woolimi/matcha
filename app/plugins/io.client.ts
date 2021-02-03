import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { io } from 'socket.io-client';

export default ({ env }: Context, inject: Inject) => {
	inject('socket', io(env.WS_URL, { withCredentials: true }));
};
