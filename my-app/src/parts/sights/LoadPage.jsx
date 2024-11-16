import { memo, useState, useCallback, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { addSight, fetchSights } from "./sightsSlice";
import { selectCurrentUser } from "../users/authSlice";

const LoadPage = () => {
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const dispatch = useDispatch();
  const requestStatus = useSelector((state) => state.sights.status);
  const currentUser = useSelector(selectCurrentUser);
  const nameInputRef = useRef();

  useEffect(() => {
    nameInputRef.current.focus();
  }, []);

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

  const onImageChange = useCallback(
    (event) => {
      const files = event.target.files;

      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            setImages((prevImages) => [
              ...prevImages,
              {
                id: nanoid(),
                src: reader.result,
                comments: [],
                reactions: {
                  likes: [],
                  dislikes: [],
                },
              },
            ]);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [setImages]
  );

  const onSaveSight = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await dispatch(
          addSight({ name, country, city, date, images, author: { _id: currentUser._id, name: currentUser.name } })
        ).unwrap();
        dispatch(fetchSights());
        setName("");
        setCountry("");
        setCity("");
        setDate("");
        setImages([]);
      } catch (error) {
        console.error(error);
      }
    },
    [city, country, date, dispatch, images, name, currentUser]
  );

  if (requestStatus === "loading") {
    return (
      <div id="loader">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div id="load-page">
      <form method="post" onSubmit={onSaveSight}>
        <label htmlFor="name">Название</label>
        <input type="text" id="name" name="name" value={name} onChange={onNameChange} ref={nameInputRef} />

        <label htmlFor="name">Страна</label>
        <input type="text" id="country" name="country" value={country} onChange={onCountryChange} />

        <label htmlFor="name">Город</label>
        <input type="text" id="city" name="city" value={city} onChange={onCityChange} />

        <label htmlFor="date">Дата</label>
        <input type="date" id="date" name="date" value={date} onChange={onDateChange} />

        <label id="file-label" htmlFor="file">
          Выберите файлы
        </label>
        <input
          type="file"
          name=""
          id="file"
          accept="image/*"
          multiple
          style={{
            display: "none",
          }}
          onChange={onImageChange}
        />
        <button type="submit">Отправить</button>
      </form>

      <div id="uploaded-images">
        {images.map((image, index) => (
          <img key={index} src={image.src} alt="Uploaded image" />
        ))}
      </div>
    </div>
  );
};

export default memo(LoadPage);
