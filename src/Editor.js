import Codemirror from 'react-codemirror';
import _ from 'lodash'

var React = require('react');
const createReactClass = require('create-react-class');

require('codemirror/mode/ruby/ruby');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

var defaults = {
  elsif_statement: "if project.done?\n" +
  "  go_on_vacation\n" +
  "elsif project.blocked?\n" +
  "  eat(:donuts)\n" +
  "else\n" +
  "  sleep\n" +
  "end"
};

var Editor = createReactClass({
  getInitialState() {
    this.callSVG = _.debounce((newCode) =>  { this.getSVG(newCode) }, 190, {maxWait: 500});
    this.updateCode(defaults.elsif_statement);
    return {
      code: defaults.elsif_statement,
      readOnly: false,
      mode: 'ruby',
    };
  },
  getSVG(rubyCode) {
    fetch('https://visualize-ruby.herokuapp.com/visualize_ruby', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruby_code: rubyCode
          }),
        }
    ).then((response) => {
      response.json().then(data => {
        this.setState({svg: data["svg"]});
        this.setState({exception: data["exception"]});
      })
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  },
  updateCode(newCode) {
    this.callSVG(newCode);
  },
  render() {
    var options = {
      lineNumbers: true,
      readOnly: this.state.readOnly,
      mode: this.state.mode
    };
    return (
        <div>
          <div className="row">

            <Codemirror ref="editor" className="column editor" value={this.state.code} onChange={this.updateCode}
                        options={options} autoFocus={true}/>
            <div>
              <div className="row svgContent" dangerouslySetInnerHTML={{__html: this.state.svg}}/>
              <div className="errorMessage">{this.state.exception}</div>
            </div>
          </div>
          <div className="row">
            <div className="column description">
              <p>
                Write a Ruby class and see method interactions. Works with procedural code and bare methods.
                This is experimental project and does not support all types of code. If you'd like it to support
                more types of code please open a <a href="https://github.com/zeisler/visualize_ruby">pull request</a>.
              </p>
            </div>
          </div>
        </div>
    );
  }
});

export default Editor
