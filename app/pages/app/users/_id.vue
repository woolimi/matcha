<template>
	<v-container fluid>
		<v-alert border="left" elevation="2" outlined text type="info" v-if="profile.id == $auth.user.id">
			This is what you profile looks like to other users.
		</v-alert>
		<div v-if="profile.error" class="text-center">
			<v-alert border="left" colored-border type="error" elevation="2"> {{ profile.error }} </v-alert>
		</div>
		<v-row v-else-if="profile.id">
			<v-col cols="12" sm="6">
				<v-card elevation="4" class="pa-2 mb-2">
					<v-carousel cycle hide-delimiter-background show-arrows-on-hover>
						<v-carousel-item
							v-for="(image, i) in profile.images"
							:key="i"
							:src="image.url"
							transition="fade-transition"
						>
						</v-carousel-item>
					</v-carousel>
				</v-card>
			</v-col>
			<v-col cols="12" sm="6">
				<v-row class="text-center">
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-card-account-details </v-icon> Name</v-subheader>
						{{ profile.firstName }} {{ profile.lastName }}
					</v-col>
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-calendar </v-icon> Birthday</v-subheader>
						{{ new Date(profile.birthdate).toLocaleDateString() }}
					</v-col>
				</v-row>
				<v-row class="text-center">
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-human-male-female </v-icon> Gender</v-subheader>
						<v-chip :color="genderColor">
							{{ profile.gender }}
						</v-chip>
					</v-col>
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-head-heart </v-icon> Sexual Preferences</v-subheader>
						<v-chip :color="preferencesColor">
							{{ profile.preferences }}
						</v-chip>
					</v-col>
				</v-row>
				<v-subheader><v-icon left> mdi-notebook </v-icon> Biography</v-subheader>
				<v-card elevation="4" class="pa-2 mb-2">
					<v-row>
						<v-col cols="12">
							{{ profile.biography }}
						</v-col>
					</v-row>
				</v-card>
				<v-row>
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-music-circle </v-icon> Interests</v-subheader>
						<v-chip class="ma-2" v-for="(tag, i) in profile.tags" :key="i">
							{{ tag }}
						</v-chip>
					</v-col>
					<v-col cols="6">
						<v-subheader><v-icon left> mdi-web </v-icon> Languages</v-subheader>
						<v-chip class="ma-2" v-for="(language, i) in profile.languages" :key="i">
							{{ language }}
						</v-chip>
					</v-col>
				</v-row>
				<v-row v-if="profile.like == 2">
					<v-col cols="12">
						<p class="text-h3 text-center pink--text text--lighten-2 mt-2 mb-2">
							<v-icon left color="pink"> mdi-heart-multiple </v-icon> Matched
						</p>
					</v-col>
				</v-row>
				<v-row v-if="profile.id != $auth.user.id">
					<v-col cols="12" class="text-center">
						<v-subheader><v-icon left> mdi-flash </v-icon> Actions</v-subheader>
						<v-bottom-sheet inset>
							<template v-slot:activator="{ on, attrs }">
								<v-btn class="ma-2" outlined color="success" v-bind="attrs" v-on="on">
									<v-icon left>mdi-map-marker</v-icon> Location
								</v-btn>
							</template>
							<v-card tile>
								<gmap-map
									:options="{
										mapTypeControl: false,
										streetViewControl: false,
										rotateControl: false,
										fullscreenControl: false,
									}"
									:center="profile.location"
									:zoom="8"
									style="width: 100%; height: 65vh"
								>
									<gmap-custom-marker :marker="$auth.user.location" :data-user-id="$auth.user.id">
										<v-avatar color="primary" size="50">
											<v-img :src="$auth.user.images[0].url" class="marker-avatar" />
										</v-avatar>
									</gmap-custom-marker>
									<gmap-custom-marker :marker="profile.location" :data-user-id="id">
										<v-avatar color="primary" size="50">
											<v-img :src="profile.images[0].url" class="marker-avatar" />
										</v-avatar>
									</gmap-custom-marker>
								</gmap-map>
							</v-card>
						</v-bottom-sheet>
						<v-btn class="ma-2" outlined color="pink" @click="likeEvent">
							<v-icon left>mdi-heart</v-icon> {{ like }}
						</v-btn>
						<v-btn class="ma-2" outlined color="primary" v-if="profile.like == 2" @click="openChat">
							<v-icon left>mdi-email</v-icon> Chat
						</v-btn>
						<v-btn class="ma-2" outlined color="orange" @click="blockEvent">
							<v-icon left>mdi-cancel</v-icon> {{ blocked }}
						</v-btn>
						<v-bottom-sheet inset>
							<template v-slot:activator="{ on, attrs }">
								<v-btn class="ma-2" outlined color="blue-grey" v-bind="attrs" v-on="on">
									<v-icon left>mdi-clock-outline</v-icon> History
								</v-btn>
							</template>
							<v-card tile class="notifications">
								<NotificationsList
									:manageable="false"
									:list="profile.history"
									:emptyMessage="noHistoryMessage"
								/>
							</v-card>
						</v-bottom-sheet>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<div v-else class="text-center">
			<v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
		</div>
	</v-container>
</template>

<script>
	export default {
		auth: true,
		validate({ params }) {
			return /^\d+$/.test(params.id);
		},
		mounted() {
			if (this.id) {
				this.$store.dispatch('profile/load', this.id);
			}
		},
		computed: {
			id() {
				return this.$route.params.id;
			},
			profile() {
				return this.$store.getters['profile/current'];
			},
			genderColor() {
				return this.profile?.gender == 'male' ? 'blue lighten-2' : 'pink lighten-2';
			},
			preferencesColor() {
				return this.profile?.preferences == 'heterosexual' ? 'blue-grey lighten-5' : 'pink lighten-5';
			},
			like() {
				switch (this.profile.like) {
					case 0:
						return 'Like';
					case 1:
					case 2:
						return 'Unlike';
					case 3:
						return 'Like back';
				}
				return 'Like';
			},
			blocked() {
				if (this.profile.blocked) {
					return 'Unblock';
				}
				return 'Block';
			},
			noHistoryMessage() {
				return `No History with ${this.profile?.firstName} ${this.profile?.lastName} yet.`;
			},
		},
		methods: {
			likeEvent() {
				this.$store.dispatch('profile/toggleLike');
			},
			openChat() {
				this.$axios.post(`/api/chat/create/${this.id}`).then((response) => {
					if (response.status >= 200 && response.status <= 201) {
						this.$router.push({ path: `/app/chat/${response.data.chat}` });
					} else {
						this.$store.commit('snackbar/SHOW', {
							message: 'Could not create a chat with User.',
							color: 'error',
						});
					}
				});
			},
			blockEvent() {
				this.$store.dispatch('profile/toggleBlock');
			},
		},
	};
</script>

<style scoped>
	.notifications {
		max-height: 65vh;
		overflow: auto;
	}
</style>
