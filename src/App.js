import React, { Component } from 'react';
import './App.css';
import './index.css';
import Editor from './Editor.js'
import Version from './Version.js'

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Visualize Ruby</h1>
        </header>
        <Editor></Editor>
        <div className="row">
          <div className="column description">
            <p>
              See Ruby control flow and methods call as flow charts.
              Helps developers better understand code and explain it to the non-technical.
            </p>
            <p>

              Write a Ruby class and see method interactions. Works with procedural code and bare methods.
              This is experimental project and does not support all types of code. If you'd like it to support
              more types of code please open a <a href="https://github.com/zeisler/visualize_ruby">pull request</a>.
            </p>
          </div>
        </div>
        <Version></Version>
      </div>
    );
  }
}

export default App;
