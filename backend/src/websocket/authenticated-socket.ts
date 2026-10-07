import { DefaultEventsMap, Socket } from 'socket.io';

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { userId: number }
>;
