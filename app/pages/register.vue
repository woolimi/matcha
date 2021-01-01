<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col class="d-flex align-center justify-center">
        <v-card elevation="2" width="600px" class="pa-6">
          <v-card-title> Sign in </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                placeholder="your@email.com"
                label="E-mail"
                type="email"
                required
              />
              <v-text-field
                placeholder="password"
                label="Password"
                type="password"
                required
              />
              <v-text-field
                placeholder="Verify password"
                label="Verify password"
                type="password"
                required
              />
              <v-text-field
                placeholder="First name"
                label="First name"
                type="text"
                required
              />
              <v-text-field
                placeholder="Last name"
                label="Last name"
                type="text"
                required
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn> sign up </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped></style>
