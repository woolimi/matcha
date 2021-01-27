<template>
	<v-container>
		<!-- Profile image -->
		<v-form>
			<v-row>
				<v-col col="12" class="text-center"> image </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> 1 / 2 / 3 / 4 / 5 </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center">fame raiting</v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> location </v-col>
			</v-row>
		</v-form>

		<!-- Private Info Form -->
		<v-form>
			<v-row>
				<v-col col="12" class="text-center"> first name </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> last name </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> email </v-col>
			</v-row>
		</v-form>

		<!-- Public Info Form -->
		<v-form>
			<v-row>
				<v-col col="12" class="text-center"> gender </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> Sexual preferences </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> A biography. </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> A list of interests with tags </v-col>
			</v-row>
			<v-row>
				<v-col col="12" class="text-center"> A biography. </v-col>
			</v-row>
		</v-form>
	</v-container>
</template>

<script>
	export default {
		auth: true,
	};
</script>

<style scoped></style>
