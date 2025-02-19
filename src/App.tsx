// routes
import { ProtectedRoutes, UnProtectedRoutes } from "@/routes";
import ReactModal from "react-modal";

// store
import { AuthStore } from "@/globalStore";

// store
import { GlobalStore } from "@/globalStore";

function App() {
  const authUser = AuthStore.use.authUser();

  const ModalComponent = GlobalStore.use.modalComponent();
  const ModalCloseButton = GlobalStore.use.modalCloseButton();
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
            borderColor: "#787878",
            background: "#ffffff",
            width: "fit-content",
            margin: "auto",
          },
          overlay: {
            zIndex: 99,
            background: "rgba(24,24,27,0.52)",
          },
        }}
      >
        <div className="absolute top-2 right-2">
          <ModalCloseButton />
        </div>
        <ModalComponent />
      </ReactModal>
    </main>
  );
}

export default App;
