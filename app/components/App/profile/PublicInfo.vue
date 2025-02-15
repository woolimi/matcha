<template>
	<v-card elevation="5">
		<v-card-title> Public Info </v-card-title>
		<v-card-text>
			<v-form @submit.prevent="setPublicInfo">
				<v-row>
					<v-col col="12" sm="6">
						<v-text-field
							label="Username"
							type="text"
							v-model.trim="user.username"
							required
							prepend-icon="mdi-account"
							:error-messages="error.username"
						/>
						<v-text-field
							label="First name"
							type="text"
							v-model.trim="user.firstName"
							required
							prepend-icon="mdi-card-account-details"
							:error-messages="error.firstName"
						/>
						<v-text-field
							label="Last name"
							type="text"
							v-model.trim="user.lastName"
							required
							prepend-icon="mdi-card-account-details"
							:error-messages="error.lastName"
						/>

						<v-autocomplete
							label="Languages"
							v-model="user.languages"
							chips
							multiple
							hide-selected
							prepend-icon="mdi-web"
							auto-select-first
							@change="languages.search = null"
							:items="languages.items"
							:search-input.sync="languages.search"
							:error-messages="error.languages"
						>
						</v-autocomplete>

						<v-row>
							<v-col col="12" sm="6">
								<v-radio-group
									v-model="user.gender"
									label="Gender"
									prepend-icon="mdi-human-male-female"
									:error-messages="error.gender"
								>
									<v-radio label="Male" value="male"></v-radio>
									<v-radio label="Female" value="female"></v-radio>
								</v-radio-group>
							</v-col>

							<v-col col="12" sm="6">
								<v-radio-group
									v-model="user.preferences"
									label="Sexual preference"
									prepend-icon="mdi-head-heart"
									:error-messages="error.preferences"
								>
									<v-radio label="Heterosexual" value="heterosexual"></v-radio>
									<v-radio label="Homosexual" value="homosexual"></v-radio>
									<v-radio label="Bisexual" value="bisexual"></v-radio>
								</v-radio-group>
							</v-col>
						</v-row>
					</v-col>

					<v-col col="12" sm="6">
						<v-menu
							ref="menu"
							v-model="menu"
							:close-on-content-click="false"
							transition="scale-transition"
							min-width="auto"
							offset-overflow
						>
							<v-date-picker
								ref="picker"
								v-model="user.birthdate"
								:max="new Date().toISOString().substr(0, 10)"
								min="1950-01-01"
								@change="setDate"
							></v-date-picker>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									v-model="user.birthdate"
									label="Birth date"
									prepend-icon="mdi-calendar"
									readonly
									v-bind="attrs"
									v-on="on"
									:error-messages="error.birthdate"
								></v-text-field>
							</template>
						</v-menu>

						<v-combobox
							v-model="user.tags"
							label="Interest"
							prepend-icon="mdi-music-circle"
							:items="interest.tags"
							:search-input.sync="interest.search"
							hide-selected
							multiple
							persistent-hint
							chips
							color="primary"
							:error-messages="error.tags"
							@change="resetSearch"
						>
							<template v-slot:no-data>
								<v-list-item>
									<v-list-item-content>
										<v-list-item-title>
											No results matching "<strong>{{ interest.search }}</strong
											>". Press <kbd>enter</kbd> to create a new one
										</v-list-item-title>
									</v-list-item-content>
								</v-list-item>
							</template>
						</v-combobox>

						<v-textarea
							class="mt-5"
							label="Biography"
							counter="150"
							auto-grow
							v-model.trim="user.biography"
							outlined
							prepend-icon="mdi-notebook"
							:error-messages="error.biography"
						/>
						<v-row>
							<v-col cols="12" class="text-center">
								<v-btn color="primary" type="submit">Save Changes</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<script>
	import languages from '~/init/languages.js';
	import _ from 'lodash';

	export default {
		data() {
			return {
				user: {
					username: this.$auth.user.username,
					firstName: this.$auth.user.firstName,
					lastName: this.$auth.user.lastName,
					languages: [...this.$auth.user.languages],
					gender: this.$auth.user.gender,
					preferences: this.$auth.user.preferences,
					tags: [...this.$auth.user.tags],
					biography: this.$auth.user.biography || '',
					birthdate: this.$auth.user.birthdate
						? new Date(this.$auth.user.birthdate).toISOString().substr(0, 10)
						: '',
				},
				error: {},
				interest: {
					tags: [],
					search: '',
				},
				languages: {
					items: languages,
					search: '',
				},
				menu: false,
			};
		},
		async fetch() {
			try {
				const { data } = await this.$axios.get('/api/tags');
				this.interest.tags = data.tags;
			} catch (error) {
				console.log(error);
			}
		},
		watch: {
			menu(val) {
				val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'));
			},
		},
		methods: {
			async setPublicInfo() {
				try {
					const validated = await this.$validator.userPublic(this.user, this.$auth.user.username);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data } = await this.$axios.post('/api/profile/public-info', this.user);
					if (data.error) throw { error: data.error };

					this.$auth.setUser({
						...this.$auth.user,
						...this.user,
					});
					this.$notifier.showMessage({
						message: 'Profile Updated !',
						color: 'success',
					});
					this.error = {};
				} catch (e) {
					if (e.error) {
						this.error = e.error;
						this.$notifier.showMessage({
							message: 'Invalid form',
							color: 'error',
						});
					} else {
						console.error(e);
						this.error = {};
						this.$notifier.showMessage({
							message: 'Server error',
							color: 'error',
						});
					}
				}
			},
			resetSearch() {
				this.user.tags = _.union(this.user.tags.map((s) => s.toLowerCase()));
				this.interest.search = '';
			},
			setDate(date) {
				this.$refs.menu.save(date);
			},
		},
	};
</script>

<style scoped></style>
