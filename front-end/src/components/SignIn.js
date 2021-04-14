import { useEffect, useState } from 'react';
import './SignIn.css';

function SignIn(props) {
	const [value1, setValue1] = useState({ username: '', });
	const [value2, setValue2] = useState({ password: '', });

	useEffect(() => {
		fetch('http://192.168.0.14:3000/checklogin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'lid': document.cookie
			}
		})
			.then(res => {
				res.text().then(function (text) {
					console.log(text)
					if (text == 'Aaa') {
						props.setShow(false);
					}
					else {
						console.log('no');
					}
				})
			})
		document.getElementById('form').addEventListener('formdata', (e) => {
			let data = e.formData;
			// submit the data via XHR
			fetch('http://192.168.0.14:3000/register', {
				method: 'POST',
				body: data
			}).then(res => {
				res.text().then((text) => {
					alert(text)
				})
			})
		});
	}, [])

	const handleInputChange1 = (event) => {
		const { value, name } = event.target;
		setValue1({ [name]: value });
	}

	const handleInputChange2 = (event) => {
		const { value, name } = event.target;
		setValue2({ [name]: value });
	}

	const signInHandler = () => {
		fetch('http://192.168.0.14:3000/login', {
			method: 'POST',
			body: JSON.stringify(Object.assign({}, value1, value2)),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				if (res.status === 200) {
					props.setShow(false);
					var d = new Date();
					d.setTime(d.getTime() + (3 * 24 * 60 * 60 * 1000));
					var expires = "expires=" + d.toUTCString();
					res.text().then(function (text) {
						document.cookie = "lid = " + text + ";" + expires;
					})
					console.log("Successful")
				}
				else {
					const error = new Error(res.error);
					if (res.status === 400) {
						alert(res.statusText)
					}
					throw error;
				}
			})
			.catch(err => {
				console.error(err);
			});
	}
	const submit = (e) => {
		e.preventDefault();
		// construct a FormData object, which fires the formdata event
		let formdata = new FormData(document.getElementById('form'));
	}

	const signUpHandler = () => {
		// let file = document.getElementById('file').files[0]
		let file = document.getElementById('form').formData
		// fetch('http://192.168.0.14:3000/register', {
		// 	method: 'POST',
		// 	body: JSON.stringify(Object.assign({}, value1, value2)),
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	}
		// }).then(res => {
		// 	res.text().then((text) => {
		// 		alert(text)
		// 	})
		// }).catch((error) => {
		// 	if (error == 'TypeError: Failed to fetch') {
		// 		alert('Try again later')
		// 	}
		// 	else {
		// 		alert(error)
		// 	}
		// })
	}

	return props.show ? (
		<div className="mainsignin">
			<div className="innerSignIn">
				<div>
					<h1>Sign Up</h1>
				</div>
				<form id="form" onSubmit={submit} encType="multipart/form-data">
					<div className="inputcontainer">
						<div id="imgupload">
							<input type="file" id="file" name="file" />
							<label htmlFor="file">Profile Image</label>
						</div>
						<div className="oneInput">
							<label>Username</label>
							<input type="text" name="username" value={value1.username} onChange={handleInputChange1} />
						</div>
						<div className="oneInput">
							<label>Password</label>
							<input type="password" name="password" value={value2.password} onChange={handleInputChange2} />
						</div>
					</div>
					<div className="row">
						<button type="submit">Sign Up</button>
						<button onClick={signInHandler}>Log In</button>
					</div>
				</form>
			</div>
		</div>
	) : "";
}

export default SignIn;