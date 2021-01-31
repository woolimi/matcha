<template>
	<v-container>
		<!-- Profile card -->
		<v-row>
			<v-col cols="12" sm="6">
				<ProfileImages />
			</v-col>
			<v-col cols="12" sm="6">
				<PrivateInfo />
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
