<template>
	<v-container class="pa-0">
		<v-expansion-panels accordion class="d-md-none" style="position: fixed">
			<SmallSearchFilter />
			<SmallSearchTag />
		</v-expansion-panels>
		<div style="height: 6.5em" class="d-md-none"></div>
		<v-container>
			<v-row>
				<v-col class="search-filters d-none d-md-block" cols="4">
					<SearchFilter />
					<SearchTag />
					<SearchLanguage />
				</v-col>
				<v-col cols="12" md="8">
					<SearchMode />
					<Results />
				</v-col>
			</v-row>
		</v-container>
	</v-container>
</template>

<script>
	export default {
		auth: true,
		middleware: 'checkVerfiedUser',
	};
</script>

<style scoped>
	.h-init {
		height: initial;
	}

	.search-filters {
		overflow-y: auto;
		max-height: calc(100vh - 140px);
	}
</style>
