import { memo } from "react";
import { useSelector } from "react-redux";
import { selectUserById, selectAllUsers } from "../users/usersSlice";
import { selectCurrentUser } from "../users/authSlice";
import { useParams, NavLink } from "react-router-dom";
import SightsList from "../sights/SightsList";

const UserPage = () => {
  const params = useParams();
  const userId = params.userId;
  const users = useSelector(selectAllUsers);
  const user = useSelector((state) => selectUserById(state, userId));
  const currentUser = useSelector(selectCurrentUser);

  return (
    <div style={{ width: "100%" }}>
      <h2>
        {user?.name} {user?.isModer && "(Модератор)"}
      </h2>

      {currentUser?.isModer && (
        <div>
          <h3>Список юзеров</h3>
          <ul className="users-list">
            {users.map((user) => (
              <li key={user._id}>
                <NavLink to={`/users/${user._id}`}>{user.name}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SightsList userId={userId} />
    </div>
  );
};

export default memo(UserPage);
