import Env from "./Env.js"
var React = require('react');

class Version extends React.Component {
  constructor(props) {
    super(props);
    this.state = { version: ""};
    this.getVersion();
  }
  getVersion() {
    fetch(Env.apiHost + '/visualize_ruby/version', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
    ).then((response) => {
      response.json().then(data => {
        this.setState({version: data["version"]});
      })
    })
  }
  render() {
    return (
        <div>
          <span>
            <a href="https://github.com/zeisler/visualize_ruby">VisualizeRuby</a> v{this.state.version}
          </span>
        </div>
    );
  }
}

export default Version
