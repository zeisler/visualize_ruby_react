const environment = process.env.NODE_ENV;

const Env = {
  development: {
    apiHost: "http://localhost:3000",
    fontHost: "http://localhost:3001"
  },
  production: {
    apiHost: "https://visualize_ruby.dustinzeisler.com/api",
    fontHost: "https://visualize_ruby.dustinzeisler.com"
  }
}[environment];

export default Env
