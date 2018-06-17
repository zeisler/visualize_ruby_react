import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './index.css';
import Editor from './Editor.js'

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
       <Editor></Editor>
      </div>
    );
  }
}

export default App;
