import { useEffect, useState } from "react";

import "./app.scss";
interface Post {
  title: string;
  content: string;
  date: string;
  star: boolean;
}

function App() {
  const [modal, setModal] = useState<boolean>(false);
  const [posts, setPost] = useState<Post[]>([]);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<string>("date");

  //로컬스토리지에서 저장된 게시물 불러오기
  useEffect(() => {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
      setPost(JSON.parse(savedPosts)); // 로컬스토리지에서 불러온 게시물을 상태에 저장
    }
  }, []);

  // 게시물이 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("posts", JSON.stringify(posts)); // 게시물을 로컬스토리지에 저장
    }
  }, [posts]);

  //삭제
  function handleDelete(post: Post) {
    const updatedPosts = posts.filter((p) => p !== post);
    setPost(updatedPosts);
  }

  //수정
  function handleEdit(post: Post) {
    setEditPost(post);
    setModal(true);
  }

  // 필터링 로직
  const filteredPosts = [...posts].sort((a, b) => {
    if (filter === "title") {
      return a.title.localeCompare(b.title);
    } else if (filter === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (filter === "star") {
      if (a.star === b.star) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.star ? -1 : 1;
    }
    return 0;
  });

  // 저장 함수
  function handleSave(title: string, content: string) {
    // 수정인 경우
    if (editPost) {
      const updatedPosts = posts.map((post) =>
        post === editPost ? { ...post, title, content } : post
      );
      setPost(updatedPosts);
    } else {
      // 새 글 추가
      const newPost: Post = {
        title,
        content,
        star: false,
        date: new Date().toISOString(), // 오늘 날짜
      };
      setPost([...posts, newPost]);
    }
    setModal(false);
  }

  return (
    <div className="App">
      <div className="header">
        <CustomSelect setFilter={setFilter}></CustomSelect>
        <h1>MY MEMO</h1>
        <button
          className="write-btn"
          onClick={() => {
            setModal(!modal);
            setEditPost(null);
          }}
        >
          WRITE
        </button>
      </div>

      <div className="post-list">
        {posts.length === 0 ? (
          <p className="empty">글 내용이 없습니다. </p>
        ) : (
          filteredPosts.map((post, index) => (
            <PostCard
              key={index}
              post={post}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          ))
        )}
      </div>

      {modal && <WriteModal editPost={editPost} onSave={handleSave} />}
    </div>
  );

  //셀렉트
  function CustomSelect({
    setFilter,
  }: {
    setFilter: (filter: string) => void;
  }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
      <div className="select">
        <div className="menu" onClick={() => setIsOpen(!isOpen)}>
          Filter
        </div>
        <div className={`select-list ${isOpen ? "open" : ""}`}>
          <div onClick={() => setFilter("title")}>Title</div>
          <div onClick={() => setFilter("date")}>Date</div>
          <div onClick={() => setFilter("star")}>Starred</div>
        </div>
      </div>
    );
  }

  //글내용
  function PostCard({
    post,
    handleDelete,
    handleEdit,
  }: {
    post: Post;
    handleDelete: (post: Post) => void;
    handleEdit: (post: Post) => void;
  }) {
    const [star, setStar] = useState<boolean>(post.star);

    const toggleStar = () => {
      setStar(!star);
      const updatedPosts = posts.map((p) =>
        p === post ? { ...p, star: !p.star } : p
      );
      setPost(updatedPosts);
    };

    const formattedDate = new Date(post.date).toLocaleDateString();

    return (
      <div className="post-card">
        <div className="card-top">
          <div className="text">
            <p className="title">{post.title}</p>
            <p className="content">{post.content}</p>
          </div>
          <button className="star" onClick={toggleStar}>
            <img src={star ? "/star-ac.png" : "/star-off.png"} alt="" />
          </button>
        </div>

        <div className="card-bottom">
          <p className="data">{formattedDate}</p>

          <div className="button-wrap">
            <button
              onClick={() => {
                handleDelete(post);
              }}
              className="delete-btn"
            >
              삭제
            </button>
            <button
              onClick={() => {
                handleEdit(post);
              }}
              className="edit-btn"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    );
  }

  //글쓰기 모달
  function WriteModal({
    editPost,
    onSave,
  }: {
    editPost: Post | null;
    onSave: (title: string, content: string) => void;
  }) {
    const [title, setTitle] = useState<string>(editPost?.title || "");
    const [content, setContent] = useState<string>(editPost?.content || "");

    return (
      <div className="Modal">
        <div className="modal-inner">
          <h3>TITLE</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />

          <h3>CONTENT</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="글 내용을 입력하세요"
            name=""
            id=""
          ></textarea>
        </div>

        <button className="save" onClick={() => onSave(title, content)}>
          Save
        </button>
      </div>
    );
  }
}

export default App;
