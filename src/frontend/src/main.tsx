import ReactDOM from "react-dom/client";
import { FirebaseAuthProvider } from "./hooks/useFirebaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "../index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <App />
    </FirebaseAuthProvider>
  </QueryClientProvider>,
);
