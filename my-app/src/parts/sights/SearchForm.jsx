import { memo, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

const SearchForm = ({ sights }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSights, setFilteredSights] = useState([]);
  const [isHidden, setIsHidden] = useState(true);

  const onInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);
      if (!value) {
        setFilteredSights([]);
        return;
      }
      setFilteredSights(
        sights.filter((sight) => {
          const title = `${sight.name}/${sight.city}/${sight.country}/${sight.date}/${sight.author.name}`.toLowerCase();
          return title.includes(value.toLowerCase());
        })
      );
    },
    [sights, setFilteredSights]
  );

  const onClickLink = useCallback(() => {
    setFilteredSights([]);
    setInputValue("");
  }, []);

  return (
    <div className="search-form">
      <div className="input-block">
        <label htmlFor="search-input">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-search"
            viewBox="0 0 16 16"
            onClick={() => setIsHidden(!isHidden)}
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
        </label>
        {!isHidden && (
          <input
            id="search-input"
            type="search"
            value={inputValue}
            onChange={onInputChange}
            placeholder="Поиск"
            autoComplete="off"
          />
        )}
      </div>

      {filteredSights.length > 0 && (
        <ul className="dropdown">
          {filteredSights.map((sight) => {
            return (
              <li key={sight._id}>
                <NavLink to={`/sights/${sight._id}`} onClick={onClickLink}>
                  {sight.name + " / "}
                  {sight.country && sight.country + " / "}
                  {sight?.city && sight?.city + " / "}
                  {sight?.date && new Date(sight?.date).toLocaleDateString() + " / "}
                  {sight.author.name && sight.author.name + " / "}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

SearchForm.propTypes = {
  sights: PropTypes.array.isRequired,
};

export default memo(SearchForm);
