import {UnControlled as CodeMirror} from 'react-codemirror2'
import Download from "downloadjs"
import _ from 'lodash'
import Env from "./Env.js"
import ErrorMessage from "./ErrorMessage.js"
import React from "react"

require('codemirror/mode/ruby/ruby');

const defaults = {
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
        unique_nodes: true,
        in_line_local_method_calls: true
      }
    };
  }

  componentDidMount() {
    this.getCode();
  }

  getCode() {
    let shareKey = window.location.pathname;
    if (shareKey === "/") {
      return this.setState({ruby_code: defaults.elsif_statement, code: defaults.elsif_statement});
    }
    let that = this;
    fetch(Env.apiHost + '/visualize_ruby/share' + shareKey, {method: 'GET'}
    ).then((response) => {
      response.json().then(data => {
        that.setState({
          dontReFetchSVG: true,
          graph: data["graph"],
          graphs: data["graphs"],
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

  getSVG(ruby_code, render_options = _.omit(this.state.render_options, ["only_graphs"])) {
    this.setState({ruby_code: ruby_code});
    fetch(Env.apiHost + '/visualize_ruby.svg', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruby_code: ruby_code,
          render_options: render_options
        }),
      }
    ).then((response) => {
      response.json().then(data => {
        let only_graphs = this.state.render_options.only_graphs || [];
        if (!_.includes(data["graphs"], only_graphs[0])) {
          only_graphs = []
        }
        this.setState(_.merge({
          graph: data["graph"],
          exception: data["exception"],
          graphs: data["graphs"]
        }, this.render_options({only_graphs: only_graphs})));
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

  shareURL() {
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
        this.setState({shareKey: data["share_key"], exception: data["exception"]});
        if (data["share_key"] !== undefined) {
          this.processAjaxData(Env.fontHost + "/" + data["share_key"]);
        }
      })
    }).catch((error) => {
      error.json().then(data => {
        this.setState({exception: data["exception"]});
      })
    })
  }

  shareUrlLink() {
    if (this.state.shareKey){
      return <a href={"/" + this.state.shareKey}>{Env.apiHost + "/" + this.state.shareKey}</a>
    }
  }

  downloadPNG() {
    this.download("png", "application/png")
  }

  downloadPDF() {
    this.download("pdf", "application/pdf")
  }

  downloadSVG() {
    this.download("svg", "image/svg+xml")
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
    this.setState(this.render_options({unique_nodes: !this.state.render_options.unique_nodes}), () => {
      this.getSVG(this.state.ruby_code);
    });
  }

  render_options(object) {
    return {render_options: _.merge(this.state.render_options, object)};
  }

  in_line_local_method_calls() {
    if(!this.state.render_options.in_line_local_method_calls === false){ // must show all graphs if not in-lining.
      this.setState(this.render_options({only_graphs: this.state.render_options.only_graphs[0]}))
    }
    this.setState(this.render_options({in_line_local_method_calls: !this.state.render_options.in_line_local_method_calls}), () => {
      this.getSVG(this.state.ruby_code);
    });
  }

  listGraphs() {
    let graphs = this.state.graphs || {};
    if (_.isEmpty(graphs)) {
      return [<option selected key="default">Default</option>];
    }
    let graphOptions = _.map(graphs, (graph) => {
        if (this.state.render_options.only_graphs[0] === graph) {
          return <option selected key={graph}>{graph}</option>
        } else {
          return <option key={graph}>{graph}</option>
        }
      }
    );
    return graphOptions;
  }

  onlyGraph(event) {
    if (_.isUndefined(event.target.value) || _.isNull(event.target.value)) {
      return
    }

    this.setState(this.render_options({only_graphs: [event.target.value]}), () => {
      this.getSVG(this.state.ruby_code, this.state.render_options)
    });
  }

  render() {
    let options = {
      lineNumbers: true,
      readOnly: false,
      mode: 'ruby'
    };
    return (
      <div>
        <div className="row">
          <div className="editorWrapper">
            <CodeMirror className="column editor" value={this.state.code} onChange={this.updateCode.bind(this)}
                        options={options} autoFocus={true}/>
          </div>
          <div className="viewer">
            Render Options
            <div className="renderOptions">
              <select onChange={this.onlyGraph.bind(this)}>
                {this.listGraphs.bind(this)()}
              </select>
              <label htmlFor="graphs">Graphs</label>
              <input
                type="checkbox"
                checked={this.state.render_options.unique_nodes}
                onChange={this.uniqueNodes.bind(this)}/>
              <label htmlFor="unique_nodes">unique nodes</label>
              <input
                type="checkbox"
                checked={this.state.render_options.in_line_local_method_calls}
                onChange={this.in_line_local_method_calls.bind(this)}/>
              <label htmlFor="in_line_local_method_calls">in-line local method calls</label>
            </div>
            <div className="viewerOptions">
              <a href="#share-url" onClick={this.shareURL.bind(this)}>Share URL</a> {this.shareUrlLink.bind(this)()}
              <div className="download">
                Download:
                <a href='#' onClick={this.downloadPNG.bind(this)}>png</a>&nbsp;
                <a href="#" onClick={this.downloadDOT.bind(this)}>dot</a>&nbsp;
                <a href="#" onClick={this.downloadPDF.bind(this)}>pdf</a>&nbsp;
                <a href="#" onClick={this.downloadSVG.bind(this)}>svg</a>&nbsp;
              </div>
            </div>
            <div className="row svgContent" dangerouslySetInnerHTML={{__html: this.state.graph}}/>
            <ErrorMessage exception={this.state.exception}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Editor
