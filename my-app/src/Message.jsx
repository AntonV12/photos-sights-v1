import { useSelector, useDispatch } from "react-redux";
import { memo, useEffect, useRef } from "react";
import { clearUsersMessage, clearUsersError } from "./parts/users/usersSlice";
import { clearAuthMessage, clearAuthError } from "./parts/users/authSlice";
import { clearSightsMessage, clearSightsError } from "./parts/sights/sightsSlice";
import { useNavigate } from "react-router-dom";

const Message = () => {
  const message = useSelector((state) => state.users.message || state.auth.message || state.sights.message);
  const error = useSelector((state) => state.users.error || state.auth.error || state.sights.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const okBtnRef = useRef(null);

  useEffect(() => {
    if (!message && !error) return;

    document.body.style.overflow = "hidden";
    okBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        okBtnRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [message, error]);

  const clearMessage = async () => {
    if (error) {
      dispatch(clearUsersError());
      dispatch(clearAuthError());
      dispatch(clearSightsError());
      document.querySelector("#name")?.focus();
    } else {
      dispatch(clearUsersMessage());
      dispatch(clearAuthMessage());
      dispatch(clearSightsMessage());
      if (!message.sight) {
        navigate("/");
      }
    }
    document.body.style.overflow = "";
  };

  if (!message && !error) return null;

  return (
    <div id="message-container">
      <div className="message">
        {error ? <p>{error}</p> : <p>{message.message}</p>}

        <button id="okBtn" onClick={clearMessage} ref={okBtnRef}>
          Ok
        </button>
      </div>
    </div>
  );
};

export default memo(Message);
