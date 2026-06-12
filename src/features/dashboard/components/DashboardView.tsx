import { useEffect, useState } from "react";
import DashboardTop from "./DashboardTop";
import SideNav from "./SideNav";
import BudgetPieChart from "../charts/BudgetDoughnutChart";
import MoneyFlowChart from "../charts/MoneyFlowChart";
import RecentTransactions from "../../transactions/components/RecentTransactions";
import SavingGoals from "../../goals/components/SavingGoals";
import AI from "../../ai/components/AIPanel";
import ChatIcon from "../../ai/components/ChatIcon";
import ProfilePanel from "../../user/components/ProfilePanel";
import TransactionsPage from "../../transactions/components/TransactionsPage";
import GoalsPage from "../../goals/components/GoalsPage";
import BillsPage from "../../bills/components/BillsPage";
import SavingPlanPage from "../../saving-plan/components/SavingPlanPage";

type DashboardViewProps = {
  initialActiveComponent?: string;
};

function DashboardView({
  initialActiveComponent = "Dashboard",
}: DashboardViewProps) {
  const [activeComponent, setActiveComponent] = useState<string>(
    initialActiveComponent
  );

  useEffect(() => {
    setActiveComponent(initialActiveComponent);
  }, [initialActiveComponent]);

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "ChatAgent":
        return <AI />;

      case "Setting":
        return <ProfilePanel />;

      case "Transactions":
        return <TransactionsPage />;

      case "Bills":
        return <BillsPage />;

      case "Goals":
        return <GoalsPage />;

      case "SavingPlan":
        return <SavingPlanPage />;

      default:
        return (
          <div className="Charts mt-0 space-y-4 px-2 sm:px-3 md:px-0 lg:mt-[-1.5rem]">
            {/* 🔹 الصف الأول */}
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-4">
              <div className="min-w-0 w-full lg:w-[65%]">
                <MoneyFlowChart />
              </div>

              <div className="min-w-0 w-full lg:w-[35%]">
                <BudgetPieChart />
              </div>
            </div>

            {/* 🔹 الصف الثاني */}
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-4">
              <div className="min-w-0 flex-1 basis-[65%]">
                <RecentTransactions />
              </div>

              <div className="min-w-0 flex-1 basis-[35%]">
                <SavingGoals />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section
      id="Admin"
      className="relative flex min-h-screen overflow-x-hidden overflow-y-auto bg-gray-50"
    >
      {/* 🧭 الشريط الجانبي */}
      <SideNav
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />

      {/* 📊 المحتوى الرئيسي */}
      <div
        className="
          ml-16
          flex
          min-w-0
          flex-1
          flex-col
          overflow-x-hidden
          transition-all
          duration-300
          md:ml-20
          lg:ml-60
        "
      >
        {activeComponent !== "Setting" &&
            activeComponent !== "Transactions" &&
            activeComponent !== "Bills" &&
          activeComponent !== "Goals" &&
          activeComponent !== "SavingPlan" && (
            <DashboardTop />
          )}

        <div className="min-w-0 p-3 sm:p-4 md:p-4">
          {renderActiveComponent()}
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-[1111] sm:bottom-8 sm:right-8">
        <ChatIcon />
      </div>
    </section>
  );
}

export default DashboardView;
