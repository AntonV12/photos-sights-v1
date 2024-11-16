import { useState, memo, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "./usersSlice";

function SignUpForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const onNameChanged = useCallback((e) => setName(e.target.value), []);
  const onPasswordChanged = useCallback((e) => setPassword(e.target.value), []);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const onSaveUser = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await dispatch(addUser({ name, password, isModer: false })).unwrap();
        setName("");
        setPassword("");
      } catch (err) {
        console.error("save user error: ", err);
      }
    },
    [name, password, dispatch]
  );

  return (
    <div className="form">
      <h1>Регистрация</h1>
      <form method="POST" onSubmit={onSaveUser}>
        <div className="input-block">
          <label htmlFor="name">Логин: </label>
          <input id="name" type="text" name="name" value={name} onChange={onNameChanged} ref={inputRef} />

          <label htmlFor="password">Пароль: </label>
          <input id="password" type="password" name="password" value={password} onChange={onPasswordChanged} />
        </div>

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}

export default memo(SignUpForm);
