<template>
  <v-app dark>
    <v-app-bar app>
      <NuxtLink to="/" style="text-decoration: none">
        <v-toolbar-title> Matcha </v-toolbar-title>
      </NuxtLink>

      <v-spacer></v-spacer>

      <template v-if="$auth.loggedIn">
        <NuxtLink to="/private" style="text-decoration: none">
          {{ $auth.user.username }}'s page
        </NuxtLink>
        <v-btn @click="logout"> logout </v-btn>
      </template>

      <template v-else>
        <NuxtLink to="/login" style="text-decoration: none"> Login </NuxtLink>
      </template>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <v-row>
        <v-col class="d-flex align-center justify-center">
          <NuxtLink to="/" style="text-decoration: none">
            <v-btn icon>
              <v-icon>mdi-home</v-icon>
            </v-btn>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import TokenManager from '~/plugins/TokenManager.client';

export default {
  mounted() {
    if (this.$auth.loggedIn) {
      TokenManager.silentRefresh(this);
    }
  },
  methods: {
    async logout() {
      clearInterval(this.$store.state.refreshId);
      this.$store.dispatch('setRefreshId', null);
      await this.$auth.logout();
    },
  },
};
</script>

<style scoped></style>
