<template>
	<v-container>
		<!-- Profile card -->
		<v-row>
			<v-col cols="12">
				<ProfileCard />
			</v-col>
			<v-col cols="12">
				<PublicInfo />
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		auth: true,
	};
</script>

<style scoped></style>
