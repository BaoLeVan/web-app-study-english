/** Web Push subscription helpers — service worker is registered in app/(app)/layout client. */

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Cleaned = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Cleaned);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function subscribeToPush(
  vapidPublicKey: string,
): Promise<PushSubscriptionJSON | null> {
  const reg = await registerServiceWorker();
  if (!reg) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing.toJSON();

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  return sub.toJSON();
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return false;
  return sub.unsubscribe();
}
