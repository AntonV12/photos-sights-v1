import { memo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { updateComments, selectSightById } from "./sightsSlice";
import { selectCurrentUser } from "../users/authSlice";
import { nanoid } from "@reduxjs/toolkit";

const CommentSightForm = ({ image, sightId, comments, setComments }) => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const sight = useSelector((state) => selectSightById(state, sightId));
  const requestStatus = useSelector((state) => state.sights.status);

  useEffect(() => {
    setText(sessionStorage.getItem(image?.id) || "");
  }, [image]);

  const onTextChange = useCallback(
    (e) => {
      setText(e.target.value);
      if (currentUser._id !== sight?.author?._id) {
        sessionStorage.setItem(image.id, e.target.value);
      }
    },
    [image?.id, currentUser?._id, sight?.author?._id]
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (requestStatus === "loading") return;
      if (!currentUser) return;

      try {
        const newComment = {
          id: nanoid(),
          sightId: sightId,
          imageId: image.id,
          userId: currentUser._id,
          date: `${new Date().toLocaleDateString()} в ${new Date().toLocaleTimeString()}`,
          userName: currentUser.name,
          comment: text,
          answer: "",
        };

        await dispatch(updateComments(newComment)).unwrap();
        setComments((comments || []).concat(newComment));
        setText("");
        sessionStorage.removeItem(image.id);
      } catch (error) {
        console.error("Error updating comments:", error);
      }
    },
    [dispatch, text, sightId, currentUser, image?.id, requestStatus, setComments, comments]
  );

  if (!currentUser) {
    return null;
  }

  return (
    <form method="post" onSubmit={onSubmit} className="comment-form">
      <textarea placeholder="Напишите комментарий" value={text} onChange={onTextChange}></textarea>
      <button>Добавить комментарий</button>
    </form>
  );
};

CommentSightForm.propTypes = {
  image: PropTypes.object,
  sightId: PropTypes.string.isRequired,
  setComments: PropTypes.func.isRequired,
  comments: PropTypes.array.isRequired,
};

export default memo(CommentSightForm);
