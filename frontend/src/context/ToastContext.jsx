import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const STYLES = {
  success: { icon: CheckCircle2, cls: "border-primary-200 bg-primary-50 text-primary-800" },
  error: { icon: XCircle, cls: "border-red-200 bg-red-50 text-red-800" },
  info: { icon: Info, cls: "border-blue-200 bg-blue-50 text-blue-800" },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(
    (id) => setToasts((list) => list.filter((t) => t.id !== id)),
    []
  );

  const push = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, cls } = STYLES[type];
          return (
            <div
              key={id}
              className={`flex items-start gap-3 rounded-lg border p-3.5 shadow-lg ${cls}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button onClick={() => dismiss(id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
