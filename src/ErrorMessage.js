import React from "react"

class ErrorMessage extends React.Component {

  humanMessage(){
    switch(this.props.exception.type) {
      case "Parser::SyntaxError":
        return "Check your syntax and I'll try again";
      default:
        return "Looks like were experiencing an error that the parser isn't setup to handle. It's been logged and I'll take a look and see what the problem is."
    }
  }

  render() {
    if(this.props.exception){
      return <div className="errorMessage">
        <div>{this.humanMessage()}</div>
        <div><pre>{this.props.exception.error_type}</pre></div>
        <div><pre>{this.props.exception.message}</pre></div>
      </div>;
    }else{
      return <div></div>
    }
  }
}

export default ErrorMessage
