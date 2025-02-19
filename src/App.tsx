// routes
import { ProtectedRoutes, UnProtectedRoutes } from "@/routes";
import ReactModal from "react-modal";

// components
import { ModalCloseBtn } from "@/components";

// store
import { AuthStore } from "@/globalStore";

// store
import { GlobalStore } from "@/globalStore";

function App() {
  const authUser = AuthStore.use.authUser();

  const ModalComponent = GlobalStore.use.modalComponent();
  const isOpen = GlobalStore.use.isModalOpen();

  return (
    <main className="main">
      {authUser ? <ProtectedRoutes /> : <UnProtectedRoutes />}
      <ReactModal
        isOpen={isOpen}
        shouldCloseOnOverlayClick={false}
        style={{
          content: {
            maxHeight: "80vh",
            height: "fit-content",
            alignSelf: "center",
            background: "#1C1C1C",
            borderColor: "#787878",
          },
          overlay: { zIndex: 99 },
        }}
      >
        <ModalCloseBtn />
        <ModalComponent />
      </ReactModal>
    </main>
  );
}

export default App;
