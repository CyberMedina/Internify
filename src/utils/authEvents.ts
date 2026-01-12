type AuthEventType = 'UNAUTHORIZED';
type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: Record<AuthEventType, AuthEventListener[]> = {
    UNAUTHORIZED: [],
  };

  on(event: AuthEventType, listener: AuthEventListener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event: AuthEventType, listener: AuthEventListener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: AuthEventType) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => listener());
  }
}

export const authEvents = new AuthEventEmitter();
