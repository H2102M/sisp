import { useState } from 'react';
import './NewPost.css';

function NewPost(props) {
	return props.show ? (
		<div className="main" >
			<div className="innerNewPost" >
				<div>
					<h1>New Post</h1>
					<b onClick={() => { props.setShow(false) }}>&#10005;</b>
				</div>
				<form id="form" method="post" encType="multipart/form-data" action="http://192.168.0.14:3000/upload" style={{display: 'flex',flexDirection: 'column'}}>
					<div className="oneInput">
						<label>Post text</label>
						<input type="text" name="posttext" /*value={value1} onChange={handleInputChange1}*/ />
					</div>
					<input type="text" style={{display:'none'}} name="lid" value={document.cookie}/>
					<label htmlFor="input">Browse image</label>
					<input id="input" type="file" name="file"/>
					<button type="submit" /*onClick={post}*/>Share</button>
				</form>
				
			</div>
		</div>
	) : "";
}

export default NewPost;