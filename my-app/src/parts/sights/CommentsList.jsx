import { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import CommentSightForm from "./CommentSightForm";
import { useDispatch, useSelector } from "react-redux";
import { updateComment, selectSightById, fetchSights } from "./sightsSlice";
import { selectCurrentUser } from "../users/authSlice";

const Answer = ({ comment, sightId, imageId }) => {
  const [answer, setAnswer] = useState(comment.answer);
  const sight = useSelector((state) => selectSightById(state, sightId));
  const currentUser = useSelector(selectCurrentUser);

  return (
    <div id="answer">
      {answer && <p>{`Ответ ${sight.author.name}: ${answer}`}</p>}

      {currentUser?._id === sight?.author?._id && !answer && (
        <AnswerButton
          comment={comment}
          sightId={sightId}
          setComments={setAnswer}
          imageId={imageId}
          comments={sight.comments}
          setAnswer={setAnswer}
        />
      )}
    </div>
  );
};

const AnswerButton = ({ comment, sightId, setComments, imageId, setAnswer }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleShowForm = () => {
    setIsClicked(!isClicked);
  };

  const handleCancel = () => {
    setIsClicked(false);
  };

  return (
    <div id="answerButton">
      {isClicked ? (
        <>
          <AnswerForm
            comment={comment}
            sightId={sightId}
            setComments={setComments}
            imageId={imageId}
            setAnswer={setAnswer}
            handleCancel={handleCancel}
          />
          <button onClick={handleCancel}>Отмена</button>
        </>
      ) : (
        <button onClick={handleShowForm}>Ответить</button>
      )}
    </div>
  );
};

const AnswerForm = ({ comment, sightId, imageId, setAnswer, handleCancel }) => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  const onTextChange = (e) => {
    setText(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (text) {
      const updatedComment = {
        id: comment.id,
        sightId: sightId,
        imageId: imageId,
        answer: text,
      };

      await dispatch(updateComment(updatedComment)).unwrap();
      await dispatch(fetchSights()).unwrap();
      setAnswer(text);
      setText("");
      handleCancel();
    }
  };

  return (
    <div id="answerForm">
      <form onSubmit={onSubmit}>
        <input type="text" value={text} onChange={onTextChange} style={{ width: "100%" }} />
        <button type="submit">Ответить</button>
      </form>
    </div>
  );
};

const CommentsList = ({ image, sightId, isEdit, setImages }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setComments(image?.comments || []);
  }, [image]);

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter((comment) => comment.id !== commentId);
    setComments(updatedComments);
    const updatedImage = { ...image, comments: updatedComments };

    setImages((prevImages) => prevImages.map((image) => (image.id === updatedImage.id ? updatedImage : image)));
  };

  return (
    <div id="commentsList">
      <CommentSightForm image={image} sightId={sightId} comments={comments} setComments={setComments} />

      {comments.length === 0 ? (
        <p>Нет комментариев</p>
      ) : (
        comments
          .slice()
          .reverse()
          .map((comment) => (
            <div key={comment.id}>
              <div>
                [{comment.date}] <b>{comment.userName}</b>: {comment.comment}
                <Answer comment={comment} sightId={sightId} imageId={image?.id} />
                {isEdit && (
                  <button onClick={() => handleDeleteComment(comment.id)} style={{ padding: "1px" }}>
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

CommentsList.propTypes = {
  image: PropTypes.object,
  sightId: PropTypes.string.isRequired,
  isEdit: PropTypes.bool.isRequired,
  setImages: PropTypes.func.isRequired,
};

Answer.propTypes = {
  comment: PropTypes.object.isRequired,
  sightId: PropTypes.string.isRequired,
  imageId: PropTypes.string.isRequired,
};

AnswerForm.propTypes = {
  comment: PropTypes.object.isRequired,
  sightId: PropTypes.string.isRequired,
  imageId: PropTypes.string.isRequired,
  setAnswer: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

AnswerButton.propTypes = {
  comment: PropTypes.object.isRequired,
  sightId: PropTypes.string.isRequired,
  setComments: PropTypes.func.isRequired,
  imageId: PropTypes.string.isRequired,
  setAnswer: PropTypes.func.isRequired,
};

export default memo(CommentsList);
