import "./App.css";
import { AppShell } from "./components";
import { FinanceProvider, useFinance } from "./context";
import { LoadingSession, LoginPage } from "./content";

function AppContent() {
  const { isCheckingSession, isSignedIn } = useFinance();

  if (isCheckingSession) return <LoadingSession />;
  if (!isSignedIn) return <LoginPage />;

  return <AppShell />;
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
