import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePostContent } from "../../actions/post.actions";

import { loginContext } from "../AppContext";
import { isEmpty } from "../../utils/utils";

import DeleteCard from "./DeleteCard";
import LikeBtn from "./LikeBtn";
import CardComments from "./CardComments";

const Card = ({ post }) => {
  const dispatch = useDispatch();
  const uId = useContext(loginContext);
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const [textUpdate, setTextUpdate] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const userData = useSelector((state) => state.userReducer);

  const sendStore = async () => {
    if (textUpdate) dispatch(updatePostContent(post.id, uId, textUpdate));
  };

  const updateText = async () => {
    sendStore().then(() => {
      setIsUpdated(false);
    });
  };

  useEffect(() => {
    !isEmpty(post) && setLoading(false);
  }, [post, userData.isAdmin, dispatch]);
  return (
    <li className="card-container" key={post.id}>
      {loading ? (
        <i className="fas fa-spinner fa-spin"></i>
      ) : (
        <>
          <article>
            <div className="card-header">
              <div className="card-avatar">
                <img
                  className="avatar-min"
                  src={post.User.avatar}
                  alt={"Photo de profil de " + post.User.username}
                />
              </div>
              <h2>{post.User.username}</h2>
              <span className="card-date">{post.createdAt}</span>
            </div>
            <div className="card-contents">
              {isUpdated === false && (
                <p className="card-content">{post.content}</p>
              )}
              {isUpdated && (
                <div className="update-post">
                  <textarea
                    className="update-content-post"
                    defaultValue={post.content}
                    onChange={(e) => setTextUpdate(e.target.value)}
                  />
                  <div className="update-btn-container">
                    <button className="btn" onClick={updateText}>
                      Valider les modifications
                    </button>
                  </div>
                </div>
              )}
              {post.attachment !== "" && (
                <img
                  className="card-picture"
                  id={post.id}
                  src={post.attachment}
                  alt={post.content}
                />
              )}
            </div>
            <div className="edit-ctrl-container">
              {userData.id === post.userId && (
                <>
                  <div className="btn-container">
                    <div
                      onClick={() => setIsUpdated(!isUpdated)}
                      tabIndex={0}
                      onKeyPress={() => setIsUpdated(!isUpdated)}
                    >
                      <i
                        className="fas fa-edit"
                        title="Modifier la description"
                      ></i>
                    </div>
                  </div>
                </>
              )}
              {userData.id === post.userId || userData.isAdmin === true ? (
                <div className="btn-container">
                  <DeleteCard id={post.id} />
                </div>
              ) : null}
            </div>
            <div className="card-footer">
              <div
                tabIndex={0}
                className="comment-icon"
                onKeyPress={() => setShowComments(!showComments)}
                onClick={() => setShowComments(!showComments)}
              >
                <i
                  className="fas fa-comment-dots"
                  title="Voir les commentaires"
                ></i>
                <span>{post.Comments.length}</span>
              </div>
              <LikeBtn post={post} />
            </div>
            {showComments && <CardComments post={post} />}
          </article>
        </>
      )}
    </li>
  );
};

export default Card;
