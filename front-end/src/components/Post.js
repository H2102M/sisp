//import Img from './uploads/img.jpg';

function Post(props) {
  return (
    <>
      <div className="imgCont">
        <div className="userContainer">
          <img src={"http://192.168.0.14:3000/uploads/userimg/" + props.user + '.webp'} alt="" />
          <p>{props.user}</p>
        </div>
        <div className="conoc">
          <img className="img" src={'http://192.168.0.14:3000/uploads/' + props.img} alt="" />
          <p className="srco" /*onclick="aa(this)"*/ >&#10084;</p>
        </div>
        <p className="imgText">{props.text}</p>
        <span>
          <p>{props.date}</p>
          <p className="likestxt"><g style={{ color: 'white' }}>{props.likes}</g> &#10084;</p>
        </span>
      </div>
    </>
  );
}

export default Post;