// routes
import { ProtectedRoutes, UnProtectedRoutes } from "@/routes";

const isAuthenticated = false;

function App() {
  return (
    <main className="main">
      {isAuthenticated ? <ProtectedRoutes /> : <UnProtectedRoutes />}
    </main>
  );
}

export default App;
