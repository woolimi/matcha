<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col class="d-flex align-center justify-center">
        <v-card elevation="2" width="600px" class="pa-6">
          <v-form @submit.prevent="userLogin">
            <v-card-title> Login </v-card-title>
            <v-card-text>
              <v-text-field
                placeholder="your@email.com"
                label="Email"
                v-model="login.email"
                type="email"
                required
              />
              <v-text-field
                placeholder="password"
                label="Password"
                v-model="login.password"
                type="password"
                required
              />
            </v-card-text>
            <v-card-text>
              You don't have an account ? Please click here to
              <NuxtLink to="/signup" style="text-decoration: none">
                register
              </NuxtLink>
            </v-card-text>
            <v-card-actions>
              <v-btn type="submit"> login </v-btn>
              <v-btn type="button" @click="apiCall">api</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TokenManager from '~/plugins/TokenManager.client';

export default {
  auth: false,
  middleware({ store, redirect, app }) {
    if (app.$auth.loggedIn) return redirect('/private');
  },
  data() {
    return {
      login: {
        email: '',
        password: '',
      },
    };
  },
  methods: {
    async apiCall() {
      const res = await this.$axios.get('http://localhost:5000/test');
    },
    async userLogin() {
      try {
        await this.$auth.loginWith('local', { data: this.form });
        TokenManager.silentRefresh(this);
        return this.$router.go(-1);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped></style>
