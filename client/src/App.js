import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

//Initialise the API
const app = new Clarifai.App({
 apiKey: 'bc89742a5f2a43b39dc4b9c66000ba2b'
});

//Using particles.js from https://www.npmjs.com/package/react-particles-js
const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

/*Creates a state so the app knows what the user enters, 
remembers it and updates it anytime it gets changed*/
class App extends Component {
  constructor() {
    super();
    this.state = {
      //anything inputed by user
      input: '',
      //url of image displayed
      imageUrl: '',
      //coordinates of box around faces
      box: {},
      route: 'signin',
      isSignedIn: false,
      //user profile
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  

  //load user data from backend database
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  //create box around faces using data from clarifai
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  //display the box
  //called from the onButtonSubmit function
  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  //Changes the input state when something is entered into the imagelinkform
  //This allows the inputed url to be used within the application
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  //In charge of what happens when the submit button is pressed
  //displays image recieved from Clarify
  //Clarifai Documentation: https://docs.clarifai.com/ 
  //increases entries value for user in backend when user enters image 
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }


  //Below are the components that make up the site
  //Particles refers to the particesOptions constant at the top of page to make the code look cleaner
  //after user signs in or registers, user data is loaded from the back-end
  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
     
      <div className="App">
         <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
