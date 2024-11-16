import PropTypes from "prop-types";
import { memo } from "react";
import { useSelector } from "react-redux";
import { selectAllSights } from "../sights/sightsSlice";
import { NavLink } from "react-router-dom";

const SightsList = ({ userId }) => {
  const sights = useSelector(selectAllSights);
  const userSights = sights?.filter((sight) => sight.author?._id === userId);

  if (userSights.length === 0) {
    return <p>Нет изображений</p>;
  }

  return (
    <div>
      <ul className="links-list">
        {userSights?.map((sight) => (
          <li key={sight._id}>
            <div>
              <NavLink to={`/sights/${sight._id}`}>
                <p>{sight.name}</p>
                <p>{sight.date}</p>
              </NavLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

SightsList.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default memo(SightsList);
