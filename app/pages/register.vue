<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col class="d-flex align-center justify-center">
        <v-card elevation="2" width="600px" class="pa-6">
          <v-form @submit.prevent="userRegister">
            <v-card-title> Register </v-card-title>
            <v-card-text>
              <v-text-field
                placeholder="your@email.com"
                label="Email"
                type="email"
                v-model="register.email"
                required
              />
              <v-text-field
                placeholder="Username"
                label="Username"
                type="text"
                v-model="register.username"
                required
              />
              <v-text-field
                placeholder="First name"
                label="First name"
                type="text"
                v-model="register.firstName"
                required
              />
              <v-text-field
                placeholder="Last name"
                label="Last name"
                type="text"
                v-model="register.lastName"
                required
              />
              <v-text-field
                placeholder="password"
                label="Password"
                type="password"
                v-model="register.password"
                required
              />
              <v-text-field
                placeholder="Verify password"
                label="Verify password"
                type="password"
                v-model="register.vpassword"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-btn type="submit"> submit </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { required, sameAs, maxLength } from 'vuelidate/lib/validators';

export default {
  auth: false,
  data() {
    return {
      register: {
        email: 'woolimi91@naver.com',
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        password: 'password',
        vpassword: 'vpassword',
      },
    };
  },
  validations: {
    email: {
      required,
    },
    username: {
      required,
    },
    firstName: {
      required,
    },
    lastName: {
      required,
    },
    password: {
      required,
    },
    vpassword: {
      required,
      sameAsPassword: sameAs('password'),
    },
  },
  methods: {
    async userRegister() {
      // TODO: form validation (vuelidate)
      try {
        const res = await this.$axios.post('/auth/register', this.register);
        if (res.status === 201) {
          alert('Successfully registered. Please check your email.');
          return window.location.replace('/');
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped></style>
