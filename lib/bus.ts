type Handler = (payload?: any) => void;
const listeners: Record<string, Set<Handler>> = {};
export const bus = {
  on(evt: string, fn: Handler) {
    (listeners[evt] ??= new Set()).add(fn);
    return () => listeners[evt]?.delete(fn);
  },
  emit(evt: string, payload?: any) {
    listeners[evt]?.forEach(fn => fn(payload));
  },
};

