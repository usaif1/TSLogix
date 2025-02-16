// routes
import { ProtectedRoutes, UnProtectedRoutes } from "@/routes";

// store
import { AuthStore } from "@/globalStore";

function App() {
  const authUser = AuthStore.use.authUser();

  return (
    <main className="main">
      {authUser ? <ProtectedRoutes /> : <UnProtectedRoutes />}
    </main>
  );
}

export default App;
