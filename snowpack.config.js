// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	optimize: {
		bundle: true,
		treeshake: true,
	},
  mount: {
	  src: "/",
  },
  plugins: [
  ],
  packageOptions: {
	  //"source": "remote",
	  "types": true,
  },
  devOptions: {
    /* ... */
	  hmr: true,
	  open: "none",
  },
  buildOptions: {
	  baseUrl: "/birthday/",
  },
};
