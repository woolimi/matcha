<template>
	<v-container>
		<v-row>
			<v-col v-for="user in users" :key="user.id" :cols="imageCols">
				<v-card elevation="10" style="border-radius: 15px">
					<v-img :src="user.url" width="100%" height="100%" aspect-ratio="0.75"></v-img>
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
					url: 'https://i.pravatar.cc/300?img=1',
				},
				{
					id: 2,
					url: 'https://i.pravatar.cc/300?img=2',
				},
				{
					id: 3,
					url: 'https://i.pravatar.cc/300?img=3',
				},
				{
					id: 4,
					url: 'https://i.pravatar.cc/300?img=4',
				},
				{
					id: 5,
					url: 'https://i.pravatar.cc/300?img=5',
				},
				{
					id: 6,
					url: 'https://i.pravatar.cc/300?img=6',
				},
				{
					id: 7,
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

<style lang="scss" scoped></style>
