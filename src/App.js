import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from './FirebaseConfig';

firebase.initializeApp(firebaseConfig);

function App() {

  const [newUser,setNewUser] = useState(false);

  const [user,setUser]= useState({
    isSignnedIn: false,
    name: '',
    email:'',
    photo:'',
    password:''
  });

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn= ()=> {
        firebase.auth().signInWithPopup(googleProvider)
        .then(res => {   
          console.log(res);
          const {email,name,picture}= res.additionalUserInfo.profile
          const signnedInUser = {
            isSignnedIn : true,
            name: name,
            email: email,
            photo: picture,
          }
        setUser(signnedInUser);
        console.log(email, name, picture);
        })
        .catch (err => {
          console.log(err);
          console.log(err.message);
        })
  }
const handleFbSignIn = () =>{
  firebase
  .auth()
  .signInWithPopup(fbProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // The signed-in user info.
    var user = result.user;
    console.log("FB User after sign in: ",user);
    // IdP data available in result.additionalUserInfo.profile.
      // ...

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var accessToken = credential.accessToken;

    // ...
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;

    // ...
  });
  

}
  const handleSignOut = () => {
          firebase.auth().signOut()
          .then (res => {
              const signedOutUser = {
                isSignnedIn: false,
                name: '',
                photo: '',
                email:'',
                error:'',
                success: false,
              }
              setUser(signedOutUser);
              console.log(res);
          })
          .catch(err => {

          })
  }

  const handleSubmit=(event)=> {
    console.log(user.email,user.password);

    if(user.email && user.password){
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then (res => {
        const newUserInfo = {...user};
        newUserInfo.error="";
        newUserInfo.success = true;
        setUser(newUserInfo);
        //console.log(res);
        updateUserName(user.name);
      })
      .catch(error => {
        const newUserInfo= {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        var errorMessage = error.message;
        console.log(errorMessage);
      });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then (res => {
        const newUserInfo = {...user};
        newUserInfo.error="";
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log("Sign in user info",res.user);
      })
      .catch((error) => {
        const newUserInfo= {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }
    event.preventDefault() //sob valid na hole submit kaj korbe na 
  }

  const handleBlur = (event)=> {
    let isFieldValid =true;
    //console.log(event.target.name, event.target.value);

    if(event.target.name === 'email'){
      isFieldValid =/\S+@\S+\.\S+/.test(event.target.value);
      // console.log(isEmailValid);
    }

    if(event.target.name === 'password'){
      const isPaasswordValid = event.target.value.length > 6 ; 
      const passwordHasNumber = /\d{1}/.test(event.target.value) ;
        isFieldValid= isPaasswordValid && passwordHasNumber;
     }

     if (isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[event.target.name]= event.target.value;
      setUser(newUserInfo);
     }

  }


const updateUserName= name => {

  const user = firebase.auth().currentUser;

        user.updateProfile({
          displayName: name
        }).then(() => {
          console.log("User name updated successfully!")
        }).catch((error) => {
          console.log(error)
        });  

}

  return (
    <div className="App">
     
    {
      user.isSignnedIn ?<button onClick={handleSignOut} >Sign out</button> : <button onClick={handleSignIn} >Sign In</button>
      
    }
    
    <br />
    
    <button onClick={handleFbSignIn}>Sign in using Facebook</button>

    {
      user.isSignnedIn && <div>
      <p>Welcome, {user.name}</p>
      <p>Your Email: {user.email}</p>
      <img src={user.photo} alt="broken pic" />

      </div>
    }


    <h1>Our Own Authentication</h1>


   {/* <p>Name: {user.name}</p>
    <p>Email: {user.email}</p>
    <p>Pass: {user.password}</p> */}

    <input type="checkbox" onChange={()=> setNewUser(!newUser)}  name="newUser" id="" />
    <label htmlFor="newUser">New User Sign Up</label>
    <form onSubmit={handleSubmit}>
      
       {newUser && <input name="name" onBlur={handleBlur} type="text"  placeholder='Your Name' />
      }
        <br />
        <input type="text" name="email" onBlur={handleBlur} placeholder="Give me your email" id="123"  required/>
        <br />
        <input type="password" onBlur={handleBlur} name="password" placeholder="Password" id="456" required/>
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : "Sign In"} />
    </form>

    <p style={{color: 'red'}}>{user.error}</p>
    
    {
      user.success && <p style={{color: 'green'}}> User {newUser? 'Created' : "Logged In"} Successfully</p>
    }

    </div>
    
  );
}

export default App;