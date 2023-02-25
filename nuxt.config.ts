// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    https: {},
  },
  modules: ['~/modules/socket.io'],
});
