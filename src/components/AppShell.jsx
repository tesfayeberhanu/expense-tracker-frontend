import {
  OperatorsPage,
  OverviewPage,
  ReportsPage,
  SettingsPage,
  TransactionsPage,
} from "../content";
import { useFinance } from "../context";
import Alert from "./Alert";
import DateFilter from "./DateFilter";
import PasswordResetModal from "./PasswordResetModal";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageMap = {
  overview: OverviewPage,
  transactions: TransactionsPage,
  operators: OperatorsPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

export default function AppShell() {
  const {
    activeSection,
    canViewTransactions,
    error,
    notice,
    setError,
    setNotice,
  } = useFinance();
  const ActivePage = pageMap[activeSection] || OverviewPage;

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <Alert message={error} onDismiss={() => setError("")} />
        <Alert
          message={notice}
          onDismiss={() => setNotice("")}
          type="success"
        />

        {canViewTransactions && activeSection !== "settings" && <DateFilter />}
        <ActivePage />
      </main>

      <PasswordResetModal />
    </div>
  );
}
