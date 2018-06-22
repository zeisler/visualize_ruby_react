var React = require('react');
const createReactClass = require('create-react-class');

var Version = createReactClass({
  getInitialState() {
    this.getVersion();
    return {};
  },
  getVersion() {
    fetch('https://visualize-ruby.herokuapp.com/visualize_ruby/version', {
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
  },
  render() {
    return (
        <div>
          <span>
            <a href="https://github.com/zeisler/visualize_ruby">VisualizeRuby</a> v{this.state.version}
          </span>
        </div>
    );
  }
});

export default Version
