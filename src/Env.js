const environment = process.env.NODE_ENV;

console.log("environment: " + environment)

const Env = {
  development: {
    apiHost: "http://localhost:3001",
    fontHost: "http://localhost:3000"
  },
  production: {
    apiHost: "https://visualize.dustinzeisler.com",
    fontHost: "https://visualize.dustinzeisler.com"
  }
}[environment];

export default Env
