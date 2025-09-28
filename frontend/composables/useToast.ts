export function useToast() {
  const notify = (message: string) => {
    if (process.client) {
      // simple placeholder toast implementation
      console.log('[Toast]', message);
    }
  };

  return {
    success: (message: string) => notify(message),
    error: (message: string) => notify(message),
  };
}
