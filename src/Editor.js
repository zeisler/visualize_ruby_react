import Codemirror from 'react-codemirror';

var React = require('react');
const createReactClass = require('create-react-class');

require('codemirror/mode/ruby/ruby');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

var defaults = {
  markdown: '# Heading\n\nSome **bold** and _italic_ text\nBy [Jed Watson](https://github.com/JedWatson)',
  ruby: 'var component = {\n\tname: "react-codemirror",\n\tauthor: "Jed Watson",\n\trepo: "https://github.com/JedWatson/react-codemirror"\n};'
};

var Editor = createReactClass({
  getInitialState () {
    return {
      code: defaults.ruby,
      readOnly: false,
      mode: 'ruby',
    };
  },
  getSVG(rubyCode) {
    fetch('https://visualize-ruby.herokuapp.com/visualize_ruby', {
        method:      'POST',
        headers:     {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body:        JSON.stringify({
          ruby_code: rubyCode
        }),
      }
    ).then((response) => {
      response.json().then(data =>{
        this.setState({svg: data["svg"]});
        this.setState({exception: data["exception"]});
      })
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  },
  updateCode (newCode) {
    this.setState({
      code: newCode
    });

    this.getSVG(newCode);
  },
  render () {
    var options = {
      lineNumbers: true,
      readOnly: this.state.readOnly,
      mode: this.state.mode
    };
    return (
      <div className="row">
        <Codemirror ref="editor" className="column editor" value={this.state.code} onChange={this.updateCode} options={options} autoFocus={true} />
        <div>
        <div className="row svgContent" dangerouslySetInnerHTML={ {__html: this.state.svg } } />
          <div className="errorMessage">{ this.state.exception}</div>
        </div>
      </div>
    );
  }
});

export default Editor
