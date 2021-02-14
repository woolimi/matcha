<template>
	<v-container>
		<v-row>
			<v-col v-for="user in users" :key="user.id" :cols="imageCols">
				<v-card elevation="10" style="border-radius: 15px">
					<v-img :src="user.url" width="100%" height="100%" aspect-ratio="0.75">
						<v-container class="d-flex align-start flex-column" style="height: 100%">
							<v-spacer></v-spacer>
							<div class="font-weight-black white--text text-shadow">
								{{ user.username }}, {{ user.age }}
							</div>
							<div class="font-weight-black white--text">
								<v-icon color="primary">mdi-heart</v-icon>
								<span class="text-shadow">{{ user.likes }}</span>
							</div>
						</v-container>
					</v-img>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		data: () => ({
			users: [
				{
					id: 1,
					username: 'user1',
					age: 21,
					url: 'https://i.pravatar.cc/300?img=1',
					likes: 1,
				},
				{
					id: 2,
					username: 'user2',
					age: 21,
					url: 'https://i.pravatar.cc/300?img=2',
					likes: 1,
				},
				{
					id: 3,
					username: 'user3',
					age: 21,
					likes: 1,
					url: 'https://i.pravatar.cc/300?img=3',
				},
				{
					id: 4,
					username: 'user4',
					age: 21,
					likes: 1,
					url: 'https://i.pravatar.cc/300?img=4',
				},
				{
					id: 5,
					username: 'user5',
					age: 21,
					likes: 1,
					url: 'https://i.pravatar.cc/300?img=5',
				},
				{
					id: 6,
					username: 'user6',
					age: 21,
					likes: 1,
					url: 'https://i.pravatar.cc/300?img=6',
				},
				{
					id: 7,
					username: 'user7',
					age: 21,
					likes: 1,
					url: 'https://i.pravatar.cc/300?img=7',
				},
			],
		}),
		computed: {
			imageCols() {
				const bp = this.$vuetify.breakpoint;
				if (bp.xsOnly) return 6;
				if (bp.smAndUp) return 4;
			},
		},
	};
</script>

<style lang="scss" scoped>
	.user-info {
		position: relative;
		left: 1em;
		bottom: 1em;
	}
	.text-shadow {
		text-shadow: 1px 1px 6px black;
	}
</style>
