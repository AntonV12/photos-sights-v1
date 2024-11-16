import { Outlet, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, fetchCurrentUser, logoutUser } from "../parts/users/authSlice";
import { fetchUsers } from "../parts/users/usersSlice";
import { fetchSights, selectAllSights } from "../parts/sights/sightsSlice";
import { useEffect } from "react";
import Message from "../Message";

import SearchForm from "../parts/sights/SearchForm";

function Root() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const sights = useSelector(selectAllSights);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
    dispatch(fetchUsers());
    dispatch(fetchSights());
  }, [dispatch, currentUser]);

  const logout = () => {
    dispatch(logoutUser());
  };

  return (
    <div id="wrapper">
      <header>
        <nav>
          <SearchForm sights={sights} />

          <NavLink to={"/"} className={({ isActive, isPending }) => (isActive ? "active" : isPending ? "loading" : "")}>
            Главная страница
          </NavLink>

          {currentUser ? (
            <>
              <NavLink to={`/users/${currentUser?._id}`}>Личный кабинет</NavLink>
              <NavLink to={"/loadPage"}>Страница загрузки</NavLink>
              <NavLink to={"#"} onClick={logout} className={() => ""}>
                Выйти
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to={"/login"}>Войти</NavLink>
              <NavLink to={"/signup"}>Зарегистрироваться</NavLink>
            </>
          )}
        </nav>
      </header>

      <div id="container">
        <>
          <main>
            <Outlet />
            <button id="toTopBtn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ↑
            </button>
          </main>
        </>
      </div>

      <Message />
    </div>
  );
}

export default Root;
