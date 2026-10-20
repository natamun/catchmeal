const STORAGE_KEY = 'scanner-camera-id';
const RELEASE_DELAY_MS = 150;

type FocusCapabilities = MediaTrackCapabilities & { focusMode?: string[] };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Stops a test stream. Some phones need a short pause before another camera can
 * open.
 */
async function release(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
  await wait(RELEASE_DELAY_MS);
}

function canAutofocus(stream: MediaStream) {
  const [track] = stream.getVideoTracks();
  const { focusMode } = track.getCapabilities() as FocusCapabilities;
  return focusMode?.includes('continuous') ?? false;
}

const cameraIndex = (label: string) =>
  Number(/camera2 (\d+)/.exec(label)?.[1] ?? 99);

/**
 * Tries the default rear camera first, then the other rear ones (sorted by
 * their Android "camera2 N" index), and keeps the first one that can autofocus.
 * When the browser cannot tell, the scanner just uses its default camera.
 */
async function pickRearCamera() {
  const { mediaDevices } = navigator;
  if (!('focusMode' in mediaDevices.getSupportedConstraints())) {
    return undefined;
  }

  const stream = await mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
  });
  const defaultId = stream.getVideoTracks()[0].getSettings().deviceId;
  const defaultFocuses = canAutofocus(stream);
  await release(stream);
  if (defaultFocuses) {
    return defaultId;
  }

  const devices = await mediaDevices.enumerateDevices();
  const otherRearCameras = devices
    .filter(
      (device) =>
        device.kind === 'videoinput' &&
        device.deviceId !== defaultId &&
        /back|rear|environment/i.test(device.label),
    )
    .sort((a, b) => cameraIndex(a.label) - cameraIndex(b.label));

  for (const device of otherRearCameras) {
    try {
      const candidate = await mediaDevices.getUserMedia({
        video: { deviceId: { exact: device.deviceId } },
      });
      const focuses = canAutofocus(candidate);
      await release(candidate);
      if (focuses) {
        return device.deviceId;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

async function resolveCamera() {
  const remembered = localStorage.getItem(STORAGE_KEY);
  if (remembered) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (devices.some((device) => device.deviceId === remembered)) {
      return remembered;
    }
  }

  const picked = await pickRearCamera();
  if (picked) {
    localStorage.setItem(STORAGE_KEY, picked);
  }
  return picked;
}

/**
 * Calls made at the same time share one search instead of opening the cameras
 * twice.
 */
let pending: Promise<string | undefined> | null = null;

/**
 * Chooses the camera used to scan barcodes and remembers it in localStorage.
 * Phones often have several rear cameras and the default one may not autofocus,
 * which makes barcodes unreadable.
 */
export function findScannerCamera() {
  pending ??= resolveCamera().finally(() => {
    pending = null;
  });
  return pending;
}
