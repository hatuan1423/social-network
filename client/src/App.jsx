import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { route } from "./routes";
import { useEffect } from "react";
import * as UserService from "~/services/UserService";
import { updateUser } from "./redux/Slices/userSlice";
import { ProtectedRoute } from "./components";
import {
  ForgotPasswordpage,
  HomePage,
  LoginPage,
  RegisterPage,
  ResetPassword,
  OtpVerificationPage,
} from "./pages";
import { handleDecoded } from "~/helpers/authHelper";

function App() {
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const { decoded, token } = handleDecoded();
    if (decoded?.userId) {
      handleGetDetailUser({ id: decoded?.userId, token });
    }
  }, []);

  const handleGetDetailUser = async ({ id, token }) => {
    const res = await UserService.getDetailUserByUserId(id);
    dispatch(updateUser({ ...res?.result, token }));
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div>
      <div data-theme={theme} className="w-full min-h-[100vh] antialiased">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordpage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
          <Route path="/" element={<HomePage />} />
          {route.map((route, i) => {
            const Page = route.element;
            const isCheckAuth =
              !route.isPrivate || user.roles[0]?.name.includes("ADMIN");
            return (
              <Route
                key={i}
                path={isCheckAuth ? route.path : ""}
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <Page />
                  </ProtectedRoute>
                }
              />
            );
          })}
        </Routes>
      </div>
    </div>
  );
}

export default App;
