import React, { useEffect, useState, lazy, Suspense } from 'react';

import './App.css';
import iconimg from './images/icon.png';
const Post = lazy(() => import('./components/Post'));
const NewPost = lazy(() => import('./components/NewPost'));
const SignIn = lazy(() => import('./components/SignIn'));

function App() {
  const [show, setShow] = useState(false);
  const [sshow, setsShow] = useState(true);
  const [posts, setPosts] = useState([<></>])

  const renderLoader = () => <p>Loading</p>;

  useEffect(() => {
    fetch('http://192.168.0.14:3000/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'lid': document.cookie
      }
    }).then(res => {
      let users = [<></>]
      res.text().then(function (text) {
        text = JSON.parse(text)
        console.log(text)
        for (let i = 0; i < text.length; i++) {
          console.log(i)
          console.log(users)
          users = [...users, <Post user={text[i].username} text={text[i].text} likes={text[i].likes} img={text[i].img} date={text[i].date} />]
        }
        setPosts(users)
      })
    })
  }, [])

  return (
    <>
      <div id="headerContainer">
        <img src={iconimg} alt="" width="10%" />
        <p text-align="center">Social Image Sharing Platform</p>
        <p id="addButton" onClick={() => { setShow(true) }}>+</p>
      </div>
      <Suspense fallback={renderLoader()}>
        {posts}
        <NewPost show={show} setShow={setShow} />
        <SignIn show={sshow} setShow={setsShow} />
      </Suspense>
    </>
  );
}

export default App;
