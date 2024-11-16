import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./app/root";
import SignUpForm from "./parts/users/SignUpForm";
import LoginForm from "./parts/users/LoginForm";
import LoadPage from "./parts/sights/LoadPage";
import UserPage from "./parts/users/UserPage";
import SightPage from "./parts/sights/SightPage";
import Index from "./parts/index";
import ErrorPage404 from "./ErrorPage404";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage404 />,
    children: [
      {
        errorElement: <ErrorPage404 />,
        children: [
          { index: true, element: <Index /> },
          { path: "/signup", element: <SignUpForm /> },
          { path: "/login", element: <LoginForm /> },
          { path: "/loadPage", element: <LoadPage /> },
          { path: "/users/:userId", element: <UserPage /> },
          { path: "/sights/:sightId", element: <SightPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
