import { useEffect, useState } from 'react';

/**
 * Whether the device has a camera, to show the barcode scan button only when
 * scanning is possible. Listing the devices asks no permission.
 */
export function useHasCamera() {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices as MediaDevices | undefined;
    if (!mediaDevices) {
      return;
    }

    let cancelled = false;
    mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (!cancelled) {
          setHasCamera(devices.some((device) => device.kind === 'videoinput'));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return hasCamera;
}
