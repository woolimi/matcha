<template>
	<v-container>
		<v-card elevation="5">
			<v-card-title> Public Info </v-card-title>
			<v-card-text>
				<v-row>
					<v-col col="12" sm="6">
						<v-text-field
							label="First name"
							type="text"
							v-model="user.firstName"
							:error-messages="error.firstName"
							required
							prepend-icon="mdi-card-account-details"
						/>
						<v-text-field
							label="Last name"
							type="text"
							v-model="user.lastName"
							:error-messages="error.lastName"
							required
							prepend-icon="mdi-card-account-details"
						/>

						<v-autocomplete
							label="Language"
							v-model="languages.select"
							:items="languages.items"
							:search-input.sync="languages.search"
							chips
							multiple
							hide-selected
							prepend-icon="mdi-web"
							auto-select-first
							@change="languages.search = null"
						>
						</v-autocomplete>

						<v-row>
							<v-col col="12" sm="6">
								<v-radio-group label="Gender" prepend-icon="mdi-human-male-female">
									<v-radio label="Male" value="male"></v-radio>
									<v-radio label="Female" value="female"></v-radio>
								</v-radio-group>
							</v-col>

							<v-col col="12" sm="6">
								<v-radio-group label="Sexual preference" prepend-icon="mdi-head-heart">
									<v-radio label="heterosexual" value="hetrosexual"></v-radio>
									<v-radio label="bisexual" value="bisexual"></v-radio>
								</v-radio-group>
							</v-col>
						</v-row>
					</v-col>

					<v-col col="12" sm="6">
						<v-combobox
							v-model="user.interest"
							label="Interest"
							prepend-icon="mdi-music-circle"
							:items="interest.tags"
							:search-input.sync="interest.search"
							hide-selected
							multiple
							persistent-hint
							chips
							color="primary"
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
						/>
						<v-row>
							<v-col cols="12" class="text-center">
								<v-btn color="primary">Save Changes</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	import languages from '~/init/languages.js';

	export default {
		data() {
			return {
				user: {
					firstName: this.$auth.user.firstName,
					lastName: this.$auth.user.lastName,
					interest: [],
				},
				error: {},
				interest: {
					tags: ['vegan'],
					search: null,
				},
				languages: {
					items: languages,
					select: [],
					search: '',
				},
			};
		},
	};
</script>

<style scoped></style>
