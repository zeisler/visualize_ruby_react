var environment = process.env.NODE_ENV;

var Env = {
  development: {
    apiHost: "http://localhost:3000",
    fontHost: "http://localhost:3001"
  },
  production: {
    apiHost: "https://visualize-ruby.herokuapp.com",
    fontHost: "https://visualize-ruby.herokuapp.com"
  }
}[environment];

export default Env
