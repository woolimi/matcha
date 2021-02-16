<template>
	<v-container fluid>
		<!-- Profile card -->
		<v-row>
			<v-col cols="12" sm="6">
				<v-card elevation="4" class="pa-2 mb-2">
					<v-carousel cycle hide-delimiter-background show-arrows-on-hover>
						<v-carousel-item v-for="(path, i) in images" :key="i" :src="path" transition="fade-transition">
						</v-carousel-item>
					</v-carousel>
				</v-card>
			</v-col>
			<v-col cols="12" sm="6">
				<v-subheader>Informations</v-subheader>
				<v-card elevation="4" class="pa-2 mb-2">
					<v-row class="text-center">
						<v-col cols="12"> {{ firstName }} {{ lastName }} </v-col>
					</v-row>
					<v-row class="text-center">
						<v-col cols="12"> {{ birthdate }} </v-col>
					</v-row>
				</v-card>
				<v-subheader>Interests</v-subheader>
				<v-row class="text-center">
					<v-col cols="6">
						<v-chip :color="gender == 'Male' ? 'blue lighten-2' : 'pink lighten-2'"> {{ gender }} </v-chip>
					</v-col>
					<v-col cols="6">
						<v-chip :color="preferences == 'Heterosexual' ? 'blue-grey lighten-5' : 'pink lighten-5'">
							{{ preferences }}
						</v-chip>
					</v-col>
				</v-row>
				<v-subheader>Biography</v-subheader>
				<v-card elevation="4" class="pa-2 mb-2">
					<v-row>
						<v-col cols="12">
							{{ biography }}
						</v-col>
					</v-row>
				</v-card>
				<v-row>
					<v-col cols="6">
						<v-subheader>Tags</v-subheader>
						<v-chip class="ma-2" v-for="(tag, i) in tags" :key="i">
							{{ tag }}
						</v-chip>
					</v-col>
					<v-col cols="6">
						<v-subheader>Languages</v-subheader>
						<v-chip class="ma-2" v-for="(language, i) in languages" :key="i">
							{{ language }}
						</v-chip>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12" class="text-center">
						<v-subheader>Actions</v-subheader>
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
									:center="location"
									:zoom="10"
									style="width: 100%; height: 65vh"
								>
									<gmap-custom-marker :marker="$auth.user.location" :data-user-id="$auth.user.id">
										<v-avatar color="primary" size="50">
											<v-img :src="$auth.user.images[0].path" class="marker-avatar" />
										</v-avatar>
									</gmap-custom-marker>
									<gmap-custom-marker :marker="location" :data-user-id="id">
										<v-avatar color="primary" size="50">
											<v-img :src="images[0]" class="marker-avatar" />
										</v-avatar>
									</gmap-custom-marker>
								</gmap-map>
							</v-card>
						</v-bottom-sheet>
						<v-btn class="ma-2" outlined color="pink"> <v-icon left>mdi-heart</v-icon> Like </v-btn>
						<v-btn class="ma-2" outlined color="orange"> <v-icon left>mdi-cancel</v-icon> Block </v-btn>
						<v-bottom-sheet inset>
							<template v-slot:activator="{ on, attrs }">
								<v-btn class="ma-2" outlined color="blue-grey" v-bind="attrs" v-on="on">
									<v-icon left>mdi-clock-outline</v-icon> History
								</v-btn>
							</template>
							<v-card tile>
								<NotificationsList :manageable="false" :list="notificationsList" />
							</v-card>
						</v-bottom-sheet>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<!--<v-row>
			<v-col cols="12">
				<v-subheader>Location</v-subheader>
			</v-col>
		</v-row>-->
	</v-container>
</template>

<script>
	export default {
		auth: true,
		data() {
			return {
				email: 'test@mail.com',
				username: 'Username',
				lastName: 'First Name',
				firstName: 'Last Name',
				gender: 'Male',
				preferences: 'Heterosexual',
				location: { lat: 48.345, lng: -0.479 },
				images: ['https://i.pravatar.cc/300?img=2'],
				tags: ['Vegan', 'Occult'],
				biography: 'I am totally not a robot.',
				languages: ['French', 'English'],
				birthdate: '20 November 2020',
				notificationsList: [
					{
						id: 1,
						type: 'message:received',
						user: { id: 1, username: 'Username' },
						at: new Date().toISOString(),
					},
				],
			};
		},
		computed: {
			id() {
				return this.$route.params.id;
			},
			noHistoryMessage() {
				return `No notifications yet ! Like or interact with ${this.firstName} ${this.lastName}.`;
			},
		},
	};
</script>
