import React from 'react';

//=> is the same as function
const Navigation = ({ onRouteChange, isSignedIn }) => {
    //replaces 'sign in' and 'register' buttons with 'sign out' if the user is already signed in
    if (isSignedIn) {
      return (
        //creates a flexbox and puts it on the right of the screen
        //makes 'sign out' clickable and uses tachyons to style it
        //https://tachyons.io/docs/
        <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
          <p onClick={() => onRouteChange('signout')} className='f3 link dim black underline pa3 pointer'>Sign Out</p>
        </nav>
      );
    } else {
      return (
        <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
          <p onClick={() => onRouteChange('signin')} className='f3 link dim black underline pa3 pointer'>Sign In</p>
          <p onClick={() => onRouteChange('register')} className='f3 link dim black underline pa3 pointer'>Register</p>
        </nav>
      );
    }
}

export default Navigation;