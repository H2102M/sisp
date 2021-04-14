import './App.css';
import iconimg from './images/icon.png';
import Post from './components/Post';
import NewPost from './components/NewPost';
import SignIn from './components/SignIn';
import React, { useEffect, useState } from 'react';

function App() {
  const [show, setShow] = useState(false);
  const [sshow, setsShow] = useState(true);
  const [posts, setPosts] = useState(<></>)

  useEffect(() => {
    fetch('http://192.168.0.14:3000/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'lid': document.cookie
      }
    }).then(res => {
      res.text().then(function (text) {
        text = JSON.parse(text)
        for (let i=0; i<text.length; i++) {
          // console.log(text[i])
          setPosts(<Post user={text[i].username} text={text[i].text} likes={text[i].likes} img={text[i].img}/>)
        }
      })
    })
  },[])

  return (
    <>
    <div id="headerContainer">
      <img src={iconimg} alt="" width="10%"/>
      <p text-align="center">Social Image Sharing Platform</p>
      <p id="addButton" onClick={() => {setShow(true)}}>+</p>
    </div>
    {posts}
    <NewPost show={show} setShow={setShow}/>
    <SignIn show={sshow} setShow={setsShow}/>
    </>
  );
}

export default App;
