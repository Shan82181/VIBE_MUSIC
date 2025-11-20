import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import GlobalPlayerBar from "@/components/GlobalPlayerBar";
import PlayerErrorBoundary from "../components/ErrorBoundary/PlayerErrorBoundary";
import { usePlayerStore } from "@/store/usePlayerStore";
const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Topbar></Topbar>
      {/* <Sidebar></Sidebar> */}
      <ResizablePanelGroup
        className="bg-amber-300 flex-1"
        direction="horizontal"
      >
        <ResizablePanel
          minSize={15}
          defaultSize={20}
          maxSize={25}
          className="bg-black"
        >
          <Sidebar></Sidebar>
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-700 hover:bg-gray-500 cursor-col-resize" />
        <ResizablePanel minSize={50} defaultSize={80} className="bg-gray-900">
          <Outlet />
          <PlayerErrorBoundary resetPlayer={usePlayerStore.getState().reset}>
            <GlobalPlayerBar />
          </PlayerErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MainLayout;
