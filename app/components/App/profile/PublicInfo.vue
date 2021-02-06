<template>
	<v-card elevation="5">
		<v-card-title> Public Info </v-card-title>
		<v-card-text>
			<v-form @submit.prevent="setPublicInfo">
				<v-row>
					<v-col col="12" sm="6">
						<v-text-field
							label="First name"
							type="text"
							v-model="user.firstName"
							required
							prepend-icon="mdi-card-account-details"
							:error-messages="error.firstName"
						/>
						<v-text-field
							label="Last name"
							type="text"
							v-model="user.lastName"
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
									<v-radio label="heterosexual" value="hetrosexual"></v-radio>
									<v-radio label="bisexual" value="bisexual"></v-radio>
								</v-radio-group>
							</v-col>
						</v-row>
					</v-col>

					<v-col col="12" sm="6">
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
							v-model="user.biography"
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

	export default {
		data() {
			return {
				user: {
					firstName: this.$auth.user.firstName,
					lastName: this.$auth.user.lastName,
					languages: [],
					gender: this.$auth.user.gender,
					preferences: this.$auth.user.preferences,
					tags: this.$auth.user.tags,
					biography: this.$auth.user.biography,
				},
				error: {
					firstName: '',
					lastName: '',
					languages: '',
					gender: '',
					preferences: '',
					tags: '',
					biography: '',
				},
				interest: {
					tags: [],
					search: '',
				},
				languages: {
					items: languages,
					search: '',
				},
			};
		},
		async fetch() {
			try {
				const { data } = await this.$axios.get('/api/tags');
				this.tags = data.tags;
			} catch (error) {
				this.$notifier.showMessage({
					message: 'cannot get tag list from server',
					color: 'error',
				});
			}
		},
		methods: {
			async setPublicInfo() {
				try {
					const validated = await this.$validator.userPublic(this.user);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data } = await this.$axios.post('/api/profile/public-info', this.user);
					if (data.error) throw { error: data.error };

					this.$notifier.showMessage({
						message: 'updated',
						color: 'success',
					});
				} catch (e) {
					if (e.error) {
						this.error = e.error;
						this.$notifier.showMessage({
							message: 'Invalid form',
							color: 'error',
						});
					} else console.log(error);
				}
			},
		},
	};
</script>

<style scoped></style>
