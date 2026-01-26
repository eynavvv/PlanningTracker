import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        duration: 4000,
      }}
      expand
      richColors
    />
  );
}
