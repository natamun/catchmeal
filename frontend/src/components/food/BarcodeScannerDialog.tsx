import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import {
  createScannerError,
  prepareZXingModule,
  Scanner,
  type ScannerErrorKind,
} from '@yudiel/react-qr-scanner';
import { LoaderCircle } from 'lucide-react';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';

import { BaseDialog } from '../ui/BaseDialog';
import { findScannerCamera } from './scannerCamera';

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) =>
      path.endsWith('.wasm') ? wasmUrl : prefix + path,
  },
});

type ScannerProps = ComponentProps<typeof Scanner>;

const FORMATS: ScannerProps['formats'] = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

const CONTINUOUS_FOCUS: MediaTrackConstraintSet & { focusMode?: string } = {
  focusMode: 'continuous',
};

const COMPONENTS: ScannerProps['components'] = { finder: false };

const SCANNER_ERRORS: Partial<Record<ScannerErrorKind, string>> = {
  'permission-denied': 'Accès à la caméra refusé',
  'no-camera': 'Aucune caméra détectée',
  'in-use': 'Caméra déjà utilisée par une autre application',
  'insecure-context': 'La caméra nécessite une connexion sécurisée',
};

const errorMessage = (kind: ScannerErrorKind) =>
  SCANNER_ERRORS[kind] ?? 'Caméra indisponible';

interface BarcodeScannerDialogProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerDialog({
  onDetected,
  onClose,
}: BarcodeScannerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [cameraId, setCameraId] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    let cancelled = false;
    findScannerCamera()
      .then((deviceId) => {
        if (!cancelled) {
          setCameraId(deviceId);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(errorMessage(createScannerError(cause).kind));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const constraints = useMemo(
    (): MediaTrackConstraints => ({
      deviceId: cameraId,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      advanced: [CONTINUOUS_FOCUS],
    }),
    [cameraId],
  );

  const renderCamera = () => {
    if (error) {
      return <p className="px-6 text-center text-sm text-green-600">{error}</p>;
    }
    if (isSearching) {
      return <LoaderCircle className="h-6 w-6 animate-spin text-green-400" />;
    }
    return (
      <Scanner
        constraints={constraints}
        formats={FORMATS}
        components={COMPONENTS}
        sound={false}
        onScan={(codes) => {
          const barcode = codes[0]?.rawValue;
          if (barcode) {
            onDetected(barcode);
          }
        }}
        onError={(scannerError) => setError(errorMessage(scannerError.kind))}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-2/5 w-4/5 rounded-xl border-2 border-green-400 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
        </div>
      </Scanner>
    );
  };

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title="Scanner un code-barres"
      maxWidth="sm"
      onClose={onClose}
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-green-50">
        {renderCamera()}
      </div>
      <p className="text-center text-sm text-green-500">
        Placez le code-barres dans le cadre
      </p>
    </BaseDialog>
  );
}
