import React, { Component } from 'react';
import './App.css';
import './index.css';
import Editor from './Editor.js'

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Visualize Ruby</h1>
          <span>
            See Ruby control flow and methods call as flow charts.
            Helps developers better understand code and explain it to the non-technical.
          </span>
        </header>
       <Editor></Editor>
      </div>
    );
  }
}

export default App;
