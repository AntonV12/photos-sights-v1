import { memo, useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "./authSlice";

const LoginForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  //const inputRef = useRef(null);

  const onNameChanged = useCallback((e) => setName(e.target.value), []);
  const onPasswordChanged = useCallback((e) => setPassword(e.target.value), []);

  /* useEffect(() => {
    inputRef.current.focus();
  }, []); */

  const onLoginUser = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await dispatch(loginUser({ name, password })).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [name, password, dispatch]
  );

  return (
    <div className="form">
      <h1>Вход</h1>
      <form method="POST" onSubmit={onLoginUser}>
        <div className="input-block">
          <label htmlFor="name">Логин: </label>
          <input
            id="name"
            type="text"
            name="name"
            value={name}
            onChange={onNameChanged}
            autoFocus /* ref={inputRef} */
          />

          <label htmlFor="password">Пароль: </label>
          <input id="password" type="password" name="password" value={password} onChange={onPasswordChanged} />
        </div>

        <button type="submit">Войти в аккаунт</button>
      </form>
    </div>
  );
};

export default memo(LoginForm);
