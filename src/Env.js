var environment = process.env.NODE_ENV;

var Env = {
  development: {
    apiHost: "http://localhost:3000",
    fontHost: "http://localhost:3001"
  },
  production: {
    apiHost: "https://visualize-ruby.herokuapp.com",
    fontHost: "https://zeisler.github.io/visualize_ruby"
  }
}[environment];

export default Env
