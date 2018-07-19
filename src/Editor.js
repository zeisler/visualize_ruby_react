import {UnControlled as CodeMirror} from 'react-codemirror2'
import Download from "downloadjs"
import _ from 'lodash'
import Env from "./Env.js"
import ErrorMessage from "./ErrorMessage.js"
import React from "react"

require('codemirror/mode/ruby/ruby');

var defaults = {
  elsif_statement: "if project.done?\n" +
  "  go_on_vacation\n" +
  "elsif project.blocked?\n" +
  "  eat(:donuts)\n" +
  "else\n" +
  "  sleep\n" +
  "end"
};

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.callSVG = _.debounce((newCode) => {
      this.getSVG(newCode)
    }, 190, {maxWait: 500});

    this.state = {
      readOnly: false,
      mode: 'ruby',
      shareKey: "",
      render_options: {
        unique_nodes: true
      }
    };
  }

  componentDidMount() {
    this.getCode();
  }

  getCode() {
    var shareKey = window.location.pathname;
    if (shareKey === "/") {
      return this.setState({ruby_code: defaults.elsif_statement, code: defaults.elsif_statement});
    }
    var that = this;
    fetch(Env.apiHost + '/visualize_ruby/share' + shareKey, {method: 'GET'}
    ).then((response) => {
      response.json().then(data => {
        that.setState({
          dontReFetchSVG: true,
          graph: data["graph"],
          ruby_code: data["ruby_code"],
          code: data["ruby_code"],
          exception: data["exception"],
          render_options: data["render_options"]
        });
      })
    }).catch((error) => {
      error.json().then(data => {
        that.setState({exception: data["exception"]});
      })
    })
  }

  getSVG(ruby_code) {
    this.setState({ruby_code: ruby_code});
    fetch(Env.apiHost + '/visualize_ruby.svg', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruby_code: ruby_code,
            render_options: this.state.render_options
          }),
        }
    ).then((response) => {
      response.json().then(data => {
        this.setState({graph: data["graph"]});
        this.setState({exception: data["exception"]});
      })
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  }

  processAjaxData(urlPath) {
    window.history.pushState(null, null, urlPath);
  }

  shareURL(callback) {
    fetch(Env.apiHost + '/visualize_ruby/share', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruby_code: this.state.ruby_code,
            render_options: this.state.render_options
          }),
        }
    ).then((response) => {
      response.json().then(data => {
        if (!_.isFunction(callback)) {
          callback = function () {
          };
        }
        this.setState({shareKey: data["share_key"], exception: data["exception"]}, callback);
        if (data["share_key"] !== undefined) {
          this.processAjaxData(Env.fontHost + "/" + data["share_key"])
        }

      })
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  }

  downloadPNG() {
    this.download("png", "application/png")
  }

  downloadDOT() {
    this.download("dot", "text/dot")
  }

  download(type, meta) {
    if (_.isUndefined(this.state.graph) || _.isNull(this.state.graph)) {
      return
    }
    fetch(Env.apiHost + '/visualize_ruby.' + type, {
          method: 'POST',
          headers: {
            'Accept': "application/png",
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruby_code: this.state.ruby_code,
            download_file: true,
            render_options: this.state.render_options
          }),
        }
    ).then((response) => {
      response.blob().then((blob) => {
        Download(blob, "graph." + type, meta);
      });
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  }

  updateCode(editor, data, value) {
    if (this.state.dontReFetchSVG) {
      this.state.dontReFetchSVG = false;
    } else {
      this.callSVG(value);
    }
  }

  uniqueNodes() {
    this.setState({
      render_options: {unique_nodes: !this.state.render_options.unique_nodes}
    }, () => {
      this.getSVG(this.state.ruby_code);
    });
  }

  editorResize(stuff) {
    console.log(stuff)
  }

  render() {
    var options = {
      lineNumbers: true,
      readOnly: false,
      mode: 'ruby'
    };
    return (
        <div>
          <div className="row">
            <div className="editorWrapper">
              <CodeMirror className="column editor" value={this.state.code} onChange={this.updateCode.bind(this)}
                          options={options} autoFocus={true} onResize={this.editorResize.bind(this)}/>
            </div>
            <div className="viewer">
              <div className="renderOptions">
                <input
                    type="checkbox"
                    checked={this.state.render_options.unique_nodes}
                    onChange={this.uniqueNodes.bind(this)}/>
                <label htmlFor="unique_nodes">unique nodes</label>
              </div>
              <div className="viewerOptions">
                <a onMouseEnter={this.shareURL.bind(this)}
                   href={"/" + (_.isEmpty(this.state.shareKey) ? "#" : this.state.shareKey)}
                   onClick={this.shareURL.bind(this)}>Share URL</a>
                <div className="download">
                  Download: <a href='#' onClick={this.downloadPNG.bind(this)}>png</a> <a href="#"
                                                                                         onClick={this.downloadDOT.bind(this)}>dot</a>
                </div>
              </div>
              <div className="row svgContent" dangerouslySetInnerHTML={{__html: this.state.graph}}/>
              <ErrorMessage exception={this.state.exception}/>
            </div>
          </div>
        </div>
    );
  }
};

export default Editor
