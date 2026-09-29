import { useSocket } from '../../socket/socket-context';

export function ConnectionBanner() {
  const { isConnected, hasConnectedOnce } = useSocket();

  if (!hasConnectedOnce || isConnected) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-700">
      Connexion perdue, reconnexion en cours...
    </div>
  );
}
