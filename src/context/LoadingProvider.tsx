import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading from "../components/Loading";
import { setProgress } from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const progressRef = useRef<ReturnType<typeof setProgress> | null>(null);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    if (!isLoading) return;

    // Start simulated progress immediately so we're never stuck at 0% if 3D init stalls.
    const progress = setProgress((value) => setLoading(value));
    progressRef.current = progress;

    // Safety: force-finish after 15s so the site is still usable even if WebGL/model load fails.
    const forceFinishTimeout = window.setTimeout(() => {
      progress.finish();
    }, 15000);

    return () => {
      window.clearTimeout(forceFinishTimeout);
      progress.stop();
      progressRef.current = null;
    };
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
