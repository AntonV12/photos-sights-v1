import { memo, useCallback, useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useParams, NavLink, useLocation } from "react-router-dom";
import { fetchSights, selectSightById, updateSight, deleteSight } from "./sightsSlice";
import { useSelector, useDispatch } from "react-redux";
import CommentsList from "./CommentsList";
import Reactions from "./Reactions";
import PropTypes from "prop-types";
import { selectCurrentUser } from "../users/authSlice";

const ImageNumber = ({ currentIndex, length }) => {
  return (
    <div className="image-number">
      {currentIndex + 1}/{length}
    </div>
  );
};

ImageNumber.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
};

const SightPage = ({ id }) => {
  const sightId = useParams().sightId || id;
  const sight = useSelector((state) => selectSightById(state, sightId));
  const location = useLocation();
  const selectedRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const currentUser = useSelector(selectCurrentUser);
  const [isEdit, setIsEdit] = useState(false);
  const dispatch = useDispatch();
  const sightStatus = useSelector((state) => state.sights.status);

  useEffect(() => {
    dispatch(fetchSights());
  }, [dispatch, currentIndex]);

  useEffect(() => {
    if (location.pathname !== "/") {
      if (JSON.parse(sessionStorage.getItem("currentIndex"))?.id === sightId) {
        setCurrentIndex(+JSON.parse(sessionStorage.getItem("currentIndex")).index);
      } else {
        setCurrentIndex(0);
      }

      if (images.length > 0) {
        setTimeout(() => {
          flushSync(() => {
            selectedRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          });
        }, 0);
      }
    }
  }, [location.pathname, images.length, sightId, currentIndex]);

  useEffect(() => {
    setName(sight?.name);
    setCountry(sight?.country);
    setCity(sight?.city);
    setDate(sight?.date);
    setImages(sight?.images || []);
  }, [sight]);

  const handleRight = useCallback(() => {
    flushSync(() => {
      if (currentIndex < images?.length - 1) {
        setCurrentIndex(currentIndex + 1);
        sessionStorage.setItem("currentIndex", JSON.stringify({ id: sightId, index: currentIndex + 1 }));
      } else {
        setCurrentIndex(0);
        sessionStorage.setItem("currentIndex", JSON.stringify({ id: sightId, index: 0 }));
      }
    });
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex, images?.length, sightId]);

  const handleLeft = useCallback(() => {
    flushSync(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        sessionStorage.setItem("currentIndex", JSON.stringify({ id: sightId, index: currentIndex - 1 }));
      } else {
        setCurrentIndex(images?.length - 1);
        sessionStorage.setItem("currentIndex", JSON.stringify({ id: sightId, index: images?.length - 1 }));
      }
    });
    selectedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex, images?.length, sightId]);

  useEffect(() => {
    if (location.pathname !== "/") {
      const handleKeyDown = (e) => {
        if (e.key === "ArrowRight") {
          handleRight();
        } else if (e.key === "ArrowLeft") {
          handleLeft();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleLeft, handleRight, location.pathname]);

  const toggleEdit = () => {
    setIsEdit(!isEdit);
  };

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onCountryChange = useCallback((e) => {
    setCountry(e.target.value);
  }, []);

  const onCityChange = useCallback((e) => {
    setCity(e.target.value);
  }, []);

  const onDateChange = useCallback((e) => {
    setDate(e.target.value);
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      if ((currentUser?.isModer && sightStatus === "idle") || sightStatus === "succeeded") {
        try {
          const updatedSight = {
            _id: sightId,
            name,
            country,
            city,
            date,
            images: images,
            author: sight?.author,
          };

          await dispatch(updateSight(updatedSight)).unwrap();
          dispatch(fetchSights());
          setIsEdit(false);
        } catch (error) {
          console.error(error);
        }
      }
    },
    [city, country, date, dispatch, name, sightId, sight?.author, images, sightStatus, currentUser?.isModer]
  );

  const handleDeleteImage = (imageId) => {
    const updatedImages = images.filter((image) => image.id !== imageId);
    setImages(updatedImages);
  };

  const handleCancel = () => {
    setImages(sight?.images || []);
    setIsEdit(false);
  };

  const handleDeleteSight = async (sightId) => {
    if ((currentUser?.isModer && sightStatus === "idle") || sightStatus === "succeeded") {
      const confirmDelete = confirm("Вы уверены, что хотите удалить эту достопримечательность?");

      try {
        if (confirmDelete) {
          await dispatch(deleteSight(sightId)).unwrap();
          dispatch(fetchSights());
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div id="sight-page">
      {sight && (
        <>
          {isEdit ? (
            <form method="POST" onSubmit={handleSave}>
              <input type="text" value={name} onChange={onNameChange} placeholder="Название" />
              <br />
              <input type="text" value={country} onChange={onCountryChange} placeholder="Страна" />
              <input type="text" value={city} onChange={onCityChange} placeholder="Город" />
              <input type="date" value={date} onChange={onDateChange} placeholder="Дата" />
              <button type="submit">Сохранить</button>
              <button onClick={handleCancel}>Отмена</button>
            </form>
          ) : (
            <>
              <h2>{sight?.name}</h2>
              <div className="description">
                <strong>
                  {sight?.country && sight?.country}
                  {sight?.city && ", " + sight?.city}
                  {sight?.date && ", " + new Date(sight?.date).toLocaleDateString()}
                </strong>{" "}
                Автор: <NavLink to={`/users/${sight?.author?._id}`}> {sight?.author?.name}</NavLink>
              </div>
              <p>
                {currentUser?.isModer && <button onClick={toggleEdit}>Редактировать</button>}
                {currentUser?.isModer && <button onClick={() => handleDeleteSight(sight?._id)}>Удалить</button>}
              </p>
            </>
          )}

          <div className="sight-image-container">
            {images.length > 1 && (
              <button className="navigate-btn" onClick={handleLeft}>
                {"<"}
              </button>
            )}
            <ImageNumber currentIndex={currentIndex} length={images.length} />

            <div id="sightsListContainer">
              <div key={sight?._id} id="sightsList">
                {images.map((image, index) => (
                  <div key={image.id} style={{ position: "relative" }}>
                    <NavLink
                      to={`/sights/${sight?._id}`}
                      /* key={image.id} */
                      draggable={true}
                      ref={currentIndex === index ? selectedRef : null}
                      onClick={() =>
                        sessionStorage.setItem("currentIndex", JSON.stringify({ id: sightId, index: index }))
                      }
                    >
                      <img className="sight-image" src={image.src} alt={sight.name} loading="lazy" />
                    </NavLink>
                    {isEdit && (
                      <button className="delete-image-button" onClick={() => handleDeleteImage(image.id)}>
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Reactions image={images[currentIndex]} sightId={sightId} />
            </div>

            {images.length > 1 && (
              <button className="navigate-btn" onClick={handleRight}>
                {">"}
              </button>
            )}
          </div>

          {location.pathname !== "/" && (
            <CommentsList image={images[currentIndex]} sightId={sightId} isEdit={isEdit} setImages={setImages} />
          )}
        </>
      )}
    </div>
  );
};

SightPage.propTypes = {
  id: PropTypes.string || undefined,
};

export default memo(SightPage);
