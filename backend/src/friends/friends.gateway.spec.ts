import { FriendsGateway } from './friends.gateway';

describe('FriendsGateway', () => {
  const emit = jest.fn();
  const to = jest.fn(() => ({ emit }));
  let gateway: FriendsGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new FriendsGateway();
    gateway.server = { to } as never;
  });

  it('sends friend:request to the recipient room', () => {
    const payload = {
      requestId: 1,
      from: { id: 2, username: 'bob', name: 'Bob', avatarUrl: null },
    };
    gateway.notifyRequestReceived(5, payload);
    expect(to).toHaveBeenCalledWith('user:5');
    expect(emit).toHaveBeenCalledWith('friend:request', payload);
  });

  it('send friend:accepted to the sender room', () => {
    const payload = {
      friendshipId: 1,
      friend: { id: 2, username: 'bob', name: 'Bob', avatarUrl: null },
    };
    gateway.notifyRequestAccepted(5, payload);
    expect(to).toHaveBeenCalledWith('user:5');
    expect(emit).toHaveBeenCalledWith('friend:accepted', payload);
  });

  it('sends friend:removed to the other participant room', () => {
    gateway.notifyFriendshipRemoved(5, { friendshipId: 1 });
    expect(to).toHaveBeenCalledWith('user:5');
    expect(emit).toHaveBeenCalledWith('friend:removed', { friendshipId: 1 });
  });
});
