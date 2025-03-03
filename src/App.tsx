// routes
import { ProtectedRoutes, UnProtectedRoutes } from "@/routes";
import ReactModal from "react-modal";

// store
import { AuthStore } from "@/globalStore";

// store
import { GlobalStore } from "@/globalStore";
import { useEffect } from "react";

function App() {
  const { authUser, stopLoader, setAuthUser, loaders } = AuthStore();
  const { ModalComponent, ModalCloseButton, isModalOpen } = GlobalStore();

  const authLoader = loaders["auth/initial-load"];
  const loggedInUser = localStorage.getItem("liu");

  useEffect(() => {
    console.log(JSON.parse(loggedInUser as string));
    if (loggedInUser) {
      setAuthUser(JSON.parse(loggedInUser));
    } else {
      setAuthUser(null);
    }

    stopLoader("auth/initial-load");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="main">
      {authLoader ? (
        <div>loading...</div>
      ) : authUser ? (
        <ProtectedRoutes />
      ) : (
        <UnProtectedRoutes />
      )}
      <ReactModal
        isOpen={isModalOpen}
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
