import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { reactionClick } from "./sightsSlice";
import { selectCurrentUser } from "../users/authSlice";

const Reactions = ({ image, sightId }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [reactions, setReactions] = useState({});

  useEffect(() => {
    setReactions(image?.reactions || {});
  }, [image]);

  const isLiked = reactions.likes?.includes(currentUser?._id);
  const isDisliked = reactions.dislikes?.includes(currentUser?._id);

  const onReactionClick = useCallback(
    async (e) => {
      const userReaction = e.target.dataset.reaction || e.target.parentElement.dataset.reaction;

      if (userReaction && currentUser?._id) {
        try {
          await dispatch(
            reactionClick({
              sightId: sightId,
              userId: currentUser._id,
              imageId: image?.id,
              reaction: userReaction,
            })
          ).unwrap();
          setReactions({
            ...reactions,
            [userReaction + "s"]: [...reactions[userReaction + "s"], currentUser._id],
          });
        } catch (error) {
          console.error("Error reacting:", error);
        }
      }
    },
    [image?.id, dispatch, sightId, currentUser?._id, reactions]
  );

  return (
    <div id="reactions">
      <button data-reaction="like" onClick={onReactionClick}>
        <span style={{ color: isLiked ? "red" : "white" }}> &hearts; </span> ({reactions?.likes?.length || 0})
      </button>
      <button data-reaction="dislike" onClick={onReactionClick}>
        <span style={{ opacity: isDisliked ? "0.3" : "1" }}> &#128078;</span> ({reactions?.dislikes?.length || 0})
      </button>
    </div>
  );
};

Reactions.propTypes = {
  image: PropTypes.object,
  sightId: PropTypes.string.isRequired,
};

export default memo(Reactions);
