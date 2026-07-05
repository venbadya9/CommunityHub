import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { isOnline } from "../hooks/network";

export const useNetworkStatus = (): boolean => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const refresh = () => {
      NetInfo.fetch().then((state) => setIsConnected(isOnline(state)));
    };

    refresh();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
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

  return isConnected;
};
