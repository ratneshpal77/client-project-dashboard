import AppRoutes from "./routes/AppRoutes";
import AuthInitializer from "./components/auth/AuthInitializer";
import SocketManager from "./components/auth/SocketManager";

function App() {
  return (
    <AuthInitializer>
      <SocketManager />
      <AppRoutes />
    </AuthInitializer>
  );
}

export default App;