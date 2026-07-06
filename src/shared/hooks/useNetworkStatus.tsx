import NetInfo from "@react-native-community/netinfo";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";
import { isOnline } from "./network";

const NetworkStatusContext = createContext<boolean | null>(null);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let requestId = 0;

    const refresh = () => {
      const currentRequestId = ++requestId;
      NetInfo.fetch().then((state) => {
        if (currentRequestId === requestId) {
          setIsConnected(isOnline(state));
        }
      });
    };

    refresh();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      requestId++; // invalidate any in-flight fetch() from refresh()
      setIsConnected(isOnline(state));
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          refresh();
        }
      },
    );

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={isConnected}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = (): boolean => {
  const value = useContext(NetworkStatusContext);

  if (value === null) {
    throw new Error("useNetworkStatus should be used in a NetworkProvider");
  }

  return value;
};
